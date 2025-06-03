import { parse } from 'node-html-parser';

export async function GET({ request }: { request: Request }) {
  const url = new URL(request.url).searchParams.get('url');
  
  if (!url) {
    return new Response(JSON.stringify({ error: 'URL is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const response = await fetch(url);
    const html = await response.text();
    const root = parse(html);

    // Extract metadata
    const title = root.querySelector('title')?.text || '';
    const description = root.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    
    // Try to find favicon
    let favicon = root.querySelector('link[rel="icon"]')?.getAttribute('href') || 
                 root.querySelector('link[rel="shortcut icon"]')?.getAttribute('href') || '';
    
    // Convert relative favicon URL to absolute
    if (favicon && !favicon.startsWith('http')) {
      const baseUrl = new URL(url);
      favicon = new URL(favicon, baseUrl.origin).toString();
    }

    return new Response(JSON.stringify({
      title,
      description,
      favicon
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch metadata' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 