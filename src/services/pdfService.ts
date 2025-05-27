import { supabase } from '~/lib/supabase';

export interface PDFSource {
  id: string;
  type: 'pdf';
  name: string;
  content: string;
  addedAt: Date;
}

export const pdfService = {
  async uploadPDF(file: File, userId: string): Promise<PDFSource> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      const response = await fetch('/api/source/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error uploading PDF');
      }

      const data = await response.json();
      return {
        id: data.id,
        type: 'pdf',
        name: data.name,
        content: data.content,
        addedAt: new Date(data.addedAt),
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw error;
    }
  },

  async deletePDF(sourceId: string): Promise<void> {
    const { error } = await supabase
      .from('persona_sources')
      .delete()
      .eq('id', sourceId);

    if (error) {
      throw new Error(`Error removing PDF source: ${error.message}`);
    }
  },

  async getPDFs(userId: string): Promise<PDFSource[]> {
    const { data, error } = await supabase
      .from('persona_sources')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'pdf')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error loading PDF sources: ${error.message}`);
    }

    return data.map((source) => ({
      id: source.id,
      type: 'pdf',
      name: source.name,
      content: source.content,
      addedAt: new Date(source.created_at),
    }));
  }
}; 