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
      
      // Fetch locations from LOCATION_MST table in cspMaster database
      const result = await pool.request().query(`
        SELECT LocId, LocName, LocDiscrip, ActivStat
        FROM LOCATION_MST 
        WHERE ActivStat = 1 OR ActivStat IS NULL
        ORDER BY LocId ASC
      `);
      
      const locations = result.recordset || [];
      console.log(`Fetched ${locations.length} locations from LOCATION_MST`);
      
      await pool.close();
      return NextResponse.json(locations);
    } catch (dbError) {
      console.error('Database error fetching locations:', dbError);
      // Try without WHERE clause in case ActivStat column doesn't exist or has issues
      try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`
          SELECT LocId, LocName, LocDiscrip
          FROM LOCATION_MST 
          ORDER BY LocId ASC
        `);
        const locations = result.recordset || [];
        console.log(`Fetched ${locations.length} locations (without ActivStat filter)`);
        await pool.close();
        return NextResponse.json(locations);
      } catch (retryError) {
        console.error('Retry query also failed:', retryError);
        return NextResponse.json([]);
      }
    }
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location data' },
      { status: 500 }
    );
  }
}

