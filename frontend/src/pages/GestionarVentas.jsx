import { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { useVentas } from '../hooks/useVentas';

export default function GestionarVentas() {
  const { user } = useAuth();
  const { getAllVentas, aprobarVenta, rechazarVenta, loading } = useVentas();
  
  const [solicitudes, setSolicitudes] = useState([]);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    if (user?.rol === 'secretario') {
      cargarSolicitudes();
    }
  }, [user]);

  const cargarSolicitudes = async () => {
    try {
      const response = await getAllVentas();
      // The backend returns `{ data: results }` for pre-registrations
      setSolicitudes(response || []);
    } catch (err) {
      console.error("Error al cargar solicitudes de preinscripción", err);
    }
  };

  const handleAprobar = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas aprobar esta preinscripción? Se creará una cuenta de alumno en el sistema.")) return;
    
    setMensaje(null);
    try {
      await aprobarVenta(id);
      setMensaje({ type: 'success', text: 'Preinscripción aprobada. Se creó el usuario alumno y se envió correo ficticio con credenciales.' });
      cargarSolicitudes();
    } catch (err) {
      setMensaje({ type: 'error', text: err.message || 'Error al aprobar la solicitud.' });
    }
  };

  const handleRechazar = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas rechazar esta preinscripción?")) return;
    
    setMensaje(null);
    try {
      await rechazarVenta(id);
      setMensaje({ type: 'success', text: 'Preinscripción rechazada correctamente.' });
      cargarSolicitudes();
    } catch (err) {
      setMensaje({ type: 'error', text: err.message || 'Error al rechazar la solicitud.' });
    }
  };

  if (user?.rol !== 'secretario') {
    return (
      <div className="flex justify-center mt-10">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          No tienes permisos para ver esta página. Acceso restringido a secretarios.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Gestión de Preinscripciones</h1>

      {mensaje && (
        <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${mensaje.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {mensaje.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Solicitudes Pendientes</h2>
        
        {loading && solicitudes.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Cargando...</p>
        ) : solicitudes.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay preinscripciones pendientes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">ID</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Nombre Completo</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">RUT</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Teléfono</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Sede</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Plan</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Comprobante</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Estado</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((sol) => (
                  <tr key={sol.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{sol.id}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{sol.nombreCompleto}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{sol.rut}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{sol.telefono}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{sol.sede}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-semibold">{sol.plan}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {sol.comprobantePagoUrl?.startsWith('http') ? (
                        <a 
                          href={sol.comprobantePagoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center"
                        >
                          Ver comprobante
                        </a>
                      ) : (
                        <span>{sol.comprobantePagoUrl}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {sol.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right space-x-2">
                      <button
                        onClick={() => handleAprobar(sol.id)}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-medium transition disabled:opacity-50"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleRechazar(sol.id)}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium transition disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
