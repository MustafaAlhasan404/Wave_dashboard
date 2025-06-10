import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '33340aae84db6ddded853028e017a58cef095797213f8b1b1eacaa0b39c45fe8';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  // Get auth token from cookies
  const authToken = request.cookies.get('authToken')?.value;
  
  console.log(`Fetching news item with ID: ${id}`);
  
  try {
    // Make request to the actual API
    const response = await fetch(`${API_URL}/news/${id}`, {
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
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Fetch error:", error);
    
    return NextResponse.json({
      success: false,
      status: 404,
      message: "News item not found",
      data: null
    }, { status: 404 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  // Get auth token from cookies
  const authToken = request.cookies.get('authToken')?.value;
  
  console.log(`Deleting news item with ID: ${id}`);
  console.log(`Authorization token: ${authToken ? 'Present' : 'Missing'}`);
  
  try {
    // Make request to the actual API
    const apiUrl = `${API_URL}/news/${id}`;
    console.log(`Making DELETE request to: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': authToken ? `Bearer ${authToken}` : '',
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      }
    });
    
    // Log response status for debugging
    console.log(`API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`API error response: ${errorText}`);
      
      return NextResponse.json({
        success: false,
        status: response.status,
        message: `Failed to delete news item: ${response.statusText}`,
        data: null
      }, { status: response.status });
    }
    
    // Try to parse as JSON, but handle text responses too
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      // Create a proper response structure if the API returned plain text
      data = {
        success: true,
        message: text || 'News item deleted successfully',
        data: {
          deletedNews: [{
            id: id
          }]
        }
      };
    }
    
    console.log('Delete successful, returning data:', data);
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Delete error:", error);
    
    return NextResponse.json({
      success: false,
      status: 500,
      message: error instanceof Error ? `Failed to delete news item: ${error.message}` : "Failed to delete news item",
      data: null
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const authToken = request.cookies.get('authToken')?.value;
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({
      success: false,
      status: 400,
      message: 'Invalid JSON body',
      data: null
    }, { status: 400 });
  }

  console.log(`Updating news with ID: ${id}`, body);

  try {
    const response = await fetch(`${API_URL}/news/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': authToken ? `Bearer ${authToken}` : '',
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error response (${response.status}):`, errorText);
      return NextResponse.json({
        success: false,
        status: response.status,
        message: `Failed to update news: ${response.statusText}`,
        data: null
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('Update successful, returning data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating news:', error);
    return NextResponse.json({
      success: false,
      status: 500,
      message: 'Failed to update news',
      data: null
    }, { status: 500 });
  }
} 