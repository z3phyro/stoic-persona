declare module 'pdf2json' {
  class PDFParser {
    constructor();
    parseBuffer(buffer: Buffer): void;
    on(event: 'pdfParser_dataReady', callback: (pdfData: any) => void): void;
    on(event: 'pdfParser_dataError', callback: (error: Error) => void): void;
  }
  export default PDFParser;
} 