import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://3819-185-107-56-150.ngrok-free.app';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'waveportal-key-12345';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from request headers
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Authorization header is required" },
        { status: 401 }
      );
    }
    
    // Forward the request to the actual API
    const response = await fetch(`${API_URL}/reports`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
        "x-api-key": API_KEY
      },
      cache: "no-store"
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reports" },
      { status: 500 }
    );
  }
} 