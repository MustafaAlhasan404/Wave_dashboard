import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '33340aae84db6ddded853028e017a58cef095797213f8b1b1eacaa0b39c45fe8';

export async function POST(request: NextRequest) {
  try {
    // Get the request body with the refresh token
    const body = await request.json();
    
    if (!body.refreshToken) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: 'Refresh token is required',
          data: null,
        },
        { status: 400 }
      );
    }
    
    console.log('Attempting to refresh token');
    
    // Forward the refresh token request to the external API
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({ refreshToken: body.refreshToken }),
    });
    
    console.log('Refresh token response status:', response.status);
    
    // Get the response data
    const data = await response.json();
    
    console.log('Refresh token response:', data);
    
    // Return the response
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      {
        success: false,
        status: 500,
        message: 'Token refresh failed',
        data: null,
      },
      { status: 500 }
    );
  }
}