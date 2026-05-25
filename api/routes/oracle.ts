import express from 'express';
import { OracleController } from '../controllers/oracleController.js';

const router = express.Router();

router.post('/config/test', OracleController.testOracleConfig);
router.post('/config', OracleController.saveOracleConfig);
router.get('/config', OracleController.getOracleConfig);
router.get('/tables/remote', OracleController.getOracleTables);
router.get('/tables/remote/:tableName', OracleController.getOracleTableStructure);
router.get('/tables', OracleController.getAllTables);
router.post('/tables', OracleController.saveTable);
router.put('/tables/:id', OracleController.updateTable);
router.delete('/tables/:id', OracleController.deleteTable);
router.post('/sql/execute', OracleController.executeSql);
router.post('/sql/validate', OracleController.validateSql);

export default router;
