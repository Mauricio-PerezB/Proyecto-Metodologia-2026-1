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
    
    // 1. Dibujar bordes elegantes
    // Borde exterior dorado (#D4AF37)
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(1.5);
    doc.rect(8, 8, width - 16, height - 16);
    
    // Borde interior azul pizarra oscuro
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, width - 20, height - 20);
    
    // Esquinas decorativas
    doc.rect(12, 12, 6, 6);
    doc.rect(width - 18, 12, 6, 6);
    doc.rect(12, height - 18, 6, 6);
    doc.rect(width - 18, height - 18, 6, 6);

    // 2. Encabezado de la Academia
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text('ACADEMIA DE FORMACIÓN Y SIMULACIÓN', width / 2, 32, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('ESCUELA DE CONDUCTORES PROFESIONALES Y CAPACITACIÓN VIRTUAL', width / 2, 38, { align: 'center' });
    
    // Línea divisoria superior
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(40, 44, width - 40, 44);
    
    // Título del Certificado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(194, 120, 3);
    doc.text('CERTIFICADO DE FINALIZACIÓN DE CURSO', width / 2, 56, { align: 'center' });
    
    // Texto de otorgamiento
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    doc.text('Por cuanto se hace constar que el alumno(a):', width / 2, 70, { align: 'center' });
    
    // Nombre del Alumno
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(15, 23, 42);
    doc.text(metadata.alumno.toUpperCase(), width / 2, 84, { align: 'center' });
    
    // Correo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Correo Electrónico: ${metadata.email}`, width / 2, 90, { align: 'center' });
    
    // Cuerpo del mensaje
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const textCuerpo = 'Ha cumplido satisfactoriamente con todos los requisitos académicos del programa de conducción,\n' +
      'aprobando tanto las simulaciones teóricas como las evaluaciones prácticas psicotécnicas.';
    doc.text(textCuerpo, width / 2, 100, { align: 'center' });
    
    // 3. Recuadro de calificaciones (Rendimiento Académico)
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(45, 114, width - 90, 26, 3, 3, 'FD');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('RENDIMIENTO ACADÉMICO REGISTRADO', width / 2, 120, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text(`Promedio de Evaluaciones Teóricas: ${metadata.promedio}%`, width / 2, 126, { align: 'center' });
    doc.text('Examen Psicotécnico Práctico: APROBADO', width / 2, 132, { align: 'center' });
    
    // 4. Fechas y Firmas
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`En fe de lo cual, se expide el presente documento en Santiago de Chile, el ${metadata.fecha}.`, width / 2, 154, { align: 'center' });
    
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
