/*###################################################################################################################################################
#####################################################################################################################################################
################################################################     KAVIJA DULMITH    ##############################################################
################################################################       29/08/2025      ##############################################################
#####################################################################################################################################################
####################################################################################################################################################*/

import { connectToDB, sql } from '../../db';


export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = 'A';
    const location = 'POS00001';
    const date = searchParams.get('Date') || '';

    console.log("Received Date:", date);
    

    if (!date) {
      return new Response(
        JSON.stringify({ Error_Message: "Please enter a date" }),
        { status: 400 }
      );
    }
    
    const pool = await connectToDB();
    
    // CALLING STORED PROCEDURE
    await pool.request()
      .input('Type', sql.VarChar(1), type)
      .input('LocID', sql.VarChar(8), location)
      .input('Date', sql.DateTime, date)
      .execute('MASTER_SP_01_100_LOAD_DAY_SUMMARY_DATA');

    
    // Run SQL query
    const qry = `
      SELECT [TotNumOfInvo]
            ,[TotInvoAmt]
            ,[CashTotal]
            ,[CreditTot]
            ,[TotCheq]
            ,[CreCardAmt]
            ,[GVAmt]
            ,[DebiNote]
            ,[TotNumOfCS]
            ,[TotAmouOfCS]
            ,[CSCashAmt]
            ,[CSCCAmt]
            ,[CSChqAmt]
            ,[CSDNAmt]
            ,[CSGVAmt]
            ,[OpnDrawAmt]
            ,[CshWithdra]
            ,[OtherExpences]
            ,[ShortExess]
            ,[TotalOutstandAmt]
            ,[TotStockValThis]
            ,[TotStockValAll]
            ,[RCCashAmt]
            ,[UndChrgReceive]
            ,[ChsCollection]
            ,[CshReceive]
            ,[WarningYes]
            ,[TotDis]
            ,[TotRetAmt]
            ,([CashTotal] + [CSCashAmt] + [RCCashAmt] + [CshReceive] + [OpnDrawAmt]) 
              - ([CshWithdra] + [OtherExpences] + [ShortExess]) AS [Finaleee]
        FROM [cspMaster].[dbo].[ZREPO_DAY_SUMMARY_RPT]
    `;

    // Option 1: using helper
    // const result = await queryDatabase(pool, qry);

    //Option 2: raw mssql
    const result = await pool.request().query(qry);
    console.log("KAVIJA WORKING");
    return new Response(JSON.stringify(result.recordset), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ Error_Message: err.message }),
      { status: 500 }
    );
  }
}

// DONE AND DUSTED 30-08-2025