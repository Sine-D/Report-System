/*##################################################################################################################################################
####################################################################################################################################################
################################################################    KAVIJA DULMITH    ##############################################################
################################################################       27/08/2025     ##############################################################
####################################################################################################################################################
####################################################################################################################################################*/

import { connectToDB, sql } from '../../db';

/* 
	@PRIVELAGE VARCHAR(1) = A
	@DATEFROM DATETIME,
	@DATETO DATETIME,
	@ITEMGRP VARCHAR(8) = GRP0000A
	@LOCID VARCHAR(8) = POS00001
	@TERID VARCHAR(2) = 00 we have to use server login to use this
*/
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const privilage = 'A';
    const location = 'POS00001';
    const itemGrp = 'GRP0000A';
    const terId = '00';
    const fromDate = searchParams.get('fromDate') || '';
    const toDate = searchParams.get('toDate') || '';

    console.log("From Date:", fromDate);
    console.log("To Date:", toDate);

    if (!fromDate || !toDate ) {
      return new Response(
        JSON.stringify({ Error_Message: "Please enter both dates!" }),
        { status: 400 }
      );
    }

    const pool = await connectToDB();

    // CALLING STORED PROCEDURE
    await pool.request()
      .input('PRIVELAGE', sql.VarChar(1), privilage)
      .input('DATEFROM', sql.DateTime, fromDate)
      .input('DATETO', sql.DateTime, toDate)
      .input('ITEMGRP', sql.VarChar(8), itemGrp)
      .input('LOCID', sql.VarChar(8), location)
      .input('TERID', sql.VarChar(2), terId)
      .execute('MASTER_SP_02_622_SAVE_ZREPO_PNL_REPORT');

    // Run SQL query
    const qry = `
      SELECT [ItemName]
        ,[SoldQty]
        ,[ProAmt]
        ,[NetSale]
        ,[UnitCost]
        ,[UnitPrice]
        ,[ItemCode]
        ,[Tax1]
        ,[Tax2]
        ,[ItemType]
        ,[CusName]
        ,[UniDiscnt]
        ,[ItemDiscrip]
        ,[InvDate]
        ,[InvNo]
        ,[AvlStock]
        ,[ExtDis]
        ,[PayMethod]
        ,SUM([NetSale]) OVER() AS TOTAL_SALE
        ,SUM([UnitCost]) OVER() AS TOTAL_COST
        ,SUM([ProAmt]) OVER() AS PROFIT_OR_LOSS
    FROM [cspMaster].[dbo].[ZREPO_PNL_REPORT]
    `;

    // Option 1: using helper
    // const result = await queryDatabase(pool, qry);

    //Option 2: raw mssql
    const result = await pool.request().query(qry);

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