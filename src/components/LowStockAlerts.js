/*##################################################################################################################################################
####################################################################################################################################################
################################################################    SINETH DINSARA    ##############################################################
################################################################       21/10/2025     ##############################################################
####################################################################################################################################################
####################################################################################################################################################*/

'use client'
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import notificationService from '../utils/notificationService';
import StockSettings from './StockSettings';

const LowStockAlerts = ({ threshold = 10, showNotification = true }) => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [currentThreshold, setCurrentThreshold] = useState(threshold);

  // Function to fetch low stock items
  const fetchLowStockItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/lowstock?threshold=${currentThreshold}`);
      const data = await response.json();
      
      if (response.ok) {
        setLowStockItems(data.items || []);
        setLastChecked(new Date().toLocaleString());
        
        // Show notification if there are low stock items and notification is enabled
        if (showNotification && data.items && data.items.length > 0) {
          await notificationService.showLowStockNotification(data.items, currentThreshold);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch low stock items');
      }
    } catch (err) {
      console.error('Error fetching low stock items:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to show low stock notification
  const showLowStockNotification = (items) => {
    const outOfStockItems = items.filter(item => item.GoodQty === 0);
    const lowStockItems = items.filter(item => item.GoodQty > 0 && item.GoodQty <= threshold);
    
    let title = 'Low Stock Alert!';
    let html = '';
    
    if (outOfStockItems.length > 0) {
      html += `<div class="text-left">
        <h4 class="font-bold text-red-600 mb-2">Out of Stock (${outOfStockItems.length} items):</h4>
        <ul class="list-disc list-inside text-sm mb-3">`;
      outOfStockItems.forEach(item => {
        html += `<li class="mb-1">${item.ItemName} (${item.SysID})</li>`;
      });
      html += `</ul></div>`;
    }
    
    if (lowStockItems.length > 0) {
      html += `<div class="text-left">
        <h4 class="font-bold text-orange-600 mb-2">Low Stock (${lowStockItems.length} items):</h4>
        <ul class="list-disc list-inside text-sm">`;
      lowStockItems.forEach(item => {
        html += `<li class="mb-1">${item.ItemName} - Qty: ${item.GoodQty}</li>`;
      });
      html += `</ul></div>`;
    }
    
    html += `<div class="mt-3 text-sm text-gray-600">
      Total items requiring attention: ${items.length}
    </div>`;

    Swal.fire({
      icon: 'warning',
      title: title,
      html: html,
      confirmButtonText: 'View Details',
      showCancelButton: true,
      cancelButtonText: 'Dismiss',
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      width: '500px',
      customClass: {
        popup: 'text-left'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        showDetailedView(items);
      }
    });
  };

  // Function to show detailed low stock view
  const showDetailedView = (items) => {
    let html = `
      <div class="max-h-96 overflow-y-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-100">
              <th class="text-left p-2 border">Item Code</th>
              <th class="text-left p-2 border">Item Name</th>
              <th class="text-center p-2 border">Quantity</th>
              <th class="text-center p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    items.forEach(item => {
      const statusColor = item.GoodQty === 0 ? 'text-red-600' : 'text-orange-600';
      html += `
        <tr>
          <td class="p-2 border font-mono text-xs">${item.SysID}</td>
          <td class="p-2 border">${item.ItemName}</td>
          <td class="p-2 border text-center font-bold">${item.GoodQty}</td>
          <td class="p-2 border text-center ${statusColor} font-medium">${item.StockStatus}</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;

    Swal.fire({
      title: 'Low Stock Items Details',
      html: html,
      confirmButtonText: 'Close',
      confirmButtonColor: '#6b7280',
      width: '700px'
    });
  };

  // Auto-fetch low stock items
  useEffect(() => {
    // Check notification status from service
    setNotificationsEnabled(notificationService.checkNotificationStatus());
    
    fetchLowStockItems();
    
    // Set up periodic checking (every 5 minutes)
    const interval = setInterval(fetchLowStockItems, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [currentThreshold, showNotification]);

  // Function to manually refresh
  const handleRefresh = () => {
    fetchLowStockItems();
  };

  // Function to update threshold
  const handleUpdateThreshold = () => {
    setShowSettings(true);
  };

  // Handle settings change
  const handleSettingsChange = (newSettings) => {
    setCurrentThreshold(newSettings.defaultThreshold);
    setNotificationsEnabled(newSettings.notificationEnabled);
    fetchLowStockItems(); // Refresh with new settings
  };

  // Function to toggle notifications
  const handleToggleNotifications = () => {
    if (notificationsEnabled) {
      notificationService.disableNotifications();
      setNotificationsEnabled(false);
      Swal.fire({
        icon: 'info',
        title: 'Notifications Disabled',
        text: 'Low stock notifications have been disabled.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#6b7280',
        timer: 2000,
        timerProgressBar: true
      });
    } else {
      notificationService.enableNotifications();
      setNotificationsEnabled(true);
      Swal.fire({
        icon: 'success',
        title: 'Notifications Enabled',
        text: 'Low stock notifications have been enabled.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#10b981',
        timer: 2000,
        timerProgressBar: true
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
          <h3 className="text-lg font-semibold text-gray-800">Low Stock Alerts</h3>
          {lowStockItems.length > 0 && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {lowStockItems.length}
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleUpdateThreshold}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md transition-colors"
            title="Update threshold"
          >
            Threshold: {currentThreshold}
          </button>
          <button
            onClick={handleToggleNotifications}
            className={`text-xs px-3 py-1 rounded-md transition-colors ${
              notificationsEnabled 
                ? 'bg-green-100 hover:bg-green-200 text-green-700' 
                : 'bg-red-100 hover:bg-red-200 text-red-700'
            }`}
            title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
          >
            {notificationsEnabled ? '🔔 ON' : '🔕 OFF'}
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-md transition-colors disabled:opacity-50"
            title="Refresh alerts"
          >
            {loading ? 'Checking...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
          <p className="text-red-700 text-sm">Error: {error}</p>
        </div>
      )}

      {loading && lowStockItems.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-2 text-gray-600">Checking stock levels...</span>
        </div>
      )}

      {!loading && lowStockItems.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <p className="text-gray-600 font-medium">All items are well stocked!</p>
          <p className="text-gray-500 text-sm mt-1">No items below threshold of {currentThreshold}</p>
        </div>
      )}

      {!loading && lowStockItems.length > 0 && (
        <div className="space-y-3 max-h-[60vh] lg:max-h-[70vh] overflow-y-auto">
          {lowStockItems.map((item, index) => (
            <div key={index} className={`border rounded-lg p-3 ${
              item.GoodQty === 0 
                ? 'border-red-200 bg-red-50' 
                : 'border-orange-200 bg-orange-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.ItemName}</h4>
                  <p className="text-sm text-gray-600 font-mono">{item.SysID}</p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    item.GoodQty === 0 ? 'text-red-600' : 'text-orange-600'
                  }`}>
                    {item.GoodQty}
                  </div>
                  <div className={`text-xs font-medium ${
                    item.GoodQty === 0 ? 'text-red-500' : 'text-orange-500'
                  }`}>
                    {item.StockStatus}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button
            onClick={() => showDetailedView(lowStockItems)}
            className="w-full mt-3 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium py-2 px-4 rounded-md transition-colors"
          >
            View All Details
          </button>
        </div>
      )}

      {lastChecked && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          Last checked: {lastChecked}
        </div>
      )}

      {/* Settings Modal */}
      <StockSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
};

export default LowStockAlerts;
