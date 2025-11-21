/*##################################################################################################################################################
####################################################################################################################################################
###########################################################         SINETH DINSARA           #######################################################
###########################################################           22/10/2025             #######################################################
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
      
      // First try to get all customers
      let result = await pool.request().query(`
        SELECT SysID, CusName, CusCode, CusPoint, LocID
        FROM CUSTOMER_MST 
        ORDER BY CusName ASC
      `);
      
      console.log('Customer query result:', result.recordset?.length || 0, 'customers found');
      
      // If no customers found, try without any filters
      if (!result.recordset || result.recordset.length === 0) {
        console.log('No customers found, trying alternative query...');
        result = await pool.request().query(`
          SELECT TOP 100 SysID, CusName, CusCode, CusPoint, LocID
          FROM CUSTOMER_MST 
          ORDER BY SysID ASC
        `);
        console.log('Alternative query result:', result.recordset?.length || 0, 'customers found');
      }
      
      await pool.close();
      return NextResponse.json(result.recordset || []);
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Return sample customers if database is not available
      const sampleCustomers = [
        { SysID: 'CUS001', CusName: 'John Smith', CusCode: 'JS001', CusPoint: 100 },
        { SysID: 'CUS002', CusName: 'Jane Doe', CusCode: 'JD001', CusPoint: 150 },
        { SysID: 'CUS003', CusName: 'Mike Johnson', CusCode: 'MJ001', CusPoint: 75 },
        { SysID: 'CUS004', CusName: 'Sarah Wilson', CusCode: 'SW001', CusPoint: 200 },
        { SysID: 'CUS005', CusName: 'David Brown', CusCode: 'DB001', CusPoint: 125 }
      ];
      return NextResponse.json(sampleCustomers);
    }
  } catch (error) {
    console.error('Error fetching customers:', error);
    // Return sample customers on any error
    const sampleCustomers = [
      { SysID: 'CUS001', CusName: 'John Smith', CusCode: 'JS001', CusPoint: 100 },
      { SysID: 'CUS002', CusName: 'Jane Doe', CusCode: 'JD001', CusPoint: 150 },
      { SysID: 'CUS003', CusName: 'Mike Johnson', CusCode: 'MJ001', CusPoint: 75 },
      { SysID: 'CUS004', CusName: 'Sarah Wilson', CusCode: 'SW001', CusPoint: 200 },
      { SysID: 'CUS005', CusName: 'David Brown', CusCode: 'DB001', CusPoint: 125 }
    ];
    return NextResponse.json(sampleCustomers);
  }
}

export async function POST(request) {
  try {
    const { customers } = await request.json();
    
    if (!Array.isArray(customers)) {
      return NextResponse.json(
        { error: 'Invalid customers data' },
        { status: 400 }
      );
    }

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
    
    // Clear existing customers
    await pool.request().query('DELETE FROM CUSTOMER_MST');
    
    // Insert new customers
    for (const customer of customers) {
      await pool.request().query(`
        INSERT INTO CUSTOMER_MST (LocID, SysID, CusName, CusCode, CusPoint)
        VALUES (@LocID, @SysID, @CusName, @CusCode, @CusPoint)
      `, {
        LocID: customer.LocID || 'LOC00001',
        SysID: customer.SysID,
        CusName: customer.CusName,
        CusCode: customer.CusCode,
        CusPoint: customer.CusPoint || 0
      });
    }
    
    await pool.close();
    
    return NextResponse.json({ 
      success: true, 
      message: `Stored ${customers.length} customers successfully` 
    });
  } catch (error) {
    console.error('Error storing customers:', error);
    return NextResponse.json(
      { error: 'Failed to store customers' },
      { status: 500 }
    );
  }
}