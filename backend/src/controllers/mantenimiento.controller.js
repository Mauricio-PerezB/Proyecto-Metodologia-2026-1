import { registrarEstadoVehiculoService } from '../services/mantenimiento.service.js';
import { handleSuccess, handleErrorServer } from '../Handlers/responseHandlers.js';

export async function registrarMantenimiento(req, res) {
    try {
        const { idVehiculo, nuevoKilometraje, reporteFalla } = req.body;

        const resultado = await registrarEstadoVehiculoService(idVehiculo, nuevoKilometraje, reporteFalla);

        if (resultado.exito) {
            handleSuccess(res, 200, resultado.mensaje, resultado.datos);
        } else {
            res.status(400).json({ status: "Error", message: resultado.mensaje });
        }

    } catch (error) {
        handleErrorServer(res, 500, "Error interno del servidor al registrar el estado del vehículo");
    }
}