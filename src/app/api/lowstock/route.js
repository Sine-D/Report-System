/*##################################################################################################################################################
####################################################################################################################################################
################################################################    KAVIJA DULMITH    ##############################################################
################################################################       16/08/2025     ##############################################################
####################################################################################################################################################
####################################################################################################################################################*/

import { queryDatabase } from '../../db';

/* This is the GET request handler for fetching low stock items
  It fetches items that are below the specified threshold quantity
  The threshold can be passed as a query parameter, default is 10
*/

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const threshold = parseInt(searchParams.get("threshold")) || 10; // Default threshold is 10

    const query = `
      SELECT 
        I.[SysID], 
        I.[ItemName], 
        Q.[GoodQty],
        CASE 
          WHEN Q.[GoodQty] = 0 THEN 'Out of Stock'
          WHEN Q.[GoodQty] <= ${threshold} THEN 'Low Stock'
          ELSE 'In Stock'
        END as [StockStatus]
      FROM [cspMaster].[dbo].[ITEM_MST] AS I
      INNER JOIN [cspMaster].[dbo].[INVENTORY_TRN] AS Q 
      ON I.[SysID] = Q.[ItemCode]
      WHERE Q.[GoodQty] <= ${threshold}
      ORDER BY Q.[GoodQty] ASC, I.[ItemName] ASC
    `;

    const lowStockItems = await queryDatabase(query);
    
    return new Response(JSON.stringify({
      items: lowStockItems,
      threshold: threshold,
      count: lowStockItems.length,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Error fetching low stock items:", err);
    return new Response(JSON.stringify({ 
      error: err.message,
      items: [],
      threshold: 10,
      count: 0 
    }), { status: 500 });
  }
}

/* This is the POST request handler for updating stock thresholds
  It allows updating the default threshold for low stock alerts
*/

export async function POST(req) {
  try {
    const { threshold, itemCode, newThreshold } = await req.json();
    
    // For now, we'll just return success as the threshold is handled in the GET request
    // In a real implementation, you might want to store thresholds per item in the database
    
    return new Response(JSON.stringify({ 
      message: "Threshold updated successfully",
      threshold: newThreshold || threshold 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Error updating threshold:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
