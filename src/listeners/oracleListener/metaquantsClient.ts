import axios, { AxiosInstance } from 'axios'

export interface MetaQuantsResponse {
  priceId: string
  updateData: `0x${string}`
  signature: `0x${string}`
}

export class MetaQuantsClient {
  private readonly client: AxiosInstance

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: 'https://api.metaquants.xyz',
      headers: {
        'X-API-KEY': apiKey,
      },
    })
  }

  public async historicalFloorPrice(collectionAddress: string, timestamp: number): Promise<MetaQuantsResponse> {
    const response = await this.client.get('/historical-floor-price', {
      params: {
        collection_address: collectionAddress,
        timestamp: timestamp,
      },
    })
    return response.data as MetaQuantsResponse
  }
}
