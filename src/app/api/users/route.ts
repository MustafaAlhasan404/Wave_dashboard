import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://3819-185-107-56-150.ngrok-free.app';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '33340aae84db6ddded853028e017a58cef095797213f8b1b1eacaa0b39c45fe8';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    
    console.log(`Sending user creation request to: ${API_URL}/users`, { 
      ...body, 
      password: '***', 
      confirmedPassword: '***' 
    });
    
    // Use record type for headers to allow any string key
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    };
    
    // Get auth token from cookies or request headers
    const authToken = request.cookies.get('authToken')?.value || 
                      request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    } else {
      console.warn('No auth token available for user creation request');
    }
    
    // Forward the user creation request to the external API
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    console.log('API response status:', response.status);
    
    // Get the response data
    const data = await response.json();
    
    console.log('User creation response from API:', data);
    
    // Return the response
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      {
        success: false,
        status: 500,
        message: 'Failed to create user',
        data: null,
      },
      { status: 500 }
    );
  }
} 