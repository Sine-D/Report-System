/*##################################################################################################################################################
####################################################################################################################################################
################################################################    KAVIJA DULMITH    ##############################################################
################################################################       25/08/2025     ##############################################################
####################################################################################################################################################
####################################################################################################################################################*/

import { queryDatabase } from '../../db';
import { NextResponse } from 'next/server';
/*
    This is the function that I have created to handle the login 
    get the all data of user from the user data table
    We get the data drom that from auth/Login/Page.tsx 
    and validate it here
    
*/
export async function POST(req) {
  try {
    const formData = await req.formData()
    const userName = formData.get('userName')
    const pwd = formData.get('userPwd')

    if (!userName || !pwd) {
      return new Response(JSON.stringify({ error: 'Missing credentials' }), { status: 400 })
    }

    const qry = `
      SELECT 
        [LoginName]
      FROM [dbo].[USER_MST]
      WHERE [LoginName] = '${userName}'
    `
    // TODO : I have to decrypt the password in the table and validate that password with our user input

    const results = await queryDatabase(qry, [{ name: 'userName', value: userName }])

    if (results.length === 0) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
    }

    const user = results[0]

    // // Compare decrypted DB password with the submitted password
    // if (user.DecryptedPassword !== pwd) {
    //   return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 401 })
    // }

    // Authenticated — set cookie
    const res = NextResponse.json({ success: true })

    res.cookies.set('token', 'your-session-token', {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60, // this is the place that we controle our cookie timeout period, we must enter values in seconds
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    return res

  } catch (err) {
    console.error('Login error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}

