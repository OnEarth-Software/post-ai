import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const tokenCookie = request.cookies.get('token');

    if (!tokenCookie || !tokenCookie.value) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        // Simple base64 decode of the JWT payload. 
        // Edge runtime doesn't have native Buffer, so use atob for base64url decode
        const token = tokenCookie.value;
        const payloadBase64 = token.split('.')[1];
        
        if (!payloadBase64) {
            throw new Error("Invalid token format");
        }

        // Handle base64url characters
        let base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        // Pad with '='
        const pad = base64.length % 4;
        if (pad) {
            if (pad === 1) {
                throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
            }
            base64 += new Array(5 - pad).join('=');
        }

        const payloadString = atob(base64);
        const payload = JSON.parse(payloadString);

        if (payload.role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        // Allow request to proceed if admin
        return NextResponse.next();
    } catch (e) {
        console.error("Middleware token decode error:", e);
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

export const config = {
    matcher: ['/admin/:path*'],
};
