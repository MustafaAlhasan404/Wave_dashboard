import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://3819-185-107-56-150.ngrok-free.app';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '33340aae84db6ddded853028e017a58cef095797213f8b1b1eacaa0b39c45fe8';

export async function POST(request: NextRequest) {
  try {
    // Get the auth token from the request
    const authToken = request.headers.get('Authorization');
    
    console.log('Notify API received auth header:', authToken ? `${authToken.substring(0, 20)}...` : 'None');
    
    if (!authToken) {
      return NextResponse.json(
        {
          success: false,
          status: 401,
          message: 'Authentication token is required',
          data: null,
        },
        { status: 401 }
      );
    }
    
    // Get the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.body || !body.topic) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: 'Missing required fields: title, body, and topic are required',
          data: null,
        },
        { status: 400 }
      );
    }
    
    // Create a clean payload with only the required fields
    const payload = {
      title: body.title,
      body: body.body,
      topic: body.topic || "news", // Default to "news" if not specified
    };
    
    // Add optional scheduledTime if present
    if (body.scheduledTime) {
      payload.scheduledTime = body.scheduledTime;
    }
    
    console.log('Sending notification:', payload);
    
    // Forward the notification request to the external API
    const response = await fetch(`${API_URL}/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'Authorization': authToken
      },
      body: JSON.stringify(payload),
    });
    
    console.log('Notification API response status:', response.status);
    
    // Get the response data
    const data = await response.json();
    console.log('Notification API response:', data);
    
    // If we get a 403 or 401, add a more descriptive message
    if (response.status === 401 || response.status === 403) {
      return NextResponse.json(
        {
          success: false,
          status: response.status,
          message: 'Authentication failed. Your session may have expired. Please log in again.',
          originalError: data.message || 'Token validation failed',
          data: null,
        },
        { status: response.status }
      );
    }
    
    // Return the response
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Notification API error:', error);
    return NextResponse.json(
      {
        success: false,
        status: 500,
        message: 'Failed to send notification',
        data: null,
      },
      { status: 500 }
    );
  }
}