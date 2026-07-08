import { patchClaseService } from "@services/clase.service.js";
import Swal from "sweetalert2";
import { createSwalField, createSwalDateField } from "../utils/swalField.jsx";
import { fireDynamicSwal } from "../utils/dynamicSwal.jsx";
import { StaticDropdownList } from "../utils/DropdownList.jsx";
import { ESTADO_CLASE, CLASE_TEORICA, CLASE_PRACTICA } from "../../constants/clase.constants.jsx";
import { gebi } from "../utils/getElementById.jsx";
import { getTeacherEmail, processTeachers } from "../../utils/ClaseUtils.js";

async function editClaseInfo(clase, profesores, vehiculos, alumnos) {
    const isPractica = (clase.tipo || "").toLowerCase().includes("práct") || (clase.tipo || "").toLowerCase().includes("pract");
    const alumnoSelectId = "swal2-alumnos-edit";

    // 1. Pre-seleccionar Profesor
    const profesorSelected = profesores.find(p => p.includes(clase.docente?.email)) || "";

    // 2. Pre-seleccionar Alumno(s)
    let alumnosHtml = "";
    if (isPractica) {
        // Dropdown para 1 solo alumno
        const alumnoObj = clase.alumnos && clase.alumnos[0];
        const alumnoSelected = alumnoObj ? `${alumnoObj.nombre} (${alumnoObj.email})` : "";
        const alumnosListMapped = Array.isArray(alumnos) ? alumnos.map(a => `${a.nombre} (${a.email})`) : [];
        alumnosHtml = StaticDropdownList(alumnosListMapped, alumnoSelected || "Alumno (1 cupo)", "swal2-input10", "m-1", false);
    } else {
        // Multiselect para alumnos teóricos
        const selectedIds = Array.isArray(clase.alumnos) ? clase.alumnos.map(a => Number(a.id)) : [];
        const options = Array.isArray(alumnos) ? alumnos.map(a => {
            const isSelected = selectedIds.includes(Number(a.id));
            return `<option value="${a.id}" ${isSelected ? "selected" : ""}>${a.nombre} (${a.email})</option>`;
        }).join("") : "";
        
        alumnosHtml = `
            <div class="mb-3 text-left">
                <label class="block text-sm font-medium text-gray-700 mb-1">Alumnos (selección múltiple)</label>
                <select id="${alumnoSelectId}" multiple class="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white" style="height:120px;">
                    ${options}
                </select>
                <p class="text-xs text-gray-400 mt-1">Mantén Ctrl/Cmd para seleccionar varios</p>
            </div>
        `;
    }

    // 3. Pre-seleccionar Vehículo (sólo para práctica)
    let vehiculoHtml = "";
    if (isPractica) {
        const activeVehicles = Array.isArray(vehiculos)
            ? vehiculos.filter(v => (v.estado || "").toLowerCase() === "activo" || (v.estado || "").toLowerCase() === "disponible" || v.patente === clase.vehiculoId).map(v => v.patente)
            : [];
        vehiculoHtml = StaticDropdownList(activeVehicles, clase.vehiculoId || "Vehículo (patente)", "swal2-input9", "m-1", false);
    }

    const { value: formValues } = await Swal.fire({
        title: isPractica ? 'Editar Clase Práctica' : 'Editar Clase Teórica',
        html: `
            ${createSwalField(2, "Descripción", clase.descripcion)}
            ${createSwalDateField(3, "fecha", clase.fecha_clase)} 
            ${createSwalField(4, "Hora de Inicio", clase.hora_inicio)}
            ${createSwalField(5, "Hora de Término", clase.hora_fin)}
            ${StaticDropdownList(ESTADO_CLASE, clase.estado_clase || "Estado", "swal2-input7", "m-1", false)}
            ${StaticDropdownList(profesores, profesorSelected || "Profesor", "swal2-input8", "m-1", false)}
            ${vehiculoHtml}
            ${alumnosHtml}
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const descripcion = String(gebi('swal2-input2')?.value || "").trim();
            const fecha_clase = gebi('swal2-input3')?.value;
            const hora_inicio = gebi('swal2-input4')?.value;
            const hora_fin = gebi('swal2-input5')?.value;
            const estado_clase = String(gebi('swal2-input7')?.value);
            const email_profesor = getTeacherEmail(String(gebi('swal2-input8')?.value));

            // Validaciones básicas
            if (!descripcion || !fecha_clase || !hora_inicio || !hora_fin) {
                Swal.showValidationMessage("Por favor completa todos los campos obligatorios.");
                return false;
            }

            let patente_auto = null;
            let email_alumno = null;
            let ids_alumnos = null;

            if (isPractica) {
                patente_auto = String(gebi('swal2-input9')?.value);
                if (!patente_auto || patente_auto === "Vehículo (patente)") {
                    patente_auto = clase.vehiculoId;
                }
                if (!patente_auto) {
                    Swal.showValidationMessage("Debes seleccionar un vehículo para la clase práctica.");
                    return false;
                }

                const alumnoSeleccionado = gebi('swal2-input10')?.value;
                if (!alumnoSeleccionado || alumnoSeleccionado === "Alumno (1 cupo)") {
                    const alumnoObj = clase.alumnos && clase.alumnos[0];
                    if (alumnoObj) {
                        email_alumno = alumnoObj.email;
                    }
                } else {
                    email_alumno = getTeacherEmail(alumnoSeleccionado);
                }

                if (!email_alumno) {
                    Swal.showValidationMessage("Debes seleccionar un alumno para la clase práctica.");
                    return false;
                }
            } else {
                const selectEl = document.getElementById(alumnoSelectId);
                ids_alumnos = selectEl
                    ? Array.from(selectEl.selectedOptions).map(o => Number(o.value))
                    : [];
            }

            return { 
                tipo: clase.tipo, 
                descripcion, 
                fecha_clase, 
                hora_inicio, 
                hora_fin, 
                estado_clase, 
                email_profesor, 
                patente_auto, 
                email_alumno, 
                ids_alumnos 
            };
        },
        theme: "light",
        customClass: {
            confirmButton: 'bg-indigo-600 text-white font-medium px-5 py-2 rounded hover:bg-indigo-700 mx-2 transition-colors',
            cancelButton: 'bg-gray-200 text-gray-800 font-medium px-5 py-2 rounded hover:bg-gray-300 mx-2 transition-colors',
            popup: 'rounded-xl shadow-xl'
        },
        buttonsStyling: false
    });

    return formValues;
}

export const editClase = (fetchClase, profesores, vehiculos, alumnos) => {
    const profesoresProcesados = processTeachers(profesores);
    const handleEditClase = async (id_clase, clase) => {
        try {
            const formValues = await editClaseInfo(clase, profesoresProcesados, vehiculos, alumnos);
            if (!formValues) return;

            const response = await patchClaseService(id_clase, formValues);
            if (response) {
                fireDynamicSwal(response?.status, null, response.message || response.details || response.data?.message || response.data?.details);
                await fetchClase();
            }
        } catch (error) {
            console.error('Error al actualizar la clase:', error);
        }
    };
    return { handleEditClase };
};

export default editClase;
