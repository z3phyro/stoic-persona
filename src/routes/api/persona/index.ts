import type { APIEvent } from '@solidjs/start/server';

export async function GET(event: APIEvent) {
    return new Response(JSON.stringify({ message: 'Hello World' }), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
