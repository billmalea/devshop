import { NextRequest, NextResponse } from 'next/server'

/**
 * Webhook handler for Pickup Mtaani delivery status updates
 * 
 * Pickup Mtaani will send POST requests to this endpoint when delivery statuses change
 * 
 * Expected payload format:
 * {
 *   event: 'package.status_changed',
 *   data: {
 *     package_id: string,
 *     tracking_code: string,
 *     status: string,
 *     timestamp: string
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Pickup Mtaani webhook received:', body)
    
    // Verify webhook signature if needed
    // const signature = request.headers.get('x-pickup-mtaani-signature')
    
    const { event, data } = body
    const { package_id, status, tracking_code } = data

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseServiceKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY not configured')
      return NextResponse.json({ success: false })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    switch (event) {
      case 'package.status_changed':
        console.log(`Package ${package_id} status changed to ${status}`)
        
        // Update delivery_packages table
        const { data: pkgData, error: pkgError } = await supabase
          .from('delivery_packages')
          .update({
            status: status.toLowerCase(),
            last_event: body,
            updated_at: new Date().toISOString(),
          })
          .eq('package_id', package_id)
          .select('order_id')
          .single()

        if (pkgError) {
          console.error('Failed to update delivery_packages:', pkgError)
          break
        }

        // Map package status to order status
        let orderStatus = 'processing'
        if (status.toLowerCase().includes('delivered')) {
          orderStatus = 'delivered'
        } else if (status.toLowerCase().includes('transit') || status.toLowerCase().includes('picked')) {
          orderStatus = 'shipped'
        } else if (status.toLowerCase().includes('cancel') || status.toLowerCase().includes('fail')) {
          orderStatus = 'cancelled'
        }

        // Update order status
        if (pkgData?.order_id) {
          await supabase
            .from('orders')
            .update({ status: orderStatus })
            .eq('id', pkgData.order_id)
        }
        break
        
      case 'package.delivered':
        console.log(`Package ${package_id} delivered successfully`)
        
        // Update package and order to delivered
        const { data: deliveredPkg } = await supabase
          .from('delivery_packages')
          .update({
            status: 'delivered',
            last_event: body,
            updated_at: new Date().toISOString(),
          })
          .eq('package_id', package_id)
          .select('order_id')
          .single()

        if (deliveredPkg?.order_id) {
          await supabase
            .from('orders')
            .update({ status: 'delivered' })
            .eq('id', deliveredPkg.order_id)
        }
        break
        
      case 'package.failed':
        console.log(`Package ${package_id} delivery failed`)
        
        // Update package and order to failed/cancelled
        const { data: failedPkg } = await supabase
          .from('delivery_packages')
          .update({
            status: 'failed',
            last_event: body,
            updated_at: new Date().toISOString(),
          })
          .eq('package_id', package_id)
          .select('order_id')
          .single()

        if (failedPkg?.order_id) {
          await supabase
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', failedPkg.order_id)
        }
        break
        
      default:
        console.log(`Unknown event type: ${event}`)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Verify webhook came from Pickup Mtaani
export async function GET() {
  return NextResponse.json({ 
    status: 'Webhook endpoint active',
    message: 'POST delivery status updates to this URL'
  })
}
