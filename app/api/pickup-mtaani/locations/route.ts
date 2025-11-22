import { NextResponse } from 'next/server'
import { getPickupMtaaniAPI } from '@/lib/pickupmtaani'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const areaId = searchParams.get('areaId')

    console.log('[Pickup Mtaani Route] Initializing API...')
    const api = getPickupMtaaniAPI()
    console.log('[Pickup Mtaani Route] Fetching locations...', { areaId })
    const locations = await api.getAgentLocations(areaId || undefined)
    console.log('[Pickup Mtaani Route] Success! Locations:', locations?.length)

    return NextResponse.json(locations)
  } catch (error) {
    console.error('[Pickup Mtaani Route] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    })
    return NextResponse.json(
      { error: 'Failed to fetch locations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
