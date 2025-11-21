/*##################################################################################################################################################
####################################################################################################################################################
################################################################    Sineth Dinsara    ##############################################################
################################################################      20/10/2025      ##############################################################
####################################################################################################################################################
####################################################################################################################################################*/

import Swal from 'sweetalert2';

class NotificationService {
  constructor() {
    this.lastNotificationTime = null;
    this.notificationCooldown = 5 * 60 * 1000; // 5 minutes between notifications
    this.isNotificationEnabled = true;
  }

  // Check if enough time has passed since last notification
  canShowNotification() {
    if (!this.isNotificationEnabled) return false;
    
    const now = Date.now();
    if (!this.lastNotificationTime || (now - this.lastNotificationTime) > this.notificationCooldown) {
      this.lastNotificationTime = now;
      return true;
    }
    return false;
  }

  // Show low stock notification
  async showLowStockNotification(items, threshold = 10) {
    if (!this.canShowNotification() || !items || items.length === 0) {
      return;
    }

    const outOfStockItems = items.filter(item => item.GoodQty === 0);
    const lowStockItems = items.filter(item => item.GoodQty > 0 && item.GoodQty <= threshold);
    
    let title = 'Low Stock Alert!';
    let icon = 'warning';
    let html = '';
    
    if (outOfStockItems.length > 0) {
      icon = 'error';
      html += `<div class="text-left">
        <h4 class="font-bold text-red-600 mb-2">🚨 Out of Stock (${outOfStockItems.length} items):</h4>
        <ul class="list-disc list-inside text-sm mb-3 max-h-32 overflow-y-auto">`;
      outOfStockItems.slice(0, 5).forEach(item => {
        html += `<li class="mb-1">${item.ItemName} (${item.SysID})</li>`;
      });
      if (outOfStockItems.length > 5) {
        html += `<li class="mb-1 text-gray-500 italic">... and ${outOfStockItems.length - 5} more items</li>`;
      }
      html += `</ul></div>`;
    }
    
    if (lowStockItems.length > 0) {
      html += `<div class="text-left">
        <h4 class="font-bold text-orange-600 mb-2">⚠️ Low Stock (${lowStockItems.length} items):</h4>
        <ul class="list-disc list-inside text-sm max-h-32 overflow-y-auto">`;
      lowStockItems.slice(0, 5).forEach(item => {
        html += `<li class="mb-1">${item.ItemName} - Qty: ${item.GoodQty}</li>`;
      });
      if (lowStockItems.length > 5) {
        html += `<li class="mb-1 text-gray-500 italic">... and ${lowStockItems.length - 5} more items</li>`;
      }
      html += `</ul></div>`;
    }
    
    html += `<div class="mt-3 text-sm text-gray-600 border-t pt-2">
      <strong>Total items requiring attention:</strong> ${items.length}
      <br>
      <span class="text-xs text-gray-500">Last checked: ${new Date().toLocaleString()}</span>
    </div>`;

    const result = await Swal.fire({
      icon: icon,
      title: title,
      html: html,
      confirmButtonText: 'View All Details',
      showCancelButton: true,
      cancelButtonText: 'Dismiss',
      showDenyButton: true,
      denyButtonText: 'Disable Alerts',
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      denyButtonColor: '#ef4444',
      width: '500px',
      customClass: {
        popup: 'text-left'
      },
      timer: 10000, // Auto close after 10 seconds
      timerProgressBar: true
    });

    if (result.isDenied) {
      this.disableNotifications();
      Swal.fire({
        icon: 'info',
        title: 'Notifications Disabled',
        text: 'Low stock notifications have been disabled. You can re-enable them from the stock page.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#6b7280'
      });
    }

    return result;
  }

  // Show success notification
  showSuccessNotification(title, text) {
    Swal.fire({
      icon: 'success',
      title: title,
      text: text,
      confirmButtonText: 'OK',
      confirmButtonColor: '#10b981',
      timer: 3000,
      timerProgressBar: true
    });
  }

  // Show error notification
  showErrorNotification(title, text) {
    Swal.fire({
      icon: 'error',
      title: title,
      text: text,
      confirmButtonText: 'OK',
      confirmButtonColor: '#ef4444'
    });
  }

  // Show info notification
  showInfoNotification(title, text) {
    Swal.fire({
      icon: 'info',
      title: title,
      text: text,
      confirmButtonText: 'OK',
      confirmButtonColor: '#3b82f6'
    });
  }

  // Show warning notification
  showWarningNotification(title, text) {
    Swal.fire({
      icon: 'warning',
      title: title,
      text: text,
      confirmButtonText: 'OK',
      confirmButtonColor: '#f59e0b'
    });
  }

  // Check if we're in browser environment
  isBrowser() {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // Disable notifications
  disableNotifications() {
    this.isNotificationEnabled = false;
    if (this.isBrowser()) {
      localStorage.setItem('lowStockNotificationsDisabled', 'true');
    }
  }

  // Enable notifications
  enableNotifications() {
    this.isNotificationEnabled = true;
    if (this.isBrowser()) {
      localStorage.removeItem('lowStockNotificationsDisabled');
    }
  }

  // Check if notifications are enabled 
  checkNotificationStatus() {
    if (!this.isBrowser()) {
      this.isNotificationEnabled = true; 
      return this.isNotificationEnabled;
    }
    const disabled = localStorage.getItem('lowStockNotificationsDisabled');
    this.isNotificationEnabled = !disabled;
    return this.isNotificationEnabled;
  }

  // Initialize notification service
  initialize() {
    this.checkNotificationStatus();
  }

  // Get notification settings
  getSettings() {
    return {
      isEnabled: this.isNotificationEnabled,
      cooldown: this.notificationCooldown,
      lastNotification: this.lastNotificationTime
    };
  }

  // Update notification settings
  updateSettings(settings) {
    if (settings.cooldown) {
      this.notificationCooldown = settings.cooldown;
    }
    if (settings.isEnabled !== undefined) {
      this.isNotificationEnabled = settings.isEnabled;
      if (this.isBrowser()) {
        if (settings.isEnabled) {
          localStorage.removeItem('lowStockNotificationsDisabled');
        } else {
          localStorage.setItem('lowStockNotificationsDisabled', 'true');
        }
      }
    }
  }
}

// Create a singleton instance
const notificationService = new NotificationService();

// Initialize the service only on client side
if (typeof window !== 'undefined') {
  notificationService.initialize();
}

export default notificationService;
