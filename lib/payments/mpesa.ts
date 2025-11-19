/**
 * M-Pesa Daraja API Integration
 * Docs: https://developer.safaricom.co.ke/
 */

const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET
const MPESA_BUSINESS_SHORT_CODE = process.env.MPESA_BUSINESS_SHORT_CODE
const MPESA_PASSKEY = process.env.MPESA_PASSKEY
const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL
const MPESA_ENVIRONMENT = process.env.MPESA_ENVIRONMENT || 'sandbox'

const MPESA_BASE_URL = MPESA_ENVIRONMENT === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke'

interface MpesaSTKRequest {
  amount: number
  phoneNumber: string // Format: 254XXXXXXXXX
  accountReference: string
  transactionDesc?: string
}

interface MpesaSTKResponse {
  MerchantRequestID?: string
  CheckoutRequestID?: string
  ResponseCode?: string
  ResponseDescription?: string
  CustomerMessage?: string
}

interface MpesaQueryResponse {
  ResponseCode?: string
  ResponseDescription?: string
  ResultCode?: string
  ResultDesc?: string
}

class MpesaClient {
  private consumerKey: string
  private consumerSecret: string
  private shortCode: string
  private passkey: string
  private callbackUrl: string
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor() {
    if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET || !MPESA_BUSINESS_SHORT_CODE || !MPESA_PASSKEY) {
      throw new Error('M-Pesa credentials not configured')
    }
    this.consumerKey = MPESA_CONSUMER_KEY
    this.consumerSecret = MPESA_CONSUMER_SECRET
    this.shortCode = MPESA_BUSINESS_SHORT_CODE
    this.passkey = MPESA_PASSKEY
    this.callbackUrl = MPESA_CALLBACK_URL || ''
  }

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64')
    
    const response = await fetch(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get M-Pesa access token')
    }

    const data = await response.json()
    this.accessToken = data.access_token
    // Token expires in 3599 seconds, cache for 3500 seconds to be safe
    this.tokenExpiry = Date.now() + (3500 * 1000)
    
    return this.accessToken!
  }

  private generatePassword(): { password: string; timestamp: string } {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
    const password = Buffer.from(`${this.shortCode}${this.passkey}${timestamp}`).toString('base64')
    return { password, timestamp }
  }

  /**
   * Initiate STK Push (Lipa Na M-Pesa Online)
   */
  async initiateSTKPush(params: MpesaSTKRequest): Promise<MpesaSTKResponse> {
    const token = await this.getAccessToken()
    const { password, timestamp } = this.generatePassword()

    const response = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: this.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.floor(params.amount),
        PartyA: params.phoneNumber,
        PartyB: this.shortCode,
        PhoneNumber: params.phoneNumber,
        CallBackURL: this.callbackUrl,
        AccountReference: params.accountReference,
        TransactionDesc: params.transactionDesc || 'Payment',
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(`M-Pesa Error: ${error.message || response.statusText}`)
    }

    return response.json()
  }

  /**
   * Query STK Push transaction status
   */
  async queryStkStatus(checkoutRequestId: string): Promise<MpesaQueryResponse> {
    const token = await this.getAccessToken()
    const { password, timestamp } = this.generatePassword()

    const response = await fetch(`${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: this.shortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(`M-Pesa Query Error: ${error.message || response.statusText}`)
    }

    return response.json()
  }
}

let mpesaClient: MpesaClient | null = null

export function getMpesaClient(): MpesaClient {
  if (!mpesaClient) {
    mpesaClient = new MpesaClient()
  }
  return mpesaClient
}

export type {
  MpesaSTKRequest,
  MpesaSTKResponse,
  MpesaQueryResponse,
}
