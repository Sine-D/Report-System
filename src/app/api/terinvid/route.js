/*##################################################################################################################################################
####################################################################################################################################################
################################################################    KAVIJA DULMITH    ##############################################################
################################################################       16/08/2025     ##############################################################
####################################################################################################################################################
####################################################################################################################################################*/

import { NextResponse } from 'next/server';
import { getNextTerInvID, getTerInvIDStatus, storeNextTerInvID } from '../../db';

/*
  API endpoint for testing and managing TerInvID generation
  GET: Get current TerInvID status and next generated ID
  POST: Generate and store next TerInvID
*/

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const locId = searchParams.get('locId') || 'POS00001';
    
    const status = await getTerInvIDStatus(locId);
    
    return NextResponse.json({
      success: true,
      locId,
      status
    });
  } catch (error) {
    console.error('Error getting TerInvID status:', error);
    return NextResponse.json(
      { error: 'Failed to get TerInvID status' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const locId = searchParams.get('locId') || 'POS00001';
    
    // Generate next TerInvID
    const nextTerInvID = await getNextTerInvID(locId);
    
    // Store it in tracking table
    const stored = await storeNextTerInvID(nextTerInvID, locId);
    
    return NextResponse.json({
      success: true,
      locId,
      nextTerInvID,
      stored,
      message: `Next TerInvID generated: ${nextTerInvID}`
    });
  } catch (error) {
    console.error('Error generating TerInvID:', error);
    return NextResponse.json(
      { error: 'Failed to generate TerInvID' },
      { status: 500 }
    );
  }
}
