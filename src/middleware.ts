import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/', '/login', '/signup'];
const protectedRoutes = ['/dashboard'];
const adminRoutes = ['/dashboard/members'];

export default async function middleware(request: NextRequest) {
	const session = await auth();

	// Check if the path is in protected routes
	const isProtectedRoute = protectedRoutes.some((route) =>
		request.nextUrl.pathname.startsWith(route)
	);

	// Check if the path is in admin routes
	const isAdminRoute = adminRoutes.some((route) =>
		request.nextUrl.pathname.startsWith(route)
	);

	// No session, trying to access protected route
	if (!session && isProtectedRoute) {
		const loginUrl = new URL('/login', request.url);
		loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
		return NextResponse.redirect(loginUrl);
	}

	// Has session but pending/rejected status
	if (session?.user && ['PENDING', 'REJECTED'].includes(session.user.status)) {
		// Allow logout
		if (request.nextUrl.pathname === '/api/auth/signout') {
			return NextResponse.next();
		}

		// Redirect to pending page or show status message
		if (!publicRoutes.includes(request.nextUrl.pathname)) {
			return NextResponse.redirect(new URL('/', request.url));
		}
	}

	// Not admin, trying to access admin route
	if (isAdminRoute && session?.user?.role !== 'SUPER_ADMIN') {
		return NextResponse.redirect(new URL('/dashboard', request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};