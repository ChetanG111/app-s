import { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth'; // Import authConfig directly

const { auth } = NextAuth(authConfig);

export default auth((req: NextRequest) => {
    const isLoggedIn = !!req.auth;
    const { nextUrl } = req;
    const isDashboard = nextUrl.pathname.startsWith('/dash');
    const isApi = nextUrl.pathname.startsWith('/api');
    const isPublicApi = nextUrl.pathname.startsWith('/api/auth') ||
        nextUrl.pathname.startsWith('/api/webhooks') ||
        nextUrl.pathname.startsWith('/api/health'); // Allow health check

    if (isDashboard && !isLoggedIn) {
        return Response.redirect(new URL('/login', nextUrl));
    }

    if (isApi && !isPublicApi && !isLoggedIn) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    return;
})

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
