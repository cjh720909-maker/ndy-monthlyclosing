'use server';

import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import iconv from 'iconv-lite';
import { formatDate } from '@/lib/utils';

import prisma from '@/lib/prisma';

export interface AbsenceRecord {
  date: string;
  dayOfWeek: string;
  driverName: string;
  vehicleNumber: string;
  phone: string;
  dockNumber: string;
  isTreated?: boolean;
  remarks?: string;
}

export async function getAbsenceData(startDate: string, endDate: string) {
  let connection;
  try {
    connection = await pool.getConnection();

    // 1. Fetch Drivers (Filter by Dock Number 01~40)
    const [drivers] = await connection.execute<RowDataPacket[]>(`
      SELECT 
        CAST(CB_DRIVER AS BINARY) as CB_DRIVER_BIN, 
        CAST(CA_NAME AS BINARY) as CA_NAME_BIN, 
        CA_NO, 
        CA_HP, 
        CA_DOCKNO
      FROM t_car 
      WHERE CA_DOCKNO IS NOT NULL 
        AND CA_DOCKNO != ''
    `);

    // Filter by Dock Range 1~40
    const targetDrivers = drivers.filter((d: any) => {
      const dockStr = d.CA_DOCKNO || '';
      if (!dockStr) return false;
      const num = parseInt(dockStr.split('-')[0], 10);
      return !isNaN(num) && num >= 1 && num <= 40;
    }).map((d: any) => {
      const driverName = iconv.decode(d.CB_DRIVER_BIN as Buffer, 'euckr');
      const carName = iconv.decode(d.CA_NAME_BIN as Buffer, 'euckr');
      return {
        ...d,
        CB_DRIVER: driverName,
        CA_NAME: carName,
      };
    });

    // 2. Fetch Dispatches from t_balju
    const [dispatches] = await connection.execute<RowDataPacket[]>(`
      SELECT B_DATE, CAST(CB_DRIVER AS BINARY) as CB_DRIVER_BIN
      FROM t_balju 
      WHERE B_DATE BETWEEN ? AND ?
    `, [startDate, endDate]);

    // 3. Process Absence
    const tempAbsenceList: AbsenceRecord[] = [];
    const dispatchMap = new Map<string, Set<string>>();
    const dailyDispatchCount = new Map<string, number>();

    dispatches.forEach((d: any) => {
      const dateStr = formatDate(new Date(d.B_DATE));
      dailyDispatchCount.set(dateStr, (dailyDispatchCount.get(dateStr) || 0) + 1);
      const rawDispatchDriver = iconv.decode(d.CB_DRIVER_BIN as Buffer, 'euckr');
      const cleanDispatchDriver = cleanName(rawDispatchDriver);
      if (!dispatchMap.has(dateStr)) {
        dispatchMap.set(dateStr, new Set());
      }
      dispatchMap.get(dateStr)!.add(cleanDispatchDriver);
    });

    const start = new Date(startDate);
    const end = new Date(endDate);

    const driversByName: Record<string, typeof targetDrivers> = {};
    targetDrivers.forEach(d => {
      if (!driversByName[d.CA_NAME]) driversByName[d.CA_NAME] = [];
      driversByName[d.CA_NAME].push(d);
    });

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      const dateStr = formatDate(d);
      if (day === 0) continue;
      const totalDispatches = dailyDispatchCount.get(dateStr) || 0;
      if (totalDispatches < 2000) continue;

      const dayOfWeekStr = getDayOfWeek(d);
      const activeDriversOnDate = dispatchMap.get(dateStr) || new Set<string>();

      for (const name of Object.keys(driversByName)) {
        const variants = driversByName[name];
        let isPresent = false;
        for (const v of variants) {
          const cleanDriver = cleanName(v.CB_DRIVER);
          const cleanCar = cleanName(v.CA_NAME);
          if (activeDriversOnDate.has(cleanDriver) || (cleanCar && activeDriversOnDate.has(cleanCar))) {
            isPresent = true;
            break;
          }
          for (const activeDriver of activeDriversOnDate) {
            const isLongEnough = cleanDriver.length >= 2;
            const isCarLongEnough = cleanCar && cleanCar.length >= 2;
            if ((isLongEnough && activeDriver.includes(cleanDriver)) ||
              (isCarLongEnough && activeDriver.includes(cleanCar!))) {
              isPresent = true;
              break;
            }
          }
          if (isPresent) break;
        }

        if (!isPresent) {
          const representative = variants.find(v => v.CA_NO && v.CA_NO.trim() !== '') || variants[0];
          tempAbsenceList.push({
            date: dateStr,
            dayOfWeek: dayOfWeekStr,
            driverName: name,
            vehicleNumber: representative.CA_NO || '',
            phone: (variants.find(v => v.CA_HP && v.CA_HP.trim() !== '')?.CA_HP) || representative.CA_HP || '',
            dockNumber: representative.CA_DOCKNO
          });
        }
      }
    }

    // 4. Merge with AbsenceTreatment from Prisma
    const treatments = await prisma.nMC_AbsenceTreatment.findMany({
      where: {
        date: { gte: startDate, lte: endDate }
      }
    });

    const treatmentMap = new Map<string, typeof treatments[0]>();
    treatments.forEach((t: typeof treatments[0]) => {
      const key = `${t.date}|${t.driverName}|${t.vehicleNumber}`;
      treatmentMap.set(key, t);
    });

    const finalAbsenceList = tempAbsenceList.map(item => {
      const key = `${item.date}|${item.driverName}|${item.vehicleNumber}`;
      const t = treatmentMap.get(key);
      return {
        ...item,
        isTreated: t?.isTreated ?? false,
        remarks: t?.remarks ?? ''
      };
    });

    return finalAbsenceList;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch absence data');
  } finally {
    if (connection) connection.release();
  }
}

export interface AbsenceSummary {
  driverName: string;
  vehicleNumber: string;
  phone: string;
  dockNumber: string;
  dates: string[];
  displayDates: string;
  totalCount: number;
  treatedCount: number;
}

export async function getAbsenceSummary(startDate: string, endDate: string): Promise<AbsenceSummary[]> {
  const rawData = await getAbsenceData(startDate, endDate);
  const grouped = new Map<string, AbsenceSummary>();

  rawData.forEach(record => {
    const key = `${record.driverName}|${record.vehicleNumber}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        driverName: record.driverName,
        vehicleNumber: record.vehicleNumber,
        phone: record.phone,
        dockNumber: record.dockNumber,
        dates: [],
        displayDates: '',
        totalCount: 0,
        treatedCount: 0
      });
    }

    const entry = grouped.get(key)!;
    entry.dates.push(record.date);
    entry.totalCount += 1;
    if (record.isTreated) {
      entry.treatedCount += 1;
    }
  });

  return Array.from(grouped.values()).map(entry => {
    entry.dates.sort();
    entry.displayDates = entry.dates.map(d => {
      const day = parseInt(d.split('-')[2], 10);
      return `${day}일`;
    }).join(', ');
    return entry;
  }).sort((a, b) => a.driverName.localeCompare(b.driverName));
}

export async function saveAbsenceTreatments(data: { date: string, driverName: string, vehicleNumber: string, isTreated: boolean, remarks: string }[]) {
  try {
    // Process in transaction or loop (upsert)
    for (const item of data) {
      await prisma.nMC_AbsenceTreatment.upsert({
        where: {
          date_driverName_vehicleNumber: {
            date: item.date,
            driverName: item.driverName,
            vehicleNumber: item.vehicleNumber
          }
        },
        update: {
          isTreated: item.isTreated,
          remarks: item.remarks
        },
        create: {
          date: item.date,
          driverName: item.driverName,
          vehicleNumber: item.vehicleNumber,
          isTreated: item.isTreated,
          remarks: item.remarks
        }
      });
    }
    return { success: true };
  } catch (error: any) {
    console.error('Failed to save absence treatments:', error);
    return { success: false, error: error.message };
  }
}

function getDayOfWeek(date: Date) {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
}

/**
 * Removes whitespace and special characters but preserves meaningful text
 */
function cleanName(name: string): string {
  if (!name) return '';
  // User Guide: Keep content inside parentheses to preserve identity (e.g. 김(영진) -> 김영진)
  // Removed: name.replace(/\(.*\)/g, '')

  // Keep only Korean, Alpha-numeric characters
  let cleaned = name.replace(/[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]/g, '');
  return cleaned.trim();
}
