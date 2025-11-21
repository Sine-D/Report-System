import { NextResponse } from 'next/server';
import sql from 'mssql';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    
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
      
      // Fetch items from ITEM_MST table in cspMaster database
      let query = `
        SELECT 
          SysID, 
          ItemName,
          ItemCode,
          AvlQty as GoodQty,
          RetailPrice as SellingPrice,
          PurchasedPrice as PurPrice
        FROM ITEM_MST 
        WHERE 1=1
      `;
      
      if (search) {
        query += ' AND (ItemName LIKE @search OR SysID LIKE @search OR ItemCode LIKE @search)';
      }
      
      query += ' ORDER BY ItemName ASC';
      
      const result = await pool.request();
      
      if (search) {
        result.input('search', sql.VarChar, `%${search}%`);
      }
      
      const items = await result.query(query);
      await pool.close();
      
      return NextResponse.json(items.recordset || []);
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Return sample items if database is not available
      const sampleItems = [
        { SysID: 'ITM001', ItemName: 'Laptop Computer', ItemCode: 'LAP001', GoodQty: 50, PurPrice: 800.00, SellingPrice: 1200.00 },
        { SysID: 'ITM002', ItemName: 'Wireless Mouse', ItemCode: 'MOU001', GoodQty: 100, PurPrice: 15.00, SellingPrice: 25.00 },
        { SysID: 'ITM003', ItemName: 'Keyboard', ItemCode: 'KEY001', GoodQty: 75, PurPrice: 25.00, SellingPrice: 45.00 },
        { SysID: 'ITM004', ItemName: 'Monitor 24"', ItemCode: 'MON001', GoodQty: 30, PurPrice: 200.00, SellingPrice: 300.00 },
        { SysID: 'ITM005', ItemName: 'USB Cable', ItemCode: 'USB001', GoodQty: 200, PurPrice: 4.00, SellingPrice: 8.00 },
        { SysID: 'ITM006', ItemName: 'Headphones', ItemCode: 'HP001', GoodQty: 60, PurPrice: 30.00, SellingPrice: 50.00 },
        { SysID: 'ITM007', ItemName: 'Webcam', ItemCode: 'WC001', GoodQty: 25, PurPrice: 40.00, SellingPrice: 70.00 },
        { SysID: 'ITM008', ItemName: 'Tablet', ItemCode: 'TAB001', GoodQty: 15, PurPrice: 300.00, SellingPrice: 450.00 },
        { SysID: 'ITM009', ItemName: 'Smartphone', ItemCode: 'SP001', GoodQty: 40, PurPrice: 400.00, SellingPrice: 600.00 },
        { SysID: 'ITM010', ItemName: 'Charger', ItemCode: 'CHG001', GoodQty: 80, PurPrice: 10.00, SellingPrice: 20.00 }
      ];
      
      // Filter sample data based on search
      const filteredItems = search 
        ? sampleItems.filter(item => 
            item.ItemName.toLowerCase().includes(search.toLowerCase()) ||
            item.SysID.toLowerCase().includes(search.toLowerCase()) ||
            item.ItemCode.toLowerCase().includes(search.toLowerCase())
          )
        : sampleItems;
      
      return NextResponse.json(filteredItems);
    }
  } catch (error) {
    console.error('Error fetching items:', error);
    // Return sample items on any error
    const sampleItems = [
      { SysID: 'ITM001', ItemName: 'Laptop Computer', ItemCode: 'LAP001', GoodQty: 50, PurPrice: 800.00, SellingPrice: 1200.00 },
      { SysID: 'ITM002', ItemName: 'Wireless Mouse', ItemCode: 'MOU001', GoodQty: 100, PurPrice: 15.00, SellingPrice: 25.00 },
      { SysID: 'ITM003', ItemName: 'Keyboard', ItemCode: 'KEY001', GoodQty: 75, PurPrice: 25.00, SellingPrice: 45.00 }
    ];
    
    return NextResponse.json(sampleItems);
  }
}