import { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import axios from '@services/root.service.js';

export default function VerAsistenciaProfesor() {
  const { user } = useAuth();
  const [clases, setClases] = useState([]);
  const [claseSeleccionada, setClaseSeleccionada] = useState('');
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Vehículo state
  const [showModalVehiculo, setShowModalVehiculo] = useState(false);
  const [reportForm, setReportForm] = useState({ kilometraje: '', gravedad: 'Baja', descripcion: '' });
  const [reportError, setReportError] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    const fetchClases = async () => {
      try {
        const response = await axios.get('/clases');
        const misClases = response.data.data.filter(c => c.profesores && c.profesores.id === user.id);
        setClases(misClases);
      } catch (err) {
        console.error('Error fetching clases', err);
        setError('Error al cargar tus clases');
      }
    };
    if (user) {
      fetchClases();
    }
  }, [user]);

  const fetchAsistencia = async (claseId) => {
    if (!claseId) {
      setAsistencias([]);
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/asistencia/clase/${claseId}`);
      setAsistencias(response.data.data);
    } catch (err) {
      console.error('Error fetching asistencia', err);
      setError('Error al cargar la asistencia de esta clase');
      setAsistencias([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClaseChange = (e) => {
    const id = e.target.value;
    setClaseSeleccionada(id);
    fetchAsistencia(id);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportError('');
    setReportSuccess('');
    setSubmittingReport(true);
    
    // Find selected class
    const claseObj = clases.find(c => String(c.id_clase) === String(claseSeleccionada) || String(c.id) === String(claseSeleccionada));
    const vehiculoId = claseObj?.vehiculoId || (claseObj?.vehiculo && claseObj?.vehiculo?.id);

    if (!vehiculoId) {
      setReportError('Esta clase no tiene un vehículo asignado para reportar.');
      setSubmittingReport(false);
      return;
    }

    try {
      const res = await axios.post('/vehiculos', {
        idVehiculo: vehiculoId,
        nuevoKilometraje: Number(reportForm.kilometraje),
        reporteFalla: {
          gravedad: reportForm.gravedad,
          descripcion: reportForm.descripcion
        }
      });
      setReportSuccess(res.data.message || 'Reporte enviado correctamente.');
      setTimeout(() => {
        setShowModalVehiculo(false);
        setReportForm({ kilometraje: '', gravedad: 'Baja', descripcion: '' });
        setReportSuccess('');
      }, 2000);
    } catch (err) {
      setReportError(err.response?.data?.message || 'Error al enviar el reporte. Verifique el kilometraje.');
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="card bg-base-100 shadow-xl p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">Ver Asistencia de Clase</h1>
        <p className="text-gray-600 mb-4">Profesor: <strong>{user?.nombre}</strong></p>
        
        <div className="form-control w-full max-w-md">
          <label className="label">
            <span className="label-text font-semibold">Seleccionar Clase</span>
          </label>
          <select 
            className="select select-bordered w-full"
            value={claseSeleccionada}
            onChange={handleClaseChange}
          >
            <option value="">Seleccione una clase...</option>
            {clases.map(c => (
              <option key={c.id_clase} value={c.id_clase}>
                {c.tipo} - {c.fecha_clase} ({c.hora_inicio} a {c.hora_fin})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error mb-6 shadow-lg"><span>{error}</span></div>}

      {claseSeleccionada && (
        <div className="card bg-base-100 shadow-xl overflow-hidden">
          <div className="bg-base-200 p-4 border-b border-base-300 flex justify-between items-center">
            <h2 className="text-xl font-bold">Listado de Alumnos</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowModalVehiculo(true)} 
                className="btn btn-sm btn-warning"
              >
                ⚠ Reportar Vehículo
              </button>
              <button 
                onClick={() => fetchAsistencia(claseSeleccionada)} 
                className="btn btn-sm btn-ghost"
                disabled={loading}
              >
                ↻ Refrescar
              </button>
            </div>
          </div>
          
          <div className="p-0">
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : asistencias.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No hay alumnos registrados con reserva para esta clase.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th className="text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asistencias.map((alumno, index) => (
                      <tr key={index} className="hover">
                        <td className="font-medium">{alumno.nombre}</td>
                        <td className="text-sm text-gray-500">{alumno.email}</td>
                        <td className="text-center">
                          {alumno.presente ? (
                            <div className="badge badge-success gap-1 text-white py-3 px-3 w-28">
                              ✓ Presente
                            </div>
                          ) : (
                            <div className="badge badge-error gap-1 text-white py-3 px-3 w-28">
                              ✗ Ausente
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {!loading && asistencias.length > 0 && (
            <div className="bg-base-200 p-4 text-sm text-center text-gray-600 border-t border-base-300">
              Total Presentes: <strong>{asistencias.filter(a => a.presente).length}</strong> / {asistencias.length}
            </div>
          )}
        </div>
      )}

      {/* Modal Reporte Vehículo */}
      {showModalVehiculo && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Reportar Estado del Vehículo</h3>
            {reportError && <div className="alert alert-error mb-4 shadow-sm text-sm p-2 text-white">{reportError}</div>}
            {reportSuccess && <div className="alert alert-success mb-4 shadow-sm text-sm p-2 text-white">{reportSuccess}</div>}
            
            <form onSubmit={handleReportSubmit}>
              <div className="form-control w-full mb-3">
                <label className="label"><span className="label-text font-semibold">Kilometraje Final *</span></label>
                <input 
                  type="number" 
                  required 
                  className="input input-bordered w-full" 
                  value={reportForm.kilometraje} 
                  onChange={(e) => setReportForm({...reportForm, kilometraje: e.target.value})} 
                  placeholder="Ej: 15200"
                />
              </div>
              
              <div className="form-control w-full mb-3">
                <label className="label"><span className="label-text font-semibold">Gravedad de Posible Falla</span></label>
                <select 
                  className="select select-bordered w-full" 
                  value={reportForm.gravedad}
                  onChange={(e) => setReportForm({...reportForm, gravedad: e.target.value})}
                >
                  <option value="Baja">Baja (Sin problemas o detalles menores)</option>
                  <option value="Media">Media (Requiere revisión, pero funciona)</option>
                  <option value="Alta">Alta (Falla grave, no puede circular)</option>
                </select>
              </div>

              <div className="form-control w-full mb-6">
                <label className="label"><span className="label-text font-semibold">Descripción del Reporte</span></label>
                <textarea 
                  className="textarea textarea-bordered w-full" 
                  value={reportForm.descripcion}
                  onChange={(e) => setReportForm({...reportForm, descripcion: e.target.value})}
                  placeholder="Observaciones sobre el estado del vehículo..."
                  rows="3"
                ></textarea>
              </div>

              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setShowModalVehiculo(false)} disabled={submittingReport}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={submittingReport}>
                  {submittingReport ? 'Enviando...' : 'Enviar Reporte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
