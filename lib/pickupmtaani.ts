/**
 * Pickup Mtaani API Client
 * Documentation: https://api.pickupmtaani.com/api/v1/docs/
 */

const PICKUP_MTAANI_API_URL = process.env.NEXT_PUBLIC_PICKUP_MTAANI_API_URL || 'https://api.pickupmtaani.com/api/v1'
const PICKUP_MTAANI_API_KEY = process.env.PICKUP_MTAANI_API_KEY

interface Location {
  id: string
  name: string
  zone?: string
  area?: string
}

interface DeliveryChargeRequest {
  origin: string
  destination: string
  weight?: number
}

interface DeliveryChargeResponse {
  amount: number
  currency: string
}

interface AgentPackageRequest {
  origin_id: string
  destination_id: string
  recipient_name: string
  recipient_phone: string
  package_description: string
  weight?: number
  value?: number
  payment_mode: 'COD' | 'PREPAID'
  cod_amount?: number
}

interface AgentPackageResponse {
  id: string
  tracking_code: string
  status: string
  delivery_fee: number
}

interface BusinessDetails {
  id: string
  name: string
  phone: string
  email: string
  category: string
}

interface MpesaPaymentResponse {
  success: boolean
  message: string
  transaction_id?: string
}

interface PaymentVerification {
  success: boolean
  paid: boolean
  transaction_id: string
  amount?: number
}

interface WebhookRegistration {
  success: boolean
  webhook_id: string
  url: string
}

interface BusinessCategory {
  id: string
  name: string
  description?: string
}

class PickupMtaaniAPI {
  private apiKey: string
  private baseURL: string

  constructor() {
    if (!PICKUP_MTAANI_API_KEY) {
      throw new Error('PICKUP_MTAANI_API_KEY is not configured')
    }
    this.apiKey = PICKUP_MTAANI_API_KEY
    this.baseURL = PICKUP_MTAANI_API_URL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    }

    console.log('[Pickup Mtaani] Request:', {
      url,
      method: options.method || 'GET',
      hasApiKey: !!this.apiKey,
      apiKeyPrefix: this.apiKey?.substring(0, 10) + '...'
    })

    const response = await fetch(url, {
      ...options,
      headers,
    })

    console.log('[Pickup Mtaani] Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      console.error('[Pickup Mtaani] Error:', error)
      throw new Error(`Pickup Mtaani API Error: ${error.message || response.statusText}`)
    }

    return response.json()
  }

  // Locations
  async getAgentLocations(): Promise<Location[]> {
    return this.request<Location[]>('/locations')
  }

  async getAreas(): Promise<Location[]> {
    return this.request<Location[]>('/locations/areas')
  }

  async getZones(): Promise<Location[]> {
    return this.request<Location[]>('/locations/zones')
  }

  // Delivery Charges
  async getAgentPackageCharge(data: DeliveryChargeRequest): Promise<DeliveryChargeResponse> {
    const params = new URLSearchParams({
      origin: data.origin,
      destination: data.destination,
      ...(data.weight && { weight: data.weight.toString() }),
    })
    return this.request<DeliveryChargeResponse>(`/delivery-charge/agent-package?${params}`)
  }

  async getDoorstepPackageCharge(data: DeliveryChargeRequest): Promise<DeliveryChargeResponse> {
    const params = new URLSearchParams({
      origin: data.origin,
      destination: data.destination,
      ...(data.weight && { weight: data.weight.toString() }),
    })
    return this.request<DeliveryChargeResponse>(`/delivery-charge/doorstep-package?${params}`)
  }

  // Agent Packages
  async createAgentPackage(data: AgentPackageRequest): Promise<AgentPackageResponse> {
    return this.request<AgentPackageResponse>('/packages/agent-agent', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getAgentPackage(packageId: string): Promise<AgentPackageResponse> {
    return this.request<AgentPackageResponse>(`/packages/agent-agent?id=${packageId}`)
  }

  async getMyAgentPackages(): Promise<AgentPackageResponse[]> {
    return this.request<AgentPackageResponse[]>('/packages/agent-agent/mine')
  }

  async updateAgentPackage(packageId: string, data: Partial<AgentPackageRequest>): Promise<AgentPackageResponse> {
    return this.request<AgentPackageResponse>('/packages/agent-update', {
      method: 'PUT',
      body: JSON.stringify({ id: packageId, ...data }),
    })
  }

  async deleteAgentPackage(packageId: string): Promise<void> {
    await this.request<void>(`/packages/agent-package?id=${packageId}`, {
      method: 'DELETE',
    })
  }

  async getUnpaidPackages(): Promise<AgentPackageResponse[]> {
    return this.request<AgentPackageResponse[]>('/packages/my-unpaid-packages')
  }

  // Payments
  async payWithMpesaSTK(packageId: string, phoneNumber: string): Promise<MpesaPaymentResponse> {
    return this.request<MpesaPaymentResponse>('/payment/pay-delivery-stk', {
      method: 'PUT',
      body: JSON.stringify({
        package_id: packageId,
        phone_number: phoneNumber,
      }),
    })
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerification> {
    return this.request<PaymentVerification>('/payment/verify-payment', {
      method: 'PUT',
      body: JSON.stringify({
        transaction_id: transactionId,
      }),
    })
  }

  // Business
  async getBusinessDetails(): Promise<BusinessDetails> {
    return this.request<BusinessDetails>('/business')
  }

  async updateBusinessDetails(data: Partial<BusinessDetails>): Promise<BusinessDetails> {
    return this.request<BusinessDetails>('/business/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async getBusinessCategories(): Promise<any[]> {
    return this.request<any[]>('/business/categories')
  }

  // Webhooks
  async registerWebhook(webhookUrl: string): Promise<any> {
    return this.request<any>('/webhooks/register', {
      method: 'POST',
      body: JSON.stringify({
        url: webhookUrl,
      }),
    })
  }
}

// Singleton instance
let pickupMtaaniAPI: PickupMtaaniAPI | null = null

export function getPickupMtaaniAPI(): PickupMtaaniAPI {
  if (!pickupMtaaniAPI) {
    pickupMtaaniAPI = new PickupMtaaniAPI()
  }
  return pickupMtaaniAPI
}

export type {
  Location,
  DeliveryChargeRequest,
  DeliveryChargeResponse,
  AgentPackageRequest,
  AgentPackageResponse,
  BusinessDetails,
}
