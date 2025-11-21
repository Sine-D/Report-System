/*##################################################################################################################################################
####################################################################################################################################################
################################################################    SINETH DINSARA    ##############################################################
################################################################       21/10/2025     ##############################################################
####################################################################################################################################################
####################################################################################################################################################*/

'use client'

import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const SimplePieChart = ({ data }) => {
  // Don't render if no data
  if (!data || (data.TOTAL_COST === 0 && data.TOTAL_SALE === 0)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-400 text-sm mb-2">📊</div>
          <p className="text-gray-500 text-sm">No data to display</p>
        </div>
      </div>
    );
  }

  // Calculate profit/loss for the pie chart
  const profit = data.PROFIT_OR_LOSS >= 0 ? data.PROFIT_OR_LOSS : 0;
  const loss = data.PROFIT_OR_LOSS < 0 ? Math.abs(data.PROFIT_OR_LOSS) : 0;

  // Prepare chart data
  const chartData = {
    labels: ['Cost', 'Profit', ...(loss > 0 ? ['Loss'] : [])],
    datasets: [
      {
        data: [
          data.TOTAL_COST || 0,
          profit,
          ...(loss > 0 ? [loss] : [])
        ],
        backgroundColor: [
          '#EF4444', // Red for cost
          '#10B981', // Green for profit
          ...(loss > 0 ? ['#F59E0B'] : []) // Orange for loss
        ],
        borderColor: [
          '#DC2626',
          '#059669',
          ...(loss > 0 ? ['#D97706'] : [])
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
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value.toLocaleString('en-US', { 
              style: 'currency', 
              currency: 'LKR',
              minimumFractionDigits: 2 
            })} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="w-full h-full p-4 flex flex-col">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">P&L Overview</h3>
        <p className="text-sm text-gray-600">Financial Breakdown</p>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full h-64">
          <Pie data={chartData} options={options} />
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="bg-red-50 p-2 rounded">
            <span className="text-red-600 font-medium">Cost: </span>
            <span className="text-red-800">{(data.TOTAL_COST || 0).toLocaleString('en-US', { 
              style: 'currency', 
              currency: 'LKR',
              minimumFractionDigits: 2 
            })}</span>
          </div>
          <div className="bg-green-50 p-2 rounded">
            <span className="text-green-600 font-medium">Sales: </span>
            <span className="text-green-800">{(data.TOTAL_SALE || 0).toLocaleString('en-US', { 
              style: 'currency', 
              currency: 'LKR',
              minimumFractionDigits: 2 
            })}</span>
          </div>
          <div className={`p-2 rounded ${data.PROFIT_OR_LOSS >= 0 ? 'bg-green-50' : 'bg-orange-50'}`}>
            <span className={`font-medium ${data.PROFIT_OR_LOSS >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
              {data.PROFIT_OR_LOSS >= 0 ? 'Profit: ' : 'Loss: '}
            </span>
            <span className={data.PROFIT_OR_LOSS >= 0 ? 'text-green-800' : 'text-orange-800'}>
              {Math.abs(data.PROFIT_OR_LOSS || 0).toLocaleString('en-US', { 
                style: 'currency', 
                currency: 'LKR',
                minimumFractionDigits: 2 
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplePieChart;
