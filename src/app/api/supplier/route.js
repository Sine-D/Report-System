/*##################################################################################################################################################
####################################################################################################################################################
################################################################    KAVIJA DULMITH    ##############################################################
################################################################          &           ##############################################################
################################################################    SINETH DINSARA    ##############################################################
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
      
      // First try to get all suppliers without filter to see if table has data
      // Using full table path for consistency
      let result = await pool.request().query(`
        SELECT SysID, SuppName, SuppCode, LocID, TrnYes
        FROM [cspMaster].[dbo].[SUPPLIER_MST] 
        ORDER BY SuppName ASC
      `);
      
      let suppliers = result.recordset || [];
      console.log(`Fetched ${suppliers.length} total suppliers from SUPPLIER_MST`);
      
      // Log first supplier to see structure
      if (suppliers.length > 0) {
        console.log('Sample supplier data:', JSON.stringify(suppliers[0], null, 2));
      }
      
      // If we have suppliers, filter by TrnYes if needed (but don't filter if all are inactive)
      // For now, return all suppliers and let the user decide
      // suppliers = suppliers.filter(sup => sup.TrnYes === 1 || sup.TrnYes === null || sup.TrnYes === undefined);
      console.log(`Returning ${suppliers.length} suppliers`);
      
      await pool.close();
      return NextResponse.json(suppliers);
    } catch (dbError) {
      console.error('Database error fetching suppliers:', dbError);
      console.error('Error details:', {
        message: dbError.message,
        code: dbError.code,
        number: dbError.number
      });
      
      // Try with minimal columns in case some columns don't exist
      try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`
          SELECT SysID, SuppName, SuppCode
          FROM [cspMaster].[dbo].[SUPPLIER_MST] 
          ORDER BY SuppName ASC
        `);
        const suppliers = result.recordset || [];
        console.log(`Fetched ${suppliers.length} suppliers (minimal columns)`);
        if (suppliers.length > 0) {
          console.log('Sample supplier (minimal):', JSON.stringify(suppliers[0], null, 2));
        }
        await pool.close();
        return NextResponse.json(suppliers);
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
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplier data' },
      { status: 500 }
    );
  }
}

