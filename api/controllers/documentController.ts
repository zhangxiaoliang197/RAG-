import { Request, Response } from 'express';
import { DocumentService } from '../services/documentService.js';
import { FileService } from '../services/fileService.js';
import { VectorService } from '../services/vectorService.js';
import { ConfigService } from '../services/configService.js';
import type { Document } from '../../shared/types.js';

export class DocumentController {
  static async uploadDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: 'No file uploaded' });
        return;
      }

      const file = req.file;
      const ext = file.originalname.split('.').pop()?.toLowerCase() || '';
      const allowedTypes = ['pdf', 'txt', 'md', 'docx'];
      
      if (!allowedTypes.includes(ext)) {
        res.status(400).json({ success: false, error: 'File type not supported' });
        return;
      }

      const docId = crypto.randomUUID();
      const docName = file.originalname;
      
      await FileService.saveUploadedFile(file, docId);
      
      const extractedText = await FileService.extractText(
        FileService.getDocumentPath(docId) + `/original.${ext}`,
        ext
      );
      
      FileService.saveExtractedText(docId, extractedText.text);
      
      const config = await ConfigService.getConfig();
      const chunks = FileService.splitTextIntoChunks(
        extractedText.text,
        config.chunkSize,
        config.chunkOverlap
      );
      
      await VectorService.addChunks(docId, docName, chunks);
      
      const document: Document = {
        id: docId,
        name: docName,
        type: ext as any,
        size: file.size,
        uploadTime: new Date().toISOString(),
        chunkCount: chunks.length
      };
      
      await DocumentService.addDocument(document);
      
      res.json({ success: true, document });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ success: false, error: 'Failed to upload document' });
    }
  }

  static async getDocuments(req: Request, res: Response): Promise<void> {
    try {
      const documents = await DocumentService.getAllDocuments();
      res.json({ success: true, documents });
    } catch (error) {
      console.error('Get documents error:', error);
      res.status(500).json({ success: false, error: 'Failed to get documents' });
    }
  }

  static async deleteDocument(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      await DocumentService.deleteDocument(id);
      await FileService.deleteDocument(id);
      await VectorService.deleteDocument(id);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Delete document error:', error);
      res.status(500).json({ success: false, error: 'Failed to delete document' });
    }
  }
}
