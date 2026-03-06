'use server';

import prisma from '@/lib/prisma';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import iconv from 'iconv-lite';
import { formatDate } from '@/lib/utils';

export interface PickingSettlementItem {
  id: number;
  year: string;
  name: string;
  baseRate: number;
  allowance: number;
  workingHours: number;
  hourlyRate: number;
  dailyRate: number;
  workingDays: number;
  absentDays: number;
  overtimeHours: number;
  deduction: number;
  addition: number;
  totalAmount: number;
  note: string;
}

export async function savePickingRate(rate: number) {
  try {
    await prisma.nDY_Config.upsert({
      where: { key: 'picking_hourly_rate' },
      update: { data: { rate }, updatedAt: new Date() },
      create: { key: 'picking_hourly_rate', data: { rate }, updatedAt: new Date() }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPickingRate() {
  try {
    const config = await prisma.nDY_Config.findUnique({
      where: { key: 'picking_hourly_rate' }
    });
    return { success: true, rate: (config?.data as any)?.rate || null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPickingSettlement(year: string, month: string) {
  let connection;
  try {
    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1, 0));

    // 0. Constants
    const DIVISOR = 26;

    // 1. Fetch ALL Picking Drivers from AdditionalCost (Source of Truth)
    const pickingDrivers = await prisma.additionalCost.findMany({
      where: {
        year: year,
        type: 'picking'
      },
      orderBy: { name: 'asc' }
    });

    if (pickingDrivers.length === 0) {
      return { success: true, data: [] };
    }

    // 2. Fetch t_il_kun Data for these drivers
    connection = await pool.getConnection();

    const startStr = formatDate(startDate);
    const endStr = formatDate(endDate);

    // We fetch ALL t_il_kun records for the date range to minimize queries, 
    // THEN match by name in memory. 
    // Note: We are NOT filtering by IK_DIV here because AdditionalCost determines who is a picking driver.
    // However, if the same name exists in t_il_kun but for multiple roles, we might need to be careful?
    // Assuming Name is unique identifier for now as per legacy system. (Or we match Name exactly).

    const [ilkunRows] = await connection.execute<RowDataPacket[]>(`
      SELECT 
        IK_DATE,
        CAST(IK_NAME AS BINARY) as IK_NAME_BIN,
        CAST(IK_GUBUN AS BINARY) as IK_GUBUN_BIN,
        IK_KUM,
        IK_MEMO
      FROM t_il_kun 
      WHERE IK_DATE BETWEEN ? AND ?
    `, [startStr, endStr]);

    const ilkunMap = new Map<string, { date: string, gubun: string, kum: number }[]>();

    ilkunRows.forEach((row: any) => {
      const name = iconv.decode(row.IK_NAME_BIN as Buffer, 'euckr');
      const gubun = iconv.decode(row.IK_GUBUN_BIN as Buffer, 'euckr');

      if (!ilkunMap.has(name)) {
        ilkunMap.set(name, []);
      }
      ilkunMap.get(name)?.push({
        date: row.IK_DATE,
        gubun: gubun,
        kum: row.IK_KUM
      });
    });

    const results: PickingSettlementItem[] = [];

    // 3. Process each AdditionalCost driver
    for (const driver of pickingDrivers) {
      // Logic:
      // DailyRate = (Base + Allowance) / 26
      const totalFixedPay = driver.baseRate + driver.allowance;
      const dailyRate = Math.round(totalFixedPay / DIVISOR);

      // Hourly Rate
      // Create schema migration for workingHours -> Done. 
      // Default 9 if 0.
      const hours = driver.workingHours > 0 ? driver.workingHours : 9;
      const hourlyRate = Math.round(dailyRate / hours);

      const records = ilkunMap.get(driver.name) || [];

      let absentCount = 0;
      let overtimeHoursTotal = 0;

      records.forEach(r => {
        // Checking for Absence
        if (r.gubun.includes('결근')) {
          absentCount++;
        }

        // Checking for Overtime
        let h = 0;
        let m = 0;

        const hourMatch = r.gubun.match(/(\d+)시간/);
        if (hourMatch) h = parseInt(hourMatch[1], 10);

        const minMatch = r.gubun.match(/(\d+)분/);
        if (minMatch) m = parseInt(minMatch[1], 10);

        if (r.gubun.includes('연장') || r.gubun.includes('추가') || r.gubun.includes('잔업')) {
          const duration = h + (m / 60);
          overtimeHoursTotal += duration;
        }
      });

      // Deduction = Absent * DailyRate
      const deduction = absentCount * dailyRate;

      // Addition = Overtime Hours * Hourly Rate
      const overtimePay = Math.round(overtimeHoursTotal * hourlyRate);

      const finalAmount = totalFixedPay - deduction + overtimePay;

      results.push({
        id: driver.id,
        year,
        name: driver.name,
        baseRate: driver.baseRate,
        allowance: driver.allowance,
        workingHours: hours,
        hourlyRate,
        dailyRate,
        workingDays: DIVISOR - absentCount,
        absentDays: absentCount,
        overtimeHours: parseFloat(overtimeHoursTotal.toFixed(1)),
        deduction,
        addition: overtimePay,
        totalAmount: finalAmount,
        note: driver.note || ''
      });
    }

    return { success: true, data: results };

  } catch (error: any) {
    console.error('Failed to get picking settlement:', error);
    return { success: false, error: error.message };
  } finally {
    if (connection) connection.release();
  }
}
