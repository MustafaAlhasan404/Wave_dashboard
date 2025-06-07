import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://3819-185-107-56-150.ngrok-free.app';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '33340aae84db6ddded853028e017a58cef095797213f8b1b1eacaa0b39c45fe8';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const saved = body.saved;
    
    // Get auth token from cookies
    const authToken = request.cookies.get('authToken')?.value;
    
    console.log(`Setting saved status for news item ${id} to: ${saved}`);
    
    // Make request to the actual API
    const response = await fetch(`${API_URL}/news/${id}/save`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({ saved })
    });
    
    if (!response.ok) {
      console.log(`API returned error status: ${response.status}`);
      throw new Error(`API returned status ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Error saving news:", error);
    return NextResponse.json({
      success: false,
      status: 400,
      message: "Failed to update saved status",
      data: null
    }, { status: 400 });
  }
} 