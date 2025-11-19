import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Bootstrap Admin Endpoint
 * POST /api/admin/bootstrap
 * 
 * One-time utility to promote the first user to superadmin.
 * Only works if no admin exists yet.
 * 
 * SECURITY: Delete this file after first use or protect with environment check.
 */
export async function POST(request: NextRequest) {
  // Optional: Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Bootstrap endpoint disabled in production' },
      { status: 403 }
    )
  }

  if (!supabaseServiceKey) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY not configured' },
      { status: 500 }
    )
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check if any admin already exists
    const { data: existingAdmins } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1)

    if (existingAdmins && existingAdmins.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Admin users already exist. Bootstrap not needed.',
        adminCount: existingAdmins.length,
      })
    }

    // Get the first user from auth.users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    })

    if (usersError || !users.users || users.users.length === 0) {
      return NextResponse.json(
        { error: 'No users found in database', details: usersError },
        { status: 404 }
      )
    }

    const firstUser = users.users[0]

    // Insert as superadmin
    const { data: adminUser, error: insertError } = await supabase
      .from('admin_users')
      .insert({
        id: firstUser.id,
        role: 'superadmin',
        is_active: true,
        permissions: [],
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to create admin', details: insertError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      admin: {
        id: adminUser.id,
        email: firstUser.email,
        role: adminUser.role,
      },
    })
  } catch (error) {
    console.error('Bootstrap admin error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : error },
      { status: 500 }
    )
  }
}

// GET endpoint to check status
export async function GET(request: NextRequest) {
  if (!supabaseServiceKey) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY not configured' },
      { status: 500 }
    )
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: admins, error } = await supabase
      .from('admin_users')
      .select('id, role, is_active')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      adminCount: admins?.length || 0,
      admins: admins || [],
      needsBootstrap: !admins || admins.length === 0,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
