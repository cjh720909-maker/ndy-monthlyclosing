'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface VehicleData {
  id?: number;
  driverName: string;
  vehicleNo: string;
  tonnage: string;
  region: string;
  allowance: number; // Current view amount
  note: string;
  history?: AllowanceHistory[];
}

export interface AllowanceHistory {
  id: number;
  year: string;
  applyDate: string; // YYYY-MM-DD
  amount: number;
  reason: string;
}

// Fetch all Vehicles with their 'Current Year' allowance logic
// If a specific year is provided, we try to find the history for that year.
// If no history exists for that year, we might fallback to current_allowance or 0?
// For now, let's implement the basic CRUD.
export async function getVehicles(year: string) {
  try {
    const vehicles = await prisma.longDistance.findMany({
      where: { isActive: true },
      include: {
        history: {
          orderBy: { applyDate: 'desc' }
        }
      },
      orderBy: { driverName: 'asc' }
    });

    // Map to frontend friendly format
    // Logic: Find the history record that covers the requested 'year'
    // Or just return the list and let frontend handle display?
    // Let's return the simplified list with the "Amount for selected Year"
    
    return vehicles.map(v => {
      // Find history for this specific year
      const yearHistory = v.history.find(h => h.year === year);
      
      // If found, use that amount. If not, use currentAllowance (fallback) 
      // or maybe 0 if strictly year-based?
      // User requirement: "기본화면은 현재년도의 금액이 보이면됨"
      const displayAmount = yearHistory ? yearHistory.amount : v.currentAllowance;

      return {
        id: v.id,
        driverName: v.driverName,
        vehicleNo: v.vehicleNo,
        tonnage: v.tonnage || '',
        region: v.region || '',
        allowance: displayAmount, // The calculated amount for this year
        note: v.note || '',
        history: v.history.map(h => ({
          id: h.id,
          year: h.year,
          applyDate: h.applyDate.toISOString().split('T')[0],
          amount: h.amount,
          reason: h.reason || ''
        }))
      };
    });

  } catch (error) {
    console.error('Failed to fetch vehicles:', error);
    return [];
  }
}

export async function saveVehicle(data: VehicleData, year: string) {
  try {
    console.log('--- saveVehicle Called ---');
    console.log('Data:', JSON.stringify(data));
    console.log('Year:', year);

    if (!year) {
        throw new Error('Year is required for saving vehicle data.');
    }

    // 1. Save Vehicle (Create or Update)
    let vehicle;
    
    if (data.id) {
      // Update existing
      console.log('Updating existing vehicle:', data.id);
      vehicle = await prisma.longDistance.update({
        where: { id: data.id },
        data: {
            driverName: data.driverName,
            vehicleNo: data.vehicleNo,
            tonnage: data.tonnage,
            region: data.region,
            currentAllowance: data.allowance,
            note: data.note,
        }
      });
    } else {
      // Create new
      console.log('Creating new vehicle...');
      vehicle = await prisma.longDistance.create({
        data: {
            driverName: data.driverName,
            vehicleNo: data.vehicleNo,
            tonnage: data.tonnage,
            region: data.region,
            currentAllowance: data.allowance,
            note: data.note,
            isActive: true // Ensure it's active
        }
      });
      console.log('Created Vehicle ID:', vehicle.id);
    }

    // 2. Manage History
    // Check if there is already a history record for this [Vehicle + Year]
    // If so, update it. If not, create it.
    // Logic: "When saving, we are setting the allowance for the SELECTED YEAR"
    
    // Check existing
    const existingHistory = await prisma.longDistanceHistory.findFirst({
      where: {
        vehicleId: vehicle.id,
        year: year
      }
    });

    if (existingHistory) {
      if (existingHistory.amount !== data.allowance) {
        // Update amount if changed
        console.log(`Updating history for year ${year}`);
        await prisma.longDistanceHistory.update({
            where: { id: existingHistory.id },
            data: { 
                amount: data.allowance,
                reason: '수정 (Update)' // Simple reason
            }
        });
      }
    } else {
      // Create new history for this year
      console.log(`Creating new history for year ${year}`);
      await prisma.longDistanceHistory.create({
        data: {
            vehicleId: vehicle.id,
            year: year,
            applyDate: new Date(`${year}-01-01`), // Default to Jan 1st
            amount: data.allowance,
            reason: '최초 등록 (Initial)'
        }
      });
    }

    console.log('Save completed successfully.');
    revalidatePath('/billing/long-distance');
    return { success: true, vehicleId: vehicle.id };

  } catch (error) {
    console.error('Failed to save vehicle:', error);
    return { success: false, error: 'Failed to save data' };
  }
}

export async function deleteVehicle(id: number) {
  try {
    // Hard delete or Soft delete? Schema has isActive. Let's use Soft Delete.
    await prisma.longDistance.update({
      where: { id },
      data: { isActive: false }
    });
    
    revalidatePath('/billing/long-distance');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete vehicle:', error);
    return { success: false, error: 'Failed to delete data' };
  }
}
