'use server';

import prisma from '@/lib/prisma';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import iconv from 'iconv-lite';

export async function createUser(data: { username: string, password: string, fullName: string }) {
    try {
        // 1. Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: { username: data.username }
        });

        if (existingUser) {
            return { success: false, error: '이미 존재하는 아이디입니다.' };
        }

        // 2. Get max ID for manual increment (DB issue mitigation)
        const maxIdUser = await prisma.user.findFirst({
            orderBy: { id: 'desc' },
        });
        const nextId = (maxIdUser?.id || 0) + 1;

        // 3. Create user
        const newUser = await prisma.user.create({
            data: {
                id: nextId,
                username: data.username,
                password: data.password,
                fullName: data.fullName,
                role: 'USER',
                canAccess: true,
                canRead: true,
                canWrite: true,
            },
        });

        return { success: true, data: newUser };
    } catch (error: any) {
        console.error('Failed to create user:', error);
        return { success: false, error: error.message };
    }
}

export async function changePassword(userId: number, newPassword: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { password: newPassword }
        });
        return { success: true };
    } catch (error: any) {
        console.error('Failed to change password:', error);
        return { success: false, error: error.message };
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
