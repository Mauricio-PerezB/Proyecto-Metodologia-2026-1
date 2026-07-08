import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@context/AuthContext';
import { getClasesStudentService } from '@services/clase.service.js';
import { MdCalendarToday, MdDirectionsCar, MdSchool, MdAccessTime } from 'react-icons/md';

export default function MisClasesFuturas() {
    const { user } = useAuth();
    const [clases, setClases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroTipo, setFiltroTipo] = useState('Todos');

    useEffect(() => {
        cargarClases();
    }, [user]);

    const cargarClases = async () => {
        try {
            setLoading(true);
            const data = await getClasesStudentService();
            if (Array.isArray(data)) {
                // Filter only classes belonging to the current student
                const misClases = data.filter(c =>
                    Array.isArray(c.alumnos) && c.alumnos.some(a => a.email === user?.email)
                );
                setClases(misClases);
            }
        } catch (err) {
            setError('Error al cargar tus clases.');
        } finally {
            setLoading(false);
        }
    };

    const now = new Date();

    const clasesFuturas = useMemo(() => {
        return clases
            .filter(c => {
                const inicio = new Date(c.fechaHoraInicio);
                const estado = (c.estado_clase || '').toLowerCase();
                const esFutura = inicio >= now && estado !== 'cancelada' && estado !== 'completada';
                const matchTipo = filtroTipo === 'Todos' || c.tipo?.toLowerCase() === filtroTipo.toLowerCase();
                return esFutura && matchTipo;
            })
            .sort((a, b) => new Date(a.fechaHoraInicio) - new Date(b.fechaHoraInicio));
    }, [clases, filtroTipo]);

    const diasParaClase = (fechaStr) => {
        const inicio = new Date(fechaStr);
        const diff = Math.ceil((inicio - now) / (1000 * 60 * 60 * 24));
        if (diff === 0) return 'Hoy';
        if (diff === 1) return 'Mañana';
        return `En ${diff} días`;
    };

    const formatFecha = (fechaStr) => {
        const d = new Date(fechaStr);
        return d.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatHora = (fechaStr) => {
        const d = new Date(fechaStr);
        return d.toTimeString().substring(0, 5);
    };

    const getBadgeColor = (tipo) => {
        if ((tipo || '').toLowerCase().includes('práct') || (tipo || '').toLowerCase().includes('pract')) {
            return 'bg-orange-100 text-orange-700 border-orange-200';
        }
        return 'bg-blue-100 text-blue-700 border-blue-200';
    };

    const getUrgencyColor = (fechaStr) => {
        const inicio = new Date(fechaStr);
        const diff = Math.ceil((inicio - now) / (1000 * 60 * 60 * 24));
        if (diff === 0) return 'border-l-4 border-l-red-400';
        if (diff <= 3) return 'border-l-4 border-l-orange-400';
        if (diff <= 7) return 'border-l-4 border-l-yellow-400';
        return 'border-l-4 border-l-indigo-300';
    };

    if (user?.rol !== 'estudiante') {
        return (
            <div className="flex justify-center mt-10">
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                    No tienes permisos para ver esta página.
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-cover bg-center pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans relative"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop')" }}
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white drop-shadow-md mb-1">
                        Mis Clases Futuras
                    </h1>
                    <p className="text-gray-300 text-sm">Tus próximas clases agendadas</p>
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                        { label: 'Total próximas', value: clases.filter(c => new Date(c.fechaHoraInicio) >= now && (c.estado_clase || '').toLowerCase() !== 'cancelada').length, icon: MdCalendarToday, color: 'indigo' },
                        { label: 'Teóricas', value: clases.filter(c => new Date(c.fechaHoraInicio) >= now && c.tipo?.toLowerCase().includes('teór')).length, icon: MdSchool, color: 'blue' },
                        { label: 'Prácticas', value: clases.filter(c => new Date(c.fechaHoraInicio) >= now && (c.tipo?.toLowerCase().includes('práct') || c.tipo?.toLowerCase().includes('pract'))).length, icon: MdDirectionsCar, color: 'orange' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className={`bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/20`}>
                            <Icon className={`text-3xl mx-auto mb-1 text-${color}-300`} />
                            <div className="text-2xl font-bold text-white">{value}</div>
                            <div className="text-xs text-gray-300 mt-0.5">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Filter */}
                <div className="flex gap-3 mb-6">
                    {['Todos', 'Teórica', 'Práctica'].map(tipo => (
                        <button
                            key={tipo}
                            onClick={() => setFiltroTipo(tipo)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                                filtroTipo === tipo
                                    ? 'bg-indigo-500 text-white shadow-lg'
                                    : 'bg-white/10 text-gray-200 hover:bg-white/20 border border-white/20'
                            }`}
                        >
                            {tipo}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="bg-red-100 text-red-700 p-4 rounded-xl">{error}</div>
                ) : clasesFuturas.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 text-center border border-white/20">
                        <MdCalendarToday className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-200 text-lg font-semibold">No tienes clases futuras agendadas.</p>
                        <p className="text-gray-400 text-sm mt-1">Contacta a la secretaría para agendar una clase.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {clasesFuturas.map((clase) => (
                            <div
                                key={clase.id}
                                className={`bg-white rounded-2xl shadow-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${getUrgencyColor(clase.fechaHoraInicio)}`}
                            >
                                {/* Date block */}
                                <div className="flex-shrink-0 bg-indigo-600 text-white rounded-xl p-4 text-center w-20 shadow-md">
                                    <div className="text-2xl font-bold leading-none">
                                        {new Date(clase.fechaHoraInicio).getDate()}
                                    </div>
                                    <div className="text-xs uppercase tracking-wide mt-0.5 opacity-80">
                                        {new Date(clase.fechaHoraInicio).toLocaleString('es-CL', { month: 'short' })}
                                    </div>
                                    <div className="text-xs mt-1 font-semibold opacity-70">
                                        {new Date(clase.fechaHoraInicio).getFullYear()}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${getBadgeColor(clase.tipo)}`}>
                                            {(clase.tipo || 'Clase').toUpperCase()}
                                        </span>
                                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                            {diasParaClase(clase.fechaHoraInicio)}
                                        </span>
                                    </div>
                                    <p className="text-gray-800 font-semibold text-base capitalize">
                                        {formatFecha(clase.fechaHoraInicio)}
                                    </p>
                                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <MdAccessTime className="text-base" />
                                            {formatHora(clase.fechaHoraInicio)} – {formatHora(clase.fechaHoraFin)}
                                        </span>
                                        {clase.vehiculoId && (
                                            <span className="flex items-center gap-1">
                                                <MdDirectionsCar className="text-base" />
                                                {clase.vehiculoId}
                                            </span>
                                        )}
                                        {clase.docente && (
                                            <span className="flex items-center gap-1">
                                                <MdSchool className="text-base" />
                                                {clase.docente.email}
                                            </span>
                                        )}
                                    </div>
                                    {clase.descripcion && (
                                        <p className="text-xs text-gray-400 mt-1 italic">"{clase.descripcion}"</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
