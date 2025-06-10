import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '33340aae84db6ddded853028e017a58cef095797213f8b1b1eacaa0b39c45fe8';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from headers
    const authHeader = request.headers.get('authorization');
    const cookies = request.headers.get('cookie');
    
    console.log('Auth test request received');
    console.log('Auth header present:', !!authHeader);
    console.log('Cookies present:', !!cookies);
    
    // Forward to a simple endpoint on the backend (like /users/me) to validate token
    // or just return the auth info for client-side debugging
    
    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          status: 401,
          message: 'No authorization token provided',
          data: {
            auth: false,
            tokenPresent: false,
            cookiesPresent: !!cookies
          }
        },
        { status: 401 }
      );
    }
    
    // For a more thorough test, we could try to validate with the backend
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'Authorization': authHeader,
          ...(cookies ? { 'Cookie': cookies } : {})
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        return NextResponse.json(
          {
            success: false,
            status: response.status,
            message: 'Backend authentication failed',
            data: {
              auth: false,
              tokenPresent: true,
              tokenValid: false,
              backendStatus: response.status,
              cookiesPresent: !!cookies
            }
          },
          { status: 401 }
        );
      }
      
      const userData = await response.json();
      
      return NextResponse.json({
        success: true,
        status: 200,
        message: 'Authentication successful',
        data: {
          auth: true,
          tokenPresent: true,
          tokenValid: true,
          cookiesPresent: !!cookies,
          user: userData.data
        }
      });
    } catch (error) {
      // If we can't reach the backend, just return what we know
      return NextResponse.json({
        success: false,
        status: 500,
        message: 'Could not validate token with backend',
        data: {
          auth: false,
          tokenPresent: true,
          error: error instanceof Error ? error.message : 'Unknown error',
          cookiesPresent: !!cookies
        }
      });
    }
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json(
      {
        success: false,
        status: 500,
        message: 'Authentication test failed',
        data: {
          auth: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
} 