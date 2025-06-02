import { supabase } from '~/lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Source {
  id: string;
  type: 'pdf' | 'url';
  name: string;
  content: string;
  url?: string;
  addedAt: Date;
}

export const aiService = {
  async getAIResponse(
    messages: Message[],
    sources: Source[],
    conversationId: string
  ): Promise<string> {
    try {
      // Prepare the system message with context from sources
      const context = sources.map(source => {
        const sourceType = source.type === 'pdf' ? 'PDF document' : 'webpage';
        return `Content from ${sourceType} "${source.name}":\n${source.content}\n`;
      }).join('\n');

      const systemMessage = {
        role: 'system',
        content: `You are an AI assistant that has been trained to answer questions instead of the person using the following knowledge sources that describe the user skills. Use this information to provide accurate and detailed responses while maintaining a technical and professional tone. Do not exaggerate or make claims beyond what is supported by the sources.

Knowledge Sources:
${context}

Instructions:
1. Base your responses on the provided knowledge sources
2. Be technically accurate and detailed
3. Maintain a professional and technical tone
4. If you're unsure about something, acknowledge the limitations and askfor clarification
5. Do not make claims that aren't supported by the sources
6. Structure the response in a way that is easy to understand and follow. Using paragraphs and lists when appropriate. Use html tags to format the response.
7. Answer using the first person because you are representing the user, answer with confidence dont cite the sources.`
      };

      // Prepare the API request
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [systemMessage, ...messages],
          conversationId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error getting AI response');
      }

      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error('Error getting AI response:', error);
      throw error;
    }
  }
}; 