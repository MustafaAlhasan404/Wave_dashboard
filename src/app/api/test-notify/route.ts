import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://3819-185-107-56-150.ngrok-free.app';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '33340aae84db6ddded853028e017a58cef095797213f8b1b1eacaa0b39c45fe8';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    
    // Get the token from the request cookies or body
    let token = request.cookies.get('authToken')?.value;
    
    // If token is not in cookies, check if it's in the request body
    if (!token && body.token) {
      token = body.token;
    }
    
    // Create a clean payload with only the required fields
    const payload: {
      title: any;
      body: any;
      topic: any;
      scheduledTime?: any;
    } = {
      title: body.title || "Test Notification",
      body: body.body || "This is a test notification",
      topic: body.topic || "news",
    };
    
    // Add optional scheduledTime if present
    if (body.scheduledTime) {
      payload.scheduledTime = body.scheduledTime;
    }
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          status: 401,
          message: 'Authentication token is required. Please include it in cookies or request body.',
          data: null,
        },
        { status: 401 }
      );
    }
    
    console.log('Test notify endpoint using token:', token.substring(0, 20) + '...');
    console.log('Notification payload:', payload);
    
    // Forward the notification request to the external API
    const response = await fetch(`${API_URL}/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });
    
    console.log('Test notify API response status:', response.status);
    
    // Get the response data
    const data = await response.json();
    console.log('Test notify API response:', data);
    
    // Return the response
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Test notification API error:', error);
    return NextResponse.json(
      {
        success: false,
        status: 500,
        message: 'Failed to send test notification',
        data: null,
      },
      { status: 500 }
    );
  }
}