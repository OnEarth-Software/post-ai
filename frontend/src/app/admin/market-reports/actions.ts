"use server";
import { cookies } from "next/headers";

export async function deleteMarketReport(campaignId: string) {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        let apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
            apiUrl = 'http://backend:8000';
        }
        
        const res = await fetch(`${apiUrl}/admin/market-reports/${campaignId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.ok) {
            return { success: true };
        } else {
            return { success: false, error: `Error ${res.status}` };
        }
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
