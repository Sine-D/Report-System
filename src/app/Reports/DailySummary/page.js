/*##################################################################################################################################################
####################################################################################################################################################
################################################################    LOGIC WRITTEN BY KAVIJA DULMITH    #############################################
###############################################################   FRONT-END WRITTEN BY SINETH DINSARA   ############################################ 
################################################################             28/08/2025                #############################################
####################################################################################################################################################
####################################################################################################################################################*/

'use client'

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Image from 'next/image';
import Link from 'next/link';
import { exportDailySummaryToExcel } from '../../../utils/excelExport';
import DailySummaryBarChart from '../../../components/DailySummaryBarChart';

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
      const res = await fetch(`/api/dailysummary?Date=${startDate}`, { method: 'GET' });
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
      text: `Generating ${selectedReport === 'p&l' ? 'P&L' : 'Daily Summary'} report for ${startDate}`,
      confirmButtonColor: '#28a745',
      confirmButtonText: 'OK'
    });

    fetchReport(); // fetch after validation
  };

  async function logout() {
    await fetch('./api/logout', { method: 'POST' })
    window.location.href = '/auth/Login'
  }

  // Excel export function for Daily Summary
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
      exportDailySummaryToExcel(reportItem, startDate);
      Swal.fire({
        icon: 'success',
        title: 'Export Successful',
        text: 'Daily Summary report has been exported to Excel',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      <div className="relative max-w-7xl mx-auto p-4 sm:p-6">

        {/* Enhanced Header */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-10 mb-8 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400/20 to-blue-400/20 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
            <div className="flex items-center space-x-6 mb-6 lg:mb-0">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17v-6h6v6M9 7h6m4 12H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
                  Daily Summary Report
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
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200 shadow-sm">
                <div className="text-sm text-gray-500 font-medium mb-1">Report Date</div>
                <div className="text-lg font-bold text-gray-900">{startDate}</div>
              </div>
            </div>
          </div>

          {/* Enhanced Report Controls */}
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Report Type Navigation */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-700 flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-6h6v6M9 7h6m4 12H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span>Report Type</span>
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/Reports/DailySummary">
                  <div className='w-full sm:w-auto px-6 py-3 rounded-2xl text-sm font-bold transition-all bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-6h6v6M9 7h6m4 12H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2z" />
                      </svg>
                      <span>Daily Summary</span>
                    </div>
                  </div>
                </Link>
                <Link href="/Reports/P&L">
                  <div className='w-full sm:w-auto px-6 py-3 rounded-2xl text-sm font-bold transition-all bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5'>
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
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    value={startDate}
                    name="Date"
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-white hover:border-gray-300 text-gray-900 text-base font-medium shadow-sm hover:shadow-md group-focus-within:shadow-lg"
                  />
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
            {/* Enhanced Report Data */}
            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8 h-full order-2 lg:order-1 overflow-hidden">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/10 to-green-400/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-6h6v6M9 7h6m4 12H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Daily Summary</h2>
                    <p className="text-sm text-gray-600">Comprehensive business report</p>
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
              
              <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 overflow-auto max-h-[70vh] border border-gray-100 shadow-inner">
                <div className="text-sm leading-relaxed text-gray-700">
                  
                  {/* Enhanced Title */}
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">DAILY SUMMARY</h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mx-auto"></div>
                  </div>
                  
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="text-gray-600 font-medium">Generating report...</p>
                      </div>
                    </div>
                  ) : Array.isArray(reportItem) && reportItem.length > 0 ? (
                    reportItem.map((item, idx) => (
                      <div key={idx} className="space-y-6">
                        {/* Enhanced Invoice Section */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-sm">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Invoice Summary</h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-gray-700">Total Amount:</span>
                                <span className="font-bold text-lg text-blue-600">{item.TotInvoAmt}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">No. of Invoices:</span>
                                <span className="font-semibold text-gray-800">{item.TotNumOfInvo}</span>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg shadow-sm">
                                <span className="text-gray-600">Cash:</span>
                                <span className="font-semibold text-green-600">{item.CashTotal}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg shadow-sm">
                                <span className="text-gray-600">Credit:</span>
                                <span className="font-semibold text-blue-600">{item.CreditTot}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg shadow-sm">
                                <span className="text-gray-600">Cheques:</span>
                                <span className="font-semibold text-purple-600">{item.TotCheq}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg shadow-sm">
                                <span className="text-gray-600">Gift Voucher:</span>
                                <span className="font-semibold text-pink-600">{item.GVAmt}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg shadow-sm">
                                <span className="text-gray-600">Credit Card:</span>
                                <span className="font-semibold text-indigo-600">{item.CreCardAmt}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg shadow-sm">
                                <span className="text-gray-600">Other:</span>
                                <span className="font-semibold text-gray-600">{item.DebiNote}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Credit Settlement Section */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-sm">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Credit Settlement</h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-gray-700">Total Settlement:</span>
                                <span className="font-bold text-lg text-green-600">{item.TotAmouOfCS}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">No. of Settlements:</span>
                                <span className="font-semibold text-gray-800">{item.TotNumOfCS}</span>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg shadow-sm">
                                <span className="text-gray-600">Cash:</span>
                                <span className="font-semibold text-green-600">{item.CSCashAmt}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg shadow-sm">
                                <span className="text-gray-600">Credit:</span>
                                <span className="font-semibold text-blue-600">{item.CSCCAmt}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg shadow-sm">
                                <span className="text-gray-600">Cheques:</span>
                                <span className="font-semibold text-purple-600">{item.CSChqAmt}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg shadow-sm">
                                <span className="text-gray-600">Other:</span>
                                <span className="font-semibold text-gray-600">{item.CSDNAmt}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg shadow-sm">
                                <span className="text-gray-600">Gift Voucher:</span>
                                <span className="font-semibold text-pink-600">{item.CSGVAmt}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Cash Flow Section */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-sm">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Cash Flow</h3>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center py-3 px-4 bg-white rounded-xl shadow-sm">
                              <span className="font-semibold text-gray-700">Opening Drawer Amount:</span>
                              <span className="font-bold text-lg text-purple-600">{item.OpnDrawAmt}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 px-4 bg-white rounded-xl shadow-sm">
                              <span className="font-semibold text-gray-700">Cash from Invoices:</span>
                              <span className="font-bold text-lg text-green-600">{item.TotInvoAmt}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 px-4 bg-white rounded-xl shadow-sm">
                              <span className="font-semibold text-gray-700">Cash from Settlements:</span>
                              <span className="font-bold text-lg text-blue-600">{item.TotAmouOfCS}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 px-4 bg-white rounded-xl shadow-sm">
                              <span className="font-semibold text-gray-700">Direct Cash Receiving:</span>
                              <span className="font-bold text-lg text-indigo-600">{item.CshReceive}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 px-4 bg-white rounded-xl shadow-sm">
                              <span className="font-semibold text-gray-700">Cash Withdrawals:</span>
                              <span className="font-bold text-lg text-red-600">{item.CshWithdra}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 px-4 bg-white rounded-xl shadow-sm">
                              <span className="font-semibold text-gray-700">Other Expenses:</span>
                              <span className="font-bold text-lg text-orange-600">{item.OtherExpences}</span>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Final Balance */}
                        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border-2 border-red-200 shadow-lg">
                          <div className="text-center">
                            <div className="flex items-center justify-center space-x-3 mb-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <h3 className="text-xl font-bold text-gray-800">Final Drawer Balance</h3>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                              <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                                {item.Finaleee}
                              </div>
                              <div className="text-sm text-gray-600 mt-2">End of Day Balance</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-12 flex flex-col items-center justify-center min-h-[480px] border border-gray-200 shadow-lg">
                      <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-700 mb-2">No Data Available</h3>
                      <p className="text-gray-600 text-center">Generate a report to view daily summary data</p>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Enhanced Chart Section */}
            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8 h-full order-1 lg:order-2 overflow-hidden">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/10 to-purple-400/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Visual Analytics</h2>
                  <p className="text-sm text-gray-600">Interactive data visualization</p>
                </div>
              </div>
              
              <div className="relative bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-6 h-full border border-gray-100 shadow-inner">
                {Array.isArray(reportItem) && reportItem.length > 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <DailySummaryBarChart data={reportItem} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                      <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Chart Preview</h3>
                    <p className="text-gray-600 text-center">Generate a report to view interactive charts</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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