/*###################################################################################################################################################
#####################################################################################################################################################
################################################################     KAVIJA DULMITH    ##############################################################
################################################################       28/08/2025      ##############################################################
#####################################################################################################################################################
####################################################################################################################################################*/

import { queryDatabase } from '../../../db';

/*
  GET request handler for fetching individual invoice details
  Returns invoice header and line items
*/
export async function GET(req, { params }) {
  try {
    const invoiceId = params.id;

    // Get invoice header
    const headerQuery = `
      SELECT 
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
      WHERE H.[SysInvNO] = ${invoiceId}
    `;

    // Get invoice details
    const detailsQuery = `
      SELECT 
        D.[InvLineNO],
        D.[ItemCode],
        D.[RetPrice],
        D.[ItemQty],
        D.[UnitPrice],
        D.[DiscAmt],
        D.[TaxAmt],
        D.[NetAmt],
        I.[ItemName]
      FROM [cspMaster].[dbo].[INVOICE_DTL] D
      LEFT JOIN [cspMaster].[dbo].[ITEM_MST] I ON D.[ItemCode] = I.[SysID]
      WHERE D.[TerInvID] = (SELECT [TerInvNO] FROM [cspMaster].[dbo].[INVOICE_HDR] WHERE [SysInvNO] = ${invoiceId})
      ORDER BY D.[InvLineNO]
    `;

    const [headerResult, detailsResult] = await Promise.all([
      queryDatabase(headerQuery),
      queryDatabase(detailsQuery)
    ]);

    const invoice = {
      header: headerResult[0] || null,
      details: detailsResult || []
    };

    return new Response(JSON.stringify(invoice), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error('Invoice details error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
