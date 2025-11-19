import { NextResponse } from 'next/server'
import { getPickupMtaaniAPI } from '@/lib/pickupmtaani'

export async function GET() {
  try {
    const api = getPickupMtaaniAPI()
    const locations = await api.getAgentLocations()
    
    return NextResponse.json({ locations })
  } catch (error) {
    console.error('Failed to fetch Pickup Mtaani locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}
