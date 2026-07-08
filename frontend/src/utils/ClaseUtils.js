export const getTeacherEmail = (teacher) => {
    const DEFAULT_EMAIL = "juanitoperez@autitos.cl";
    if (typeof(teacher) !== "string") {
        return DEFAULT_EMAIL
    }
    try {
        const splitTeacher = teacher.split("(")[1];
        const trimmedTeacher = splitTeacher.substring(0, splitTeacher.length - 1);
        return trimmedTeacher;
    } catch (error) {
        console.error(error);
        return DEFAULT_EMAIL;
    }
}

export const getTeacherNombre = (teacher) => {
    const DEFAULT_NAME = "juanito perez";
    if (typeof(teacher) !== "string") {
        return DEFAULT_NAME
    }
    try {
        const splitTeacher = teacher.split("(")[0];
        const nameTeacher = splitTeacher.substring(0, splitTeacher.length - 1);
        const nameTeacherWithoutId = nameTeacher.split(". ")[1];
        return nameTeacherWithoutId;
    } catch (error) {
        console.error(error);
        return DEFAULT_NAME;
    }
}

export const getTeacherEmailFromTeacherList = (teacher) => {
    const DEFAULT_EMAIL = "juanitoperez@gmail.com";
    if (!teacher || (typeof(teacher) !== "string")) {
        return DEFAULT_EMAIL
    }

    try {
        teacher = teacher.split("(")[1];

    } catch (error) {
        console.error(error);
        return DEFAULT_EMAIL;
    }
}

export const processTeachers = (teachers) => {
    if (!Array.isArray(teachers)) {
        return [];
    }

    return teachers.map((teacher) => {
        try {
            // Formato objeto {id, nombre, email} devuelto por el API
            if (typeof teacher === 'object' && teacher !== null) {
                return `${teacher.nombre} (${teacher.email})`;
            }
            // Formato string legado: "N. nombre (email)"
            if (typeof teacher === 'string') {
                return teacher.split(". ")[1] || teacher;
            }
            return null;
        } catch (error) {
            console.error(error);
            return null;
        }
    }).filter(Boolean);
}