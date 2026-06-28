import { useEffect, useState } from "react";
import { getClasesService, deleteClaseService } from "@services/clase.service.js";
import { getUserRole } from "@services/profile.service.js";
import { DUPageBrowser } from "@components/daisyui/DUPageBrowser.jsx";
import { alertSuccess, alertError, confirmDelete } from "@helpers/sweetAlert.js";

const MisClases = () => {
    const userRole = getUserRole();
    const isTeacher = userRole === "profesor";

    const [clasesData, setClasesData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [buscar, setBuscar] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchClases();
    }, []);

    const fetchClases = async () => {
        try {
            setIsLoading(true);
            const data = await getClasesService();
            setClasesData(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error al obtener clases:", error);
            alertError("Error al obtener las clases");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClase = async (id_clase) => {
        try {
            const isConfirmed = await confirmDelete(
                "¿Está seguro que desea cancelar esta clase?"
            );
            if (!isConfirmed) return;

            setIsLoading(true);
            const response = await deleteClaseService(id_clase);
            if (response.status === 200) {
                alertSuccess("Clase cancelada exitosamente");
                fetchClases();
            }
        } catch (error) {
            alertError("Error al cancelar la clase");
        } finally {
            setIsLoading(false);
        }
    };

    // Filtrado de clases
    const filteredClases = Array.isArray(clasesData)
        ? clasesData.filter(
            (clase) =>
                clase.descripcion?.toLowerCase().includes(buscar.toLowerCase()) ||
                clase.tipo?.toLowerCase().includes(buscar.toLowerCase()) ||
                clase.dia?.toLowerCase().includes(buscar.toLowerCase())
        )
        : [];

    // Paginación
    const POSTS_PER_PAGE = 5;
    const lastPostIndex = currentPage * POSTS_PER_PAGE;
    const firstPostIndex = lastPostIndex - POSTS_PER_PAGE;
    const currentPageContent = filteredClases.slice(firstPostIndex, lastPostIndex);
    const pageAmount = Math.ceil(filteredClases.length / POSTS_PER_PAGE) || 0;

    const limpiarFiltros = () => {
        setBuscar("");
        setCurrentPage(1);
    };

    const getDayOfWeekEmoji = (dia) => {
        const daysMap = {
            lunes: "🅼",
            martes: "🅼",
            miercoles: "🅼",
            jueves: "🅽",
            viernes: "🅽",
            sabado: "🅾",
            domingo: "🅾",
        };
        return daysMap[dia?.toLowerCase()] || "📅";
    };

    if (!isTeacher) {
        return (
            <div className="alert alert-warning m-4">
                <span>Acceso denegado. Solo los profesores pueden acceder a esta página.</span>
            </div>
        );
    }

    return (
        <div className="mis-clases-page p-4">
            <div className="mb-4">
                <h1 className="text-3xl font-bold mb-4">Mis Clases</h1>

                <div className="flex gap-2 mb-4 flex-wrap items-center">
                    {/* Buscador */}
                    <input
                        type="text"
                        placeholder="Buscar por tipo, descripción o día..."
                        className="input input-bordered flex-1 max-w-xs"
                        value={buscar}
                        onChange={(e) => {
                            setBuscar(e.target.value);
                            setCurrentPage(1);
                        }}
                    />

                    {/* Limpiar filtros */}
                    {buscar && (
                        <button className="btn btn-outline" onClick={limpiarFiltros}>
                            Limpiar Filtros
                        </button>
                    )}

                    {/* Indicador de carga */}
                    {isLoading && <span className="loading loading-spinner"></span>}
                </div>
            </div>

            {/* Tabla o grid de clases */}
            {currentPageContent.length === 0 ? (
                <div className="alert alert-info">
                    <span>No hay clases registradas</span>
                </div>
            ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {currentPageContent.map((clase) => (
                        <div key={clase.id_clase} className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title text-lg">
                                    {clase.tipo?.toUpperCase()}
                                </h2>
                                <p className="text-sm font-semibold mb-2">
                                    {getDayOfWeekEmoji(clase.dia)} {clase.dia?.charAt(0).toUpperCase() + clase.dia?.slice(1)}
                                </p>
                                <p className="text-base-content text-opacity-70">
                                    {clase.descripcion}
                                </p>
                                <div className="divider my-2"></div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="badge badge-lg">
                                        📅 {clase.fecha_clase}
                                    </span>
                                </div>
                                <div className="text-sm font-semibold mt-2">
                                    <span className="badge badge-info">
                                        🕐 {clase.hora_inicio} - {clase.hora_fin}
                                    </span>
                                </div>
                                <div className="card-actions justify-end mt-4">
                                    <button
                                        className="btn btn-sm btn-error"
                                        onClick={() => handleDeleteClase(clase.id_clase)}
                                        disabled={isLoading}
                                    >
                                        Cancelar Clase
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Paginación */}
            {pageAmount > 1 && (
                <div className="mt-6">
                    <DUPageBrowser
                        setCurrentPageNumber={setCurrentPage}
                        currentPageNumber={currentPage}
                        pageAmount={pageAmount}
                    />
                </div>
            )}
        </div>
    );
};

export default MisClases;
