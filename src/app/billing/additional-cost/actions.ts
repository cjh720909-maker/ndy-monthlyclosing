'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getAdditionalCosts(year: string) {
  try {
    const costs = await prisma.additionalCost.findMany({
      where: { year },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: costs };
  } catch (error) {
    console.error('Failed to get additional costs:', error);
    return { success: false, error: 'Failed to fetch data' };
  }
}

export async function createAdditionalCost(data: {
  year: string;
  name: string;
  type: string;
  contractType: string;
  baseRate: number;
  allowance: number;
  workingHours: number;
  note: string;
}) {
  try {
    const result = await prisma.additionalCost.create({
      data: {
        year: data.year,
        name: data.name,
        type: data.type,
        contractType: data.contractType,
        baseRate: data.baseRate,
        allowance: data.allowance,
        workingHours: data.workingHours,
        note: data.note,
      },
    });
    revalidatePath('/billing/additional-cost');
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to create additional cost:', error);
    return { success: false, error: 'Failed to create record' };
  }
}

export async function updateAdditionalCost(id: number, data: {
  year: string;
  name: string;
  type: string;
  contractType: string;
  baseRate: number;
  allowance: number;
  workingHours: number;
  note: string;
}) {
  try {
    const result = await prisma.additionalCost.update({
      where: { id },
      data: {
        year: data.year,
        name: data.name,
        type: data.type,
        contractType: data.contractType,
        baseRate: data.baseRate,
        allowance: data.allowance,
        workingHours: data.workingHours,
        note: data.note,
      },
    });
    revalidatePath('/billing/additional-cost');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Failed to update additional cost:', error);
    return { success: false, error: error.message || 'Failed to update record' };
  }
}

export async function deleteAdditionalCost(id: number) {
  try {
    await prisma.additionalCost.delete({
      where: { id },
    });
    revalidatePath('/billing/additional-cost');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete additional cost:', error);
    return { success: false, error: 'Failed to delete record' };
  }
}
