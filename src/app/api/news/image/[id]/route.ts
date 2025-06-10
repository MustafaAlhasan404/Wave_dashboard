import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '33340aae84db6ddded853028e017a58cef095797213f8b1b1eacaa0b39c45fe8';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: 'News ID is required',
          data: null,
        },
        { status: 400 }
      );
    }
    
    // Get auth token from cookies and headers
    const authHeader = request.headers.get('authorization');
    const cookies = request.headers.get('cookie');
    
    // Log the incoming request
    console.log(`Processing image upload for news ID: ${id}`);
    console.log('Auth header present:', !!authHeader);
    console.log('Cookies present:', !!cookies);
    
    // Clone the request to get the form data
    const formData = await request.formData();
    const image = formData.get('image');
    
    if (!image || !(image instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: 'Image file is required',
          data: null,
        },
        { status: 400 }
      );
    }
    
    console.log('Image file received:', image.name, image.size, image.type);
    
    // Create a new FormData to send to the API
    const apiFormData = new FormData();
    apiFormData.append('image', image);
    
    // Target URL for the backend API
    const targetUrl = `${API_URL}/news/image/${id}`;
    console.log('Forwarding to backend URL:', targetUrl);
    
    // Set up headers
    const headers: HeadersInit = {
      'x-api-key': API_KEY,
    };
    
    // Add authorization if available
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Pass cookies if available
    if (cookies) {
      headers['Cookie'] = cookies;
    }
    
    console.log('Sending request with headers:', Object.keys(headers).join(', '));
    
    // Forward the request to the target URL
    const response = await fetch(targetUrl, {
      method: 'PATCH',
      headers,
      body: apiFormData,
      credentials: 'include',
    });
    
    // Detailed logging for debugging
    console.log('Backend response status:', response.status);
    console.log('Backend response headers:', Object.fromEntries(response.headers.entries()));
    
    // Check if response is ok
    if (!response.ok) {
      let errorMessage = `Backend API returned error: ${response.status}`;
      let errorData = null;
      
      try {
        // Try to parse error response as JSON
        const errorBody = await response.json();
        console.error('Backend API error (JSON):', errorBody);
        errorMessage = errorBody.message || errorMessage;
        errorData = errorBody.data || null;
      } catch (e) {
        // If not JSON, get as text
        const errorText = await response.text();
        console.error('Backend API error (Text):', errorText);
        errorMessage = errorText || errorMessage;
      }
      
      return NextResponse.json(
        {
          success: false,
          status: response.status,
          message: errorMessage,
          data: errorData,
        },
        { status: response.status }
      );
    }
    
    // Get the response data
    const responseData = await response.json();
    console.log('Backend response data:', responseData);
    
    // Transform response to match expected format if needed
    // The backend returns { success, status, message, data: { imageUrl } }
    // But our client expects { success, status, message, data: { image } }
    
    const transformedResponse = {
      ...responseData,
      data: {
        image: responseData.data?.imageUrl || null
      }
    };
    
    console.log('Transformed response:', transformedResponse);
    
    // Return the transformed response
    return NextResponse.json(transformedResponse);
  } catch (error) {
    console.error('Image upload proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        status: 500,
        message: error instanceof Error ? error.message : 'Image upload failed',
        data: null,
      },
      { status: 500 }
    );
  }
} 