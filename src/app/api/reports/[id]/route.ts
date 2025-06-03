import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://3819-185-107-56-150.ngrok-free.app';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'waveportal-key-12345';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Report ID is required" },
        { status: 400 }
      );
    }
    
    // Get auth token from request headers
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Authorization header is required" },
        { status: 401 }
      );
    }
    
    // Forward the request to the actual API
    const response = await fetch(`${API_URL}/reports/${id}`, {
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
    console.error(`Error fetching report:`, error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Report ID is required" },
        { status: 400 }
      );
    }
    
    // Get auth token from request headers
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Authorization header is required" },
        { status: 401 }
      );
    }
    
    // Get request body
    const body = await request.json();
    
    // Validate request body
    if (!body.status) {
      return NextResponse.json(
        { success: false, message: "Status is required" },
        { status: 400 }
      );
    }
    
    // Forward the request to the actual API
    const response = await fetch(`${API_URL}/reports/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
        "x-api-key": API_KEY
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`Error updating report:`, error);
    return NextResponse.json(
      { success: false, message: "Failed to update report" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Report ID is required" },
        { status: 400 }
      );
    }
    
    // Get auth token from request headers
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Authorization header is required" },
        { status: 401 }
      );
    }
    
    // Forward the request to the actual API
    const response = await fetch(`${API_URL}/reports/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
        "x-api-key": API_KEY
      }
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`Error deleting report:`, error);
    return NextResponse.json(
      { success: false, message: "Failed to delete report" },
      { status: 500 }
    );
  }
} 