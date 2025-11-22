import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient()
        const body = await request.json()
        const { key, value } = body

        if (!key) {
            return NextResponse.json(
                { error: 'Setting key is required' },
                { status: 400 }
            )
        }

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Use service role to bypass RLS
        const supabaseAdmin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data, error } = await supabaseAdmin
            .from('settings')
            .upsert({
                key,
                value,
                updated_at: new Date().toISOString(),
                updated_by: user.id
            }, {
                onConflict: 'key'
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ setting: data })
    } catch (error) {
        console.error('Failed to update setting:', error)
        return NextResponse.json(
            { error: 'Failed to update setting' },
            { status: 500 }
        )
    }
}
