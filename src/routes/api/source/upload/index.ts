import type { APIEvent } from '@solidjs/start/server';
import { supabase } from '~/lib/supabase';
import PDFParser from 'pdf2json';

interface PDFData {
  Pages: Array<{
    Texts: Array<{
      R: Array<{
        T: string;
      }>;
    }>;
  }>;
}

export async function POST(event: APIEvent) {
  try {
    const formData = await event.request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return new Response(
        JSON.stringify({ error: 'File and userId are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (file.type !== 'application/pdf') {
      return new Response(
        JSON.stringify({ error: 'Only PDF files are allowed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert File to Buffer for pdf2json
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF content using pdf2json
    const pdfParser = new PDFParser();
    const pdfData = await new Promise<PDFData>((resolve, reject) => {
      pdfParser.on('pdfParser_dataReady', (pdfData: PDFData) => {
        resolve(pdfData);
      });
      pdfParser.on('pdfParser_dataError', (error: Error) => {
        reject(error);
      });
      pdfParser.parseBuffer(buffer);
    });

    // Extract text content from pdf2json output
    const content = pdfData.Pages.map((page) => 
      page.Texts.map((text) => 
        decodeURIComponent(text.R[0].T)
      ).join(' ')
    ).join('\n');

    // Save to database
    const { data, error } = await supabase
      .from('persona_sources')
      .insert({
        user_id: userId,
        type: 'pdf',
        name: file.name,
        content: content,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error saving PDF source: ${error.message}`);
    }

    return new Response(
      JSON.stringify({
        id: data.id,
        type: 'pdf',
        name: file.name,
        content: content,
        addedAt: new Date(data.created_at),
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error processing PDF:', error);
    return new Response(
      JSON.stringify({ error: 'Error processing PDF file' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
