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
"[project]/.next-internal/server/app/settlement/absence/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/settlement/absence/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$settlement$2f$absence$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/settlement/absence/actions.ts [app-rsc] (ecmascript)");
;
}),
"[project]/.next-internal/server/app/settlement/absence/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/settlement/absence/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "60724d0e1a7f4f2edb2322c97ca8b5143405ac6b56",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$settlement$2f$absence$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAbsenceData"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$settlement$2f$absence$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$settlement$2f$absence$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/settlement/absence/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/settlement/absence/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$settlement$2f$absence$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/settlement/absence/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7bb865cd._.js.map