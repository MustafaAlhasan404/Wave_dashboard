import { NextRequest, NextResponse } from "next/server";

// Generate mock news data
function generateMockNews(count: number = 100) {
  const categories = ["Politics", "Business", "Technology", "Health", "Entertainment", "Sports", "Science"];
  const statuses = ["published", "draft", "archived"];
  const sources = [
    {
      id: "c4d7f976-6cf4-4e20-9898-c086989d43cd",
      name: "Kutch - Labadie News",
      image: "https://picsum.photos/seed/pQyN1pq/2314/2437",
      link: "https://squeaky-alb.info/",
      _count: { sourceFollowings: 4 }
    },
    {
      id: "56857500-39bd-42ac-82df-aea81bbb91a9",
      name: "Block, Wyman and Mante News",
      image: "https://picsum.photos/seed/zsGf3hS7W/2610/2491",
      link: "https://taut-trash.org",
      _count: { sourceFollowings: 3 }
    },
    {
      id: "63f78d3e-eb48-4202-b783-3fa9272fa03e",
      name: "Rice - Deckow News",
      image: "https://loremflickr.com/2110/3659?lock=8641000348519977",
      link: "https://live-corporation.info/",
      _count: { sourceFollowings: 3 }
    },
    {
      id: "a474dcde-9e0c-4a39-804c-798cb5d5cbb6",
      name: "Bogan and Sons News",
      image: "https://loremflickr.com/1913/1482?lock=5334640065820832",
      link: "https://bright-spring.biz",
      _count: { sourceFollowings: 2 }
    }
  ];

  return Array.from({ length: count }, (_, i) => {
    const id = crypto.randomUUID();
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomSource = sources[Math.floor(Math.random() * sources.length)];
    const randomDate = new Date(Date.now() - Math.floor(Math.random() * 10000000000));
    const credibilityScore = Math.random();
    const fakeVoice = Math.random() > 0.8;
    const isSaved = Math.random() > 0.9;

    return {
      id,
      image: Math.random() > 0.7 ? `https://picsum.photos/seed/${id}/800/600` : null,
      title: `News article ${i + 1}: ${randomCategory} update ${id.substring(0, 8)}`,
      category: randomCategory,
      fakeVoice,
      credibilityScore,
      publishedAt: randomDate.toISOString(),
      status: randomStatus,
      source: randomSource,
      isSaved
    };
  });
}

// Cache the generated news to avoid regenerating on each request
let cachedNews = generateMockNews(100);

export async function GET(request: NextRequest) {
  // Get page and limit from query parameters
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  
  // Calculate pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedNews = cachedNews.slice(startIndex, endIndex);
  
  // Add a small delay to simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json({
    success: true,
    status: 200,
    message: "News Returned",
    data: {
      news: paginatedNews,
      pagination: {
        total: cachedNews.length,
        page,
        limit,
        totalPages: Math.ceil(cachedNews.length / limit)
      }
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create a new news item
    const newItem = {
      id: crypto.randomUUID(),
      image: body.image || null,
      title: body.title,
      category: body.category,
      fakeVoice: body.fakeVoice || false,
      credibilityScore: body.credibilityScore || Math.random(),
      publishedAt: new Date().toISOString(),
      status: body.status || "draft",
      source: body.source || {
        id: "c4d7f976-6cf4-4e20-9898-c086989d43cd",
        name: "Kutch - Labadie News",
        image: "https://picsum.photos/seed/pQyN1pq/2314/2437",
        link: "https://squeaky-alb.info/",
        _count: { sourceFollowings: 4 }
      },
      isSaved: false
    };
    
    // Add to the cached news
    cachedNews = [newItem, ...cachedNews];
    
    return NextResponse.json({
      success: true,
      status: 201,
      message: "News Created",
      data: { news: newItem }
    });
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