/**
 * TinyPesa Payment Integration
 * Docs: https://tinypesa.com/docs
 */

const TINYPESA_API_TOKEN = process.env.TINYPESA_API_TOKEN
const TINYPESA_ACCOUNT_ID = process.env.TINYPESA_ACCOUNT_ID
const TINYPESA_API_URL = 'https://tinypesa.com/api/v1'

interface TinyPesaSTKRequest {
  amount: number
  msisdn: string // Phone number format: 2547XXXXXXXX
  account_no: string // Reference number
}

interface TinyPesaSTKResponse {
  success: boolean
  request_id?: string
  message?: string
}

interface TinyPesaStatusResponse {
  success: boolean
  status?: 'pending' | 'success' | 'failed'
  transaction_reference?: string
  mpesa_reference?: string
  amount?: number
  message?: string
}

class TinyPesaClient {
  private apiToken: string
  private accountId: string

  constructor() {
    if (!TINYPESA_API_TOKEN || !TINYPESA_ACCOUNT_ID) {
      throw new Error('TinyPesa credentials not configured')
    }
    this.apiToken = TINYPESA_API_TOKEN
    this.accountId = TINYPESA_ACCOUNT_ID
  }

  private async request<T>(endpoint: string, data?: any): Promise<T> {
    const url = `${TINYPESA_API_URL}${endpoint}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Apikey': this.apiToken,
      },
      body: JSON.stringify({
        ...data,
        account_id: this.accountId,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(`TinyPesa Error: ${error.message || response.statusText}`)
    }

    return response.json()
  }

  /**
   * Trigger STK Push to customer phone
   */
  async triggerSTK(params: TinyPesaSTKRequest): Promise<TinyPesaSTKResponse> {
    return this.request<TinyPesaSTKResponse>('/express', {
      amount: params.amount,
      msisdn: params.msisdn,
      account_no: params.account_no,
    })
  }

  /**
   * Check transaction status
   */
  async checkStatus(requestId: string): Promise<TinyPesaStatusResponse> {
    return this.request<TinyPesaStatusResponse>('/status', {
      request_id: requestId,
    })
  }
}

let tinyPesaClient: TinyPesaClient | null = null

export function getTinyPesaClient(): TinyPesaClient {
  if (!tinyPesaClient) {
    tinyPesaClient = new TinyPesaClient()
  }
  return tinyPesaClient
}

export type {
  TinyPesaSTKRequest,
  TinyPesaSTKResponse,
  TinyPesaStatusResponse,
}
