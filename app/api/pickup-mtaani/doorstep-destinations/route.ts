import { NextResponse, NextRequest } from 'next/server'
import { getPickupMtaaniAPI } from '@/lib/pickupmtaani'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const areaId = searchParams.get('areaId') || undefined
        const searchKey = searchParams.get('searchKey') || undefined

        const api = getPickupMtaaniAPI()
        const locations = await api.getDoorstepDestinations(areaId, searchKey)

        return NextResponse.json({ data: locations })
    } catch (error) {
        console.error('Failed to fetch doorstep destinations:', error)
        return NextResponse.json(
            { error: 'Failed to fetch doorstep destinations' },
            { status: 500 }
        )
    }
}
