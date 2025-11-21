/*##################################################################################################################################################
####################################################################################################################################################
###############################################################     LOGIC WRITTEN BY KAVIJA DULMITH     ############################################
###############################################################   FRONT-END WRITTEN BY SINETH DINSARA   ############################################ 
###############################################################              28/08/2025                 ############################################
####################################################################################################################################################
####################################################################################################################################################*/

'use client'

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Image from 'next/image';
import Link from 'next/link';
import { exportPnLToExcel } from '../../../utils/excelExport';
import SimplePieChart from '../../../components/SimplePieChart';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('daily');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [reportItem, setReportItem] = useState([]);
  const [loading, setLoading] = useState(false);
  

  // This is the function which fetches report Data when we click the generate report button
  // It fetches the data from the API and updates the reportItem state
  // It also handles loading state and error handling
  async function fetchReport() {
    try {
      setLoading(true);
      const res = await fetch(`/api/pnl?fromDate=${startDate}&toDate=${endDate}`, { method: 'GET' });
      const reportData = await res.json();
      console.log("KAVIJA fetched data:", reportData);

      // make sure it's always an array
      if (Array.isArray(reportData)) {
        setReportItem(reportData);
      } else if (reportData && typeof reportData === 'object') {
        setReportItem([reportData]);
      } else {
        setReportItem([]);
      }
    } catch (err) {
      console.error("Error fetching report:", err);
      setReportItem([]);
    } finally {
      setLoading(false);
    }
  } 

  // Actually this is the function which we connect to the generate report button 
  /* 
    From here we trigger the fetchReport function after validation
  */
  const handleGenerateReport = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      Swal.fire({
        icon: 'error',
        title: 'Date Required',
        text: 'Please select both start and end dates',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK'
      });
      return;
    }

    // INFORIMING ALERT: that the report is being generated
    Swal.fire({
      icon: 'info',
      title: 'Generating Report',
      text: `Generating P&L II report for ${startDate}`,
      confirmButtonColor: '#28a745',
      confirmButtonText: 'OK'
    });

    fetchReport(); // fetch after validation
  };

  async function logout() {
    await fetch('./api/logout', { method: 'POST' })
    window.location.href = '/auth/Login'
  }

  // Excel export function for P&L Report
  const handleExcelExport = () => {
    if (!reportItem || reportItem.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Data',
        text: 'Please generate a report first before exporting to Excel',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      exportPnLToExcel(reportItem, startDate, endDate);
      Swal.fire({
        icon: 'success',
        title: 'Export Successful',
        text: 'P&L report has been exported to Excel',
        confirmButtonColor: '#28a745',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error('Excel export error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: 'Failed to export report to Excel. Please try again.',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK'
      });
    }
  }; 

  // I used this to check items array but no need more but I keep this for future debugging **KAVIJA DULMITH**
  /* 
    Actually this debugging method isnt working now because this is in UseEffect hook
    this work after the page load but we store the reportItem after clicking the generate report button
    so this will not work now but I keep this for future debugging
  */
  useEffect(() => {
    console.log("reportItem updated:", reportItem);
  }, [reportItem]);

  const totals = reportItem.reduce(
    (acc, item) => {
      acc.TOTAL_COST += Number(item.UnitCost || 0);
      acc.TOTAL_SALE += Number(item.NetSale || 0);
      acc.PROFIT_OR_LOSS += Number(item.ProAmt || 0);
      return acc;
    },
    { TOTAL_COST: 0, TOTAL_SALE: 0, PROFIT_OR_LOSS: 0 }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      <div className="relative max-w-7xl mx-auto p-4 sm:p-6">
      {/* Navigation Sidebar (disabled, using global Sidebar) */}
      <div className="hidden w-64 bg-gray-400 shadow-lg rounded-r-2xl p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">GLOBAL POS</h1>
        </div>
        
        <nav className="flex lg:flex-col justify-center lg:justify-start space-x-4 lg:space-x-0 lg:space-y-4">
            <Link href="/" >
                <div
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                    role="button"
                    tabIndex={0}
                >
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h7v7H3V7zm11 0h7v7h-7V7zM3 16h7v5H3v-5zm11 0h7v5h-7v-5z" />
                    </svg>
                    <span className="text-gray-600">Stock</span>
                </div>
            </Link>

            <Link href="/Reports/DailySummary">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-100 cursor-pointer">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-6h6v6M9 7h6m4 12H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-green-700 font-medium">Reports</span>
                </div>
            </Link>

            <Link href="/Add">
              <div className="flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm lg:text-base text-gray-600">Add Items</span>
              </div>
            </Link>
            
            <div
              className=" bg-[#b23b3b] flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 rounded-lg hover:bg-[#8a0c03] cursor-pointer transition-colors"
              role="button"
              tabIndex={0}
              >
              <div className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500">
                <Image src="/logout.png" width={5} height={5} className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500" alt="logout"/>
              </div>
              <button className="text-sm lg:text-base text-white" onClick={logout}>Log Out</button>
            </div>
        </nav>
      </div>

        {/* Enhanced Header */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-10 mb-8 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-green-400/20 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
            <div className="flex items-center space-x-6 mb-6 lg:mb-0">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 bg-clip-text text-transparent mb-2">
                  Profit & Loss Report
                </h1>
                
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-200 shadow-sm">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold">System Online</span>
                  </div>
                 

                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6 w-full lg:w-auto">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200 shadow-sm">
                <div className="text-sm text-gray-500 font-medium mb-1">Date Range</div>
                <div className="text-lg font-bold text-gray-900">{startDate} - {endDate}</div>
              </div>
            </div>
          </div>

          {/* Enhanced Report Controls */}
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Report Type Navigation */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-700 flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span>Report Type</span>
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/Reports/DailySummary">
                  <div className='w-full sm:w-auto px-6 py-3 rounded-2xl text-sm font-bold transition-all bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5'>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-6h6v6M9 7h6m4 12H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2z" />
                      </svg>
                      <span>Daily Summary</span>
                    </div>
                  </div>
                </Link>
                <Link href="/Reports/P&L">
                  <div className='w-full sm:w-auto px-6 py-3 rounded-2xl text-sm font-bold transition-all bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>P&L Report</span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Date Selection and Generate Button */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-700 flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span>Report Settings</span>
              </h3>
              <form className="space-y-4" onSubmit={handleGenerateReport}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="date"
                      value={startDate}
                      name="fromDate"
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-white hover:border-gray-300 text-gray-900 text-base font-medium shadow-sm hover:shadow-md group-focus-within:shadow-lg"
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="date"
                      value={endDate}
                      name="toDate"
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-white hover:border-gray-300 text-gray-900 text-base font-medium shadow-sm hover:shadow-md group-focus-within:shadow-lg"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white py-4 px-8 rounded-2xl font-bold hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed text-base group"
                >
                  <div className="flex items-center justify-center space-x-3">
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                    <span>{loading ? 'Generating...' : 'Generate Report'}</span>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                  </div>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Enhanced Content Area */}
        {selectedReport === 'daily' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch max-w-full mb-8">
            {/* Enhanced P&L Report Table */}
            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8 h-full order-2 lg:order-1 overflow-hidden">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/10 to-green-400/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">P&L Report</h2>
                    <p className="text-sm text-gray-600">Financial performance analysis</p>
                  </div>
                </div>
                <button 
                  onClick={handleExcelExport}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Export Excel</span>
                  </div>
                </button>
              </div>
              
              {/* Enhanced P&L Report Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">PROFIT AND LOSS REPORT II</h2>
                <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mx-auto mb-4"></div>
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex justify-center sm:justify-between items-center text-gray-700">
                    <div className="text-sm font-semibold">From: <span className="text-green-600">{startDate}</span></div>
                    <div className="text-sm font-semibold">To: <span className="text-green-600">{endDate}</span></div>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    <p className="text-gray-600 font-medium">Generating report...</p>
                  </div>
                </div>
              ) : reportItem.length > 0 ? (
                <div className="bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl p-6 overflow-auto max-h-[70vh] border border-gray-100 shadow-inner">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm min-w-[800px]">
                      <thead>
                        <tr className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                          <th className="px-4 py-3 text-center font-bold text-gray-800 text-sm w-20 rounded-l-xl">Code</th>
                          <th className="px-4 py-3 text-left font-bold text-gray-800 text-sm w-1/3">Item Name</th>
                          <th className="px-4 py-3 text-center font-bold text-gray-800 text-sm w-24">Sold Qty</th>
                          <th className="px-4 py-3 text-center font-bold text-gray-800 text-sm w-28">Selling Price</th>
                          <th className="px-4 py-3 text-center font-bold text-gray-800 text-sm w-28">Total Cost</th>
                          <th className="px-4 py-3 text-center font-bold text-gray-800 text-sm w-28">Net Sale</th>
                          <th className="px-4 py-3 text-center font-bold text-gray-800 text-sm w-28 rounded-r-xl">Profit/Loss</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportItem.map((item, idx) => (
                          <tr key={idx} className="border-b border-gray-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-green-50 transition-colors">
                            <td className="px-4 py-3 text-center text-gray-700 font-medium">{item.ItemCode}</td>
                            <td className="px-4 py-3 text-gray-700 font-medium">{item.ItemName}</td>
                            <td className="px-4 py-3 text-center text-gray-700 font-semibold">{item.SoldQty}</td>
                            <td className="px-4 py-3 text-center text-blue-600 font-semibold">{item.UnitPrice}</td>
                            <td className="px-4 py-3 text-center text-red-600 font-semibold">{item.UnitCost}</td>
                            <td className="px-4 py-3 text-center text-green-600 font-semibold">{item.NetSale}</td>
                            <td className={`px-4 py-3 text-center font-bold ${Number(item.ProAmt) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {item.ProAmt}
                            </td>
                          </tr>
                        ))}

                        {/* Enhanced Total Row */}
                        <tr className="bg-gradient-to-r from-gray-100 to-green-100 border-t-2 border-green-300">
                          <td className="px-4 py-4"></td>
                          <td className="px-4 py-4 font-bold text-gray-800 text-lg">TOTAL:</td>
                          <td className="px-4 py-4"></td>
                          <td className="px-4 py-4"></td>
                          <td className="px-4 py-4 text-center font-bold text-red-600 text-lg underline">{totals.TOTAL_COST.toFixed(2)}</td>
                          <td className="px-4 py-4 text-center font-bold text-green-600 text-lg underline">{totals.TOTAL_SALE.toFixed(2)}</td>
                          <td className={`px-4 py-4 text-center font-bold text-lg underline ${totals.PROFIT_OR_LOSS >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {totals.PROFIT_OR_LOSS.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-green-50 rounded-3xl p-12 flex flex-col items-center justify-center min-h-[480px] border border-gray-200 shadow-lg">
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No Data Available</h3>
                  <p className="text-gray-600 text-center">Generate a report to view P&L data</p>
                </div>
              )}
          </div>


            {/* Enhanced Chart Section */}
            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8 h-full order-1 lg:order-2 overflow-hidden">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/10 to-purple-400/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Financial Analytics</h2>
                  <p className="text-sm text-gray-600">Profit & Loss visualization</p>
                </div>
              </div>
              
              <div className="relative bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-6 h-full border border-gray-100 shadow-inner">
                {reportItem.length > 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <SimplePieChart data={totals} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                      <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Chart Preview</h3>
                    <p className="text-gray-600 text-center">Generate a report to view financial charts</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-12 flex flex-col items-center justify-center min-h-[480px] overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-400/10 to-gray-500/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-gray-400/10 to-gray-500/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative w-32 h-32 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Report Selected</h3>
            <p className="text-gray-600 text-center">Choose a report type and generate your data</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;

// DONE ND DUSTED 30-08-2025