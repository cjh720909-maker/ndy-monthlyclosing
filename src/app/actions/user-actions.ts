'use server';

import prisma from '@/lib/prisma';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import iconv from 'iconv-lite';

export async function syncUsers() {
    let connection;
    try {
        connection = await pool.getConnection();

        // 1. Fetch users from MySQL (t_employ)
        const [rows] = await connection.execute<RowDataPacket[]>(`
      SELECT 
        E_SABUN, 
        E_PASS, 
        CAST(E_NAME AS BINARY) as E_NAME_BIN
      FROM t_employ 
      WHERE E_DEL = 'N'
    `);

        let syncCount = 0;

        // 2. Sync to PostgreSQL (NMC_User)
        for (const row of rows) {
            const username = row.E_SABUN;
            const password = row.E_PASS;
            const name = iconv.decode(row.E_NAME_BIN as Buffer, 'euckr');

            if (!username || !password) continue;

            await prisma.user.upsert({
                where: { username },
                update: {
                    password,
                    fullName: name,
                },
                create: {
                    username,
                    password,
                    fullName: name,
                    role: 'USER',
                    canAccess: true,
                    canRead: true,
                    canWrite: true,
                },
            });
            syncCount++;
        }

        return { success: true, count: syncCount };
    } catch (error: any) {
        console.error('Failed to sync users:', error);
        return { success: false, error: error.message };
    } finally {
        if (connection) connection.release();
    }
}

export async function getUsers() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { id: 'asc' },
        });
        return { success: true, data: users };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateUserPermissions(userId: number, permissions: { canAccess?: boolean, canRead?: boolean, canWrite?: boolean }) {
    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: permissions
        });
        return { success: true, data: updatedUser };
    } catch (error: any) {
        console.error('Failed to update user permissions:', error);
        return { success: false, error: error.message };
    }
}
