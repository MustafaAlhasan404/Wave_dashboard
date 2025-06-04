import { NextRequest, NextResponse } from "next/server";

// Generate a mock news item for a given ID
function generateMockNewsItem(id: string) {
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
    }
  ];

  // Use the ID to generate deterministic values
  const idSum = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  
  const randomCategory = categories[idSum % categories.length];
  const randomStatus = statuses[idSum % statuses.length];
  const randomSource = sources[idSum % sources.length];
  const randomDate = new Date(Date.now() - (idSum * 1000000));
  const credibilityScore = (idSum % 100) / 100;
  const fakeVoice = idSum % 5 === 0;
  const isSaved = idSum % 10 === 0;

  return {
    id,
    image: idSum % 3 === 0 ? `https://picsum.photos/seed/${id}/800/600` : null,
    title: `News article: ${randomCategory} update ${id.substring(0, 8)}`,
    category: randomCategory,
    fakeVoice,
    credibilityScore,
    publishedAt: randomDate.toISOString(),
    status: randomStatus,
    source: randomSource,
    isSaved,
    content: `This is the full content of the news article with ID ${id}. It contains detailed information about the ${randomCategory} topic discussed in the headline.

The article was published on ${randomDate.toLocaleDateString()} and has a credibility score of ${Math.round(credibilityScore * 100)}%.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.`
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  // Simulate a delay to mimic API latency
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Generate a mock news item for the given ID
  const newsItem = generateMockNewsItem(id);
  
  return NextResponse.json({
    success: true,
    status: 200,
    message: "News Item Returned",
    data: { news: newsItem }
  });
} 