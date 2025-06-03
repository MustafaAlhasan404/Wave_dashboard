import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://3819-185-107-56-150.ngrok-free.app';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '33340aae84db6ddded853028e017a58cef095797213f8b1b1eacaa0b39c45fe8';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    
    console.log(`Sending login request to: ${API_URL}/auth/login`, { body });
    
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    };
    
    // Only log the first 10 characters of the API key for security
    console.log('Login request headers:', {
      ...headers,
      'x-api-key': `${API_KEY.substring(0, 10)}...` // Obscured for logs
    });
    
    // Make sure API key is exactly what we expect
    console.log('API key length:', API_KEY.length);
    console.log('API key first 10 chars:', API_KEY.substring(0, 10));
    console.log('Login request API URL:', `${API_URL}/auth/login`);
    console.log('Login request body:', body);
    
    // Forward the login request to the external API
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    console.log('API response status:', response.status);
    
    // Get the response data
    const data = await response.json();
    
    console.log('Login response from API:', data);
    
    // Return the response
    return NextResponse.json(data);
  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        status: 500,
        message: 'Login request failed',
        data: null,
      },
      { status: 500 }
    );
  }
}