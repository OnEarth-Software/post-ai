import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // This accepts username (email) and password to forward to FastAPI
        const formData = new URLSearchParams();
        if (body.username) formData.append('username', body.username);
        if (body.password) formData.append('password', body.password);
        if (body.temp_token) formData.append('temp_token', body.temp_token);
        if (body.code) formData.append('code', body.code);

        // If no API_URL is provided, fallback to NEXT_PUBLIC_API_URL
        let apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        // If it's localhost, we are in local dev. Since we use Docker Compose, Next.js must call 'backend:8000'
        if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
            apiUrl = 'http://backend:8000';
        }
        
        // Determine the endpoint based on whether it's standard login or 2FA
        let endpoint = `${apiUrl}/auth/login`;
        let reqBody: any = formData.toString();
        let headers: Record<string, string> = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        if (body.temp_token && body.code) {
            endpoint = `${apiUrl}/auth/login/2fa`;
            reqBody = JSON.stringify({ temp_token: body.temp_token, code: body.code });
            headers = { 'Content-Type': 'application/json' };
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: reqBody
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        // If it requires 2FA, don't set cookie yet, just return the temp_token
        if (data.requires_2fa) {
            return NextResponse.json(data);
        }

        // Set HttpOnly cookie for the access token
        if (data.access_token) {
            cookies().set({
                name: 'token',
                value: data.access_token,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 1 week (match backend expiration if possible)
            });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Login API route error:", error);
        return NextResponse.json({ detail: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
