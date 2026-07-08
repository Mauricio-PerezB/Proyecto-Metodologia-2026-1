import { Router } from 'express';
import { registrarMantenimiento, registrarVehiculo, obtenerVehiculos, obtenerVehiculoPorId, obtenerVehiculosEnMantenimiento, actualizarVehiculo, eliminarVehiculo, obtenerHistorial, resolverMantenimiento } from '../controllers/mantenimiento.controller.js';

const router = Router();

router.get('/historial', obtenerVehiculosEnMantenimiento);
router.get('/:id/historial', obtenerHistorial);
router.post('/resolver', resolverMantenimiento);
router.get('/', obtenerVehiculos);
router.get('/:id', obtenerVehiculoPorId);
router.post('/', registrarMantenimiento);
router.post('/nuevo', registrarVehiculo);
router.put('/:id', actualizarVehiculo);
router.delete('/:id', eliminarVehiculo);

export default router;