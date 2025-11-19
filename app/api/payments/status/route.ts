import { NextRequest, NextResponse } from 'next/server'
import { getPaymentService } from '@/lib/payments'

/**
 * Check payment status
 * GET /api/payments/status?requestId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const requestId = searchParams.get('requestId')

    if (!requestId) {
      return NextResponse.json(
        { error: 'Missing requestId parameter' },
        { status: 400 }
      )
    }

    const paymentService = getPaymentService()
    const result = await paymentService.checkPaymentStatus(requestId)

    return NextResponse.json({
      success: result.success,
      status: result.status,
      transactionRef: result.transactionRef,
      amount: result.amount,
      message: result.message,
      provider: paymentService.getProvider(),
    })
  } catch (error) {
    console.error('Payment status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
