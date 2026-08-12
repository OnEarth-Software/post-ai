'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function deleteCampaign(campaignId: string) {
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
        const response = await fetch(`${apiUrl}/admin/campaigns/${campaignId}`, {
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

        revalidatePath('/admin/campaigns');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete campaign:", error);
        return { success: false, error: 'Internal server error' };
    }
}
