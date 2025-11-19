import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * TinyPesa Callback Handler
 * Receives callbacks from TinyPesa after payment completion
 * POST /api/payments/tinypesa/callback
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('TinyPesa callback received:', JSON.stringify(body, null, 2))

    const {
      status,
      request_id,
      mpesa_reference,
      amount,
      msisdn,
      account_no,
    } = body

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (status === 'success') {
      // Payment successful
      console.log(`TinyPesa payment successful: ${mpesa_reference}`)

      // Update order with transaction reference
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          mpesa_transaction_id: mpesa_reference,
          status: 'processing',
        })
        .eq('phone_number', msisdn)
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
          mpesa_transaction_id: mpesa_reference,
          status: 'paid',
          last_event: body,
          updated_at: new Date().toISOString(),
        })
        .is('mpesa_transaction_id', null)
        .order('created_at', { ascending: false })
        .limit(1)
    } else if (status === 'failed') {
      // Payment failed
      console.log(`TinyPesa payment failed for request: ${request_id}`)

      // Mark order as cancelled
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
        })
        .eq('phone_number', msisdn)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)

      if (orderError) {
        console.error('Failed to update failed order:', orderError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('TinyPesa callback processing error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
