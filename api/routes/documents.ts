import express from 'express';
import multer from 'multer';
import { DocumentController } from '../controllers/documentController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), DocumentController.uploadDocument);
router.get('/', DocumentController.getDocuments);
router.delete('/:id', DocumentController.deleteDocument);

export default router;
