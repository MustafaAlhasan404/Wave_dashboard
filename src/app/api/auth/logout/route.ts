import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Create a response that will redirect to the login page
  const response = NextResponse.redirect(new URL('/login', request.url));
  
  // Clear cookies with various path options
  response.cookies.delete('authToken');
  response.cookies.delete('refreshToken');
  
  // Also clear with specific paths
  response.cookies.delete({ name: 'authToken', path: '/dashboard' });
  response.cookies.delete({ name: 'refreshToken', path: '/dashboard' });
  
  return response;
}