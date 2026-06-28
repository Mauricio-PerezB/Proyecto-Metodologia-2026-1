import { Router } from 'express';
import { registrarMantenimiento } from '../controllers/mantenimiento.controller.js';

const router = Router();


router.post('/', registrarMantenimiento);

export default router;