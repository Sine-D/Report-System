/*##################################################################################################################################################
####################################################################################################################################################
################################################################    KAVIJA DULMITH    ##############################################################
################################################################       16/08/2025     ##############################################################
####################################################################################################################################################
####################################################################################################################################################*/

import { queryDatabase } from '../../db';

/* This is the GET request handler for fetching system settings
  Currently handles stock threshold settings
*/

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const settingType = searchParams.get("type") || "stock";

    let settings = {};

    if (settingType === "stock") {
      // For now, we'll return default settings
      // In a real implementation, you might store these in a settings table
      settings = {
        defaultThreshold: 10,
        notificationEnabled: true,
        checkInterval: 5, // minutes
        autoNotification: true
      };
    }

    return new Response(JSON.stringify({
      type: settingType,
      settings: settings,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Error fetching settings:", err);
    return new Response(JSON.stringify({ 
      error: err.message,
      settings: {}
    }), { status: 500 });
  }
}

/* This is the POST request handler for updating system settings
  Currently handles stock threshold settings
*/

export async function POST(req) {
  try {
    const { settingType, settings } = await req.json();
    
    // For now, we'll just return success
    // In a real implementation, you would save these settings to the database
    
    let updatedSettings = {};
    
    if (settingType === "stock") {
      updatedSettings = {
        defaultThreshold: settings.defaultThreshold || 10,
        notificationEnabled: settings.notificationEnabled !== undefined ? settings.notificationEnabled : true,
        checkInterval: settings.checkInterval || 5,
        autoNotification: settings.autoNotification !== undefined ? settings.autoNotification : true
      };
    }

    return new Response(JSON.stringify({ 
      message: "Settings updated successfully",
      type: settingType,
      settings: updatedSettings,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Error updating settings:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
