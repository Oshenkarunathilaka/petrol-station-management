'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createAuditLog } from '@/lib/audit'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await createAuditLog({
      action: 'LOGIN',
      module: 'Employees',
      recordId: user.id,
      newValue: { email: user.email },
      userId: user.id
    })
  }

  return { success: true }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Automatically create a profile for the new user with ADMIN role
  if (authData.user) {
    try {
      // 1. Get the ADMIN role ID
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'ADMIN')
        .single()

      if (roleError || !roleData) {
        console.error('Failed to fetch ADMIN role:', roleError)
      } else {
        // 2. Insert into profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: email,
            full_name: email.split('@')[0], // Default name from email
            role_id: roleData.id,
            status: 'ACTIVE'
          })
          
        if (profileError) {
          console.error('Failed to create profile:', profileError)
        }
      }
    } catch (err) {
      console.error('Unexpected error during profile creation:', err)
    }
  }

  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await createAuditLog({
      action: 'LOGOUT',
      module: 'Employees',
      recordId: user.id,
      oldValue: { email: user.email },
      userId: user.id
    })
  }
  await supabase.auth.signOut()
  redirect('/login')
}

