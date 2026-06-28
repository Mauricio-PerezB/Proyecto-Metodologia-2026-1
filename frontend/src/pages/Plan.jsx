import { useEffect, useState } from "react";
import { useGetPlanes } from "../hooks/Planes/useGetPlanes.jsx";
import useCreatePlan from "../hooks/Planes/useCreatePlan.jsx";
import useEditPlan from "../hooks/Planes/useEditPlan.jsx";
import useDeletePlan from "../hooks/Planes/useDeletePlan.jsx";

const Plan = () => {
    const [planesData, setPlanesData] = useState([]);

    const [planes, fetchPlanes] = useGetPlanes(planesData, setPlanesData);

    const { handleCreatePlan } = useCreatePlan(fetchPlanes);
    const { handleEditPlan } = useEditPlan(fetchPlanes);
    const { handleDeletePlan } = useDeletePlan(fetchPlanes);
    const [buscar, setBuscar] = useState("");

    useEffect(() => {
        if (typeof fetchPlanes === 'function') {
            fetchPlanes();
        }
    }, []);

    const limpiarFiltros = () => {
        setBuscar("");
    };

    return (
        <div className="Plan-page">
            <button 
                className="create btn btn-primary ml-3 mt-3 mb-0" 
                onClick={() => handleCreatePlan(fetchPlanes)}
            >
                Crear Plan
            </button>
            
            {buscar && (
                <button className="solicitud-limpiar-btn btn ml-5" onClick={limpiarFiltros}>
                    Limpiar
                </button>
            )}
            
            <div className="Plan2-page">
                <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Precio</th>
                                <th>Duración</th>
                                <th>Clases</th>
                                <th>Tipo</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {planes?.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center">
                                        No hay planes registrados
                                    </td>
                                </tr>
                            ) : (
                                planes?.map((plan) => (
                                    <tr key={plan.id_plan}>
                                        <td>{plan.id_plan}</td>
                                        <td>{plan.nombre}</td>
                                        <td>${plan.costo}</td>
                                        <td>{plan.duracion_semanas} semanas</td>
                                        <td>{plan.clases_totales}</td>
                                        <td>
                                            <span className={`badge ${
                                                plan.tipo === 'teorico' ? 'badge-info' :
                                                plan.tipo === 'practico' ? 'badge-warning' :
                                                'badge-success'
                                            }`}>
                                                {plan.tipo}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${
                                                plan.estado === 'activo' ? 'badge-success' : 'badge-error'
                                            }`}>
                                                {plan.estado}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button
                                                    className="btn btn-xs btn-info"
                                                    onClick={() => handleEditPlan(plan)}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    className="btn btn-xs btn-error"
                                                    onClick={() => handleDeletePlan(plan.id_plan, plan.nombre)}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Plan;