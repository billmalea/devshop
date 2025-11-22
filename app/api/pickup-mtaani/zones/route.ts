import { NextResponse } from 'next/server'
import { getPickupMtaaniAPI } from '@/lib/pickupmtaani'

export async function GET() {
  try {
    const api = getPickupMtaaniAPI()
    const zones = await api.getZones()
    
    return NextResponse.json(zones)
  } catch (error) {
    console.error('Failed to fetch zones:', error)
    return NextResponse.json(
      { error: 'Failed to fetch zones', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
