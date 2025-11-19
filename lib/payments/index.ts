/**
 * Unified Payment Service
 * Routes to TinyPesa or M-Pesa based on environment configuration
 */

import { getTinyPesaClient } from './tinypesa'
import { getMpesaClient } from './mpesa'

const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER || 'tinypesa'

interface PaymentSTKRequest {
  amount: number
  phoneNumber: string // Accepts multiple formats, will be normalized
  reference: string
  description?: string
}

interface PaymentSTKResponse {
  success: boolean
  requestId?: string
  checkoutRequestId?: string
  message?: string
}

interface PaymentStatusResponse {
  success: boolean
  status: 'pending' | 'success' | 'failed' | 'unknown'
  transactionRef?: string
  amount?: number
  message?: string
}

/**
 * Normalize phone number to required format
 * Accepts: 0712345678, +254712345678, 254712345678, 712345678
 * Returns: 254712345678
 */
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '')
  
  // Remove leading zeros
  digits = digits.replace(/^0+/, '')
  
  // Add country code if missing
  if (digits.length === 9) {
    digits = '254' + digits
  } else if (!digits.startsWith('254') && digits.length === 12) {
    // Already has country code but not 254
    digits = '254' + digits.slice(-9)
  }
  
  return digits
}

class PaymentService {
  private provider: 'tinypesa' | 'mpesa'

  constructor() {
    this.provider = PAYMENT_PROVIDER as 'tinypesa' | 'mpesa'
    
    if (!['tinypesa', 'mpesa'].includes(this.provider)) {
      throw new Error(`Invalid payment provider: ${this.provider}. Use 'tinypesa' or 'mpesa'`)
    }
  }

  /**
   * Initiate STK Push payment
   */
  async initiatePayment(params: PaymentSTKRequest): Promise<PaymentSTKResponse> {
    const normalizedPhone = normalizePhoneNumber(params.phoneNumber)
    
    if (this.provider === 'tinypesa') {
      try {
        const client = getTinyPesaClient()
        const response = await client.triggerSTK({
          amount: params.amount,
          msisdn: normalizedPhone,
          account_no: params.reference,
        })
        
        return {
          success: response.success,
          requestId: response.request_id,
          message: response.message || 'STK push sent',
        }
      } catch (error) {
        console.error('TinyPesa STK error:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Payment initiation failed',
        }
      }
    } else {
      try {
        const client = getMpesaClient()
        const response = await client.initiateSTKPush({
          amount: params.amount,
          phoneNumber: normalizedPhone,
          accountReference: params.reference,
          transactionDesc: params.description,
        })
        
        return {
          success: response.ResponseCode === '0',
          requestId: response.MerchantRequestID,
          checkoutRequestId: response.CheckoutRequestID,
          message: response.CustomerMessage || response.ResponseDescription || 'STK push sent',
        }
      } catch (error) {
        console.error('M-Pesa STK error:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Payment initiation failed',
        }
      }
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(requestId: string): Promise<PaymentStatusResponse> {
    if (this.provider === 'tinypesa') {
      try {
        const client = getTinyPesaClient()
        const response = await client.checkStatus(requestId)
        
        return {
          success: response.success,
          status: response.status || 'unknown',
          transactionRef: response.mpesa_reference,
          amount: response.amount,
          message: response.message,
        }
      } catch (error) {
        console.error('TinyPesa status check error:', error)
        return {
          success: false,
          status: 'unknown',
          message: error instanceof Error ? error.message : 'Status check failed',
        }
      }
    } else {
      try {
        const client = getMpesaClient()
        const response = await client.queryStkStatus(requestId)
        
        const resultCode = response.ResultCode || response.ResponseCode
        let status: 'pending' | 'success' | 'failed' | 'unknown' = 'unknown'
        
        if (resultCode === '0') {
          status = 'success'
        } else if (resultCode === '1032' || resultCode === '1') {
          status = 'failed'
        } else if (resultCode === '1037') {
          status = 'pending'
        }
        
        return {
          success: true,
          status,
          message: response.ResultDesc || response.ResponseDescription,
        }
      } catch (error) {
        console.error('M-Pesa status check error:', error)
        return {
          success: false,
          status: 'unknown',
          message: error instanceof Error ? error.message : 'Status check failed',
        }
      }
    }
  }

  /**
   * Get current provider name
   */
  getProvider(): string {
    return this.provider
  }
}

let paymentService: PaymentService | null = null

export function getPaymentService(): PaymentService {
  if (!paymentService) {
    paymentService = new PaymentService()
  }
  return paymentService
}

export type {
  PaymentSTKRequest,
  PaymentSTKResponse,
  PaymentStatusResponse,
}
