export async function registrarEstadoVehiculoService(idVehiculo, nuevoKilometraje, reporteFalla) {
    try {
        // Simulación de consulta a la base de datos para obtener el vehículo por su ID
        const vehiculo = { 
            id: idVehiculo, 
            patente: "AB-CD-12", 
            kilometraje: 45000, 
            estado: "Activo", 
            historialFallas: [] 
        };

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
            vehiculo.historialFallas.push({
                fecha: new Date().toISOString(),
                descripcion: reporteFalla.descripcion,
                gravedad: reporteFalla.gravedad
            });

            if (reporteFalla.gravedad === 'Alta') {
                vehiculo.estado = 'En Mantenimiento';
                alertaEnviada = true;
                console.log(`[NOTIFICACIÓN] Alerta: El vehículo ${vehiculo.patente} ha sido puesto 'En Mantenimiento' por falla grave.`);
            }
        }

        //  Aquí iría la lógica para guardar el vehículo actualizado en la base de datos

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