import { NextRequest, NextResponse } from 'next/server';
import TurndownService from 'turndown';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return new NextResponse(`Failed to fetch ${url}`, { status: response.status });
    }
    const html = await response.text();
    const turndownService = new TurndownService();
    const markdown = turndownService.turndown(html);

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown',
      },
    });
  } catch (error) {
    return new NextResponse('Error converting to markdown', { status: 500 });
  }
}
