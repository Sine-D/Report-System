/*##################################################################################################################################################
####################################################################################################################################################
################################################################    KAVIJA DULMITH    ##############################################################
################################################################       16/08/2025     ##############################################################
####################################################################################################################################################
####################################################################################################################################################*/

import { NextResponse } from 'next/server';
import sql from 'mssql';

export async function GET() {
  try {
    // Database configuration for cspMaster database
    const config = {
      user: process.env.USER || 'sa',
      password: process.env.PASSWORD || '',
      server: process.env.SERVER || 'localhost',
      database: 'cspMaster', // Connect directly to cspMaster database
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    };

    try {
      const pool = await sql.connect(config);
      
      // First try to get all staff without filter to see if table has data
      let result = await pool.request().query(`
        SELECT SysId, StaffName, StaffCode, LocId, TrnYes
        FROM [cspMaster].[dbo].[STAFF_MST] 
        ORDER BY StaffName ASC
      `);
      
      let staff = result.recordset || [];
      console.log(`Fetched ${staff.length} total staff members from STAFF_MST`);
      
      // Log first staff member to see structure
      if (staff.length > 0) {
        console.log('Sample staff data:', JSON.stringify(staff[0], null, 2));
        // Filter active staff if needed (but return all for now)
        // staff = staff.filter(s => s.TrnYes === 1 || s.TrnYes === null || s.TrnYes === undefined);
        console.log(`Returning ${staff.length} staff members`);
      } else {
        console.warn('No staff members found in STAFF_MST table');
      }
      
      await pool.close();
      return NextResponse.json(staff);
    } catch (dbError) {
      console.error('Database error fetching staff:', dbError);
      console.error('Error details:', {
        message: dbError.message,
        code: dbError.code,
        number: dbError.number
      });
      
      // Try with minimal columns in case some columns don't exist
      try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`
          SELECT SysId, StaffName, StaffCode
          FROM [cspMaster].[dbo].[STAFF_MST] 
          ORDER BY StaffName ASC
        `);
        const staff = result.recordset || [];
        console.log(`Fetched ${staff.length} staff members (minimal columns)`);
        if (staff.length > 0) {
          console.log('Sample staff (minimal):', JSON.stringify(staff[0], null, 2));
        }
        await pool.close();
        return NextResponse.json(staff);
      } catch (retryError) {
        console.error('Retry query also failed:', retryError);
        console.error('Retry error details:', {
          message: retryError.message,
          code: retryError.code,
          number: retryError.number
        });
        return NextResponse.json([], { status: 200 });
      }
    }
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff data' },
      { status: 500 }
    );
  }
}
