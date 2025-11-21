/*##################################################################################################################################################
####################################################################################################################################################
################################################################    KAVIJA DULMITH    ##############################################################
################################################################       16/08/2025     ##############################################################
####################################################################################################################################################
####################################################################################################################################################*/

import { NextResponse } from 'next/server';
import sql from 'mssql';

export async function POST() {
  try {
    // Database configuration for cspMaster database
    const config = {
      user: process.env.USER || 'sa',
      password: process.env.PASSWORD || '',
      server: process.env.SERVER || 'localhost',
      database: 'cspMaster',
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    };

    const pool = await sql.connect(config);
    
    try {
      // Check if Staff column exists
      const checkColumn = await pool.request().query(`
        SELECT COUNT(*) as ColumnExists
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'INVOICE_HDR' AND COLUMN_NAME = 'Staff'
      `);
      
      const columnExists = checkColumn.recordset[0].ColumnExists > 0;
      
      if (!columnExists) {
        // Add Staff column
        await pool.request().query(`
          ALTER TABLE INVOICE_HDR ADD Staff TEXT
        `);
        
        console.log('Staff column added successfully');
        return NextResponse.json({
          success: true,
          message: 'Staff column added to INVOICE_HDR table'
        });
      } else {
        console.log('Staff column already exists');
        return NextResponse.json({
          success: true,
          message: 'Staff column already exists in INVOICE_HDR table'
        });
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database error: ' + dbError.message },
        { status: 500 }
      );
    } finally {
      await pool.close();
    }
  } catch (error) {
    console.error('Error adding Staff column:', error);
    return NextResponse.json(
      { error: 'Failed to add Staff column' },
      { status: 500 }
    );
  }
}
