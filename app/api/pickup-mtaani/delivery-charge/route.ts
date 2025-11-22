import { NextResponse } from 'next/server'
import { getPickupMtaaniAPI } from '@/lib/pickupmtaani'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, origin, destination, weight } = body

    if (!type || !origin || !destination) {
      return NextResponse.json(
        { error: 'Missing required fields: type, origin, destination' },
        { status: 400 }
      )
    }

    const api = getPickupMtaaniAPI()
    let result

    if (type === 'agent') {
      result = await api.getAgentPackageCharge({ origin, destination, weight })
    } else if (type === 'doorstep') {
      result = await api.getDoorstepPackageCharge({ origin, destination, weight })
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "agent" or "doorstep"' },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to calculate delivery charge:', error)
    return NextResponse.json(
      { error: 'Failed to calculate delivery charge', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
