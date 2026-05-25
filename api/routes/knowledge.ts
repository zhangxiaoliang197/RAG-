import express from 'express';
import { KnowledgeController } from '../controllers/knowledgeController.js';

const router = express.Router();

router.get('/metrics', KnowledgeController.getAllMetrics);
router.post('/metrics', KnowledgeController.saveMetric);
router.put('/metrics/:id', KnowledgeController.updateMetric);
router.delete('/metrics/:id', KnowledgeController.deleteMetric);

router.get('/sql-examples', KnowledgeController.getAllSqlExamples);
router.post('/sql-examples', KnowledgeController.saveSqlExample);
router.put('/sql-examples/:id', KnowledgeController.updateSqlExample);
router.delete('/sql-examples/:id', KnowledgeController.deleteSqlExample);

export default router;
