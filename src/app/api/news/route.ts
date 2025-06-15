import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '33340aae84db6ddded853028e017a58cef095797213f8b1b1eacaa0b39c45fe8';

export async function GET(request: NextRequest) {
  console.log("News API route called");
  
  // Get page and limit from query parameters
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const audio = searchParams.get('audio');
  
  // Get auth token from cookies
  const authToken = request.cookies.get('authToken')?.value;
  
  console.log("Auth token exists:", !!authToken);
  
  // Build the API URL with all necessary parameters
  let apiUrl = `${API_URL}/news?page=${page}&limit=${limit}`;
  if (audio === 'true') {
    apiUrl += '&audio=true';
  }
  
  console.log("Making request to:", apiUrl);
  
  try {
    // Make request to the actual API
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      }
    });
    
    if (!response.ok) {
      console.log(`API returned error status: ${response.status}`);
      throw new Error(`API returned status ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Received ${data?.data?.news?.length || 0} news items from API`);
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Fetch error:", error);
  
    return NextResponse.json({
      success: false,
      status: 500,
      message: "Failed to fetch news from API",
      data: {
        news: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0
        }
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get auth token from cookies
    const authToken = request.cookies.get('authToken')?.value;
    
    // Make request to the actual API
    const response = await fetch(`${API_URL}/news`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Error creating news:", error);
    return NextResponse.json({
      success: false,
      status: 400,
      message: "Failed to create news",
      data: null
    }, { status: 400 });
  }
} 