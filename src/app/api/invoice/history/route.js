/*###################################################################################################################################################
#####################################################################################################################################################
################################################################     KAVIJA DULMITH    ##############################################################
################################################################       28/08/2025      ##############################################################
#####################################################################################################################################################
####################################################################################################################################################*/

import { queryDatabase } from '../../../db';

/*
  GET request handler for fetching invoice history
  Returns list of invoices with header information
*/
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") || 50;
    const offset = searchParams.get("offset") || 0;

    const query = `
      SELECT TOP ${limit}
        H.[SysInvNO],
        H.[TerInvNO],
        H.[RefNO],
        H.[InvDate],
        H.[InvTime],
        H.[CusCode],
        H.[NoOfItems],
        H.[SubTot],
        H.[InvoDis],
        H.[NetAmount],
        H.[CashPaidAmt],
        H.[CreditOrCash],
        H.[UserID],
        C.[CusName]
      FROM [cspMaster].[dbo].[INVOICE_HDR] H
      LEFT JOIN [cspMaster].[dbo].[CUSTOMER_MST] C ON H.[CusCode] = C.[CusCode]
      ORDER BY H.[SysInvNO] DESC
    `;

    const result = await queryDatabase(query);

    return new Response(JSON.stringify(result || []), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error('Invoice history error:', err);
    return new Response(JSON.stringify([]), { status: 500 });
  }
}
