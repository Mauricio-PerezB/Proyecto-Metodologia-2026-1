document.addEventListener("DOMContentLoaded", () => {
  // --- Navigation & Routing ---
  const menuItems = document.querySelectorAll(".menu-item");
  const sections = document.querySelectorAll(".content-section");
  const pageTitle = document.getElementById("pageTitle");
  const pageSubtitle = document.getElementById("pageSubtitle");
  const menuToggleBtn = document.getElementById("menuToggleBtn");
  const sidebar = document.getElementById("sidebar");

  const routeMetadata = {
    dashboardSection: { title: "Panel de Inicio", subtitle: "Resumen general y avisos de la escuela de manejo" },
    clasesSection: { title: "Calendario y Clases", subtitle: "Programación de sesiones teóricas y prácticas" },
    preinscripcionesSection: { title: "Preinscripciones", subtitle: "Solicitudes de nuevos alumnos y aprobaciones" },
    vehiculosSection: { title: "Flota y Taller", subtitle: "Gestión de vehículos de instrucción y mantenimientos" },
    perfilSection: { title: "Mi Cuenta", subtitle: "Estado de sesión y datos personales" }
  };

  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      const target = item.getAttribute("data-target");
      
      // Update sidebar active state
      menuItems.forEach(mi => mi.classList.remove("active"));
      item.classList.add("active");

      // Update section visibility
      sections.forEach(sec => sec.classList.remove("active-section"));
      const targetSec = document.getElementById(target);
      if (targetSec) targetSec.classList.add("active-section");

      // Update titles
      if (routeMetadata[target]) {
        pageTitle.textContent = routeMetadata[target].title;
        pageSubtitle.textContent = routeMetadata[target].subtitle;
      }

      // Close sidebar on mobile
      sidebar.classList.remove("sidebar-open");
    });
  });

  menuToggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("sidebar-open");
  });

  // --- Modal Helpers (expose to window for HTML click handlers) ---
  window.openRejectionModal = (id) => {
    document.getElementById("rejectionId").value = id;
    document.getElementById("rejectionReason").value = "";
    document.getElementById("rejectionModal").classList.add("active-modal");
  };

  window.closeRejectionModal = () => {
    document.getElementById("rejectionModal").classList.remove("active-modal");
  };

  window.openReceiptModal = (url) => {
    document.getElementById("receiptImage").src = url;
    document.getElementById("receiptModal").classList.add("active-modal");
  };

  window.closeReceiptModal = () => {
    document.getElementById("receiptModal").classList.remove("active-modal");
  };

  window.closeAddVehicleModal = () => {
    document.getElementById("addVehicleModal").classList.remove("active-modal");
  };

  window.closeMaintenanceModal = () => {
    document.getElementById("maintenanceModal").classList.remove("active-modal");
  };

  document.getElementById("btnShowAddVehicleModal").addEventListener("click", () => {
    document.getElementById("addVehicleForm").reset();
    document.getElementById("addVehicleModal").classList.add("active-modal");
  });

  document.getElementById("btnShowMaintenanceModal").addEventListener("click", () => {
    document.getElementById("maintenanceForm").reset();
    document.getElementById("maintenanceModal").classList.add("active-modal");
  });

  // --- Custom Toast System ---
  const toastsContainer = document.getElementById("toastsContainer");

  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `custom-toast toast-${type}`;
    
    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "error") icon = "❌";

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
    `;

    toastsContainer.appendChild(toast);

    // Auto-remove toast
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // --- Session State Management ---
  const userWidget = document.getElementById("userWidget");
  const widgetAvatar = document.getElementById("widgetAvatar");
  const widgetName = document.getElementById("widgetName");
  const widgetRole = document.getElementById("widgetRole");
  const logoutBtn = document.getElementById("logoutBtn");

  const authFlowContainer = document.getElementById("authFlowContainer");
  const profileDetailsContainer = document.getElementById("profileDetailsContainer");
  
  const profileBigAvatar = document.getElementById("profileBigAvatar");
  const profileName = document.getElementById("profileName");
  const profileRole = document.getElementById("profileRole");
  const profileRut = document.getElementById("profileRut");
  const profilePhone = document.getElementById("profilePhone");
  const profileCampus = document.getElementById("profileCampus");

  async function checkAuthSession() {
    const token = localStorage.getItem("token");
    if (!token) {
      // Not logged in
      widgetAvatar.textContent = "?";
      widgetName.textContent = "Invitado";
      widgetRole.textContent = "Sin Sesión";
      logoutBtn.style.display = "none";
      
      authFlowContainer.style.display = "flex";
      profileDetailsContainer.style.display = "none";
      return;
    }

    try {
      const res = await fetch("/api/profile/private", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();

      if (res.ok && result.status === "Success") {
        const user = result.data.user || result.data;
        
        // Populate sidebar widget
        const avatarLetter = (user.email ? user.email.charAt(0) : "U").toUpperCase();
        widgetAvatar.textContent = avatarLetter;
        widgetName.textContent = user.email;
        widgetRole.textContent = user.role || "Alumno";
        logoutBtn.style.display = "block";

        // Populate Cuenta tab details
        profileBigAvatar.textContent = avatarLetter;
        profileName.textContent = user.email;
        profileRole.textContent = user.role || "Alumno";
        profileRut.textContent = user.rut || "No registrado";
        profilePhone.textContent = user.phone || "No registrado";
        profileCampus.textContent = user.campus || "No registrado";

        authFlowContainer.style.display = "none";
        profileDetailsContainer.style.display = "block";
      } else {
        // Token invalid/expired
        localStorage.removeItem("token");
        checkAuthSession();
      }
    } catch (err) {
      console.error("Session verification error:", err);
      // Fallback offline display
      widgetAvatar.textContent = "U";
      widgetName.textContent = "Modo Offline";
      widgetRole.textContent = "Local";
      logoutBtn.style.display = "block";
    }
  }

  // --- Auth Switch views ---
  const loginCard = document.getElementById("loginCard");
  const registerCard = document.getElementById("registerCard");
  const switchToRegister = document.getElementById("switchToRegister");
  const switchToLogin = document.getElementById("switchToLogin");

  switchToRegister.addEventListener("click", () => {
    loginCard.style.display = "none";
    registerCard.style.display = "block";
  });

  switchToLogin.addEventListener("click", () => {
    registerCard.style.display = "none";
    loginCard.style.display = "block";
  });

  // Login Form Submission
  const loginForm = document.getElementById("loginForm");
  const loginSubmitBtn = document.getElementById("loginSubmitBtn");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginSubmitBtn.classList.add("btn-loading-state");

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();

      if (res.ok && json.status === "Success") {
        localStorage.setItem("token", json.data.token);
        showToast("Sesión iniciada correctamente", "success");
        loginForm.reset();
        await checkAuthSession();
        loadAllData();
      } else {
        showToast(json.message || "Error al iniciar sesión", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de comunicación con el servidor", "error");
    } finally {
      loginSubmitBtn.classList.remove("btn-loading-state");
    }
  });

  // Register Form Submission
  const registerForm = document.getElementById("registerForm");
  const registerSubmitBtn = document.getElementById("registerSubmitBtn");

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    registerSubmitBtn.classList.add("btn-loading-state");

    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const rut = document.getElementById("regRut").value;
    const phone = document.getElementById("regPhone").value;
    const campus = document.getElementById("regCampus").value;
    const role = document.getElementById("regRole").value;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rut, phone, campus, role })
      });
      const json = await res.json();

      if (res.status === 201) {
        showToast("Cuenta creada exitosamente. Inicie sesión para continuar.", "success");
        registerForm.reset();
        // Switch back to login card
        registerCard.style.display = "none";
        loginCard.style.display = "block";
      } else {
        showToast(json.message || "Error al registrar la cuenta", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de comunicación con el servidor", "error");
    } finally {
      registerSubmitBtn.classList.remove("btn-loading-state");
    }
  });

  // Logout Buttons handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    showToast("Sesión cerrada", "info");
    checkAuthSession();
  };

  logoutBtn.addEventListener("click", handleLogout);
  document.getElementById("profileLogoutBtn").addEventListener("click", handleLogout);


  // --- Real-time Notifications Feed Log Helper ---
  const dashboardNotificationsFeed = document.getElementById("dashboardNotificationsFeed");

  function addNotificationToFeed(details, isSevere = false) {
    const time = new Date().toLocaleTimeString();
    const item = document.createElement("div");
    item.className = `notification-item-card ${isSevere ? "alert-severe" : ""}`;

    item.innerHTML = `
      <div class="notification-item-card-header">
        <span>${isSevere ? "⚠️ Alerta Crítica de Flota" : "📧 Aviso de Agenda Registrado"}</span>
        <span class="notification-item-card-time">${time}</span>
      </div>
      <div class="notification-item-card-body">${details}</div>
    `;

    // Remove placeholder if present
    const placeholder = dashboardNotificationsFeed.querySelector(".empty-placeholder");
    if (placeholder) placeholder.remove();

    dashboardNotificationsFeed.insertBefore(item, dashboardNotificationsFeed.firstChild);
  }


  // --- Data Loaders & Renderers ---
  let usersListCached = [];
  let vehiclesListCached = [];

  // Update Top metrics counters
  function updateDashboardMetrics(clasesCount, preRegistrosCount, usersCount, vehiclesCount) {
    document.getElementById("statClasses").textContent = clasesCount;
    document.getElementById("statPendingInscriptions").textContent = preRegistrosCount;
    document.getElementById("statUsers").textContent = usersCount;
    document.getElementById("statVehicles").textContent = vehiclesCount;
  }

  // Load Users, Populating Class scheduling options
  async function loadUsers() {
    try {
      const res = await fetch("/api/auth/users");
      const json = await res.json();
      
      if (res.ok && json.status === "Success") {
        usersListCached = json.data;

        const instructors = usersListCached.filter(u => u.role === "Docente" || u.role === "Profesor");
        const students = usersListCached.filter(u => u.role === "Alumno");

        // 1. Populate Docente select
        const classDocente = document.getElementById("classDocente");
        classDocente.innerHTML = '<option value="" disabled selected>Seleccione docente...</option>';
        instructors.forEach(inst => {
          const opt = document.createElement("option");
          opt.value = inst.id;
          opt.textContent = `${inst.email} (ID: ${inst.id})`;
          classDocente.appendChild(opt);
        });

        // 2. Populate Students checkbox container
        const classStudentsList = document.getElementById("classStudentsList");
        classStudentsList.innerHTML = "";
        
        if (students.length === 0) {
          classStudentsList.innerHTML = `
            <span style="font-size: 0.85rem; color: var(--text-muted); font-style: italic; text-align: center; padding: 15px;">
              No hay alumnos registrados. Use las herramientas de prueba abajo.
            </span>`;
        } else {
          students.forEach(st => {
            const label = document.createElement("label");
            label.className = "checkbox-item";
            label.innerHTML = `
              <input type="checkbox" name="alumnoIds" value="${st.id}">
              <div class="checkbox-item-details">
                <span class="checkbox-item-title">${st.email}</span>
                <span class="checkbox-item-subtitle">RUT: ${st.rut || "Sin RUT"} | ID: ${st.id}</span>
              </div>
            `;
            classStudentsList.appendChild(label);
          });
        }
      }
    } catch (err) {
      console.error("Error loading users:", err);
    }
  }

  // Load and Render Classes list
  async function loadClasses() {
    try {
      const res = await fetch("/api/clases");
      const json = await res.json();
      
      if (res.ok && json.status === "Success") {
        const classes = json.data;
        const listDiv = document.getElementById("scheduledClassesList");
        listDiv.innerHTML = "";

        if (classes.length === 0) {
          listDiv.innerHTML = `
            <div class="empty-placeholder">
              <span class="empty-placeholder-icon">📭</span>
              <span>No hay clases programadas en el sistema.</span>
            </div>`;
          return classes.length;
        }

        classes.forEach(c => {
          const start = new Date(c.fechaHoraInicio).toLocaleString();
          const end = new Date(c.fechaHoraFin).toLocaleString();

          const studentTags = c.alumnos && c.alumnos.length > 0
            ? c.alumnos.map(a => `<span class="student-tag">${a.email}</span>`).join("")
            : `<span class="student-tag" style="background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2); color: var(--error);">Sin alumnos asignados</span>`;

          const card = document.createElement("div");
          card.className = "class-item-card";
          card.innerHTML = `
            <div class="class-item-header">
              <span class="class-item-title">${c.descripcion}</span>
              <span class="badge-tag ${c.tipo.toLowerCase() === "práctica" || c.tipo.toLowerCase() === "practica" ? "practica" : "teorica"}">${c.tipo}</span>
            </div>
            
            <div class="class-item-details-grid">
              <div class="detail-row">
                <span class="detail-icon">👨‍🏫</span>
                <span>Docente: <strong>${c.docente ? c.docente.email : "No asignado"}</strong></span>
              </div>
              <div class="detail-row">
                <span class="detail-icon">🕒</span>
                <span>${start} - ${end}</span>
              </div>
              ${c.vehiculoId ? `
              <div class="detail-row">
                <span class="detail-icon">🚗</span>
                <span>Vehículo: <strong style="font-family: monospace;">${c.vehiculoId}</strong></span>
              </div>` : ""}
            </div>

            <div class="class-item-students">
              ${studentTags}
            </div>
          `;
          listDiv.appendChild(card);
        });

        return classes.length;
      }
    } catch (err) {
      console.error("Error loading classes:", err);
    }
    return 0;
  }

  // Load and Render Pre-registrations
  async function loadPreRegistrations() {
    try {
      const res = await fetch("/api/preregistro");
      const json = await res.json();
      
      if (res.ok) {
        const pending = json.data;
        const listDiv = document.getElementById("pendingInscriptionsList");
        listDiv.innerHTML = "";

        if (pending.length === 0) {
          listDiv.innerHTML = `
            <div class="empty-placeholder">
              <span class="empty-placeholder-icon">📂</span>
              <span>No hay solicitudes de preinscripción pendientes.</span>
            </div>`;
          return pending.length;
        }

        pending.forEach(p => {
          const row = document.createElement("div");
          row.className = "class-item-card";
          row.style.borderLeft = "4px solid var(--warning)";
          row.innerHTML = `
            <div class="class-item-header">
              <span class="class-item-title">${p.nombreCompleto}</span>
              <span class="status-indicator pendiente">${p.estado}</span>
            </div>
            
            <div class="class-item-details-grid">
              <div>RUT: <strong>${p.rut}</strong></div>
              <div>Teléfono: <strong>${p.telefono}</strong></div>
              <div>Sede: <strong>${p.sede}</strong></div>
              <div>Plan: <strong>${p.plan}</strong></div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 12px; margin-top: 5px;">
              <a href="#" class="btn-receipt" onclick="openReceiptModal('${p.comprobantePagoUrl}'); return false;">
                <span>📄 Ver Comprobante</span>
              </a>
              
              <div style="display: flex; gap: 8px;">
                <button class="btn-danger" style="padding: 6px 12px; font-size: 0.75rem;" onclick="openRejectionModal(${p.id})">Rechazar</button>
                <button class="btn-success" style="padding: 6px 12px; font-size: 0.75rem;" onclick="approveRequest(${p.id})">Aprobar</button>
              </div>
            </div>
          `;
          listDiv.appendChild(row);
        });

        return pending.length;
      }
    } catch (err) {
      console.error("Error loading pre-registrations:", err);
    }
    return 0;
  }

  // Approve a pre-registration
  window.approveRequest = async (id) => {
    try {
      const res = await fetch(`/api/preregistro/${id}/aprobar`, { method: "POST" });
      const json = await res.json();
      
      if (res.ok) {
        showToast("Solicitud aprobada y usuario Creado", "success");
        addNotificationToFeed(`Inscripción APROBADA para Alumno ID: ${json.user?.id || ""}. Se le ha enviado un correo con sus credenciales de acceso.`);
        loadAllData();
      } else {
        showToast(json.message || "Error al aprobar la solicitud", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de comunicación", "error");
    }
  };

  // Rejection form submit handler
  const rejectionForm = document.getElementById("rejectionForm");
  rejectionForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("rejectionId").value;
    const motivo = document.getElementById("rejectionReason").value;

    try {
      const res = await fetch(`/api/preregistro/${id}/rechazar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo })
      });
      const json = await res.json();

      if (res.ok) {
        showToast("Solicitud rechazada correctamente", "success");
        closeRejectionModal();
        loadAllData();
      } else {
        showToast(json.message || "Error al rechazar", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de comunicación", "error");
    }
  });

  // Load and Render Vehicles Fleet
  async function loadVehicles() {
    try {
      const res = await fetch("/api/mantenimiento");
      const json = await res.json();
      
      if (res.ok && json.status === "Success") {
        vehiclesListCached = json.data;

        // 1. Render in Fleet Grid
        const grid = document.getElementById("fleetGrid");
        grid.innerHTML = "";

        if (vehiclesListCached.length === 0) {
          grid.innerHTML = `
            <div class="empty-placeholder" style="grid-column: span 3;">
              <span class="empty-placeholder-icon">🚗</span>
              <span>No hay vehículos registrados en el taller. Añada uno para iniciar.</span>
            </div>`;
        } else {
          vehiclesListCached.forEach(v => {
            const card = document.createElement("div");
            card.className = "glass-card vehicle-card";
            card.innerHTML = `
              <div class="vehicle-card-header">
                <div>
                  <h4 class="vehicle-model">${v.modelo}</h4>
                  <span class="vehicle-plate-badge">${v.patente}</span>
                </div>
                <span class="vehicle-status-pill ${v.estado.toLowerCase().replace(" ", "-")}">${v.estado}</span>
              </div>
              
              <div class="vehicle-card-body">
                <div>Kilometraje: <strong>${v.kilometraje} km</strong></div>
                <div>ID: <strong>${v.id}</strong></div>
              </div>

              <div class="vehicle-card-footer">
                <button class="btn-card-action btn-card-danger" title="Eliminar Vehículo" onclick="deleteVehicle(${v.id})">
                  <span>🗑️</span>
                </button>
              </div>
            `;
            grid.appendChild(card);
          });
        }

        // 2. Populate vehicles options in forms
        const classVehicle = document.getElementById("classVehicle");
        classVehicle.innerHTML = '<option value="" disabled selected>Seleccione vehículo...</option>';
        
        const maintVehicleId = document.getElementById("maintVehicleId");
        maintVehicleId.innerHTML = '<option value="" disabled selected>Seleccione vehículo...</option>';

        vehiclesListCached.forEach(v => {
          if (v.estado === "Activo") {
            const opt = document.createElement("option");
            opt.value = v.patente; // Patente is expected by the class endpoint
            opt.textContent = `${v.modelo} (${v.patente})`;
            classVehicle.appendChild(opt);
          }
          
          const opt2 = document.createElement("option");
          opt2.value = v.id;
          opt2.textContent = `${v.modelo} - ${v.patente}`;
          maintVehicleId.appendChild(opt2);
        });

        // 3. Render under Maintenance / Warn History Logs
        const workshopList = document.getElementById("maintenanceLogsList");
        workshopList.innerHTML = "";

        const workshopVehicles = vehiclesListCached.filter(v => v.estado === "En Mantenimiento" || v.estado === "Inactivo");

        if (workshopVehicles.length === 0) {
          workshopList.innerHTML = `
            <div class="empty-placeholder">
              <span class="empty-placeholder-icon">🛡️</span>
              <span>Todos los vehículos están operativos o en ruta.</span>
            </div>`;
        } else {
          workshopVehicles.forEach(wv => {
            const row = document.createElement("div");
            row.className = "class-item-card";
            row.style.borderLeft = "4px solid var(--error)";
            row.innerHTML = `
              <div class="class-item-header">
                <span class="class-item-title">${wv.modelo} (<span style="font-family: monospace;">${wv.patente}</span>)</span>
                <span class="vehicle-status-pill fuera-servicio">Bloqueado</span>
              </div>
              <div class="class-item-details-grid">
                <div>Odómetro: <strong>${wv.kilometraje} km</strong></div>
                <div>ID Vehículo: <strong>${wv.id}</strong></div>
              </div>
              <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">
                ⚠️ Retirado de las clases prácticas de forma temporal por reporte de falla grave.
              </div>
              <div style="margin-top: 10px; display: flex; justify-content: flex-end;">
                <button class="btn btn-outline" style="font-size: 0.8rem; padding: 4px 10px;" onclick="darDeAltaVehiculo(${wv.id})">Dar de Alta</button>
              </div>
            `;
            workshopList.appendChild(row);
          });
        }

        // Global function for the button
        if (!window.darDeAltaVehiculo) {
          window.darDeAltaVehiculo = async function(id) {
            try {
              const res = await fetch(`/api/mantenimiento/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estado: "Activo" })
              });
              if (!res.ok) throw new Error("Error al dar de alta el vehículo.");
              showToast("Vehículo restaurado y disponible para clases prácticas.", "success");
              loadAllData();
            } catch (err) {
              console.error(err);
              showToast("Error", "No se pudo actualizar el estado.", true);
            }
          };
        }

        return vehiclesListCached.length;
      }
    } catch (err) {
      console.error("Error loading vehicles:", err);
    }
    return 0;
  }

  // Delete vehicle call
  window.deleteVehicle = async (id) => {
    if (!confirm("¿Está seguro de que desea eliminar este vehículo del sistema?")) return;
    try {
      const res = await fetch(`/api/mantenimiento/${id}`, { method: "DELETE" });
      const json = await res.json();
      
      if (res.ok) {
        showToast("Vehículo eliminado correctamente", "success");
        loadAllData();
      } else {
        showToast(json.message || "Error al eliminar vehículo", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de comunicación", "error");
    }
  };


  // --- Consolidated Data Fetching ---
  async function loadAllData() {
    const classesCount = await loadClasses();
    const preRegistrosCount = await loadPreRegistrations();
    const vehiclesCount = await loadVehicles();
    
    // Refresh users & dropdown lists
    await loadUsers();
    
    // Calculate total users
    const usersCount = usersListCached.length;

    // Update Top stats labels
    updateDashboardMetrics(classesCount, preRegistrosCount, usersCount, vehiclesCount);
  }


  // --- Form Handlers ---

  // 1. Show/Hide vehicle selector conditionally based on class type
  const classTypeSelect = document.getElementById("classType");
  const classVehicleWrapper = document.getElementById("classVehicleWrapper");

  classTypeSelect.addEventListener("change", () => {
    if (classTypeSelect.value === "Práctica") {
      classVehicleWrapper.style.display = "flex";
      document.getElementById("classVehicle").setAttribute("required", "required");
    } else {
      classVehicleWrapper.style.display = "none";
      document.getElementById("classVehicle").removeAttribute("required");
    }
  });

  // 2. Class Scheduling Form Submit
  const classSchedulingForm = document.getElementById("classSchedulingForm");
  const scheduleSubmitBtn = document.getElementById("scheduleSubmitBtn");

  classSchedulingForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    scheduleSubmitBtn.classList.add("btn-loading-state");

    const checkedStudents = Array.from(document.querySelectorAll('input[name="alumnoIds"]:checked'))
      .map(cb => cb.value);

    const data = {
      descripcion: document.getElementById("classDesc").value,
      tipo: classTypeSelect.value,
      fechaHoraInicio: document.getElementById("classStart").value,
      fechaHoraFin: document.getElementById("classEnd").value,
      docenteId: document.getElementById("classDocente").value,
      alumnoIds: checkedStudents,
      vehiculoId: document.getElementById("classVehicle").value
    };

    try {
      const res = await fetch("/api/clases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const json = await res.json();

      if (res.status === 201) {
        showToast("Clase agendada y guardada correctamente", "success");
        classSchedulingForm.reset();
        classVehicleWrapper.style.display = "none";
        
        // Push notification item
        const docenteEmail = json.data.docente ? json.data.docente.email : "Instructor";
        addNotificationToFeed(
          `Nueva clase práctica agendada en calendario del docente ${docenteEmail}.
          - Clase: ${data.descripcion}
          - Horario: ${new Date(data.fechaHoraInicio).toLocaleString()} - ${new Date(data.fechaHoraFin).toLocaleString()}
          ${data.vehiculoId ? `- Patente Asignada: ${data.vehiculoId}` : ""}`
        );

        loadAllData();
      } else {
        showToast(json.message || "Error al agendar la clase", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de conexión", "error");
    } finally {
      scheduleSubmitBtn.classList.remove("btn-loading-state");
    }
  });

  // 3. Pre-registration Form Submit
  const preRegistrationForm = document.getElementById("preRegistrationForm");
  const preRegisterSubmitBtn = document.getElementById("preRegisterSubmitBtn");

  preRegistrationForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    preRegisterSubmitBtn.classList.add("btn-loading-state");

    const data = {
      nombreCompleto: document.getElementById("preName").value,
      rut: document.getElementById("preRut").value,
      telefono: document.getElementById("prePhone").value,
      sede: document.getElementById("preCampus").value,
      plan: document.getElementById("prePlan").value,
      comprobantePagoUrl: document.getElementById("preReceipt").value
    };

    try {
      const res = await fetch("/api/preregistro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const json = await res.json();

      if (res.status === 201) {
        showToast("Preinscripción enviada correctamente. Revise en Bandeja de Secretaría.", "success");
        preRegistrationForm.reset();
        loadAllData();
      } else {
        showToast(json.message || "Error al enviar la solicitud", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de conexión", "error");
    } finally {
      preRegisterSubmitBtn.classList.remove("btn-loading-state");
    }
  });

  // 4. Add Vehicle Form Submit
  const addVehicleForm = document.getElementById("addVehicleForm");
  
  addVehicleForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const patente = document.getElementById("vehPatente").value;
    const modelo = document.getElementById("vehModelo").value;
    const kilometrajeInicial = document.getElementById("vehKilometraje").value;

    try {
      const res = await fetch("/api/mantenimiento/nuevo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patente, modelo, kilometrajeInicial })
      });
      const json = await res.json();

      if (res.status === 201) {
        showToast("Vehículo añadido exitosamente a la flota", "success");
        closeAddVehicleModal();
        loadAllData();
      } else {
        showToast(json.message || "Error al registrar vehículo", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error al conectar", "error");
    }
  });

  // 5. Report Maintenance Form Submit
  const maintenanceForm = document.getElementById("maintenanceForm");
  
  maintenanceForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const idVehiculo = parseInt(document.getElementById("maintVehicleId").value);
    const nuevoKilometraje = parseInt(document.getElementById("maintKm").value);
    const desc = document.getElementById("maintDesc").value;
    const severity = document.getElementById("maintSeverity").value;

    const reqData = {
      idVehiculo,
      nuevoKilometraje,
      reporteFalla: severity ? { descripcion: desc, gravedad: severity } : null
    };

    try {
      const res = await fetch("/api/mantenimiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqData)
      });
      const json = await res.json();

      if (res.ok) {
        showToast(json.message || "Odómetro y mantenimiento actualizados", "success");
        closeMaintenanceModal();

        // If severe gravity high, log a fleet alarm in notifications feed
        if (severity === "Alta") {
          addNotificationToFeed(
            `El vehículo ID: ${idVehiculo} ha sido bloqueado y puesto 'En Mantenimiento' por falla grave.
            - Motivo: ${desc}
            - Kilometraje: ${nuevoKilometraje} km`,
            true
          );
        }
        
        loadAllData();
      } else {
        showToast(json.message || "Error al reportar mantenimiento", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de conexión", "error");
    }
  });


  // --- Simulation Helpers ---
  const quickDocenteBtn = document.getElementById("quickDocenteBtn");
  const quickAlumnoBtn = document.getElementById("quickAlumnoBtn");
  const quickVehiculoBtn = document.getElementById("quickVehiculoBtn");

  async function quickRegisterDemoUser(role) {
    const seed = Math.floor(Math.random() * 10000);
    const mockEmail = `${role.toLowerCase()}${seed}@escuela.cl`;
    const mockRut = `20.${seed.toString().padStart(3, "0")}.121-K`;
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: mockEmail,
          password: "password123",
          role: role,
          rut: mockRut,
          phone: "+56 9 7665 4321",
          campus: "Central"
        })
      });
      const json = await res.json();
      
      if (res.status === 201) {
        showToast(`Usuario ${role} de prueba creado: ${mockEmail}`, "success");
        loadAllData();
      } else {
        showToast(json.message || "Error al crear usuario de prueba", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error al conectar con la API de registro", "error");
    }
  }

  quickDocenteBtn.addEventListener("click", () => quickRegisterDemoUser("Docente"));
  quickAlumnoBtn.addEventListener("click", () => quickRegisterDemoUser("Alumno"));
  
  quickVehiculoBtn.addEventListener("click", async () => {
    const seed = Math.floor(Math.random() * 10000);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randPlate = `${chars.charAt(Math.floor(Math.random() * 26))}${chars.charAt(Math.floor(Math.random() * 26))}-${chars.charAt(Math.floor(Math.random() * 26))}${chars.charAt(Math.floor(Math.random() * 26))}-${seed.toString().substring(0, 2)}`;
    const models = ["Toyota Yaris", "Nissan Versa", "Suzuki Swift", "Chevrolet Sail"];
    const randModel = models[Math.floor(Math.random() * models.length)];

    try {
      const res = await fetch("/api/mantenimiento/nuevo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patente: randPlate,
          modelo: randModel,
          kilometrajeInicial: Math.floor(Math.random() * 10000)
        })
      });
      if (res.status === 201) {
        showToast(`Vehículo de prueba añadido: ${randModel} (${randPlate})`, "success");
        loadAllData();
      } else {
        const json = await res.json();
        showToast(json.message || "Error al crear vehículo de prueba", "error");
      }
    } catch (err) {
      console.error(err);
    }
  });


  // --- Initial Startup ---
  checkAuthSession();
  loadAllData();
});
