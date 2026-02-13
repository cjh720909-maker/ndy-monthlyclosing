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
"[project]/.next-internal/server/app/billing/long-distance/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/billing/long-distance/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$billing$2f$long$2d$distance$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/billing/long-distance/actions.ts [app-rsc] (ecmascript)");
;
;
;
}),
"[project]/.next-internal/server/app/billing/long-distance/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/billing/long-distance/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "40772157a4b252950f234fa654999810d60663a685",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$billing$2f$long$2d$distance$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getVehicles"],
    "40ae473e7cdb093565c03385112549d1d3335573df",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$billing$2f$long$2d$distance$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteVehicle"],
    "600e3faf1f93146b985c81c554868f84e2b2317569",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$billing$2f$long$2d$distance$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["saveVehicle"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$billing$2f$long$2d$distance$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$billing$2f$long$2d$distance$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/billing/long-distance/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/billing/long-distance/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$billing$2f$long$2d$distance$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/billing/long-distance/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_47dc9b35._.js.map