import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '33340aae84db6ddded853028e017a58cef095797213f8b1b1eacaa0b39c45fe8';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from headers
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          status: 401,
          message: 'Authorization token is required',
          data: null,
        },
        { status: 401 }
      );
    }
    
    // Forward the request to the external API
    const response = await fetch(`${API_URL}/apiKeys`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'x-api-key': API_KEY,
      },
    });
    
    // Get the response data
    const data = await response.json();
    
    // Return the response
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API Keys fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        status: 500,
        message: 'Failed to fetch API keys',
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get auth token from headers
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          status: 401,
          message: 'Authorization token is required',
          data: null,
        },
        { status: 401 }
      );
    }
    
    // Get the request body
    const body = await request.json();
    
    // Forward the request to the external API
    const response = await fetch(`${API_URL}/apiKeys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(body),
    });
    
    // Get the response data
    const data = await response.json();
    
    // Return the response
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API Key creation error:', error);
    return NextResponse.json(
      {
        success: false,
        status: 500,
        message: 'Failed to create API key',
        data: null,
      },
      { status: 500 }
    );
  }
} 