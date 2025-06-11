import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '33340aae84db6ddded853028e017a58cef095797213f8b1b1eacaa0b39c45fe8';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params;
    
    if (!key) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: 'API Key is required',
          data: null,
        },
        { status: 400 }
      );
    }
    
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
    const response = await fetch(`${API_URL}/apiKeys/${key}`, {
      method: 'PATCH',
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
    console.error('API Key status update error:', error);
    return NextResponse.json(
      {
        success: false,
        status: 500,
        message: 'Failed to update API key status',
        data: null,
      },
      { status: 500 }
    );
  }
} 