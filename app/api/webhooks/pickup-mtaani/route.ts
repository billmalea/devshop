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
    
    switch (event) {
      case 'package.status_changed':
        console.log(`Package ${data.package_id} status changed to ${data.status}`)
        // TODO: Update order status in database
        // TODO: Send customer notification
        break
        
      case 'package.delivered':
        console.log(`Package ${data.package_id} delivered successfully`)
        // TODO: Mark order as delivered
        // TODO: Send delivery confirmation to customer
        break
        
      case 'package.failed':
        console.log(`Package ${data.package_id} delivery failed`)
        // TODO: Handle failed delivery
        // TODO: Notify customer and admin
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
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'Webhook endpoint active',
    message: 'POST delivery status updates to this URL'
  })
}
