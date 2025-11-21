/*##################################################################################################################################################
####################################################################################################################################################
###########################################################         SINETH DINSARA           #######################################################
###########################################################           20/10/2025             #######################################################
####################################################################################################################################################
####################################################################################################################################################*/

import * as XLSX from 'xlsx';

/* Export Daily Summary Report to Excel */
export const exportDailySummaryToExcel = (reportData, date) => {
  if (!reportData || reportData.length === 0) {
    alert('No data available to export');
    return;
  }

  const data = reportData[0]; // Daily summary has one record
  
  // Create worksheet
  const wb = XLSX.utils.book_new();
  
  // Prepare data for Excel
  const excelData = [
    ['DAILY SUMMARY REPORT'],
    ['Date:', date],
    [''],
    ['INVOICE DETAILS'],
    ['Total Invoice Amount:', data.TotInvoAmt || 0],
    ['Total No. Of Invoices:', data.TotNumOfInvo || 0],
    [''],
    ['Payment Methods:'],
    ['Cash:', data.CashTotal || 0],
    ['Credit:', data.CreditTot || 0],
    ['Cheques:', data.TotCheq || 0],
    ['Gift Voucher:', data.GVAmt || 0],
    ['Credit Card:', data.CreCardAmt || 0],
    ['Other:', data.DebiNote || 0],
    [''],
    ['CREDIT SETTLEMENT DETAILS'],
    ['Total Credit Settlement:', data.TotAmouOfCS || 0],
    ['Total No. Of Settlements:', data.TotNumOfCS || 0],
    [''],
    ['Credit Settlement Payment Methods:'],
    ['Cash:', data.CSCashAmt || 0],
    ['Credit:', data.CSCCAmt || 0],
    ['Cheques:', data.CSChqAmt || 0],
    ['Other:', data.CSDNAmt || 0],
    ['Gift Voucher:', data.CSGVAmt || 0],
    [''],
    ['EXPENSE DETAILS'],
    ['Opening Drawer Amount:', data.OpnDrawAmt || 0],
    ['Cash Receiving from Invoice:', data.TotInvoAmt || 0],
    ['Cash Receiving from Credit Settlement:', data.TotAmouOfCS || 0],
    ['Cash Receiving - Direct Drawer:', data.CshReceive || 0],
    ['Total Cash Withdrawals - Direct Drawer:', data.CshWithdra || 0],
    ['Other Expenses:', data.OtherExpences || 0],
    [''],
    ['FINAL BALANCE'],
    ['Final Drawer Balance for the Day:', data.Finaleee || 0]
  ];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(excelData);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 40 }, // Column A
    { wch: 20 }  // Column B
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Daily Summary');

  // Generate filename
  const filename = `Daily_Summary_Report_${date.replace(/-/g, '_')}.xlsx`;
  
  // Save file
  XLSX.writeFile(wb, filename);
};

/* Export P&L Report to Excel */
export const exportPnLToExcel = (reportData, fromDate, toDate) => {
  if (!reportData || reportData.length === 0) {
    alert('No data available to export');
    return;
  }

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  
  // Calculate totals
  const totals = reportData.reduce(
    (acc, item) => {
      acc.TOTAL_COST += Number(item.UnitCost || 0);
      acc.TOTAL_SALE += Number(item.NetSale || 0);
      acc.PROFIT_OR_LOSS += Number(item.ProAmt || 0);
      return acc;
    },
    { TOTAL_COST: 0, TOTAL_SALE: 0, PROFIT_OR_LOSS: 0 }
  );

  // Prepare data for Excel
  const excelData = [
    ['PROFIT AND LOSS REPORT II'],
    [`From: ${fromDate}`, `To: ${toDate}`],
    [''],
    ['Item Code', 'Item Name', 'Sold Qty', 'Selling Price', 'Total Cost', 'Net Sale', 'Profit/Loss']
  ];

  // Add data rows
  reportData.forEach(item => {
    excelData.push([
      item.ItemCode || '',
      item.ItemName || '',
      item.SoldQty || 0,
      item.UnitPrice || 0,
      item.UnitCost || 0,
      item.NetSale || 0,
      item.ProAmt || 0
    ]);
  });

  // Add totals row
  excelData.push(['', 'TOTAL:', '', '', totals.TOTAL_COST.toFixed(2), totals.TOTAL_SALE.toFixed(2), totals.PROFIT_OR_LOSS.toFixed(2)]);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(excelData);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 12 }, // Item Code
    { wch: 30 }, // Item Name
    { wch: 10 }, // Sold Qty
    { wch: 12 }, // Selling Price
    { wch: 12 }, // Total Cost
    { wch: 12 }, // Net Sale
    { wch: 12 }  // Profit/Loss
  ];

  // Style the header row
  const headerRange = XLSX.utils.decode_range(ws['!ref']);
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 3, c: col }); // Row 4 (0-indexed)
    if (!ws[cellAddress]) ws[cellAddress] = { v: '' };
    ws[cellAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "F0F0F0" } }
    };
  }

  // Style the totals row
  const lastRow = excelData.length - 1;
  for (let col = 0; col < 7; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: lastRow, c: col });
    if (!ws[cellAddress]) ws[cellAddress] = { v: '' };
    ws[cellAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "E0E0E0" } }
    };
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'P&L Report');

  // Generate filename
  const filename = `PnL_Report_${fromDate.replace(/-/g, '_')}_to_${toDate.replace(/-/g, '_')}.xlsx`;
  
  // Save file
  XLSX.writeFile(wb, filename);
};
