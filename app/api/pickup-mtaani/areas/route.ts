import { NextResponse } from 'next/server'
import { getPickupMtaaniAPI } from '@/lib/pickupmtaani'

export async function GET() {
    try {
        const api = getPickupMtaaniAPI()
        const areas = await api.getAreas()

        return NextResponse.json(areas)
    } catch (error) {
        console.error('Failed to fetch areas:', error)
        return NextResponse.json(
            { error: 'Failed to fetch areas', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
