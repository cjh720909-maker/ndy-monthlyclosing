module.exports = [
"[project]/src/lib/prisma.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = /*TURBOPACK member replacement*/ __turbopack_context__.g;
const prisma = globalForPrisma.prisma || new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    log: [
        'query'
    ]
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/src/app/billing/long-distance/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40772157a4b252950f234fa654999810d60663a685":"getVehicles","40ae473e7cdb093565c03385112549d1d3335573df":"deleteVehicle","600e3faf1f93146b985c81c554868f84e2b2317569":"saveVehicle"},"",""] */ __turbopack_context__.s([
    "deleteVehicle",
    ()=>deleteVehicle,
    "getVehicles",
    ()=>getVehicles,
    "saveVehicle",
    ()=>saveVehicle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
async function getVehicles(year) {
    try {
        const vehicles = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].longDistance.findMany({
            where: {
                isActive: true
            },
            include: {
                history: {
                    orderBy: {
                        applyDate: 'desc'
                    }
                }
            },
            orderBy: {
                driverName: 'asc'
            }
        });
        // Map to frontend friendly format
        // Logic: Find the history record that covers the requested 'year'
        // Or just return the list and let frontend handle display?
        // Let's return the simplified list with the "Amount for selected Year"
        return vehicles.map((v)=>{
            // Find history for this specific year
            const yearHistory = v.history.find((h)=>h.year === year);
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
                allowance: displayAmount,
                note: v.note || '',
                history: v.history.map((h)=>({
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
async function saveVehicle(data, year) {
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
            vehicle = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].longDistance.update({
                where: {
                    id: data.id
                },
                data: {
                    driverName: data.driverName,
                    vehicleNo: data.vehicleNo,
                    tonnage: data.tonnage,
                    region: data.region,
                    currentAllowance: data.allowance,
                    note: data.note
                }
            });
        } else {
            // Create new
            console.log('Creating new vehicle...');
            vehicle = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].longDistance.create({
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
        const existingHistory = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].longDistanceHistory.findFirst({
            where: {
                vehicleId: vehicle.id,
                year: year
            }
        });
        if (existingHistory) {
            if (existingHistory.amount !== data.allowance) {
                // Update amount if changed
                console.log(`Updating history for year ${year}`);
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].longDistanceHistory.update({
                    where: {
                        id: existingHistory.id
                    },
                    data: {
                        amount: data.allowance,
                        reason: '수정 (Update)' // Simple reason
                    }
                });
            }
        } else {
            // Create new history for this year
            console.log(`Creating new history for year ${year}`);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].longDistanceHistory.create({
                data: {
                    vehicleId: vehicle.id,
                    year: year,
                    applyDate: new Date(`${year}-01-01`),
                    amount: data.allowance,
                    reason: '최초 등록 (Initial)'
                }
            });
        }
        console.log('Save completed successfully.');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/billing/long-distance');
        return {
            success: true,
            vehicleId: vehicle.id
        };
    } catch (error) {
        console.error('Failed to save vehicle:', error);
        return {
            success: false,
            error: 'Failed to save data'
        };
    }
}
async function deleteVehicle(id) {
    try {
        // Hard delete or Soft delete? Schema has isActive. Let's use Soft Delete.
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].longDistance.update({
            where: {
                id
            },
            data: {
                isActive: false
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/billing/long-distance');
        return {
            success: true
        };
    } catch (error) {
        console.error('Failed to delete vehicle:', error);
        return {
            success: false,
            error: 'Failed to delete data'
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getVehicles,
    saveVehicle,
    deleteVehicle
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getVehicles, "40772157a4b252950f234fa654999810d60663a685", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(saveVehicle, "600e3faf1f93146b985c81c554868f84e2b2317569", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteVehicle, "40ae473e7cdb093565c03385112549d1d3335573df", null);
}),
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/timers [external] (timers, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("timers", () => require("timers"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/string_decoder [external] (string_decoder, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("string_decoder", () => require("string_decoder"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[project]/src/lib/db.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mysql2$2f$promise$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/mysql2/promise.js [app-rsc] (ecmascript)");
;
const pool = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mysql2$2f$promise$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].createPool(process.env.MYSQL_URL || '');
const __TURBOPACK__default__export__ = pool;
}),
"[project]/src/app/settlement/absence/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"60724d0e1a7f4f2edb2322c97ca8b5143405ac6b56":"getAbsenceData"},"",""] */ __turbopack_context__.s([
    "getAbsenceData",
    ()=>getAbsenceData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconv$2d$lite$2f$lib$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/iconv-lite/lib/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
async function getAbsenceData(startDate, endDate) {
    let connection;
    try {
        connection = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].getConnection();
        // 1. Fetch Drivers (Filter by Dock Number 01~40)
        // Cast to BINARY to preserve EUC-KR bytes from MySQL
        const [drivers] = await connection.execute(`
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
        const targetDrivers = drivers.filter((d)=>{
            const dockStr = d.CA_DOCKNO || '';
            if (!dockStr) return false;
            const num = parseInt(dockStr.split('-')[0], 10);
            return !isNaN(num) && num >= 1 && num <= 40;
        }).map((d)=>{
            // Decode binary fields to EUC-KR
            const driverName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconv$2d$lite$2f$lib$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].decode(d.CB_DRIVER_BIN, 'euckr');
            const carName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconv$2d$lite$2f$lib$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].decode(d.CA_NAME_BIN, 'euckr'); // Decode CA_NAME
            return {
                ...d,
                CB_DRIVER: driverName,
                CA_NAME: carName
            };
        });
        // 2. Fetch Dispatches from t_balju (Cast to BINARY)
        // User Guide: "Search using CB_DRIVER in t_balju... if match found, that CA_NAME is present."
        const [dispatches] = await connection.execute(`
      SELECT DISTINCT B_DATE, CAST(CB_DRIVER AS BINARY) as CB_DRIVER_BIN
      FROM t_balju 
      WHERE B_DATE BETWEEN ? AND ?
    `, [
            startDate,
            endDate
        ]);
        // 3. Process Absence
        const absenceList = [];
        const dispatchMap = new Set();
        dispatches.forEach((d)=>{
            // t_balju uses B_DATE
            const dateStr = formatDate(new Date(d.B_DATE));
            // Decode dispatch driver name
            const dispatchDriver = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconv$2d$lite$2f$lib$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].decode(d.CB_DRIVER_BIN, 'euckr');
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
        const driversByName = {};
        targetDrivers.forEach((d)=>{
            if (!driversByName[d.CA_NAME]) driversByName[d.CA_NAME] = [];
            driversByName[d.CA_NAME].push(d);
        });
        for(let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)){
            const day = d.getDay();
            // Mon(1) ~ Fri(5)
            if (day === 0 || day === 6) continue;
            const dateStr = formatDate(d);
            const dayOfWeekStr = getDayOfWeek(d);
            // Iterate uniq names
            for (const name of Object.keys(driversByName)){
                const variants = driversByName[name]; // All t_car rows for this person
                // Check if ANY of the variants' CB_DRIVER exists in dispatchMap for this date
                // "If CB_DRIVER search hits... CA_NAME is not absent"
                let isPresent = false;
                for (const v of variants){
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
                        driverName: name,
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
    } finally{
        if (connection) connection.release();
    }
}
function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
function getDayOfWeek(date) {
    const days = [
        '일',
        '월',
        '화',
        '수',
        '목',
        '금',
        '토'
    ];
    return days[date.getDay()];
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getAbsenceData
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getAbsenceData, "60724d0e1a7f4f2edb2322c97ca8b5143405ac6b56", null);
}),
"[project]/src/app/settlement/turn2/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"6037f6cc602327b59d6bd67b6c99289397d2b11cbe":"getTurn2WeeklyData","60f57eed40fcc4f8250c32d2bfcb163cff3a2ed678":"getTurn2Data"},"",""] */ __turbopack_context__.s([
    "getTurn2Data",
    ()=>getTurn2Data,
    "getTurn2WeeklyData",
    ()=>getTurn2WeeklyData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconv$2d$lite$2f$lib$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/iconv-lite/lib/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
// Helper: Fetch Raw 2nd Turn Records
async function fetchTurn2Records(startDate, endDate) {
    let connection;
    try {
        connection = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].getConnection();
        // 1. Fetch all drivers with valid dock numbers
        const [drivers] = await connection.execute(`
      SELECT 
        CAST(CB_DRIVER AS BINARY) as CB_DRIVER_BIN, 
        CAST(CA_NAME AS BINARY) as CA_NAME_BIN, 
        CA_NO, 
        CA_HP, 
        CA_DOCKNO
      FROM t_car 
      WHERE CA_DOCKNO IS NOT NULL AND CA_DOCKNO != ''
    `);
        const driverMap = new Map();
        drivers.forEach((d)=>{
            const cbDriver = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconv$2d$lite$2f$lib$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].decode(d.CB_DRIVER_BIN, 'euckr');
            const caName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconv$2d$lite$2f$lib$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].decode(d.CA_NAME_BIN, 'euckr');
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
        const [dispatches] = await connection.execute(`
      SELECT DISTINCT B_DATE, CAST(CB_DRIVER AS BINARY) as CB_DRIVER_BIN
      FROM t_balju 
      WHERE B_DATE BETWEEN ? AND ?
    `, [
            startDate,
            endDate
        ]);
        // 3. Process Daily Data
        const results = [];
        const dailyData = {};
        dispatches.forEach((d)=>{
            const dateStr = formatDate(new Date(d.B_DATE));
            const cbDriver = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconv$2d$lite$2f$lib$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].decode(d.CB_DRIVER_BIN, 'euckr');
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
        Object.entries(dailyData).forEach(([dateStr, drivers])=>{
            const dayOfWeek = getDayOfWeek(new Date(dateStr));
            Object.values(drivers).forEach((data)=>{
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
        return results.sort((a, b)=>b.date.localeCompare(a.date));
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch turn2 data');
    } finally{
        if (connection) connection.release();
    }
}
async function getTurn2Data(startDate, endDate) {
    return await fetchTurn2Records(startDate, endDate);
}
async function getTurn2WeeklyData(startDate, endDate) {
    const records = await fetchTurn2Records(startDate, endDate);
    // Aggregation Map: DriverName -> Counts
    const summaryMap = {};
    records.forEach((record)=>{
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
    const summary = [];
    // Sort by driver name for now? Or just map values.
    Object.values(summaryMap).sort((a, b)=>a.driverName.localeCompare(b.driverName)).forEach((d)=>{
        summary.push({
            weekStart: startDate,
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
function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
function getDayOfWeek(date) {
    const days = [
        '일',
        '월',
        '화',
        '수',
        '목',
        '금',
        '토'
    ];
    return days[date.getDay()];
}
// Get Monday and Sunday of the week for a given date
function getWeekRange(date) {
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
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getTurn2Data,
    getTurn2WeeklyData
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getTurn2Data, "60f57eed40fcc4f8250c32d2bfcb163cff3a2ed678", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getTurn2WeeklyData, "6037f6cc602327b59d6bd67b6c99289397d2b11cbe", null);
}),
"[project]/.next-internal/server/app/billing/additional-cost/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/billing/long-distance/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/app/settlement/absence/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/src/app/settlement/turn2/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$billing$2f$long$2d$distance$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/billing/long-distance/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$settlement$2f$absence$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/settlement/absence/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$settlement$2f$turn2$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/settlement/turn2/actions.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
}),
"[project]/.next-internal/server/app/billing/additional-cost/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/billing/long-distance/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/app/settlement/absence/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/src/app/settlement/turn2/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "40772157a4b252950f234fa654999810d60663a685",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$billing$2f$long$2d$distance$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getVehicles"],
    "40ae473e7cdb093565c03385112549d1d3335573df",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$billing$2f$long$2d$distance$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteVehicle"],
    "600e3faf1f93146b985c81c554868f84e2b2317569",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$billing$2f$long$2d$distance$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["saveVehicle"],
    "6037f6cc602327b59d6bd67b6c99289397d2b11cbe",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$settlement$2f$turn2$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getTurn2WeeklyData"],
    "60724d0e1a7f4f2edb2322c97ca8b5143405ac6b56",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$settlement$2f$absence$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAbsenceData"],
    "60f57eed40fcc4f8250c32d2bfcb163cff3a2ed678",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$settlement$2f$turn2$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getTurn2Data"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$billing$2f$additional$2d$cost$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$billing$2f$long$2d$distance$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$app$2f$settlement$2f$absence$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$src$2f$app$2f$settlement$2f$turn2$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/billing/additional-cost/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/billing/long-distance/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/src/app/settlement/absence/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE2 => "[project]/src/app/settlement/turn2/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$billing$2f$long$2d$distance$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/billing/long-distance/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$settlement$2f$absence$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/settlement/absence/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$settlement$2f$turn2$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/settlement/turn2/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c0b0c210._.js.map