import { NextResponse } from 'next/server'
import { getPickupMtaaniAPI } from '@/lib/pickupmtaani'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('locationId')

    if (!locationId) {
        return NextResponse.json({ error: 'Location ID is required' }, { status: 400 })
    }

    try {
        const api = getPickupMtaaniAPI()
        const agents = await api.getAgents(locationId)
        return NextResponse.json(agents)
    } catch (error) {
        console.error('Error fetching agents:', error)
        return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
    }
}
