import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that don't require authentication
const publicPaths = ['/login', '/forgot-password'];

export function middleware(request: NextRequest) {
  // Check if the path is in the public paths
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Get the token from the cookies
  const token = request.cookies.get('authToken')?.value;
  
  // If the path is not public and there's no token, redirect to login
  if (!isPublicPath && !token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // If the path is login and there's a token, redirect to dashboard
  if (request.nextUrl.pathname.startsWith('/login') && token) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  // Continue with the request
  return NextResponse.next();
}

// Configure matcher for paths to run middleware on
export const config = {
  matcher: [
    // Match all routes except for static files, api routes, and _next
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};