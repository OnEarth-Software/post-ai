'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function updateUser(userId: string, formData: any) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return { success: false, error: 'Unauthorized' };
    }

    let apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
        apiUrl = 'http://backend:8000';
    }

    try {
        const response = await fetch(`${apiUrl}/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("Backend error:", err);
            return { success: false, error: 'Update failed on backend.' };
        }

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error("Failed to update user:", error);
        return { success: false, error: 'Internal server error' };
    }
}

export async function deleteUser(userId: string) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return { success: false, error: 'Unauthorized' };
    }

    let apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
        apiUrl = 'http://backend:8000';
    }

    try {
        const response = await fetch(`${apiUrl}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("Backend error:", err);
            return { success: false, error: 'Delete failed on backend.' };
        }

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete user:", error);
        return { success: false, error: 'Internal server error' };
    }
}
