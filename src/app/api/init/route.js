import { NextResponse } from 'next/server';
import { initInvoicingTables, queryDatabase } from '../../db';

export async function POST() {
  try {
    // Initialize all invoicing tables
    await initInvoicingTables();
    
    // Insert sample terminal configuration
    await queryDatabase(`
      INSERT INTO TERMINAL_CONFIG (LocID, TerID, EndPointURL) 
      VALUES ('LOC00001', '03', 'http://localhost:3000')
      ON DUPLICATE KEY UPDATE TerID = VALUES(TerID)
    `);
    
    // Insert sample logged user
    await queryDatabase(`
      INSERT INTO LOGGED_USER (UserID) 
      VALUES ('UID00000')
      ON DUPLICATE KEY UPDATE UserID = VALUES(UserID)
    `);
    
    // Insert sample customers
    const sampleCustomers = [
      { SysID: 'CUS001', CusName: 'John Doe', CusCode: 'JD001', CusPoint: 100 },
      { SysID: 'CUS002', CusName: 'Jane Smith', CusCode: 'JS002', CusPoint: 150 },
      { SysID: 'CUS003', CusName: 'Bob Johnson', CusCode: 'BJ003', CusPoint: 75 },
      { SysID: 'CUS004', CusName: 'Alice Brown', CusCode: 'AB004', CusPoint: 200 },
      { SysID: 'CUS005', CusName: 'Charlie Wilson', CusCode: 'CW005', CusPoint: 50 }
    ];
    
    for (const customer of sampleCustomers) {
      await queryDatabase(`
        INSERT INTO CUSTOMER_MST (LocID, SysID, CusName, CusCode, CusPoint)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE CusName = VALUES(CusName)
      `, ['LOC00001', customer.SysID, customer.CusName, customer.CusCode, customer.CusPoint]);
    }
    
    // Insert sample items
    const sampleItems = [
      { SysID: 'ITM001', ItemName: 'Laptop Computer', ItemCode: 'LAP001', AvlQty: 50, RetailPrice: 1200.00, PurchasedPrice: 800.00 },
      { SysID: 'ITM002', ItemName: 'Wireless Mouse', ItemCode: 'MOU001', AvlQty: 100, RetailPrice: 25.00, PurchasedPrice: 15.00 },
      { SysID: 'ITM003', ItemName: 'Keyboard', ItemCode: 'KEY001', AvlQty: 75, RetailPrice: 45.00, PurchasedPrice: 25.00 },
      { SysID: 'ITM004', ItemName: 'Monitor 24"', ItemCode: 'MON001', AvlQty: 30, RetailPrice: 300.00, PurchasedPrice: 200.00 },
      { SysID: 'ITM005', ItemName: 'USB Cable', ItemCode: 'USB001', AvlQty: 200, RetailPrice: 8.00, PurchasedPrice: 4.00 }
    ];
    
    for (const item of sampleItems) {
      await queryDatabase(`
        INSERT INTO ITEM_MST (LocID, SysID, ItemName, ItemCode, AvlQty, RetailPrice, PurchasedPrice)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE ItemName = VALUES(ItemName)
      `, ['LOC00001', item.SysID, item.ItemName, item.ItemCode, item.AvlQty, item.RetailPrice, item.PurchasedPrice]);
    }
    
    // Insert sample prices
    const samplePrices = [
      { SysId: 'ITM001', ItemCode: 'ITM001', MarkPrice: 1200.00, CredPrice: 1100.00, DisPrice: 1000.00, PurPrice: 800.00 },
      { SysId: 'ITM002', ItemCode: 'ITM002', MarkPrice: 25.00, CredPrice: 22.00, DisPrice: 20.00, PurPrice: 15.00 },
      { SysId: 'ITM003', ItemCode: 'ITM003', MarkPrice: 45.00, CredPrice: 40.00, DisPrice: 35.00, PurPrice: 25.00 },
      { SysId: 'ITM004', ItemCode: 'ITM004', MarkPrice: 300.00, CredPrice: 280.00, DisPrice: 250.00, PurPrice: 200.00 },
      { SysId: 'ITM005', ItemCode: 'ITM005', MarkPrice: 8.00, CredPrice: 7.00, DisPrice: 6.00, PurPrice: 4.00 }
    ];
    
    for (const price of samplePrices) {
      await queryDatabase(`
        INSERT INTO PRICE_TRN (LocId, SysId, ItemCode, MarkPrice, CredPrice, DisPrice, PurPrice, ActivStatus)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE MarkPrice = VALUES(MarkPrice)
      `, ['LOC00001', price.SysId, price.ItemCode, price.MarkPrice, price.CredPrice, price.DisPrice, price.PurPrice, 1]);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully with sample data',
      data: {
        customers: sampleCustomers.length,
        items: sampleItems.length,
        prices: samplePrices.length
      }
    });
    
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database', details: error.message },
      { status: 500 }
    );
  }
}
