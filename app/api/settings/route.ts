import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/server'

export async function GET() {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('app_settings')
            .select('*')
            .order('key')

        if (error) throw error

        // Convert array to key-value object
        const settings: Record<string, any> = {}
        data?.forEach(setting => {
            settings[setting.key] = setting.value
        })

        return NextResponse.json({ settings })
    } catch (error) {
        console.error('Failed to fetch settings:', error)
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        )
    }
}

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

        // Get current user to verify auth
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
            .from('app_settings')
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
            { error: error instanceof Error ? error.message : 'Failed to update setting', details: error },
            { status: 500 }
        )
    }
}
