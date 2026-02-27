'use server';

import db from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type MonthlyVehicleCostInput = {
  cost1T: number;
  cost2T: number;
  cost2_5T: number;
  cost3T: number;
  cost3_5T: number;
  cost5T: number;
  cost5TAxis: number;
};

export async function getMonthlyCosts(year: string) {
  const workingDays = "6";
  try {
    const data = await db.monthlyVehicleCost.findUnique({
      where: { 
        year_workingDays: {
          year,
          workingDays
        }
      },
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching monthly costs:', error);
    return { success: false, error: '데이터를 가져오지 못했습니다.' };
  }
}

export async function saveMonthlyCosts(year: string, data: MonthlyVehicleCostInput) {
  const workingDays = "6";
  try {
    console.log('[DEBUG] saveMonthlyCosts input:', { year, workingDays, data });
    
    // Ensure all numeric values are integers
    const sanitizedData = {
      cost1T: Math.floor(data.cost1T || 0),
      cost2T: Math.floor(data.cost2T || 0),
      cost2_5T: Math.floor(data.cost2_5T || 0),
      cost3T: Math.floor(data.cost3T || 0),
      cost3_5T: Math.floor(data.cost3_5T || 0),
      cost5T: Math.floor(data.cost5T || 0),
      cost5TAxis: Math.floor(data.cost5TAxis || 0),
    };

    const result = await db.monthlyVehicleCost.upsert({
      where: { 
        year_workingDays: {
          year,
          workingDays
        }
      },
      update: sanitizedData,
      create: {
        year,
        workingDays,
        ...sanitizedData,
      },
    });
    
    console.log('[DEBUG] saveMonthlyCosts success:', result.id);
    revalidatePath('/settlement/monthly-vehicle-cost');
    return { success: true, data: result };
  } catch (error) {
    console.error('[CRITICAL] saveMonthlyCosts failed:', error);
    return { 
      success: false, 
      error: '저장 실패: ' + (error instanceof Error ? error.message : '알 수 없는 DB 오류') 
    };
  }
}

export async function getAvailableYears() {
  try {
    const data = await db.monthlyVehicleCost.findMany({
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'desc' },
    });
    return { success: true, data: data.map(d => d.year) };
  } catch (error) {
    console.error('Error fetching available years:', error);
    return { success: false, error: 'Failed to fetch years' };
  }
}

export async function getPreviousYearCosts(year: string) {
  const workingDays = "6";
  try {
    const prevYear = (parseInt(year) - 1).toString();
    const data = await db.monthlyVehicleCost.findUnique({
      where: { 
        year_workingDays: {
          year: prevYear,
          workingDays
        }
      },
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching previous year costs:', error);
    return { success: false, error: '전년도 데이터를 가져오지 못했습니다.' };
  }
}
