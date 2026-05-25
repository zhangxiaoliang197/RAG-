import express from 'express';
import { AnalysisController } from '../controllers/analysisController.js';

const router = express.Router();

router.post('/', AnalysisController.analyzeQuery);
router.post('/generate-sql', AnalysisController.generateOnlySql);
router.post('/execute-sql', AnalysisController.executeOnlySql);

export default router;
