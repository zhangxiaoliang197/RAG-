import express from 'express';
import multer from 'multer';
import { DatabaseController } from '../controllers/databaseController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/driver/upload', upload.single('file'), DatabaseController.uploadDriver);
router.post('/config/test', DatabaseController.testConfig);
router.post('/config', DatabaseController.saveConfig);
router.get('/config', DatabaseController.getConfig);
router.get('/tables/remote', DatabaseController.getRemoteTables);
router.get('/tables/remote/:tableName', DatabaseController.getRemoteTableStructure);
router.get('/tables', DatabaseController.getAllTables);
router.post('/tables', DatabaseController.saveTable);
router.put('/tables/:id', DatabaseController.updateTable);
router.delete('/tables/:id', DatabaseController.deleteTable);
router.post('/sql/execute', DatabaseController.executeSql);
router.post('/sql/validate', DatabaseController.validateSql);

export default router;

