import axios from './root.service.js';

// Obtener todos los alumnos
export async function getAlumnosService() {
  try {
    const response = await axios.get('/alumnos');
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error al obtener alumnos:', error);
    throw error.response?.data || error;
  }
}

// Registrar un alumno nuevo
export async function createAlumnoService(alumnoData) {
  try {
    const response = await axios.post('/alumnos', alumnoData);
    return response.data;
  } catch (error) {
    console.error('Error al registrar alumno:', error);
    throw error.response?.data || error;
  }
}

// Registrar nota de test teórico
export async function addTestTeoricoService(id, nota) {
  try {
    const response = await axios.post(`/alumnos/${id}/tests`, { nota });
    return response.data;
  } catch (error) {
    console.error('Error al registrar test:', error);
    throw error.response?.data || error;
  }
}

// Registrar nota y estado de examen psicotécnico
export async function addExamenPsicotecnicoService(id, nota, estado) {
  try {
    const response = await axios.post(`/alumnos/${id}/examenes`, { nota, estado });
    return response.data;
  } catch (error) {
    console.error('Error al registrar examen:', error);
    throw error.response?.data || error;
  }
}

// Promover alumno a Egresado
export async function egresarAlumnoService(id) {
  try {
    const response = await axios.put(`/alumnos/${id}/egresar`);
    return response.data;
  } catch (error) {
    console.error('Error al egresar alumno:', error);
    throw error.response?.data || error;
  }
}

// Descargar certificado
export async function downloadCertificateService(id, nombreAlumno) {
  try {
    const response = await axios.get(`/alumnos/${id}/certificado/descargar`, {
      responseType: 'blob' // Important to handle text file download
    });
    
    // Create a link to download the file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const filename = `certificado_${nombreAlumno.replace(/\s+/g, '_').toLowerCase()}.txt`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('Error al descargar certificado:', error);
    throw error.response?.data || error;
  }
}
