import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '33340aae84db6ddded853028e017a58cef095797213f8b1b1eacaa0b39c45fe8';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get auth token from cookies
    const authToken = request.cookies.get('authToken')?.value;
    
    // Make request to the actual API
    const response = await fetch(`${API_URL}/news/resend/${id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Error resending news to AI:", error);
    return NextResponse.json({
      success: false,
      status: 400,
      message: "Failed to resend news to AI",
      data: null
    }, { status: 400 });
  }
} 