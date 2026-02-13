-- CreateTable
CREATE TABLE "LongDistance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "driverName" TEXT NOT NULL,
    "vehicleNo" TEXT NOT NULL,
    "tonnage" TEXT,
    "region" TEXT,
    "currentAllowance" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LongDistanceHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vehicleId" INTEGER NOT NULL,
    "year" TEXT NOT NULL,
    "applyDate" DATETIME NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LongDistanceHistory_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "LongDistance" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
