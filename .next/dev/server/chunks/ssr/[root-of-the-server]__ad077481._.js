module.exports = [
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
"[project]/.next-internal/server/app/settlement/turn2/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/settlement/turn2/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$settlement$2f$turn2$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/settlement/turn2/actions.ts [app-rsc] (ecmascript)");
;
;
}),
"[project]/.next-internal/server/app/settlement/turn2/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/settlement/turn2/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "6037f6cc602327b59d6bd67b6c99289397d2b11cbe",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$settlement$2f$turn2$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getTurn2WeeklyData"],
    "60f57eed40fcc4f8250c32d2bfcb163cff3a2ed678",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$settlement$2f$turn2$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getTurn2Data"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$settlement$2f$turn2$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$settlement$2f$turn2$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/settlement/turn2/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/settlement/turn2/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$settlement$2f$turn2$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/settlement/turn2/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ad077481._.js.map