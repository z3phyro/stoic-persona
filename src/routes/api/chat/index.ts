import type { APIEvent } from '@solidjs/start/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(event: APIEvent) {
  try {
    const { messages, conversationId } = await event.request.json();

    if (!messages || !conversationId) {
      return new Response(
        JSON.stringify({ error: 'Messages and conversationId are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert messages to Anthropic format
    const anthropicMessages = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }));

    const completion = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      messages: anthropicMessages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = completion.content[0]?.text;

    if (!content) {
      throw new Error('No response from Claude');
    }

    return new Response(
      JSON.stringify({ content }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(
      JSON.stringify({ error: 'Error processing chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 