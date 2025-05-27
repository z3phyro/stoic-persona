import type { APIEvent } from '@solidjs/start/server';
import { supabase } from '~/lib/supabase';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

export async function POST(event: APIEvent) {
  try {
    const formData = await event.request.formData();
    const url = formData.get('url') as string;
    const userId = formData.get('userId') as string;

    if (!url || !userId) {
      return new Response(
        JSON.stringify({ error: 'URL and userId are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch and parse the webpage
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Remove script and style elements
    const scripts = document.getElementsByTagName('script');
    const styles = document.getElementsByTagName('style');
    Array.from(scripts).forEach(script => script.remove());
    Array.from(styles).forEach(style => style.remove());

    // Extract text content
    const content = document.body.textContent?.trim() || '';

    // Save to database
    const { data, error } = await supabase
      .from('persona_sources')
      .insert({
        user_id: userId,
        type: 'url',
        name: url,
        url: url,
        content: content,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error saving URL source: ${error.message}`);
    }

    return new Response(
      JSON.stringify({
        id: data.id,
        type: 'url',
        name: url,
        url: url,
        content: content,
        addedAt: new Date(data.created_at),
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error processing URL:', error);
    return new Response(
      JSON.stringify({ error: 'Error processing URL' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 