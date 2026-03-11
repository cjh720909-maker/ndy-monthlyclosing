'use server';

import pool from '@/lib/db';
import prisma from '@/lib/prisma'; // Prisma 추가
import { RowDataPacket } from 'mysql2';
import iconv from 'iconv-lite';
import { formatDate } from '@/lib/utils';

export interface OvertimeItem {
  id: number;
  date: string;
  name: string;
  div: string;
  gubun: string;
  parsedHours: number;
}

export interface OvertimeSummary {
  name: string;
  totalHours: number;
  details: OvertimeItem[];
}

export async function saveHolidays(dates: string[], overwrite = false) {
  try {
    let finalDates = dates;

    if (!overwrite) {
      const currentConfig = await prisma.nDY_Config.findUnique({
        where: { key: 'holidays' }
      });
      const existingDates = (currentConfig?.data as any)?.dates || [];
      // Combine and remove duplicates
      finalDates = Array.from(new Set([...existingDates, ...dates])).sort();
    }

    await prisma.nDY_Config.upsert({
      where: { key: 'holidays' },
      update: { data: { dates: finalDates }, updatedAt: new Date() },
      create: { key: 'holidays', data: { dates: finalDates }, updatedAt: new Date() }
    });
    return { success: true, dates: finalDates };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getHolidays() {
  try {
    const config = await prisma.nDY_Config.findUnique({
      where: { key: 'holidays' }
    });
    return { success: true, dates: (config?.data as any)?.dates || [] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getOvertimeData(startDate: string, endDate: string) {
  let connection;
  try {
    connection = await pool.getConnection();

    // 1. Calculate Standard Hourly Rate from AdditionalCost (Prisma)
    const year = startDate.split('-')[0];

    // 1. Get Standard Hourly Rate from NDY_Config (优先)
    const pickingRateConfig = await prisma.nDY_Config.findUnique({
      where: { key: 'picking_hourly_rate' }
    });

    let standardHourlyRate = (pickingRateConfig?.data as any)?.rate || 0;

    if (standardHourlyRate === 0) {
      // Fallback to calculate from AdditionalCost if not set
      const sourceDriver = await prisma.additionalCost.findFirst({
        where: {
          year: year,
          workingHours: 4
        }
      });

      if (sourceDriver && sourceDriver.baseRate > 0) {
        standardHourlyRate = Math.floor(sourceDriver.baseRate / (26 * 4));
      }
    }

    // 2. Fetch t_il_kun records (MySQL)
    const [rows] = await connection.execute<RowDataPacket[]>(`
      SELECT 
        IK_IDX,
        IK_DATE,
        CAST(IK_NAME AS BINARY) as IK_NAME_BIN,
        CAST(IK_DIV AS BINARY) as IK_DIV_BIN,
        CAST(IK_GUBUN AS BINARY) as IK_GUBUN_BIN
      FROM t_il_kun 
      WHERE IK_DATE BETWEEN ? AND ?
      ORDER BY IK_DATE DESC, IK_NAME ASC
    `, [startDate, endDate]);

    const items: OvertimeItem[] = [];

    rows.forEach((row: any) => {
      const name = iconv.decode(row.IK_NAME_BIN as Buffer, 'euckr');
      const div = iconv.decode(row.IK_DIV_BIN as Buffer, 'euckr');
      const gubun = iconv.decode(row.IK_GUBUN_BIN as Buffer, 'euckr');

      if (!div.includes('기사파트')) {
        return;
      }

      let hours = 0;
      let mins = 0;
      const hourMatch = gubun.match(/(\d+)시간/);
      if (hourMatch) hours = parseInt(hourMatch[1], 10);
      const minMatch = gubun.match(/(\d+)분/);
      if (minMatch) mins = parseInt(minMatch[1], 10);
      const duration = hours + (mins / 60);

      items.push({
        id: row.IK_IDX,
        date: row.IK_DATE instanceof Date ? formatDate(row.IK_DATE) : row.IK_DATE,
        name,
        div,
        gubun,
        parsedHours: parseFloat(duration.toFixed(2))
      });
    });

    // 3. Get Holidays for multiplier
    const holidayConfig = await prisma.nDY_Config.findUnique({
      where: { key: 'holidays' }
    });
    const holidays = (holidayConfig?.data as any)?.dates || [];

    return {
      success: true,
      data: items,
      standardHourlyRate,
      holidays
    };

  } catch (error: any) {
    console.error('Failed to get overtime data:', error);
    return { success: false, error: error.message };
  } finally {
    if (connection) connection.release();
  }
}
