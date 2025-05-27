import { supabase } from '~/lib/supabase';

export interface URLSource {
  id: string;
  type: 'url';
  name: string;
  url: string;
  content: string;
  addedAt: Date;
}

export const urlService = {
  async visitURL(url: string, userId: string): Promise<URLSource> {
    try {
      const formData = new FormData();
      formData.append('url', url);
      formData.append('userId', userId);

      const response = await fetch('/api/source/visit', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error visiting URL');
      }

      const data = await response.json();
      return {
        id: data.id,
        type: 'url',
        name: data.name,
        url: data.url,
        content: data.content,
        addedAt: new Date(data.addedAt),
      };
    } catch (error) {
      console.error('Error processing URL:', error);
      throw error;
    }
  },

  async deleteURL(sourceId: string): Promise<void> {
    const { error } = await supabase
      .from('persona_sources')
      .delete()
      .eq('id', sourceId);

    if (error) {
      throw new Error(`Error removing URL source: ${error.message}`);
    }
  },

  async getURLs(userId: string): Promise<URLSource[]> {
    const { data, error } = await supabase
      .from('persona_sources')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'url')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error loading URL sources: ${error.message}`);
    }

    return data.map((source) => ({
      id: source.id,
      type: 'url',
      name: source.name,
      url: source.url,
      content: source.content,
      addedAt: new Date(source.created_at),
    }));
  }
}; 