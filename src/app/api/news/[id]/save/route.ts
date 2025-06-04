import { NextRequest, NextResponse } from "next/server";

// This is a mock API endpoint for saving/unsaving news items
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const saved = body.saved;
    
    // Simulate a delay to mimic API latency
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In a real application, this would update the database
    console.log(`News item ${id} saved status set to: ${saved}`);
    
    return NextResponse.json({
      success: true,
      status: 200,
      message: saved ? "News saved successfully" : "News unsaved successfully",
      data: { id, saved }
    });
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