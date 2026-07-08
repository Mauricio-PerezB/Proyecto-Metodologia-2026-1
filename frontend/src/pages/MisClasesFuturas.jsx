import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@context/AuthContext';
import { getClasesStudentService } from '@services/clase.service.js';
import { MdAccessTime, MdDirectionsCar, MdSchool } from 'react-icons/md';

export default function MisClasesFuturas() {
  const { user } = useAuth();
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('Todos');

  useEffect(() => {
    if (user?.rol === 'estudiante') cargarClases();
  }, [user]);

  const cargarClases = async () => {
    try {
      setLoading(true);
      const data = await getClasesStudentService();
      if (Array.isArray(data)) {
        const misClases = data.filter(c =>
          Array.isArray(c.alumnos) && c.alumnos.some(a => a.email === user?.email)
        );
        setClases(misClases);
      }
    } catch (e) {
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
        const coincideTipo = filtroTipo === 'Todos' || c.tipo?.toLowerCase() === filtroTipo.toLowerCase();
        return esFutura && coincideTipo;
      })
      .sort((a, b) => new Date(a.fechaHoraInicio) - new Date(b.fechaHoraInicio));
  }, [clases, filtroTipo]);

  if (user?.rol !== 'estudiante') {
    return (
      <div className="flex justify-center mt-10">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">No tienes permisos para ver esta página.</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mis Clases Futuras</h1>

      <div className="mb-4 space-x-2">
        <button
          onClick={() => setFiltroTipo('Todos')}
          className={`px-3 py-1 rounded ${filtroTipo === 'Todos' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
        >Todos</button>
        <button
          onClick={() => setFiltroTipo('Teórica')}
          className={`px-3 py-1 rounded ${filtroTipo === 'Teórica' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
        >Teórica</button>
        <button
          onClick={() => setFiltroTipo('Práctica')}
          className={`px-3 py-1 rounded ${filtroTipo === 'Práctica' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
        >Práctica</button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : clasesFuturas.length === 0 ? (
        <p>No tienes clases próximas.</p>
      ) : (
        <ul className="space-y-3">
          {clasesFuturas.map(clase => (
            <li key={clase.id} className="border p-3 rounded">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">
                  {new Date(clase.fechaHoraInicio).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="text-sm text-gray-600">{clase.tipo}</span>
              </div>
              <div className="text-sm text-gray-700 flex items-center space-x-2 mb-1">
                <MdAccessTime />
                <span>{new Date(clase.fechaHoraInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(clase.fechaHoraFin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {clase.vehiculoId && (
                <div className="text-sm text-gray-700 flex items-center space-x-2 mb-1">
                  <MdDirectionsCar />
                  <span>{clase.vehiculoId}</span>
                </div>
              )}
              {clase.docente && (
                <div className="text-sm text-gray-700 flex items-center space-x-2 mb-1">
                  <MdSchool />
                  <span>{clase.docente.email}</span>
                </div>
              )}
              {clase.descripcion && (
                <p className="text-xs text-gray-500 italic">"{clase.descripcion}"</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
