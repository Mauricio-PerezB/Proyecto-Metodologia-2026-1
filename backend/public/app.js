document.addEventListener("DOMContentLoaded", () => {
  const classForm = document.getElementById("classForm");
  const tipoSelect = document.getElementById("tipo");
  const vehiculoGroup = document.getElementById("vehiculoGroup");
  const vehiculoIdInput = document.getElementById("vehiculoId");
  const docenteSelect = document.getElementById("docenteId");
  const studentsContainer = document.getElementById("studentsContainer");
  const classesList = document.getElementById("classesList");
  const notificationsFeed = document.getElementById("notificationsFeed");
  const toastContainer = document.getElementById("toastContainer");

  const addDocenteBtn = document.getElementById("addDocenteBtn");
  const addAlumnoBtn = document.getElementById("addAlumnoBtn");

  tipoSelect.addEventListener("change", () => {
    const selected = tipoSelect.value;
    if (selected === "Práctica") {
      vehiculoGroup.classList.remove("hidden");
      vehiculoIdInput.setAttribute("required", "required");
    } else {
      vehiculoGroup.classList.add("hidden");
      vehiculoIdInput.removeAttribute("required");
      vehiculoIdInput.value = "";
    }
  });

  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>
      <div>${message}</div>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function addNotificationFeed(data) {
    const time = new Date().toLocaleTimeString();
    const item = document.createElement("div");
    item.className = "notification-item";
    item.innerHTML = `
      <div class="notification-item-header">
        <span>Aviso de Agenda Enviado</span>
        <span class="notification-time">${time}</span>
      </div>
      <div class="notification-body">
        <strong>Para:</strong> ${data.docente.email} (Docente ID: ${data.docente.id})
        <strong>Clase:</strong> ${data.descripcion}
        <strong>Horario:</strong> ${new Date(data.fechaHoraInicio).toLocaleString()} - ${new Date(data.fechaHoraFin).toLocaleString()}
        ${data.vehiculoId ? `<strong>Vehículo:</strong> ${data.vehiculoId}` : ""}
      </div>
    `;
    
    const emptyFeed = notificationsFeed.querySelector(".empty-feed");
    if (emptyFeed) emptyFeed.remove();

    notificationsFeed.insertBefore(item, notificationsFeed.firstChild);
  }

  async function loadUsers() {
    try {
      const res = await fetch("/api/auth/users");
      const json = await res.json();
      
      if (json.status === "Success") {
        const users = json.data;
        
        const docentes = users.filter(u => u.role === "Docente" || u.role === "Profesor");
        const alumnos = users.filter(u => u.role === "Alumno");

        docenteSelect.innerHTML = '<option value="" disabled selected>Seleccione docente...</option>';
        if (docentes.length === 0) {
          docenteSelect.innerHTML = '<option value="" disabled>No hay docentes registrados</option>';
        } else {
          docentes.forEach(d => {
            const opt = document.createElement("option");
            opt.value = d.id;
            opt.textContent = `${d.email} (ID: ${d.id})`;
            docenteSelect.appendChild(opt);
          });
        }

        studentsContainer.innerHTML = "";
        if (alumnos.length === 0) {
          studentsContainer.innerHTML = '<span class="loading-text">No hay alumnos registrados. Use las herramientas de prueba abajo.</span>';
        } else {
          alumnos.forEach(a => {
            const label = document.createElement("label");
            label.className = "student-checkbox-item";
            label.innerHTML = `
              <input type="checkbox" name="alumnoIds" value="${a.id}">
              <div class="student-info">
                <span class="student-name">${a.email}</span>
                <span class="student-meta">RUT: ${a.rut || "Sin RUT"} | ID: ${a.id}</span>
              </div>
            `;
            studentsContainer.appendChild(label);
          });
        }
      }
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      showToast("Error al cargar los usuarios del sistema", "error");
    }
  }

  async function loadClasses() {
    try {
      const res = await fetch("/api/clases");
      const json = await res.json();

      if (json.status === "Success") {
        const clases = json.data;
        classesList.innerHTML = "";

        if (clases.length === 0) {
          classesList.innerHTML = '<div class="empty-list">No hay clases programadas en el calendario.</div>';
          return;
        }

        clases.forEach(c => {
          const item = document.createElement("div");
          item.className = "class-card-item";
          
          const formatTime = (dStr) => new Date(dStr).toLocaleString("es-CL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });

          const alumnosList = c.alumnos && c.alumnos.length > 0
            ? c.alumnos.map(a => `<span class="student-tag">${a.email}</span>`).join("")
            : '<span class="student-tag" style="background-color: var(--error-color);">Sin alumnos asignados</span>';

          item.innerHTML = `
            <div class="class-card-header">
              <span class="class-title">${c.descripcion}</span>
              <span class="class-tag ${c.tipo.toLowerCase()}">${c.tipo}</span>
            </div>
            <div class="class-details">
              <div class="class-detail-line">
                <span class="class-detail-icon">👨‍🏫</span>
                <span>Docente: <strong>${c.docente ? c.docente.email : "No asignado"}</strong></span>
              </div>
              <div class="class-detail-line">
                <span class="class-detail-icon">🕒</span>
                <span>${formatTime(c.fechaHoraInicio)} - ${formatTime(c.fechaHoraFin)}</span>
              </div>
              ${c.vehiculoId ? `
              <div class="class-detail-line">
                <span class="class-detail-icon">🚗</span>
                <span>Vehículo Asignado: <strong>${c.vehiculoId}</strong></span>
              </div>` : ""}
            </div>
            <div style="font-size: 0.8rem; margin-top: 4px;">Estudiantes Asignados:</div>
            <div class="class-students">
              ${alumnosList}
            </div>
          `;
          classesList.appendChild(item);
        });
      }
    } catch (err) {
      console.error("Error al cargar clases:", err);
    }
  }

  classForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById("submitBtn");
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;

    const checkedStudents = Array.from(document.querySelectorAll('input[name="alumnoIds"]:checked'))
      .map(cb => cb.value);

    const formData = {
      descripcion: document.getElementById("descripcion").value,
      tipo: tipoSelect.value,
      fechaHoraInicio: document.getElementById("fechaHoraInicio").value,
      fechaHoraFin: document.getElementById("fechaHoraFin").value,
      docenteId: docenteSelect.value,
      alumnoIds: checkedStudents,
      vehiculoId: vehiculoIdInput.value
    };

    try {
      const response = await fetch("/api/clases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const result = await response.json();

      if (response.status === 201) {
        showToast(result.message, "success");
        classForm.reset();
        vehiculoGroup.classList.add("hidden");
        vehiculoIdInput.removeAttribute("required");
        
        addNotificationFeed(result.data);
        loadClasses();
      } else {
        showToast(result.message || "Error al programar la clase", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de conexión con el servidor", "error");
    } finally {
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
    }
  });

  async function registerDemoUser(role) {
    const random = Math.floor(Math.random() * 1000);
    const mockEmail = `${role.toLowerCase()}${random}@escuela.cl`;
    const mockRut = `19.${random}.332-K`;
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: mockEmail,
          password: "password123",
          role: role,
          rut: mockRut,
          phone: "+56 9 8888 7777",
          campus: "Central"
        })
      });
      const result = await response.json();
      
      if (response.status === 201) {
        showToast(`Usuario ${role} creado de prueba: ${mockEmail}`, "success");
        loadUsers();
      } else {
        showToast(`Error al crear usuario de prueba: ${result.message}`, "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error al conectar con la API de autenticación", "error");
    }
  }

  addDocenteBtn.addEventListener("click", () => registerDemoUser("Docente"));
  addAlumnoBtn.addEventListener("click", () => registerDemoUser("Alumno"));

  loadUsers();
  loadClasses();
});
