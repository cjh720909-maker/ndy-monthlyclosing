'use server';

import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import iconv from 'iconv-lite';

export interface AbsenceRecord {
  date: string;
  dayOfWeek: string;
  driverName: string;
  vehicleNumber: string;
  phone: string;
  dockNumber: string;
}

export interface WeeklyTurn2Summary {
  weekStart: string;
  weekEnd: string;
  driverName: string;
  vehicleNumber: string;
  weekdayCount: number;
  saturdayCount: number;
  sundayCount: number;
  total: number;
}

// Helper: Fetch Raw 2nd Turn Records
async function fetchTurn2Records(startDate: string, endDate: string): Promise<AbsenceRecord[]> {
  let connection;
  try {
    connection = await pool.getConnection();

    // 1. Fetch all drivers with valid dock numbers
    const [drivers] = await connection.execute<RowDataPacket[]>(`
      SELECT 
        CAST(CB_DRIVER AS BINARY) as CB_DRIVER_BIN, 
        CAST(CA_NAME AS BINARY) as CA_NAME_BIN, 
        CA_NO, 
        CA_HP, 
        CA_DOCKNO
      FROM t_car 
      WHERE CA_DOCKNO IS NOT NULL AND CA_DOCKNO != ''
    `);

    const driverMap = new Map<string, { name: string; dock: string; dockInt: number; phone: string; carNo: string }>();

    drivers.forEach((d: any) => {
      const cbDriver = iconv.decode(d.CB_DRIVER_BIN as Buffer, 'euckr');
      const caName = iconv.decode(d.CA_NAME_BIN as Buffer, 'euckr');
      const dock = d.CA_DOCKNO;
      const dockInt = parseInt(dock.split('-')[0], 10);

      // Filter: Dock 1 ~ 40 only
      if (!isNaN(dockInt) && dockInt >= 1 && dockInt <= 40) {
        driverMap.set(cbDriver, {
          name: caName,
          dock: dock,
          dockInt: dockInt,
          phone: d.CA_HP,
          carNo: d.CA_NO
        });
      }
    });

    // 2. Fetch dispatches
    const [dispatches] = await connection.execute<RowDataPacket[]>(`
      SELECT DISTINCT B_DATE, CAST(CB_DRIVER AS BINARY) as CB_DRIVER_BIN
      FROM t_balju 
      WHERE B_DATE BETWEEN ? AND ?
    `, [startDate, endDate]);

    // 3. Process Daily Data
    const results: AbsenceRecord[] = [];
    const dailyData: Record<string, Record<string, { 
        dockInts: Set<number>, 
        dockStrs: Set<string>, 
        info: any 
    }>> = {};

    dispatches.forEach((d: any) => {
      const dateStr = formatDate(new Date(d.B_DATE));
      const cbDriver = iconv.decode(d.CB_DRIVER_BIN as Buffer, 'euckr');
      const driverInfo = driverMap.get(cbDriver);

      if (!driverInfo) return;

      if (!dailyData[dateStr]) dailyData[dateStr] = {};
      if (!dailyData[dateStr][driverInfo.name]) {
        dailyData[dateStr][driverInfo.name] = {
            dockInts: new Set(),
            dockStrs: new Set(),
            info: driverInfo
        };
      }

      const entry = dailyData[dateStr][driverInfo.name];
      entry.dockInts.add(driverInfo.dockInt);
      entry.dockStrs.add(driverInfo.dock);
    });

    // 4. Identify 2nd Turns (>= 2 unique dock ints)
    Object.entries(dailyData).forEach(([dateStr, drivers]) => {
        const dayOfWeek = getDayOfWeek(new Date(dateStr));
        
        Object.values(drivers).forEach((data) => {
            if (data.dockInts.size >= 2) {
                const dockDisplay = Array.from(data.dockStrs).sort().join(', ');
                results.push({
                    date: dateStr,
                    dayOfWeek: dayOfWeek,
                    driverName: data.info.name,
                    vehicleNumber: data.info.carNo,
                    phone: data.info.phone || '',
                    dockNumber: dockDisplay
                });
            }
        });
    });

    return results.sort((a, b) => b.date.localeCompare(a.date));

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch turn2 data');
  } finally {
    if (connection) connection.release();
  }
}

// 1. Existing Function: Return List
export async function getTurn2Data(startDate: string, endDate: string) {
  return await fetchTurn2Records(startDate, endDate);
}

// 2. New Function: Return Total Period Summary (Weekly -> Total Period)
// User Request: Don't split by week, just sum up for the whole period.
export async function getTurn2WeeklyData(startDate: string, endDate: string): Promise<WeeklyTurn2Summary[]> {
  const records = await fetchTurn2Records(startDate, endDate);
  
  // Aggregation Map: DriverName -> Counts
  const summaryMap: Record<string, {
    driverName: string;
    vehicleNumber: string;
    weekday: number;
    saturday: number;
    sunday: number;
  }> = {};

  records.forEach(record => {
    // Just group by driver
    if (!summaryMap[record.driverName]) {
      summaryMap[record.driverName] = {
        driverName: record.driverName,
        vehicleNumber: record.vehicleNumber,
        weekday: 0,
        saturday: 0,
        sunday: 0
      };
    }

    const entry = summaryMap[record.driverName];
    const date = new Date(record.date);
    const day = date.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
    
    if (day === 0) {
      entry.sunday++;
    } else if (day === 6) {
      entry.saturday++;
    } else {
      entry.weekday++;
    }
  });

  // Flatten to Array
  const summary: WeeklyTurn2Summary[] = [];
  
  // Sort by driver name for now? Or just map values.
  Object.values(summaryMap).sort((a,b) => a.driverName.localeCompare(b.driverName)).forEach(d => {
    summary.push({
      weekStart: startDate, // Just use the query range for display
      weekEnd: endDate,
      driverName: d.driverName,
      vehicleNumber: d.vehicleNumber,
      weekdayCount: d.weekday,
      saturdayCount: d.saturday,
      sundayCount: d.sunday,
      total: d.weekday + d.saturday + d.sunday
    });
  });

  return summary;
}

// Utilities
function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDayOfWeek(date: Date) {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
}

// Get Monday and Sunday of the week for a given date
function getWeekRange(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  
  const monday = new Date(d.setDate(diff));
  const sunday = new Date(new Date(monday).setDate(monday.getDate() + 6));

  return {
    start: formatDate(monday),
    end: formatDate(sunday)
  };
}
