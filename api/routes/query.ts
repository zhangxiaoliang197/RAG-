import express from 'express';
import { QueryController } from '../controllers/queryController.js';

const router = express.Router();

router.post('/', QueryController.query);

export default router;
