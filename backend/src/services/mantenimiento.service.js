import { AppDataSource } from "../config/configDB.js";
import { Vehiculo } from "../entities/vehiculo.entity.js";
import { HistorialMantenimiento } from "../entities/historialMantenimiento.entity.js";
import { enviarAlertaMantenimiento } from "./email.service.js";
export async function registrarNuevo(patente, modelo, kilometrajeInicial, transmision) {
    const kilometraje = Number(kilometrajeInicial);

    if (isNaN(kilometraje) || kilometraje < 0) {
        throw new Error("El kilometraje inicial no puede ser negativo.");
    }

    const vehiculoRepository = AppDataSource.getRepository(Vehiculo);
    const existente = await vehiculoRepository.findOneBy({ patente });

    if (existente) {
        throw new Error("La patente ya existe en el sistema.");
    }

    const nuevoVehiculo = vehiculoRepository.create({
        patente,
        modelo,
        transmision,
        kilometraje,
        estado: "Activo",
    });

    return await vehiculoRepository.save(nuevoVehiculo);
}

export async function obtenerVehiculos() {
    const vehiculoRepository = AppDataSource.getRepository(Vehiculo);
    return await vehiculoRepository.find();
}

export async function obtenerVehiculosEnMantenimiento() {
    const vehiculoRepository = AppDataSource.getRepository(Vehiculo);
    return await vehiculoRepository.find({ where: { estado: "En Mantenimiento" } });
}

export async function obtenerVehiculoPorId(id) {
    const vehiculoRepository = AppDataSource.getRepository(Vehiculo);
    return await vehiculoRepository.findOneBy({ id });
}

export async function actualizarVehiculo(id, updates) {
    const vehiculoRepository = AppDataSource.getRepository(Vehiculo);
    const vehiculo = await vehiculoRepository.findOneBy({ id });

    if (!vehiculo) {
        throw new Error("Vehículo no encontrado");
    }

    if (updates.patente && updates.patente !== vehiculo.patente) {
        const existente = await vehiculoRepository.findOneBy({ patente: updates.patente });
        if (existente) {
            throw new Error("La patente ya existe en el sistema.");
        }
        vehiculo.patente = updates.patente;
    }

    if (updates.modelo) {
        vehiculo.modelo = updates.modelo;
    }

    if (updates.transmision) {
        vehiculo.transmision = updates.transmision;
    }

    if (updates.kilometraje !== undefined && updates.kilometraje !== null) {
        const kilometraje = Number(updates.kilometraje);
        if (isNaN(kilometraje) || kilometraje < 0) {
            throw new Error("El kilometraje no puede ser negativo.");
        }
        vehiculo.kilometraje = kilometraje;
    }

    if (updates.estado) {
        vehiculo.estado = updates.estado;
    }

    return await vehiculoRepository.save(vehiculo);
}

export async function eliminarVehiculo(id) {
    const vehiculoRepository = AppDataSource.getRepository(Vehiculo);
    const vehiculo = await vehiculoRepository.findOneBy({ id });

    if (!vehiculo) {
        throw new Error("Vehículo no encontrado");
    }

    await vehiculoRepository.remove(vehiculo);
    return vehiculo;
}

export async function registrarEstadoVehiculoService(idVehiculo, nuevoKilometraje, reporteFalla) {
    try {
        const vehiculoRepository = AppDataSource.getRepository(Vehiculo);
        const vehiculo = await vehiculoRepository.findOneBy({ id: idVehiculo });

        if (!vehiculo) {
            return { exito: false, mensaje: "El vehículo no existe en el sistema." };
        }

        //  Validación Automática de Odómetro
        if (nuevoKilometraje <= vehiculo.kilometraje) {
            return { 
                exito: false, 
                mensaje: `Error: El kilometraje de término (${nuevoKilometraje} km) debe ser mayor al último registro (${vehiculo.kilometraje} km).` 
            };
        }

        vehiculo.kilometraje = nuevoKilometraje;
        let alertaEnviada = false;

        //  Gestión de Fallas y Notificación
        if (reporteFalla && reporteFalla.gravedad) {
            const historialRepo = AppDataSource.getRepository(HistorialMantenimiento);
            const nuevoHistorial = historialRepo.create({
                vehiculo: vehiculo,
                kilometraje: nuevoKilometraje,
                gravedad: reporteFalla.gravedad,
                descripcionFalla: reporteFalla.descripcion || '',
                estado: 'Pendiente'
            });
            await historialRepo.save(nuevoHistorial);

            if (reporteFalla.gravedad === 'Alta') {
                vehiculo.estado = 'En Mantenimiento';
                alertaEnviada = true;
                await enviarAlertaMantenimiento(vehiculo.patente, reporteFalla, nuevoKilometraje);
                console.log(`[NOTIFICACIÓN] Alerta: El vehículo ${vehiculo.patente} ha sido puesto 'En Mantenimiento' por falla grave.`);
            }
        }

        await vehiculoRepository.save(vehiculo);

        return {
            exito: true,
            mensaje: alertaEnviada 
                ? `Registro exitoso. ALERTA: Vehículo ${vehiculo.patente} bloqueado por fallas.`
                : `Estado del vehículo actualizado correctamente.`,
            datos: {
                id: vehiculo.id,
                kilometrajeActualizado: vehiculo.kilometraje,
                estadoFinal: vehiculo.estado
            }
        };

    } catch (error) {
        throw new Error(error.message);
    }
}

export async function obtenerHistorialPorVehiculo(idVehiculo) {
    const historialRepo = AppDataSource.getRepository(HistorialMantenimiento);
    return await historialRepo.find({
        where: { vehiculo: { id: idVehiculo } },
        order: { fechaReporte: "DESC" }
    });
}

export async function resolverMantenimiento(idHistorial, costoReparacion, detalleReparacion) {
    const historialRepo = AppDataSource.getRepository(HistorialMantenimiento);
    const historial = await historialRepo.findOne({
        where: { id: idHistorial },
        relations: ["vehiculo"]
    });

    if (!historial) {
        throw new Error("Registro de historial no encontrado");
    }

    if (historial.estado === "Resuelto") {
        throw new Error("Este mantenimiento ya fue resuelto");
    }

    historial.estado = "Resuelto";
    historial.fechaResolucion = new Date();
    historial.costoReparacion = costoReparacion ? Number(costoReparacion) : null;
    historial.detalleReparacion = detalleReparacion || '';

    await historialRepo.save(historial);

    // Cambiar estado del vehículo a Activo/Disponible
    const vehiculo = historial.vehiculo;
    vehiculo.estado = "disponible";
    const vehiculoRepository = AppDataSource.getRepository(Vehiculo);
    await vehiculoRepository.save(vehiculo);

    return historial;
}