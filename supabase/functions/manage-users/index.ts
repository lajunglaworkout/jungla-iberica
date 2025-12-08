import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Function "manage-users" up and running!')

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Create Supabase client with Admin rights (Service Role Key)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        const { action, authData, dbData, userId, employeeId, currentEmail } = await req.json()

        console.log(`🚀 Action: ${action}`, { userId, employeeId, currentEmail })

        // Helper to find Auth User by Email (since we don't store UUID in employees table yet)
        const findAuthUserByEmail = async (email: string) => {
            if (!email) return null;
            // List users (defaults to 50 per page, should be enough for now or loop if needed)
            const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
            if (error || !data.users) return null;
            return data.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
        }

        // --- CREATE USER ---
        if (action === 'create' || action === 'invite') {
            const { email, password } = authData

            // 1. Create/Invite user in Auth
            let authUser, authError;

            if (action === 'invite') {
                const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
                    redirectTo: authData.redirectTo,
                    data: {
                        full_name: dbData ? `${dbData.first_name} ${dbData.last_name}` : email
                    }
                })
                authUser = data.user;
                authError = error;
            } else {
                const { data, error } = await supabaseAdmin.auth.admin.createUser({
                    email,
                    password,
                    email_confirm: true,
                    user_metadata: {
                        full_name: dbData ? `${dbData.first_name} ${dbData.last_name}` : email
                    }
                })
                authUser = data.user;
                authError = error;
            }

            if (authError) throw authError

            // 2. Insert into employees table
            // We use the same email to link them. The DB will auto-generate the ID.
            if (dbData) {
                const { data: newEmployee, error: dbError } = await supabaseAdmin
                    .from('employees')
                    .insert([{
                        ...dbData,
                        email: email, // Ensure email matches
                        created_at: new Date().toISOString()
                    }])
                    .select()
                    .single()

                if (dbError) {
                    console.error('❌ DB Insert Error:', dbError)
                    // Rollback: Delete the Auth user we just created
                    if (authUser?.id) await supabaseAdmin.auth.admin.deleteUser(authUser.id)
                    throw new Error(`Database Error: ${dbError.message} (${dbError.details || ''})`)
                }

                return new Response(
                    JSON.stringify({ user: authUser, employee: newEmployee, message: 'User and Profile created successfully' }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
                )
            }

            return new Response(
                JSON.stringify({ user: authUser, message: 'Auth User created' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        // --- UPDATE USER ---
        if (action === 'update') {

            // Resolve Auth User ID if not provided (using currentEmail)
            let targetUserId = userId;
            if (!targetUserId && currentEmail) {
                const foundUser = await findAuthUserByEmail(currentEmail);
                if (foundUser) targetUserId = foundUser.id;
            }

            // 1. Update Auth (if needed and we have ID)
            let authUpdated = false;
            if (targetUserId && (authData?.email || authData?.password)) {
                const updates: any = {}
                if (authData.email) updates.email = authData.email
                if (authData.password) updates.password = authData.password

                const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, updates)
                if (authError) throw authError
                authUpdated = true;
            }

            // 2. Update DB (if needed)
            let dbUpdated = false;
            // Always update DB if employeeId is provided
            if (employeeId && dbData) {
                const { error: dbError } = await supabaseAdmin
                    .from('employees')
                    .update(dbData)
                    .eq('id', employeeId)

                if (dbError) throw new Error(`Database Update Error: ${dbError.message}`)
                dbUpdated = true;
            }

            return new Response(
                JSON.stringify({ message: 'Update successful', details: { auth: authUpdated, db: dbUpdated } }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        // --- DELETE USER ---
        if (action === 'delete') {

            // Resolve Auth User ID if not provided
            let targetUserId = userId;
            if (!targetUserId && currentEmail) {
                const foundUser = await findAuthUserByEmail(currentEmail);
                if (foundUser) targetUserId = foundUser.id;
            }

            // 1. Delete Auth User (if linked)
            if (targetUserId) {
                const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId)
                if (deleteAuthError) console.error('Error deleting Auth user:', deleteAuthError)
            } else {
                console.warn('⚠️ Could not logic Auth User to delete (No ID or Email match)')
            }

            // 2. Delete Employee Profile
            if (employeeId) {
                const { error: deleteDbError } = await supabaseAdmin
                    .from('employees')
                    .delete()
                    .eq('id', employeeId)

                if (deleteDbError) throw deleteDbError
            }

            return new Response(
                JSON.stringify({ message: 'User deleted successfully' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        throw new Error(`Unknown action: ${action}`)

    } catch (error) {
        console.error('❌ Error processing request:', error)
        // Return 200 with error object so client can read the message
        // (Supabase invoke throws on non-2xx preventing body reading easily)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    }
})
