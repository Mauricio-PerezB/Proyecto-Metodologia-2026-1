import axios from './root.service.js';
import { jsPDF } from 'jspdf';

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

// Descargar certificado en formato PDF
export async function downloadCertificateService(id, nombreAlumno) {
  try {
    // Solicitar JSON al backend para obtener los metadatos estructurados
    const response = await axios.get(`/alumnos/${id}/certificado/descargar`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const certData = response.data;
    const metadata = certData.metadata;
    
    // Crear un documento PDF profesional en orientación horizontal (Letter Landscape)
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'letter'
    });
    
    const width = doc.internal.pageSize.getWidth(); // 279.4 mm
    const height = doc.internal.pageSize.getHeight(); // 215.9 mm
    
    // 1. Dibujar un borde minimalista y limpio
    doc.setDrawColor(148, 163, 184); // Slate-400
    doc.setLineWidth(0.3);
    doc.rect(12, 12, width - 24, height - 24);

    // 2. Encabezado de la Academia
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text('ACADEMIA DE FORMACIÓN Y SIMULACIÓN', width / 2, 34, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text('ESCUELA DE CONDUCTORES PROFESIONALES', width / 2, 40, { align: 'center' });
    
    // Línea divisoria superior
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(40, 46, width - 40, 46);
    
    // Título del Certificado (Gris oscuro profesional)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('CERTIFICADO DE FINALIZACIÓN DE CURSO', width / 2, 58, { align: 'center' });
    
    // Texto de otorgamiento
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text('Por medio del presente documento se deja constancia que el alumno(a):', width / 2, 72, { align: 'center' });
    
    // Nombre del Alumno
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text(metadata.alumno.toUpperCase(), width / 2, 84, { align: 'center' });
    
    // Correo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Correo Electrónico: ${metadata.email}`, width / 2, 90, { align: 'center' });
    
    // Cuerpo del mensaje
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(71, 85, 105);
    const textCuerpo = 'Ha completado satisfactoriamente el curso teórico-práctico de conducción en simuladores y vehículos,\n' +
      'cumpliendo con todos los estándares académicos exigidos y aprobando las evaluaciones correspondientes.';
    doc.text(textCuerpo, width / 2, 100, { align: 'center', lineHeightFactor: 1.4 });
    
    // 3. Sección de calificaciones simple sin tarjeta de color
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('CALIFICACIONES REGISTRADAS', width / 2, 118, { align: 'center' });

    // Línea sutil para separar calificaciones
    doc.setDrawColor(226, 232, 240);
    doc.line(80, 122, width - 80, 122);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Promedio de Simulaciones Teóricas: ${metadata.promedio}%`, width / 2, 128, { align: 'center' });
    doc.text('Examen Psicotécnico Práctico: APROBADO', width / 2, 134, { align: 'center' });
    
    // 4. Fechas y Firmas
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Expedido en Santiago de Chile, el ${metadata.fecha}.`, width / 2, 154, { align: 'center' });
    
    // Líneas de firma
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.5);
    
    // Firma Izquierda
    doc.line(45, 178, 115, 178);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Director Académico', 80, 183, { align: 'center' });
    doc.setFontSize(8);
    doc.text('Academia de Formación', 80, 187, { align: 'center' });
    
    // Firma Derecha
    doc.line(width - 115, 178, width - 45, 178);
    doc.setFontSize(9);
    doc.text('Instructor de Conducción', width - 80, 183, { align: 'center' });
    doc.setFontSize(8);
    doc.text('Firma Autorizada', width - 80, 187, { align: 'center' });
    
    // Detalles de verificación en formato Courier
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`CÓDIGO DE VERIFICACIÓN: ${metadata.certificadoId}`, width / 2, 202, { align: 'center' });
    
    // Descargar el archivo PDF
    const filename = `certificado_${nombreAlumno.replace(/\s+/g, '_').toLowerCase()}.pdf`;
    doc.save(filename);
    
    return { success: true };
  } catch (error) {
    console.error('Error al descargar certificado:', error);
    throw error.response?.data || error;
  }
}
