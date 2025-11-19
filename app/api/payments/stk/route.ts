import { NextRequest, NextResponse } from 'next/server'
import { getPaymentService } from '@/lib/payments'

/**
 * Initiate M-Pesa/TinyPesa STK Push
 * POST /api/payments/stk
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, phoneNumber, reference, description } = body

    if (!amount || !phoneNumber || !reference) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, phoneNumber, reference' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    const paymentService = getPaymentService()
    const result = await paymentService.initiatePayment({
      amount: Number(amount),
      phoneNumber: String(phoneNumber),
      reference: String(reference),
      description: description ? String(description) : undefined,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || 'Payment initiation failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      requestId: result.requestId,
      checkoutRequestId: result.checkoutRequestId,
      message: result.message,
      provider: paymentService.getProvider(),
    })
  } catch (error) {
    console.error('STK initiation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
