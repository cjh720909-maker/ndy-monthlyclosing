'use server';

import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import iconv from 'iconv-lite';
import { formatDate } from '@/lib/utils';

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
      SELECT B_DATE, CAST(CB_DRIVER AS BINARY) as CB_DRIVER_BIN
      FROM t_balju 
      WHERE B_DATE BETWEEN ? AND ?
    `, [startDate, endDate]);

    // 3. Process Absence
    const absenceList: AbsenceRecord[] = [];
    const dispatchMap = new Map<string, Set<string>>(); // Date -> Set of Cleaned Driver Names
    const dailyDispatchCount = new Map<string, number>(); // Date -> Total Dispatches

    dispatches.forEach((d: any) => {
      const dateStr = formatDate(new Date(d.B_DATE));
      
      // Update daily count
      dailyDispatchCount.set(dateStr, (dailyDispatchCount.get(dateStr) || 0) + 1);

      // Decode and clean dispatch driver name
      const rawDispatchDriver = iconv.decode(d.CB_DRIVER_BIN as Buffer, 'euckr');
      const cleanDispatchDriver = cleanName(rawDispatchDriver);
      
      if (!dispatchMap.has(dateStr)) {
        dispatchMap.set(dateStr, new Set());
      }
      dispatchMap.get(dateStr)!.add(cleanDispatchDriver);
    });

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Group drivers by CA_NAME
    const driversByName: Record<string, typeof targetDrivers> = {};
    targetDrivers.forEach(d => {
        if (!driversByName[d.CA_NAME]) driversByName[d.CA_NAME] = [];
        driversByName[d.CA_NAME].push(d);
    });

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      const dateStr = formatDate(d);
      
      // 1. Skip Sunday(0)
      if (day === 0) continue;

      // 2. Intelligent Working Day Determination
      // [최팀장님 지시] 전체 배차 건수가 2000건 미만이면 설 연휴 등 휴무로 간주합니다.
      // 향후 이 숫자는 최팀장님 요청에 따라 조정 가능합니다. (평시 평균 약 5000건)
      const totalDispatches = dailyDispatchCount.get(dateStr) || 0;
      if (totalDispatches < 2000) continue;

      const dayOfWeekStr = getDayOfWeek(d);
      const activeDriversOnDate = dispatchMap.get(dateStr) || new Set<string>();

      // Iterate uniq names
      for (const name of Object.keys(driversByName)) {
        const variants = driversByName[name];
        let isPresent = false;
        
        for (const v of variants) {
            const cleanDriver = cleanName(v.CB_DRIVER);
            const cleanCar = cleanName(v.CA_NAME);
            
            // Match 1: Check by Driver Name (Exact or Included in dispatch)
            if (activeDriversOnDate.has(cleanDriver)) {
                isPresent = true;
                break;
            }

            // Match 2: Check by Car/Dispatch Name (Exact or Included in dispatch)
            // Even if dispatch record doesn't have the driver name, 
            // it often matches the CA_NAME in t_car.
            if (cleanCar && activeDriversOnDate.has(cleanCar)) {
                isPresent = true;
                break;
            }

            // Match 3: Partial match for both
            for (const activeDriver of activeDriversOnDate) {
                if (activeDriver.includes(cleanDriver) || (cleanCar && activeDriver.includes(cleanCar))) {
                    isPresent = true;
                    break;
                }
            }
            if (isPresent) break;
        }

        if (!isPresent) {
            // Pick a representative that has a vehicle number and phone if possible
            const representative = variants.find(v => v.CA_NO && v.CA_NO.trim() !== '') || variants[0];
            absenceList.push({
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

function getDayOfWeek(date: Date) {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
}

/**
 * Removes parentheses, whitespace and special characters for cleaner matching
 */
function cleanName(name: string): string {
    if (!name) return '';
    // Remove text inside parentheses: "Heo(Dispatch)" -> "Heo"
    let cleaned = name.replace(/\(.*\)/g, '');
    // Remove whitespace and non-alphanumeric chars (keep Korean and Alphanum)
    cleaned = cleaned.replace(/[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]/g, '');
    return cleaned.trim();
}
