import { NextRequest, NextResponse } from 'next/server'
import { getPickupMtaaniAPI } from '@/lib/pickupmtaani'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const packageId = searchParams.get('id')

    const api = getPickupMtaaniAPI()
    
    if (packageId) {
      const packageData = await api.getAgentPackage(packageId)
      return NextResponse.json(packageData)
    } else {
      const packages = await api.getMyAgentPackages()
      return NextResponse.json({ data: packages })
    }
  } catch (error) {
    console.error('Failed to fetch packages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      originId,
      destinationId,
      packageDescription,
      recipientName,
      recipientPhone,
      weight,
      value,
      paymentMode,
      codAmount
    } = body

    if (!originId || !destinationId || !packageDescription || !recipientName || !recipientPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const api = getPickupMtaaniAPI()
    const packageData = await api.createAgentPackage({
      origin_id: originId,
      destination_id: destinationId,
      package_description: packageDescription,
      recipient_name: recipientName,
      recipient_phone: recipientPhone,
      weight,
      value,
      payment_mode: paymentMode || 'PREPAID',
      cod_amount: codAmount
    })
    
    return NextResponse.json(packageData)
  } catch (error) {
    console.error('Failed to create package:', error)
    return NextResponse.json(
      { error: 'Failed to create delivery package' },
      { status: 500 }
    )
  }
}
