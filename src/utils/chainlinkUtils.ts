import axios from 'axios'
import * as crypto from 'crypto'
import { URLSearchParams } from 'url'

interface SingleReport {
  feedID: string
  validFromTimestamp: number
  observationsTimestamp: number
  fullReport: string
}

const path = '/api/v1/reports'
const bulkPath = '/api/v1/reports/bulk'

function generateHMAC(
  method: string,
  path: string,
  body: Buffer,
  clientId: string,
  timestamp: number,
  userSecret: string
): string {
  const serverBodyHash = crypto.createHash('sha256')
  serverBodyHash.update(body)
  const serverBodyHashString = `${method} ${path} ${serverBodyHash.digest('hex')} ${clientId} ${timestamp}`
  const signedMessage = crypto.createHmac('sha256', Buffer.from(userSecret, 'utf-8'))
  signedMessage.update(serverBodyHashString)
  const userHmac = signedMessage.digest('hex')
  return userHmac
}

function generateAuthHeaders(
  method: string,
  pathAndParams: string,
  clientId: string,
  userSecret: string
) {
  const timestamp = Date.now()
  const hmacString = generateHMAC(method, pathAndParams, Buffer.from(''), clientId, timestamp, userSecret)

  return {
    'Authorization': clientId,
    'X-Authorization-Timestamp': timestamp.toString(),
    'X-Authorization-Signature-SHA256': hmacString,
  }
}

export async function fetchReportSingleFeed(
  baseUrl: string,
  clientId: string,
  userSecret: string,
  feedId: string,
  timestampSeconds: number,
): Promise<SingleReport> {
  const params = new URLSearchParams({
    feedID: feedId,
    timestamp: timestampSeconds.toString(),
  })

  const urlPath = `${path}?${params.toString()}`
  const url = `${baseUrl}${path}?${params.toString()}`
  const method = 'GET'

  const headers = generateAuthHeaders(method, urlPath, clientId, userSecret)

  try {
    const response = await axios.get(url, { headers })
    return response.data.report
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Unexpected status code ${error.response?.status}: ${error.response?.data}`)
    } else {
      throw new Error(`An unexpected error occurred: ${error.message}`)
    }
  }
}

export async function fetchReportManyFeeds(
  baseUrl: string,
  clientId: string,
  userSecret: string,
  feedIds: string[],
  timestampSeconds: number,
): Promise<SingleReport[]> {
  const params = new URLSearchParams({
    feedIDs: feedIds.join(','),
    timestamp: timestampSeconds.toString(),
  })

  const urlPath = `${bulkPath}?${params.toString()}`
  const url = `${baseUrl}${bulkPath}?${params.toString()}`
  const method = 'GET'

  const headers = generateAuthHeaders(method, urlPath, clientId, userSecret)

  try {
    const response = await axios.get(url, { headers })
    if (response.status !== 200) {
      throw new Error(`Unexpected status code ${response.status}: ${response.data}`)
    }
    return response.data.reports
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Unexpected status code ${error.response?.status}: ${error.response?.data}`)
    } else {
      throw new Error(`An unexpected error occurred: ${error.message}`)
    }
  }
}

