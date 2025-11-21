'use server'

import { NextResponse } from 'next/server'
import { connectToDB, sql } from '../../db'

export async function POST(request) {
	let tx
	try {
		const body = await request.json()
		const {
			header = {},
			items = [],
		} = body || {}

		if (!Array.isArray(items) || items.length === 0) {
			return NextResponse.json({ ok: false, message: 'No items to save' }, { status: 400 })
		}

		const pool = await connectToDB()
		tx = new sql.Transaction(pool)
		await tx.begin()
		const req = new sql.Request(tx)

		// Auto-generate GrnNo (GRN00001...) while keeping LocID fixed as POS00001.
		// IMPORTANT: Only consider TEMP table so numbering starts at GRN00001 for this flow.
		const seqQuery = `
			SELECT 
				CASE 
					WHEN MAX(
						CASE 
							WHEN LEFT(ISNULL(GrnNo,''),3)='GRN' AND ISNUMERIC(REPLACE(GrnNo,'GRN',''))=1
								THEN CONVERT(INT, REPLACE(GrnNo,'GRN',''))
							ELSE 0
						END
					) IS NULL OR MAX(
						CASE 
							WHEN LEFT(ISNULL(GrnNo,''),3)='GRN' AND ISNUMERIC(REPLACE(GrnNo,'GRN',''))=1
								THEN CONVERT(INT, REPLACE(GrnNo,'GRN',''))
							ELSE 0
						END
					) = 0
					THEN 1
					ELSE MAX(
						CASE 
							WHEN LEFT(ISNULL(GrnNo,''),3)='GRN' AND ISNUMERIC(REPLACE(GrnNo,'GRN',''))=1
								THEN CONVERT(INT, REPLACE(GrnNo,'GRN',''))
							ELSE 0
						END
					) + 1
				END AS NextGrn
			FROM [dbo].[GOODS_RECEIVE_HDR_TEMP];
		`
		const seqRes = await req.query(seqQuery)
		const nextGrn = seqRes.recordset?.[0]?.NextGrn || 1
		const locId = 'POS00001'
		const grnNo = `GRN${String(nextGrn).padStart(5, '0')}`
		const grnDate = header.date ? new Date(header.date) : new Date()
		const suppCode = header.supplier || null
		const refNo = header.invoiceNo || null
		const staffCode = header.staff || null
		const remark = header.remark || null
		const grossTotal = items.reduce((sum, r) => {
			const qty = Number(r.quantity) || 0
			const price = Number(r.purchasedPrice) || 0
			return sum + qty * price
		}, 0)

		// Insert Header into GOODS_RECEIVE_HDR_TEMP (clone of GOODS_RECEIVE_HDR)
		await req
			.input('LocID', sql.VarChar(20), locId)
			.input('GrnNo', sql.VarChar(50), grnNo)
			.input('GrnDate', sql.DateTime, grnDate)
			.input('CateId', sql.VarChar(2), 'DI')
			.input('SuppCode', sql.VarChar(20), suppCode)
			.input('RefNo', sql.VarChar(50), refNo)
			.input('StaffCode', sql.VarChar(20), staffCode)
			.input('Remark', sql.VarChar(400), remark)
			.input('GrossTotal', sql.Decimal(18, 2), grossTotal)
			.query(`
        INSERT INTO [dbo].[GOODS_RECEIVE_HDR_TEMP]
          ([LocID], [GrnNo], [GrnDate], [CateId], [SuppCode], [RefNo], [StaffCode], [Remar], [GrossTot])
        VALUES
          (@LocID, @GrnNo, @GrnDate, @CateId, @SuppCode, @RefNo, @StaffCode, @Remark, @GrossTotal)
      `)
		// Conditionally set GmStat and GmTotal (avoid compile-time errors if columns don't exist)
		const gmStatExists = await new sql.Request(tx).query(`
      SELECT 1 AS x 
      WHERE EXISTS (
        SELECT 1 FROM sys.columns 
        WHERE object_id = OBJECT_ID('dbo.GOODS_RECEIVE_HDR_TEMP') AND name = 'GmStat'
      )`)
		if (gmStatExists.recordset?.length) {
			await new sql.Request(tx)
				.input('GrnNo', sql.VarChar(50), grnNo)
				.input('GrossTotal', sql.Decimal(18, 2), grossTotal)
				.query(`UPDATE [dbo].[GOODS_RECEIVE_HDR_TEMP] SET [GmStat] = @GrossTotal WHERE [GrnNo] = @GrnNo`)
		}
		// Try multiple common spellings for GmTotal in case schema differs
		const gmTotalNameRes = await new sql.Request(tx).query(`
      SELECT TOP 1 name 
      FROM sys.columns 
      WHERE object_id = OBJECT_ID('dbo.GOODS_RECEIVE_HDR_TEMP')
        AND name IN ('GmTotal','GmTot','GmTotl')
    `)
		const gmTotalCol = gmTotalNameRes.recordset?.[0]?.name
		if (gmTotalCol) {
			await new sql.Request(tx)
				.input('GrnNo', sql.VarChar(50), grnNo)
				.input('GrossTotal', sql.Decimal(18, 2), grossTotal)
				.query(`UPDATE [dbo].[GOODS_RECEIVE_HDR_TEMP] SET [${gmTotalCol}] = @GrossTotal WHERE [GrnNo] = @GrnNo`)
		}

		// Insert Details into GOODS_RECEIVE_DTL_TEMP (clone of GOODS_RECEIVE_DTL)
		for (let index = 0; index < items.length; index++) {
			const row = items[index]
			const lineNo = index + 1
			const qty = Number(row.quantity) || 0
			const price = Number(row.purchasedPrice) || 0
			const total = qty * price

			const dreq = new sql.Request(tx)
			await dreq
				.input('LocID', sql.VarChar(20), locId)
				.input('GrnNo', sql.VarChar(50), grnNo)
				.input('LinNo', sql.Int, lineNo)
				.input('ItemCode', sql.VarChar(100), row.itemCode || null)
				.input('GoodQty', sql.Decimal(18, 3), qty)
				.input('PruchPrice', sql.Decimal(18, 2), price)
				.input('PurPrice', sql.Decimal(18, 2), price)
				.input('TotPuchPrice', sql.Decimal(18, 2), total)
				.query(`
          INSERT INTO [dbo].[GOODS_RECEIVE_DTL_TEMP]
            ([LocID], [GrnNo], [LinNo], [ItemCode], [GoodQty], [PruchPrice], [PurPrice], [TotPuchPrice])
          VALUES
            (@LocID, @GrnNo, @LinNo, @ItemCode, @GoodQty, @PruchPrice, @PurPrice, @TotPuchPrice)
        `)
		}

		await tx.commit()
		return NextResponse.json({ ok: true, message: 'GRN saved to TEMP tables', grnNo, locId })
	} catch (err) {
		// Attempt rollback if a transaction exists in scope
		try {
			if (tx && tx._aborted !== true) {
				await tx.rollback()
			}
		} catch {}
		console.error('GRN save error:', err)
		return NextResponse.json({ ok: false, message: 'Failed to save GRN', error: String(err?.message || err) }, { status: 500 })
	}
}

