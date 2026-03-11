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
    const data = await db.monthlyVehicleCost.findFirst({
      where: {
        year: year,
        workingDays: workingDays
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

    // Ensure all numeric values are integers and handle potentially empty/invalid inputs
    const sanitize = (val: any) => {
      const num = Number(val);
      return isNaN(num) ? 0 : Math.floor(num);
    };

    const sanitizedData = {
      cost1T: sanitize(data.cost1T),
      cost2T: sanitize(data.cost2T),
      cost2_5T: sanitize(data.cost2_5T),
      cost3T: sanitize(data.cost3T),
      cost3_5T: sanitize(data.cost3_5T),
      cost5T: sanitize(data.cost5T),
      cost5TAxis: sanitize(data.cost5TAxis),
    };

    // Manual upsert because database might lack the unique constraint for ON CONFLICT
    // Use findFirst for better stability when compound unique constraints are problematic
    const existing = await db.monthlyVehicleCost.findFirst({
      where: {
        year: year,
        workingDays: workingDays
      }
    });

    let result;
    if (existing) {
      result = await db.monthlyVehicleCost.update({
        where: { id: existing.id },
        data: sanitizedData
      });
    } else {
      result = await db.monthlyVehicleCost.create({
        data: {
          year,
          workingDays,
          ...sanitizedData,
        }
      });
    }

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
