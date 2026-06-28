import { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { getVehiculos, createVehiculo, deleteVehiculo, updateVehiculo } from '@services/vehiculo.service';
import { getReservas } from '@services/reserva.service';

export default function GestionVehiculosSecretaria() {
  const { user } = useAuth();
  const [vehiculos, setVehiculos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const [showModal, setShowModal] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState(null);
  const [formData, setFormData] = useState({
    patente: '',
    transmision: 'mecanico',
    estado: 'disponible'
  });

  useEffect(() => {
    if (user?.rol === 'secretario') {
      cargarVehiculos();
    }
  }, [user]);

  const cargarVehiculos = async () => {
    try {
      setLoading(true);
      const [resVehiculos, resReservas] = await Promise.all([
        getVehiculos(),
        getReservas()
      ]);
      
      if (resVehiculos?.data) {
        setVehiculos(resVehiculos.data);
      } else {
        setVehiculos([]);
      }

      if (resReservas?.data) {
        // Filtrar solo las reservas activas/pendientes
        setReservas(resReservas.data.filter(r => r.estado === 'pendiente' || r.estado === 'completada'));
      }
    } catch (err) {
      setError("Error al cargar vehículos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVehiculo) {
        const res = await updateVehiculo(editingVehiculo.id, formData);
        if (res?.data || res?.status === "Success" || res?.message) {
          alert("Vehículo actualizado exitosamente");
          setShowModal(false);
          setEditingVehiculo(null);
          setFormData({ patente: '', transmision: 'mecanico', estado: 'disponible' });
          cargarVehiculos();
        } else {
          alert(res?.message || "Error al actualizar vehículo");
        }
      } else {
        const res = await createVehiculo(formData);
        if (res?.data) {
          alert("Vehículo registrado exitosamente");
          setShowModal(false);
          setFormData({ patente: '', transmision: 'mecanico', estado: 'disponible' });
          cargarVehiculos();
        } else {
          alert(res?.message || "Error al registrar vehículo");
        }
      }
    } catch (err) {
      alert(editingVehiculo ? "Error al actualizar vehículo" : "Error al registrar vehículo");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este vehículo? Esto fallará si el auto tiene clases agendadas.")) return;
    
    try {
      const res = await deleteVehiculo(id);
      if (res?.status === "Success" || res?.message?.includes("exitosamente")) {
        alert("Vehículo eliminado");
        cargarVehiculos();
      } else {
        alert(res?.message || "Error al eliminar vehículo");
      }
    } catch (err) {
      alert("Error al eliminar vehículo");
    }
  };

  if (user?.rol !== 'secretario') {
    return (
      <div className="flex justify-center mt-10">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          No tienes permisos para ver esta página.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Vehículos</h1>
        <button className="btn btn-primary" onClick={() => { setEditingVehiculo(null); setFormData({ patente: '', transmision: 'mecanico', estado: 'disponible' }); setShowModal(true); }}>
          + Agregar Vehículo
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-10"><span className="loading loading-spinner loading-lg"></span></div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">ID</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Patente</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Transmisión</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Estado</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vehiculos.map((vehiculo) => (
                  <tr key={vehiculo.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{vehiculo.id}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{vehiculo.patente}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 uppercase">{vehiculo.transmision}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        {vehiculo.estado || 'DISPONIBLE'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button 
                        className="btn btn-sm btn-info text-white"
                        onClick={() => {
                          setEditingVehiculo(vehiculo);
                          setFormData({ 
                            patente: vehiculo.patente, 
                            transmision: vehiculo.transmision,
                            estado: vehiculo.estado || 'disponible'
                          });
                          setShowModal(true);
                        }}
                      >
                        Editar
                      </button>
                      <button 
                        className="btn btn-sm btn-error text-white"
                        onClick={() => handleDelete(vehiculo.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {vehiculos.length === 0 && (
              <div className="text-center py-6 text-gray-500">No hay vehículos registrados en la flota.</div>
            )}
          </div>
        </div>
      )}

      {/* Agenda de Vehículos */}
      {!loading && !error && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Agenda de Ocupación</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-50 border-b border-blue-200">
                  <th className="px-4 py-3 text-sm font-medium text-blue-800">Fecha</th>
                  <th className="px-4 py-3 text-sm font-medium text-blue-800">Horario</th>
                  <th className="px-4 py-3 text-sm font-medium text-blue-800">Vehículo</th>
                  <th className="px-4 py-3 text-sm font-medium text-blue-800">Alumno</th>
                  <th className="px-4 py-3 text-sm font-medium text-blue-800">Estado</th>
                </tr>
              </thead>
              <tbody>
                {reservas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).map((reserva) => (
                  <tr key={reserva.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                      {new Date(reserva.fecha).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {reserva.clase ? reserva.clase.hora_inicio : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-800">
                      {reserva.vehiculo ? `${reserva.vehiculo.patente} (${reserva.vehiculo.transmision})` : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {reserva.user?.nombre}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        reserva.estado === 'completada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {reserva.estado.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reservas.length === 0 && (
              <div className="text-center py-6 text-gray-500">No hay clases agendadas próximamente.</div>
            )}
          </div>
        </div>
      )}

      {/* Modal Agregar Vehículo */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{editingVehiculo ? "Editar Vehículo" : "Agregar Nuevo Vehículo"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Patente</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Ej: AB-CD-12"
                  className="input input-bordered w-full mt-1" 
                  value={formData.patente} 
                  onChange={e => setFormData({...formData, patente: e.target.value.toUpperCase()})} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Transmisión</label>
                <select 
                  className="select select-bordered w-full mt-1" 
                  value={formData.transmision} 
                  onChange={e => setFormData({...formData, transmision: e.target.value})}
                >
                  <option value="mecanico">Manual</option>
                  <option value="automatico">Automático</option>
                </select>
              </div>

              {editingVehiculo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <select 
                    className="select select-bordered w-full mt-1" 
                    value={formData.estado} 
                    onChange={e => setFormData({...formData, estado: e.target.value})}
                  >
                    <option value="disponible">Disponible</option>
                    <option value="en_taller">En Taller</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
