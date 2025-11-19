import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * M-Pesa Callback Handler
 * Receives callbacks from Safaricom after STK push completion
 * POST /api/payments/mpesa/callback
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('M-Pesa callback received:', JSON.stringify(body, null, 2))

    const { Body } = body
    if (!Body || !Body.stkCallback) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Invalid callback data' })
    }

    const { stkCallback } = Body
    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback

    // Extract transaction details from metadata
    let amount = 0
    let mpesaReceiptNumber = ''
    let phoneNumber = ''

    if (CallbackMetadata && CallbackMetadata.Item) {
      for (const item of CallbackMetadata.Item) {
        if (item.Name === 'Amount') amount = item.Value
        if (item.Name === 'MpesaReceiptNumber') mpesaReceiptNumber = item.Value
        if (item.Name === 'PhoneNumber') phoneNumber = item.Value
      }
    }

    // Use service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (ResultCode === 0) {
      // Payment successful
      console.log(`Payment successful: ${mpesaReceiptNumber}`)

      // Update order with M-Pesa transaction ID
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          mpesa_transaction_id: mpesaReceiptNumber,
          status: 'processing',
        })
        .eq('phone_number', phoneNumber)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)

      if (orderError) {
        console.error('Failed to update order:', orderError)
      }

      // Update delivery package if exists
      await supabase
        .from('delivery_packages')
        .update({
          mpesa_transaction_id: mpesaReceiptNumber,
          status: 'paid',
          last_event: body,
          updated_at: new Date().toISOString(),
        })
        .is('mpesa_transaction_id', null)
        .order('created_at', { ascending: false })
        .limit(1)
    } else {
      // Payment failed
      console.log(`Payment failed: ${ResultDesc}`)

      // Mark order as failed
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
        })
        .eq('phone_number', phoneNumber)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)

      if (orderError) {
        console.error('Failed to update failed order:', orderError)
      }
    }

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Callback processed successfully',
    })
  } catch (error) {
    console.error('M-Pesa callback processing error:', error)
    return NextResponse.json({
      ResultCode: 1,
      ResultDesc: 'Internal server error',
    })
  }
}
