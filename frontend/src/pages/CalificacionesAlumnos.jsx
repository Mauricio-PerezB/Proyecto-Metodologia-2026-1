import { useState, useEffect, useMemo } from "react";
import { getUserRole } from "@services/profile.service.js";
import {
  getAlumnosService,
  createAlumnoService,
  addTestTeoricoService,
  addExamenPsicotecnicoService,
  egresarAlumnoService,
  downloadCertificateService,
} from "@services/alumno.service.js";
import { alertSuccess, alertError } from "@helpers/sweetAlert.js";
import { MdSchool, MdAssignment, MdCheckCircle, MdDownload, MdPersonAdd } from "react-icons/md";

const CalificacionesAlumnos = () => {
  const userRole = getUserRole();
  const hasAccess = userRole === "profesor" || userRole === "secretario";

  const [alumnos, setAlumnos] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [loading, setLoading] = useState(false);

  // States for modals
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showExamenModal, setShowExamenModal] = useState(false);
  
  // Selected student for grades
  const [selectedAlumno, setSelectedAlumno] = useState(null);

  // Form states
  const [studentForm, setStudentForm] = useState({ nombre: "", email: "" });
  const [testForm, setTestForm] = useState({ nota: "" });
  const [examenForm, setExamenForm] = useState({ nota: "", estado: "Aprobado" });

  const fetchAlumnos = async () => {
    setLoading(true);
    try {
      const data = await getAlumnosService();
      setAlumnos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      alertError("No se pudo obtener la lista de alumnos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasAccess) {
      fetchAlumnos();
    }
  }, [hasAccess]);

  const filteredAlumnos = useMemo(() => {
    return alumnos.filter((alumno) => {
      const matchSearch =
        buscar === "" ||
        alumno.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
        alumno.email.toLowerCase().includes(buscar.toLowerCase());
      return matchSearch;
    });
  }, [alumnos, buscar]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!studentForm.nombre || !studentForm.email) {
      alertError("Todos los campos son requeridos.");
      return;
    }
    setLoading(true);
    try {
      await createAlumnoService(studentForm);
      alertSuccess("Alumno registrado exitosamente.");
      setStudentForm({ nombre: "", email: "" });
      setShowStudentModal(false);
      fetchAlumnos();
    } catch (error) {
      alertError(error.message || "Error al registrar alumno.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTest = async (e) => {
    e.preventDefault();
    const notaNum = parseFloat(testForm.nota);
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 100) {
      alertError("La nota debe ser un número entre 0 y 100.");
      return;
    }
    setLoading(true);
    try {
      await addTestTeoricoService(selectedAlumno.id, notaNum);
      alertSuccess("Nota de test de simulación registrada.");
      setTestForm({ nota: "" });
      setShowTestModal(false);
      setSelectedAlumno(null);
      fetchAlumnos();
    } catch (error) {
      alertError(error.message || "Error al registrar la calificación.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddExamen = async (e) => {
    e.preventDefault();
    const notaNum = parseFloat(examenForm.nota);
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 100) {
      alertError("La nota debe ser un número entre 0 y 100.");
      return;
    }
    setLoading(true);
    try {
      await addExamenPsicotecnicoService(selectedAlumno.id, notaNum, examenForm.estado);
      alertSuccess("Resultado de examen psicotécnico registrado.");
      setExamenForm({ nota: "", estado: "Aprobado" });
      setShowExamenModal(false);
      setSelectedAlumno(null);
      fetchAlumnos();
    } catch (error) {
      alertError(error.message || "Error al registrar la calificación.");
    } finally {
      setLoading(false);
    }
  };

  const handleEgresar = async (id) => {
    setLoading(true);
    try {
      await egresarAlumnoService(id);
      alertSuccess("¡Validaciones aprobadas! Alumno promovido a Egresado con éxito.");
      fetchAlumnos();
    } catch (error) {
      alertError(error.message || "No se cumplen los requisitos mínimos para egresar.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCert = async (id, nombre) => {
    setLoading(true);
    try {
      await downloadCertificateService(id, nombre);
      alertSuccess("Certificado descargado correctamente.");
    } catch (error) {
      alertError(error.message || "No se pudo descargar el certificado.");
    } finally {
      setLoading(false);
    }
  };

  if (!hasAccess) {
    return (
      <div className="alert alert-warning m-4 max-w-2xl mx-auto shadow-lg">
        <span>Acceso denegado. Solo los profesores o secretarios pueden acceder a esta sección.</span>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop')",
      }}
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"></div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-wide shadow-black drop-shadow-md">
              Evaluaciones Internas
            </h1>
            <p className="text-gray-300 text-sm mt-1">
              Registro de calificaciones, promedio de simulaciones y certificación de egresados.
            </p>
          </div>
          <button
            onClick={() => setShowStudentModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg shadow-lg font-semibold transition-all flex items-center gap-2"
          >
            <MdPersonAdd className="text-xl" />
            <span>Registrar Alumno</span>
          </button>
        </div>

        {/* Buscador */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Buscar alumno por nombre o correo electrónico..."
            className="bg-gray-900/90 text-white placeholder-gray-400 border border-gray-700 px-4 py-3 rounded-lg w-full md:w-1/2 outline-none focus:border-indigo-500 transition-colors"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Alumno</th>
                  <th className="px-6 py-4 font-semibold text-center">Promedio Tests</th>
                  <th className="px-6 py-4 font-semibold text-center">Último Examen Psicotécnico</th>
                  <th className="px-6 py-4 font-semibold text-center">Estado del Curso</th>
                  <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && filteredAlumnos.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                      Cargando alumnos...
                    </td>
                  </tr>
                ) : filteredAlumnos.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                      No se encontraron alumnos registrados.
                    </td>
                  </tr>
                ) : (
                  filteredAlumnos.map((alumno) => {
                    const avg = alumno.promedioTests || 0;
                    const psicotecnico = alumno.ultimoExamenPsicotecnico;
                    
                    const isAvgPassed = avg >= 80;
                    const isExamenPassed = psicotecnico?.estado === "Aprobado";
                    const isEgresado = alumno.estado === "Egresado";

                    // Avg badge style
                    const avgColorClass = isAvgPassed
                      ? "bg-green-100 text-green-800 border-green-200"
                      : avg > 0
                      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                      : "bg-gray-100 text-gray-800 border-gray-200";

                    // Psychotechnic badge style
                    let psicotecnicoBadgeClass = "bg-gray-100 text-gray-800 border-gray-200";
                    if (psicotecnico) {
                      if (isExamenPassed) psicotecnicoBadgeClass = "bg-green-100 text-green-800 border-green-200";
                      else if (psicotecnico.estado === "Reprobado") psicotecnicoBadgeClass = "bg-red-100 text-red-800 border-red-200";
                      else psicotecnicoBadgeClass = "bg-yellow-100 text-yellow-800 border-yellow-200";
                    }

                    return (
                      <tr key={alumno.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{alumno.nombre}</div>
                          <div className="text-xs text-gray-500">{alumno.email}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${avgColorClass}`}>
                            {avg > 0 ? `${avg.toFixed(2)}%` : "Sin tests"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {psicotecnico ? (
                            <div className="flex flex-col items-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${psicotecnicoBadgeClass}`}>
                                {psicotecnico.estado}
                              </span>
                              <span className="text-[10px] text-gray-500 mt-0.5">Nota: {psicotecnico.nota}%</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs italic">No realizado</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              isEgresado
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : "bg-blue-100 text-blue-800 border-blue-200"
                            }`}
                          >
                            {alumno.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2 justify-center">
                            {!isEgresado && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedAlumno(alumno);
                                    setShowTestModal(true);
                                  }}
                                  className="border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1"
                                >
                                  <MdAssignment />
                                  <span>+ Test</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedAlumno(alumno);
                                    setShowExamenModal(true);
                                  }}
                                  className="border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1"
                                >
                                  <MdSchool />
                                  <span>+ Examen</span>
                                </button>
                                <button
                                  onClick={() => handleEgresar(alumno.id)}
                                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold shadow-sm transition-all flex items-center gap-1"
                                >
                                  <MdCheckCircle />
                                  <span>Egresar</span>
                                </button>
                              </>
                            )}
                            {isEgresado && (
                              <button
                                onClick={() => handleDownloadCert(alumno.id, alumno.nombre)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold shadow-sm transition-all flex items-center gap-1"
                              >
                                <MdDownload />
                                <span>Descargar Certificado</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: REGISTRAR ALUMNO */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-100 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MdPersonAdd className="text-indigo-600 text-2xl" />
              <span>Registrar Nuevo Alumno</span>
            </h3>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  value={studentForm.nombre}
                  onChange={(e) => setStudentForm({ ...studentForm, nombre: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="juan.perez@example.com"
                  className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR NOTA TEST */}
      {showTestModal && selectedAlumno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <MdAssignment className="text-indigo-600 text-2xl" />
              <span>Registrar Calificación de Test</span>
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              Registrar nota de simulación teórica para <strong>{selectedAlumno.nombre}</strong>.
            </p>
            <form onSubmit={handleAddTest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Nota de Simulación (%)</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="Porcentaje de aprobación (0 - 100)"
                  className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  value={testForm.nota}
                  onChange={(e) => setTestForm({ nota: e.target.value })}
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowTestModal(false);
                    setSelectedAlumno(null);
                  }}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR EXAMEN PSICOTECNICO */}
      {showExamenModal && selectedAlumno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <MdSchool className="text-indigo-600 text-2xl" />
              <span>Registrar Examen Psicotécnico</span>
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              Registrar examen práctico/psicotécnico para <strong>{selectedAlumno.nombre}</strong>.
            </p>
            <form onSubmit={handleAddExamen} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Nota (%)</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="Porcentaje obtenido (0 - 100)"
                  className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  value={examenForm.nota}
                  onChange={(e) => setExamenForm({ ...examenForm, nota: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Estado de Aprobación</label>
                <select
                  className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  value={examenForm.estado}
                  onChange={(e) => setExamenForm({ ...examenForm, estado: e.target.value })}
                >
                  <option className="text-gray-900 bg-white" value="Aprobado">Aprobado</option>
                  <option className="text-gray-900 bg-white" value="Reprobado">Reprobado</option>
                  <option className="text-gray-900 bg-white" value="Pendiente">Pendiente</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowExamenModal(false);
                    setSelectedAlumno(null);
                  }}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalificacionesAlumnos;
