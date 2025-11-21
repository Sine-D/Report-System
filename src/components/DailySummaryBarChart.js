/*##################################################################################################################################################
####################################################################################################################################################
###########################################################         SINETH DINSARA           #######################################################
###########################################################           21/10/2025             #######################################################
####################################################################################################################################################
####################################################################################################################################################*/

'use client'

import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DailySummaryBarChart = ({ data }) => {
  // Don't render if no data
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-400 text-sm mb-2">📊</div>
          <p className="text-gray-500 text-sm">No data to display</p>
        </div>
      </div>
    );
  }

  const item = data[0]; // Get the first item

  const [activeChart, setActiveChart] = React.useState('payments');

  // Payment Methods Data
  const paymentMethodsData = {
    labels: ['Cash', 'Credit', 'Cheques', 'Gift Voucher', 'Credit Card', 'Other'],
    datasets: [
      {
        label: 'Amount (LKR)',
        data: [
          parseFloat(item.CashTotal || 0),
          parseFloat(item.CreditTot || 0),
          parseFloat(item.TotCheq || 0),
          parseFloat(item.GVAmt || 0),
          parseFloat(item.CreCardAmt || 0),
          parseFloat(item.DebiNote || 0)
        ],
        backgroundColor: [
          '#10B981', // Green for cash
          '#3B82F6', // Blue for credit
          '#8B5CF6', // Purple for cheques
          '#F59E0B', // Orange for gift voucher
          '#EF4444', // Red for credit card
          '#6B7280'  // Gray for other
        ],
        borderColor: [
          '#059669',
          '#2563EB',
          '#7C3AED',
          '#D97706',
          '#DC2626',
          '#4B5563'
        ],
        borderWidth: 2,
      },
    ],
  };

  // Credit Settlement Data
  const creditSettlementData = {
    labels: ['Cash', 'Credit', 'Cheques', 'Other', 'Gift Voucher'],
    datasets: [
      {
        label: 'Amount (LKR)',
        data: [
          parseFloat(item.CSCashAmt || 0),
          parseFloat(item.CSCCAmt || 0),
          parseFloat(item.CSChqAmt || 0),
          parseFloat(item.CSDNAmt || 0),
          parseFloat(item.CSGVAmt || 0)
        ],
        backgroundColor: [
          '#10B981',
          '#3B82F6',
          '#8B5CF6',
          '#6B7280',
          '#F59E0B'
        ],
        borderColor: [
          '#059669',
          '#2563EB',
          '#7C3AED',
          '#4B5563',
          '#D97706'
        ],
        borderWidth: 2,
      },
    ],
  };

  // Cash Flow Data
  const cashFlowData = {
    labels: ['Opening', 'Invoice Cash', 'Credit Settlement', 'Direct Receiving', 'Withdrawals', 'Other Expenses'],
    datasets: [
      {
        label: 'Amount (LKR)',
        data: [
          parseFloat(item.OpnDrawAmt || 0),
          parseFloat(item.CashTotal || 0),
          parseFloat(item.CSCashAmt || 0),
          parseFloat(item.CshReceive || 0),
          parseFloat(item.CshWithdra || 0),
          parseFloat(item.OtherExpences || 0)
        ],
        backgroundColor: [
          '#10B981', // Green for positive
          '#3B82F6', // Blue for invoice cash
          '#8B5CF6', // Purple for credit settlement
          '#F59E0B', // Orange for direct receiving
          '#EF4444', // Red for withdrawals
          '#6B7280'  // Gray for expenses
        ],
        borderColor: [
          '#059669',
          '#2563EB',
          '#7C3AED',
          '#D97706',
          '#DC2626',
          '#4B5563'
        ],
        borderWidth: 2,
      },
    ],
  };

  // Invoice vs Credit Settlement Comparison
  const comparisonData = {
    labels: ['Total Invoice Amount', 'Total Credit Settlement'],
    datasets: [
      {
        label: 'Amount (LKR)',
        data: [
          parseFloat(item.TotInvoAmt || 0),
          parseFloat(item.TotAmouOfCS || 0)
        ],
        backgroundColor: ['#10B981', '#3B82F6'],
        borderColor: ['#059669', '#2563EB'],
        borderWidth: 2,
      },
    ],
  };

  // Payment Methods Pie Chart Data
  const paymentPieData = {
    labels: ['Cash', 'Credit', 'Cheques', 'Gift Voucher', 'Credit Card', 'Other'],
    datasets: [
      {
        data: [
          parseFloat(item.CashTotal || 0),
          parseFloat(item.CreditTot || 0),
          parseFloat(item.TotCheq || 0),
          parseFloat(item.GVAmt || 0),
          parseFloat(item.CreCardAmt || 0),
          parseFloat(item.DebiNote || 0)
        ],
        backgroundColor: [
          '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280'
        ],
        borderColor: [
          '#059669', '#2563EB', '#7C3AED', '#D97706', '#DC2626', '#4B5563'
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 10
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y || context.parsed;
            return `${context.dataset.label}: ${value.toLocaleString('en-US', { 
              style: 'currency', 
              currency: 'LKR',
              minimumFractionDigits: 2 
            })}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString('en-US', { 
              style: 'currency', 
              currency: 'LKR',
              minimumFractionDigits: 0 
            });
          }
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 9
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value.toLocaleString('en-US', { 
              style: 'currency', 
              currency: 'LKR',
              minimumFractionDigits: 2 
            })} (${percentage}%)`;
          }
        }
      }
    }
  };

  const chartComponents = {
    payments: <Bar data={paymentMethodsData} options={options} />,
    credit: <Bar data={creditSettlementData} options={options} />,
    cashflow: <Bar data={cashFlowData} options={options} />,
    comparison: <Bar data={comparisonData} options={options} />,
    pie: <Pie data={paymentPieData} options={pieOptions} />
  };

  return (
    <div className="w-full h-full p-4 flex flex-col">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Daily Summary Analytics</h3>
        <p className="text-sm text-gray-600">Comprehensive Financial Analysis - {new Date().toLocaleDateString()}</p>
      </div>

      {/* Chart Type Navigation */}
      <div className="flex flex-wrap gap-1 mb-4 bg-gray-100 rounded-lg p-1">
        {[
          { key: 'payments', label: 'Payment Methods' },
          { key: 'credit', label: 'Credit Settlement' },
          { key: 'cashflow', label: 'Cash Flow' },
          { key: 'comparison', label: 'Invoice vs Credit' },
          { key: 'pie', label: 'Payment Pie' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveChart(key)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              activeChart === key 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full h-64">
          {chartComponents[activeChart]}
        </div>
      </div>

      {/* Detailed Summary Stats */}
      <div className="mt-4 space-y-3">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-blue-50 p-2 rounded">
            <span className="text-blue-600 font-medium">Total Invoices: </span>
            <span className="text-blue-800 font-bold">{item.TotNumOfInvo || 0}</span>
          </div>
          <div className="bg-green-50 p-2 rounded">
            <span className="text-green-600 font-medium">Credit Settlements: </span>
            <span className="text-green-800 font-bold">{item.TotNumOfCS || 0}</span>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 gap-2 text-xs">
          <div className="bg-gray-50 p-2 rounded">
            <span className="text-gray-600 font-medium">Total Invoice Amount: </span>
            <span className="text-gray-800 font-bold">{(parseFloat(item.TotInvoAmt || 0)).toLocaleString('en-US', { 
              style: 'currency', 
              currency: 'LKR',
              minimumFractionDigits: 2 
            })}</span>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <span className="text-gray-600 font-medium">Total Credit Settlement: </span>
            <span className="text-gray-800 font-bold">{(parseFloat(item.TotAmouOfCS || 0)).toLocaleString('en-US', { 
              style: 'currency', 
              currency: 'LKR',
              minimumFractionDigits: 2 
            })}</span>
          </div>
        </div>

        {/* Final Balance */}
        <div className="bg-red-50 p-3 rounded text-center border-2 border-red-200">
          <span className="text-red-600 font-bold text-sm">FINAL DRAWER BALANCE: </span>
          <span className="text-red-800 font-bold text-lg">{(parseFloat(item.Finaleee || 0)).toLocaleString('en-US', { 
            style: 'currency', 
            currency: 'LKR',
            minimumFractionDigits: 2 
          })}</span>
        </div>
      </div>
    </div>
  );
};

export default DailySummaryBarChart;
