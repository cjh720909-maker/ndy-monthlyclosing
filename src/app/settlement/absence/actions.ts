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

export async function getAbsenceData(startDate: string, endDate: string) {
  let connection;
  try {
    connection = await pool.getConnection();

    // 1. Fetch Drivers (Filter by Dock Number 01~40)
    // Cast to BINARY to preserve EUC-KR bytes from MySQL
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
        AND CA_NO IS NOT NULL
        AND CA_NO != ''
    `);

    // Filter by Dock Range 1~40
    const targetDrivers = drivers.filter((d: any) => {
      const dockStr = d.CA_DOCKNO || '';
      if (!dockStr) return false;
      const num = parseInt(dockStr.split('-')[0], 10);
      return !isNaN(num) && num >= 1 && num <= 40;
    }).map((d: any) => {
      // Decode binary fields to EUC-KR
      const driverName = iconv.decode(d.CB_DRIVER_BIN as Buffer, 'euckr');
      const carName = iconv.decode(d.CA_NAME_BIN as Buffer, 'euckr'); // Decode CA_NAME
      return {
        ...d,
        CB_DRIVER: driverName,
        CA_NAME: carName, // Add decoded CA_NAME
      };
    });

    // 2. Fetch Dispatches from t_balju (Cast to BINARY)
    // User Guide: "Search using CB_DRIVER in t_balju... if match found, that CA_NAME is present."
    const [dispatches] = await connection.execute<RowDataPacket[]>(`
      SELECT DISTINCT B_DATE, CAST(CB_DRIVER AS BINARY) as CB_DRIVER_BIN
      FROM t_balju 
      WHERE B_DATE BETWEEN ? AND ?
    `, [startDate, endDate]);

    // 3. Process Absence
    const absenceList: AbsenceRecord[] = [];
    const dispatchMap = new Set<string>();

    dispatches.forEach((d: any) => {
      // t_balju uses B_DATE
      const dateStr = formatDate(new Date(d.B_DATE));
      // Decode dispatch driver name
      const dispatchDriver = iconv.decode(d.CB_DRIVER_BIN as Buffer, 'euckr');
      dispatchMap.add(`${dateStr}|${dispatchDriver}`);
    });

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Create a map of CA_NAME -> List of CB_DRIVERs (Aliases)
    // A single CA_NAME might have multiple CB_DRIVER entries in t_car (according to user)
    // Or we just check if *any* target driver with same CA_NAME has a match.
    // Actually, t_car rows ARE the drivers. 
    // If t_car has (CA_NAME='Kim', CB_DRIVER='KimA') and (CA_NAME='Kim', CB_DRIVER='KimB')
    // We should treat 'Kim' as present if either 'KimA' or 'KimB' is in t_balju.
    
    // Group drivers by CA_NAME
    const driversByName: Record<string, typeof targetDrivers> = {};
    targetDrivers.forEach(d => {
        if (!driversByName[d.CA_NAME]) driversByName[d.CA_NAME] = [];
        driversByName[d.CA_NAME].push(d);
    });

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      // Mon(1) ~ Fri(5)
      if (day === 0 || day === 6) continue;

      const dateStr = formatDate(d);
      const dayOfWeekStr = getDayOfWeek(d);

      // Iterate uniq names
      for (const name of Object.keys(driversByName)) {
        const variants = driversByName[name]; // All t_car rows for this person
        
        // Check if ANY of the variants' CB_DRIVER exists in dispatchMap for this date
        // "If CB_DRIVER search hits... CA_NAME is not absent"
        let isPresent = false;
        
        for (const v of variants) {
            if (dispatchMap.has(`${dateStr}|${v.CB_DRIVER}`)) {
                isPresent = true;
                break;
            }
        }

        if (!isPresent) {
            // Not found -> Absent
            // We use the first variant to get display info (Phone, Vehicle No, Dock)
            // Or we should list all? Usually just one is fine or the primary one.
            const representative = variants[0];
            
            absenceList.push({
                date: dateStr,
                dayOfWeek: dayOfWeekStr,
                driverName: name, // Display CA_NAME
                vehicleNumber: representative.CA_NO,
                phone: representative.CA_HP || '',
                dockNumber: representative.CA_DOCKNO
            });
        }
      }
    }

    return absenceList;

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
  dates: string[];     // ["2026-02-02", "2026-02-05"]
  displayDates: string; // "2일, 5일"
  totalCount: number;
}

export async function getAbsenceSummary(startDate: string, endDate: string): Promise<AbsenceSummary[]> {
  const rawData = await getAbsenceData(startDate, endDate);
  
  // Aggregate by Driver + Vehicle (Composite Key)
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
        totalCount: 0
      });
    }

    const entry = grouped.get(key)!;
    entry.dates.push(record.date);
    entry.totalCount += 1;
  });

  // Process display format and sorting
  return Array.from(grouped.values()).map(entry => {
    // Sort dates just in case
    entry.dates.sort();
    
    // Format: "2일, 5일, 12일"
    // Assuming all dates are in the same month for simplicity as per user request context.
    // If spanning months, we might want "2/2, 2/5". 
    // For now, let's just use the Day part if typical usage is monthly.
    // However, to be safe, I'll use "D일" format.
    entry.displayDates = entry.dates.map(d => {
        const day = parseInt(d.split('-')[2], 10);
        return `${day}일`;
    }).join(', ');
    
    return entry;
  }).sort((a, b) => a.driverName.localeCompare(b.driverName));
}

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
