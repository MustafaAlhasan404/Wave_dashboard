import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '33340aae84db6ddded853028e017a58cef095797213f8b1b1eacaa0b39c45fe8';

export async function POST(request: NextRequest) {
  try {
    // Get the path from the request URL (everything after /api/proxy)
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/api/proxy');
    const path = pathParts.length > 1 ? pathParts[1] : '';
    
    // Target URL to proxy to
    const targetUrl = `${API_URL}${path}`;
    
    // Get the request body
    const body = await request.json();
    
    console.log(`Proxying request to: ${targetUrl}`, { body });
    
    // Forward the request to the target URL
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(body),
    });
    
    // Get the response data
    const data = await response.json();
    
    console.log('Proxy response:', data);
    
    // Return the response
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        status: 500,
        message: 'Proxy request failed',
        data: null,
      },
      { status: 500 }
    );
  }
}