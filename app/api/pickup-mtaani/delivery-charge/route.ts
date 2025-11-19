import { NextRequest, NextResponse } from 'next/server'
import { getPickupMtaaniAPI } from '@/lib/pickupmtaani'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')
    const weight = searchParams.get('weight')

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      )
    }

    const api = getPickupMtaaniAPI()
    const charge = await api.getAgentPackageCharge({
      origin,
      destination,
      weight: weight ? parseFloat(weight) : undefined,
    })
    
    return NextResponse.json(charge)
  } catch (error) {
    console.error('Failed to calculate delivery charge:', error)
    return NextResponse.json(
      { error: 'Failed to calculate delivery charge' },
      { status: 500 }
    )
  }
}
