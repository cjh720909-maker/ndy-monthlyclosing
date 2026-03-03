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

export async function getOvertimeData(startDate: string, endDate: string) {
  let connection;
  try {
    connection = await pool.getConnection();

    // 1. Calculate Standard Hourly Rate from AdditionalCost (Prisma)
    const year = startDate.split('-')[0];
    
    // Find a driver with 4 working hours (e.g., 'Park Geun-nan' logic)
    const sourceDriver = await prisma.additionalCost.findFirst({
        where: {
            year: year,
            workingHours: 4
        }
    });

    let standardHourlyRate = 0;
    if (sourceDriver && sourceDriver.baseRate > 0) {
        // Calculation: monthly baseRate / (26 days * 4 hours)
        standardHourlyRate = Math.floor(sourceDriver.baseRate / (26 * 4));
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

    return { 
        success: true, 
        data: items,
        standardHourlyRate 
    };

  } catch (error: any) {
    console.error('Failed to get overtime data:', error);
    return { success: false, error: error.message };
  } finally {
    if (connection) connection.release();
  }
}
