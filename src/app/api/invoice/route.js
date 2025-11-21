/*##################################################################################################################################################
####################################################################################################################################################
###########################################################         SINETH DINSARA           #######################################################
###########################################################           21/10/2025             #######################################################
####################################################################################################################################################
####################################################################################################################################################*/

import { NextResponse } from 'next/server';
import { queryDatabase, initInvoicingTables, connectToDB, sql } from '../../db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const searchItemName = searchParams.get('searchItemName') || '';
    const searchItemCode = searchParams.get('searchItemCode') || '';
    const priceCategory = searchParams.get('priceCategory') || 'Cash Price';
    
    // Initialize tables if they don't exist
    try {
      await initInvoicingTables();
    } catch (dbError) {
      console.error('Database initialization failed:', dbError);
      // Return empty arrays if database is not available
      if (action === 'priceCategories') {
        return NextResponse.json([
          { 'PriceCate Type': 'Cash Price', PriceCategory: 'Cash Price' },
          { 'PriceCate Type': 'Whole Sale', PriceCategory: 'Whole Sale' },
          { 'PriceCate Type': 'Special', PriceCategory: 'Special' }
        ]);
      }
      if (action === 'count') {
        return NextResponse.json({ count: 0 });
      }
      return NextResponse.json([]);
    }
    
    if (action === 'priceCategories') {
      // Return price categories
      const categories = [
        { 'PriceCate Type': 'Cash Price', PriceCategory: 'Cash Price' },
        { 'PriceCate Type': 'Whole Sale', PriceCategory: 'Whole Sale' },
        { 'PriceCate Type': 'Special', PriceCategory: 'Special' }
      ];
      return NextResponse.json(categories);
    }

    if (action === 'getItemPrice') {
      const itemCode = searchParams.get('itemCode');
      const priceCategory = searchParams.get('priceCategory') || 'Cash Price';
      
      if (!itemCode) {
        return NextResponse.json({ error: 'Item code is required' }, { status: 400 });
      }

      try {
        // Get price based on price category from PRICE_TRN table
        let priceQuery = '';
        let priceField = '';
        
        switch (priceCategory) {
          case 'Cash Price':
            priceField = 'RetPrice';
            break;
          case 'Whole Sale':
            priceField = 'CredPrice';
            break;
          case 'Special':
            priceField = 'DisPrice';
            break;
          default:
            priceField = 'RetPrice';
        }

        priceQuery = `
          SELECT ${priceField} as Price, MarkPrice, RetPrice, CredPrice, DisPrice
          FROM PRICE_TRN 
          WHERE ItemCode = ? AND ActivStatus = 1
          ORDER BY EfeDate DESC
        `;

        const prices = await queryDatabase(priceQuery, [itemCode]);
        
        if (prices && prices.length > 0) {
          const priceData = prices[0];
          return NextResponse.json({
            price: priceData.Price || priceData.MarkPrice || 0,
            markPrice: priceData.MarkPrice || 0,
            retPrice: priceData.RetPrice || 0,
            credPrice: priceData.CredPrice || 0,
            disPrice: priceData.DisPrice || 0
          });
        } else {
          // Fallback to item's retail price
          const itemQuery = 'SELECT RetailPrice FROM ITEM_MST WHERE SysID = ?';
          const itemData = await queryDatabase(itemQuery, [itemCode]);
          return NextResponse.json({
            price: itemData[0]?.RetailPrice || 0,
            markPrice: itemData[0]?.RetailPrice || 0,
            retPrice: itemData[0]?.RetailPrice || 0,
            credPrice: itemData[0]?.RetailPrice || 0,
            disPrice: itemData[0]?.RetailPrice || 0
          });
        }
      } catch (error) {
        console.error('Error fetching item price:', error);
        // Return sample prices based on price category when database is not available
        const samplePrices = {
          'Cash Price': 100,
          'Whole Sale': 80,
          'Special': 60
        };
        
        return NextResponse.json({
          price: samplePrices[priceCategory] || 100,
          markPrice: 100,
          retPrice: 100,
          credPrice: 80,
          disPrice: 60
        });
      }
    }
    
    if (action === 'count') {
      // Return count of pending invoices
      const result = await queryDatabase('SELECT COUNT(*) as count FROM INVOICE_HDR');
      return NextResponse.json({ count: result[0]?.count || 0 });
    }
    
    if (action === 'upload') {
      // Upload pending invoices to server (simulate)
      const invoices = await queryDatabase('SELECT * FROM INVOICE_HDR');
      const invoiceDetails = await queryDatabase('SELECT * FROM INVOICE_DTL');
      
      if (invoices.length === 0) {
        return NextResponse.json({ error: 'No invoices to upload' }, { status: 400 });
      }
      
      // Move to deleted tables
      for (const invoice of invoices) {
        await queryDatabase(`
          INSERT INTO DELETED_INVOICE_HDR (
            LocID, TerInvNO, RefNO, SlpCode, CreditOrCash, InvDate, InvTime,
            CusCode, CusPoint, NoOfItems, ItemDis, SubTot, InvoDis, TaxAmount,
            NetAmount, CashPaidAmt, UserID, SysDateTime, ViewInvNo, TotalCost,
            TrnYes, NbtAmt, DeliCharge, PriceCateType, PriceCategory
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          invoice.LocID, invoice.TerInvNO, invoice.RefNO, invoice.SlpCode, invoice.CreditOrCash,
          invoice.InvDate, invoice.InvTime, invoice.CusCode, invoice.CusPoint, invoice.NoOfItems,
          invoice.ItemDis, invoice.SubTot, invoice.InvoDis, invoice.TaxAmount, invoice.NetAmount,
          invoice.CashPaidAmt, invoice.UserID, invoice.SysDateTime, invoice.ViewInvNo, invoice.TotalCost,
          invoice.TrnYes, invoice.NbtAmt, invoice.DeliCharge, invoice.PriceCateType, invoice.PriceCategory
        ]);
      }
      
      for (const detail of invoiceDetails) {
        await queryDatabase(`
          INSERT INTO DELETED_INVOICE_DTL (
            LocID, TerInvID, InvLineNO, ItemCode, RetPrice, ItemQty, UnitPrice,
            DiscAmt, TaxAmt, NetAmt, ItemCost, InventLocID, BagQty, IRF, TrnYes,
            SpeciDtl, ItemDis, DisPrecen, MarkedPrice, ItmIsueTime
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          detail.LocID, detail.TerInvID, detail.InvLineNO, detail.ItemCode, detail.RetPrice,
          detail.ItemQty, detail.UnitPrice, detail.DiscAmt, detail.TaxAmt, detail.NetAmt,
          detail.ItemCost, detail.InventLocID, detail.BagQty, detail.IRF, detail.TrnYes,
          detail.SpeciDtl, detail.ItemDis, detail.DisPrecen, detail.MarkedPrice, detail.ItmIsueTime
        ]);
      }
      
      // Clear original tables
      await queryDatabase('DELETE FROM INVOICE_HDR');
      await queryDatabase('DELETE FROM INVOICE_DTL');
      
      return NextResponse.json({ 
        success: true, 
        message: `Uploaded ${invoices.length} invoices successfully` 
      });
    }
    
    if (action === 'searchItems') {
      // Search items based on name or code
      let query = `
      SELECT 
          I.SysID, 
          I.ItemName,
          I.ItemCode,
          I.AvlQty as GoodQty,
          P.PurPrice,
          CASE 
            WHEN '${priceCategory}' = 'Cash Price' THEN P.MarkPrice
            WHEN '${priceCategory}' = 'Whole Sale' THEN P.CredPrice
            WHEN '${priceCategory}' = 'Special' THEN P.DisPrice
            ELSE P.MarkPrice
          END as SellingPrice
        FROM ITEM_MST AS I
        INNER JOIN PRICE_TRN AS P ON I.SysID = P.ItemCode
        WHERE P.ActivStatus = 1
      `;
      
      const conditions = [];
      const params = [];
      
      if (searchItemName) {
        conditions.push('I.ItemName LIKE ?');
        params.push(`%${searchItemName}%`);
      }
      
      if (searchItemCode) {
        conditions.push('I.SysID LIKE ?');
        params.push(`%${searchItemCode}%`);
      }
      
      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY I.ItemName ASC';
      
      const items = await queryDatabase(query, params);
      return NextResponse.json(items);
    }
    
    // Default: return all items
    const items = await queryDatabase(`
      SELECT 
        I.SysID, 
        I.ItemName,
        I.ItemCode,
        I.AvlQty as GoodQty,
        P.PurPrice,
        CASE 
          WHEN '${priceCategory}' = 'Cash Price' THEN P.MarkPrice
          WHEN '${priceCategory}' = 'Whole Sale' THEN P.CredPrice
          WHEN '${priceCategory}' = 'Special' THEN P.DisPrice
          ELSE P.MarkPrice
        END as SellingPrice
      FROM ITEM_MST AS I
      INNER JOIN PRICE_TRN AS P ON I.SysID = P.ItemCode
      WHERE P.ActivStatus = 1
      ORDER BY I.ItemName ASC
    `);
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching invoice data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice data' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();

    const customer = formData.get('customer');
    const referenceNo = formData.get('referenceNo') || '-';
    const priceCategoryInput = formData.get('priceCategory');
    const staff = formData.get('staff') || '';
    const items = JSON.parse(formData.get('items') || '[]');
    const subTotal = parseFloat(formData.get('subTotal')) || 0;
    const extraDiscount = parseFloat(formData.get('extraDiscount')) || 0;
    const netTotal = parseFloat(formData.get('netTotal')) || 0;
    const cashPaid = parseFloat(formData.get('cashPaid')) || 0;
    const creditAmount = parseFloat(formData.get('creditAmount')) || 0;
    const cardAmount = parseFloat(formData.get('cardAmount')) || 0;

    if (!customer || !items || items.length === 0) {
      return NextResponse.json({ error: 'Customer and items are required' }, { status: 400 });
    }

    const pool = await connectToDB();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    const requestTX = new sql.Request(transaction);

    // Determine LocID and TerID (fallback defaults)
    const locId = 'POS00001';
    const terId = '03';

    // Get current date/time for invoice timestamps
    const now = new Date();

    // Get next SysInvNO
    const nextSysQuery = `SELECT ISNULL(MAX(SysInvNO), 0) + 1 AS NextNo FROM [cspMaster].[dbo].[INVOICE_HDR] WHERE [LocID] = @SysLocID`;
    const nextSysRes = await requestTX
      .input('SysLocID', sql.VarChar(8), locId)
      .query(nextSysQuery);
    const sysInvNo = nextSysRes.recordset?.[0]?.NextNo || 1;

    // Get next TerInvNO by reading latest ID from database and incrementing
    const nextTerQuery = `SELECT ISNULL(MAX(CAST(TerInvNO AS INT)), 0) + 1 AS NextNo FROM [cspMaster].[dbo].[INVOICE_HDR] WHERE [LocID] = @TerLocID`;
    const nextTerRes = await requestTX
      .input('TerLocID', sql.VarChar(8), locId)
      .query(nextTerQuery);
    const terInvNo = nextTerRes.recordset?.[0]?.NextNo?.toString().padStart(8, '0') || '00000001';


    // Compute amounts and constants
    const invDate = now;
    const invTime = now;
    const slpCode = staff || 'SLP00000'; // Use selected staff SysId, fallback to default
    const cusCode = customer;
    const cusPoint = 0;
    // Calculate total quantity of all items (sum of all item quantities)
    const noOfItems = items.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
    const itemDis = 0;
    const invoDis = extraDiscount; // extraDiscount is already the actual discount amount
    const taxAmount = 0;
    const cashPaidAmt = cashPaid;
    const userID = 'UID00000';
    const sysDateTime = now;
    const viewInvNo = terInvNo;
    const totalCost = netTotal;
    const trnYes = 0;
    const nbtAmt = 0;
    const deliCharge = 0;
    const priceCateType = 'GRP00008';
    const priceCategory = 'CAT1';

    // Determine payment type per spec: 0=mix no credit, 1=direct credit, 2=direct cash, 3=mix with credit
    let creditOrCash = 0;
    if (cashPaid === 0 && !cardAmount && creditAmount > 0) {
      creditOrCash = 1;
    } else if (cashPaid > 0 && !cardAmount && creditAmount === 0) {
      creditOrCash = 2;
    } else if (creditAmount > 0) {
      creditOrCash = 3;
    }

    // Insert header
    const insertHdr = `
      INSERT INTO [cspMaster].[dbo].[INVOICE_HDR] (
        [LocID],[SysInvNO],[TerInvNO],[RefNO],[SlpCode],[CreditOrCash],[InvDate],[InvTime],
        [CusCode],[CusPoint],[NoOfItems],[ItemDis],[SubTot],[InvoDis],[TaxAmount],
        [NetAmount],[CashPaidAmt],[UserID],[SysDateTime],[ViewInvNo],[TotalCost],[TrnYes],
        [NbtAmt],[DeliCharge],[PriceCateType],[PriceCategory]
      ) VALUES (
        @LocID,@SysInvNO,@TerInvNO,@RefNO,@SlpCode,@CreditOrCash,@InvDate,@InvTime,
        @CusCode,@CusPoint,@NoOfItems,@ItemDis,@SubTot,@InvoDis,@TaxAmount,
        @NetAmount,@CashPaidAmt,@UserID,@SysDateTime,@ViewInvNo,@TotalCost,@TrnYes,
        @NbtAmt,@DeliCharge,@PriceCateType,@PriceCategory
      )`;

    const reqHdr = new sql.Request(transaction);
    await reqHdr
      .input('LocID', sql.VarChar(8), locId)
      .input('SysInvNO', sql.Int, sysInvNo)
      .input('TerInvNO', sql.VarChar(8), terInvNo)
      .input('RefNO', sql.VarChar(24), referenceNo)
      .input('SlpCode', sql.VarChar(8), slpCode)
      .input('CreditOrCash', sql.TinyInt, creditOrCash)
      .input('InvDate', sql.DateTime, invDate)
      .input('InvTime', sql.DateTime, invTime)
      .input('CusCode', sql.VarChar(8), cusCode)
      .input('CusPoint', sql.Int, cusPoint)
      .input('NoOfItems', sql.TinyInt, noOfItems)
      .input('ItemDis', sql.Money, itemDis)
      .input('SubTot', sql.Money, subTotal)
      .input('InvoDis', sql.Money, invoDis)
      .input('TaxAmount', sql.Money, taxAmount)
      .input('NetAmount', sql.Money, netTotal)
      .input('CashPaidAmt', sql.Money, cashPaidAmt)
      .input('UserID', sql.VarChar(8), userID)
      .input('SysDateTime', sql.DateTime, sysDateTime)
      .input('ViewInvNo', sql.VarChar(8), viewInvNo)
      .input('TotalCost', sql.Money, totalCost)
      .input('TrnYes', sql.TinyInt, trnYes)
      .input('NbtAmt', sql.Money, nbtAmt)
      .input('DeliCharge', sql.Money, deliCharge)
      .input('PriceCateType', sql.VarChar(8), priceCateType)
      .input('PriceCategory', sql.VarChar(4), priceCategory)
      .query(insertHdr);

    // Insert details
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const invLineNo = i + 1;
      const itemQty = Number(item.quantity) || 0;
      const unitPrice = Number(item.price) || 0;
      const retPrice = unitPrice;
      const discAmt = 0;
      const taxAmt = 0;
      const netAmt = Number(item.grossPrice ?? unitPrice * itemQty);
      const itemCost = unitPrice * itemQty;
      const inventLocId = 'POS00001';
      const bagQty = 0;
      const irf = 0;
      const trnYesDtl = 0;
      const speciDtl = ' ';
      const itemDisFlg = 'N';
      const disPrecen = 0;
      const markedPrice = unitPrice;
      const itmIsueTime = new Date(); // Generate fresh timestamp for each item

      const insertDtl = `
        INSERT INTO [cspMaster].[dbo].[INVOICE_DTL] (
          [LocID],[TerInvID],[InvLineNO],[ItemCode],[RetPrice],[ItemQty],[UnitPrice],
          [DiscAmt],[TaxAmt],[NetAmt],[ItemCost],[InventLocID],[BagQty],[IRF],[TrnYes],
          [SpeciDtl],[ItemDis],[DisPrecen],[MarkedPrice],[ItmIsueTime]
        ) VALUES (
          @LocID,@TerInvID,@InvLineNO,@ItemCode,@RetPrice,@ItemQty,@UnitPrice,
          @DiscAmt,@TaxAmt,@NetAmt,@ItemCost,@InventLocID,@BagQty,@IRF,@TrnYes,
          @SpeciDtl,@ItemDis,@DisPrecen,@MarkedPrice,@ItmIsueTime
        )`;

      const reqDtl = new sql.Request(transaction);
      await reqDtl
        .input('LocID', sql.VarChar(8), 'POS00001')
        .input('TerInvID', sql.VarChar(8), terInvNo)
        .input('InvLineNO', sql.SmallInt, invLineNo)
        .input('ItemCode', sql.NVarChar(8), String(item.code).slice(0, 8))
        .input('RetPrice', sql.Money, retPrice)
        .input('ItemQty', sql.Float, itemQty)
        .input('UnitPrice', sql.Money, unitPrice)
        .input('DiscAmt', sql.Money, discAmt)
        .input('TaxAmt', sql.Money, taxAmt)
        .input('NetAmt', sql.Money, netAmt)
        .input('ItemCost', sql.Money, itemCost)
        .input('InventLocID', sql.VarChar(8), inventLocId)
        .input('BagQty', sql.Float, bagQty)
        .input('IRF', sql.TinyInt, irf)
        .input('TrnYes', sql.TinyInt, trnYesDtl)
        .input('SpeciDtl', sql.VarChar(40), speciDtl)
        .input('ItemDis', sql.VarChar(2), itemDisFlg)
        .input('DisPrecen', sql.Float, disPrecen)
        .input('MarkedPrice', sql.Money, markedPrice)
        .input('ItmIsueTime', sql.DateTime, itmIsueTime)
        .query(insertDtl);

      // Reduce stock quantity in ITEM_MST (AvlQty)
      const updateStock = `
        UPDATE I
        SET I.[AvlQty] = ISNULL(I.[AvlQty], 0) - @Qty
        FROM [cspMaster].[dbo].[ITEM_MST] I
        WHERE I.[SysID] = @ItemCode
      `;
      const reqStock = new sql.Request(transaction);
      await reqStock
        .input('ItemCode', sql.NVarChar(8), String(item.code).slice(0, 8))
        .input('Qty', sql.Float, itemQty)
        .query(updateStock);
    }

    await transaction.commit();

    // Verify header exists and return it for debugging/confirmation
    const verifyPool = await connectToDB();
    const verifyReq = new sql.Request(verifyPool);
    const verifyRes = await verifyReq
      .input('LocID', sql.VarChar(8), locId)
      .input('SysInvNO', sql.Int, sysInvNo)
      .input('TerInvNO', sql.VarChar(8), terInvNo)
      .query(`
        SELECT TOP 1 *
        FROM [cspMaster].[dbo].[INVOICE_HDR]
        WHERE [LocID]=@LocID AND [SysInvNO]=@SysInvNO AND [TerInvNO]=@TerInvNO
      `);

    return NextResponse.json({
      success: true,
      invoiceNumber: terInvNo,
      sysInvNo,
      headerRow: verifyRes.recordset?.[0] || null
    }, { status: 200 });
  } catch (error) {
    try {
      if (typeof transaction !== 'undefined') {
        await transaction.rollback();
      }
    } catch {}
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create invoice' }, { status: 500 });
  }
}