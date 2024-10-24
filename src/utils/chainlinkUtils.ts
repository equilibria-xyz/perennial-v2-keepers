import axios from 'axios'
import * as crypto from 'crypto'
import { URLSearchParams } from 'url'
import { ChainlinkConfig } from '../config.js'

interface SingleReport {
  feedID: string
  validFromTimestamp: number
  observationsTimestamp: number
  fullReport: string
}

const path = '/api/v1/reports'
const bulkPath = '/api/v1/reports/bulk'

function generateHMAC(method: string, path: string, body: Buffer, timestamp: number): string {
  const serverBodyHash = crypto.createHash('sha256')
  serverBodyHash.update(body)
  const serverBodyHashString = `${method} ${path} ${serverBodyHash.digest('hex')} ${
    ChainlinkConfig.clientId
  } ${timestamp}`
  const signedMessage = crypto.createHmac('sha256', Buffer.from(ChainlinkConfig.userSecret, 'utf-8'))
  signedMessage.update(serverBodyHashString)
  const userHmac = signedMessage.digest('hex')
  return userHmac
}

function generateAuthHeaders(method: string, pathAndParams: string) {
  const timestamp = Date.now()
  const hmacString = generateHMAC(method, pathAndParams, Buffer.from(''), timestamp)

  return {
    Authorization: ChainlinkConfig.clientId,
    'X-Authorization-Timestamp': timestamp.toString(),
    'X-Authorization-Signature-SHA256': hmacString,
  }
}

export async function fetchReportSingleFeed(feedId: string, timestampSeconds: number): Promise<SingleReport> {
  const params = new URLSearchParams({
    feedID: feedId,
    timestamp: timestampSeconds.toString(),
  })

  const urlPath = `${path}?${params.toString()}`
  const url = `${ChainlinkConfig.baseUrl}${path}?${params.toString()}`
  const method = 'GET'

  const headers = generateAuthHeaders(method, urlPath)

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

export async function fetchReportManyFeeds(feedIds: string[], timestampSeconds: number): Promise<SingleReport[]> {
  const params = new URLSearchParams({
    feedIDs: feedIds.join(','),
    timestamp: timestampSeconds.toString(),
  })

  const urlPath = `${bulkPath}?${params.toString()}`
  const url = `${ChainlinkConfig.baseUrl}${bulkPath}?${params.toString()}`
  const method = 'GET'

  const headers = generateAuthHeaders(method, urlPath)

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
