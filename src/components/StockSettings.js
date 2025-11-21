/*##################################################################################################################################################
####################################################################################################################################################
################################################################    SINETH DINSARA    ##############################################################
################################################################       21/10/2025     ##############################################################
####################################################################################################################################################
####################################################################################################################################################*/

'use client'
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const StockSettings = ({ onSettingsChange, isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    defaultThreshold: 10,
    notificationEnabled: true,
    checkInterval: 5,
    autoNotification: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  // Load settings from API
  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings?type=stock');
      const data = await response.json();
      
      if (response.ok && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load settings',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  // Save settings to API
  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settingType: 'stock',
          settings: settings
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Settings Saved',
          text: 'Stock settings have been updated successfully',
          confirmButtonText: 'OK',
          confirmButtonColor: '#10b981',
          timer: 2000,
          timerProgressBar: true
        });
        
        // Notify parent component of changes
        if (onSettingsChange) {
          onSettingsChange(settings);
        }
        
        // Close modal
        onClose();
      } else {
        throw new Error(data.error || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save settings',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset to defaults
  const resetToDefaults = () => {
    Swal.fire({
      title: 'Reset Settings',
      text: 'Are you sure you want to reset all settings to default values?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reset',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280'
    }).then((result) => {
      if (result.isConfirmed) {
        setSettings({
          defaultThreshold: 10,
          notificationEnabled: true,
          checkInterval: 5,
          autoNotification: true
        });
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Stock Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="ml-2 text-gray-600">Loading settings...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Default Threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Stock Threshold
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.defaultThreshold}
                  onChange={(e) => handleInputChange('defaultThreshold', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter threshold value"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Items with quantity below this value will trigger low stock alerts
                </p>
              </div>

              {/* Check Interval */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check Interval (minutes)
                </label>
                <select
                  value={settings.checkInterval}
                  onChange={(e) => handleInputChange('checkInterval', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value={1}>1 minute</option>
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  How often to check for low stock items
                </p>
              </div>

              {/* Notification Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">Notification Settings</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Enable Notifications
                    </label>
                    <p className="text-xs text-gray-500">
                      Show popup notifications for low stock items
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notificationEnabled}
                      onChange={(e) => handleInputChange('notificationEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Auto Notifications
                    </label>
                    <p className="text-xs text-gray-500">
                      Automatically show notifications when page loads
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoNotification}
                      onChange={(e) => handleInputChange('autoNotification', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t">
                <button
                  onClick={resetToDefaults}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockSettings;
