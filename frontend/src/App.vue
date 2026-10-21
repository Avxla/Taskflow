<template>
  <div id="app" class="taskflow-app">
    
    <!-- ========================================== -->
    <!-- CONTENEDOR DE ALERTAS FLOTANTES (5 SEG)    -->
    <!-- ========================================== -->
    <div class="custom-alerts-container">
      <div 
        v-for="alert in alerts" 
        :key="alert.id" 
        class="custom-alert-toast" 
        :class="alert.type"
        @click="removeAlert(alert.id)"
      >
        <div class="alert-content">
          <span class="alert-icon">{{ alert.type === 'success' ? '✨' : alert.type === 'warning' ? '⚠️' : '🚨' }}</span>
          <div class="alert-text-group">
            <span class="alert-title">{{ alert.type === 'success' ? 'Éxito' : alert.type === 'warning' ? 'Advertencia' : 'Error' }}</span>
            <span class="alert-message">{{ alert.message }}</span>
          </div>
        </div>
        <div class="alert-progress-bar" :class="alert.type"></div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL / DETALLE DE SOLICITUD ("VER MÁS")  -->
    <!-- ========================================== -->
    <div v-if="selectedRequest" class="modal-overlay" @click.self="closeDetailModal">
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="modal-badge-icon">📋</span>
            <div>
              <h2>Detalle de la Solicitud</h2>
              <p>Información completa del requerimiento seleccionado</p>
            </div>
          </div>
          <button @click="closeDetailModal" class="btn-close-modal" title="Cerrar">✕</button>
        </div>

        <div class="modal-body">
          <div class="detail-row">
            <span class="detail-label">Título del Requerimiento:</span>
            <strong class="detail-value text-highlight">{{ selectedRequest.title }}</strong>
          </div>

          <div class="detail-grid">
            <div class="detail-row">
              <span class="detail-label">Cliente / Empresa:</span>
              <span class="detail-value">{{ selectedRequest.clientName || 'No especificado' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Categoría:</span>
              <span class="category-badge">{{ selectedRequest.category || 'General' }}</span>
            </div>
          </div>

          <div class="detail-grid">
            <div class="detail-row">
              <span class="detail-label">Nivel de Prioridad:</span>
              <span class="priority-badge" :class="`priority-${selectedRequest.priority || 'Media'}`">
                {{ selectedRequest.priority || 'Media' }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Estado Actual:</span>
              <span class="status-pill" :class="getStatusClass(selectedRequest.status)">
                {{ selectedRequest.status || 'Pendiente' }}
              </span>
            </div>
          </div>

          <div class="detail-row full-width">
            <span class="detail-label">Descripción Detallada:</span>
            <div class="description-box">
              {{ selectedRequest.description }}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeDetailModal" class="btn-submit-rich">Cerrar Detalle</button>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL / PANTALLA DE INICIO DE SESIÓN      -->
    <!-- ========================================== -->
    <div v-if="!isLoggedIn" class="login-overlay">
      <div class="login-card">
        <div class="login-header-corporate">
          <div class="corporate-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <div>
            <h2>Acceso a Plataforma</h2>
            <p>TASKFLOW Enterprise Security</p>
          </div>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="input-group">
            <label for="role-select">Rol de Autenticación</label>
            <select id="role-select" v-model="selectedRole" class="rich-select">
              <option value="client">Portal de Clientes (Creación de Requerimientos)</option>
              <option value="admin">Panel Administrativo (Control Total)</option>
            </select>
          </div>

          <div class="input-group" v-if="selectedRole === 'admin'">
            <label for="admin-password">Credencial de Administrador</label>
            <input 
              type="password" 
              id="admin-password" 
              v-model="adminPassword" 
              placeholder="••••••••" 
              required 
            />
          </div>

          <button type="submit" class="btn-submit-rich" :disabled="loggingIn">
            <span v-if="!loggingIn">Iniciar Sesión</span>
            <div v-else class="btn-spinner"></div>
          </button>
        </form>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- APLICACIÓN PRINCIPAL (TRAS INICIAR SESIÓN) -->
    <!-- ========================================== -->
    <template v-else>
      <div class="hero-bg">
        <div class="hero-content">
          <div class="brand">
            <div class="logo-icon">⚡</div>
            <div>
              <h1>TASKFLOW</h1>
              <p>Plataforma Inteligente de Gestión de Solicitudes</p>
            </div>
          </div>

          <nav class="view-switcher" v-if="userRole === 'admin'">
            <button 
              :class="['switch-btn', { active: currentView === 'client' }]" 
              @click="switchView('client')"
            >
              Portal Cliente
            </button>
            <button 
              :class="['switch-btn', { active: currentView === 'admin' }]" 
              @click="switchView('admin')"
            >
              Panel Administrativo
            </button>
          </nav>

          <div class="user-session-box">
            <span class="role-badge" :class="userRole">
              {{ userRole === 'admin' ? '👑 Administrador' : '👤 Cliente' }}
            </span>
            <button @click="logout" class="btn-logout" title="Cerrar Sesión">Salir</button>
          </div>

          <div class="server-status" :class="{ online: isConnected, offline: !isConnected }">
            <span class="status-dot"></span>
            <span>{{ isConnected ? 'API Conectada' : 'Sin conexión' }}</span>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- VISTA DE CLIENTE                         -->
      <!-- ========================================== -->
      <main v-if="currentView === 'client'" class="client-view-container">
        <div class="client-card-rich">
          <div class="client-card-header">
            <span class="panel-icon">🚀</span>
            <div>
              <h2>Crear Nueva Solicitud de Servicio</h2>
              <p>Completa los detalles para ingresar tu requerimiento al sistema general.</p>
            </div>
          </div>

          <form @submit.prevent="submitClientRequest" class="rich-form">
            <div class="form-grid">
              <div class="input-group">
                <label for="client-title">Título del requerimiento</label>
                <input 
                  type="text" 
                  id="client-title" 
                  v-model="clientForm.title" 
                  placeholder="Ej. Optimización de base de datos" 
                  required 
                />
              </div>

              <div class="input-group">
                <label for="client-name">Nombre o Empresa</label>
                <input 
                  type="text" 
                  id="client-name" 
                  v-model="clientForm.clientName" 
                  placeholder="Ej. Innovación Digital S.A." 
                  required 
                />
              </div>
            </div>

            <div class="form-grid">
              <div class="input-group">
                <label for="client-category">Categoría</label>
                <select id="client-category" v-model="clientForm.category" class="rich-select">
                  <option value="Desarrollo">💻 Desarrollo Software</option>
                  <option value="Base de Datos">🗄️ Base de Datos</option>
                  <option value="Seguridad">🔒 Seguridad & DevOps</option>
                  <option value="Diseño UI/UX">🎨 Diseño UI/UX</option>
                </select>
              </div>

              <div class="input-group">
                <label for="client-priority">Nivel de Prioridad</label>
                <select id="client-priority" v-model="clientForm.priority" class="rich-select">
                  <option value="Baja">🟢 Baja</option>
                  <option value="Media">🟡 Media</option>
                  <option value="Alta">🟠 Alta</option>
                  <option value="Crítica">🔴 Crítica</option>
                </select>
              </div>
            </div>

            <div class="input-group">
              <label for="client-desc">Descripción detallada</label>
              <textarea 
                id="client-desc" 
                v-model="clientForm.description" 
                placeholder="Escribe los detalles técnicos o pasos a seguir..." 
                rows="5" 
                required
              ></textarea>
            </div>

            <button type="submit" class="btn-submit-rich" :disabled="submitting">
              <span v-if="!submitting">Enviar Solicitud al Sistema</span>
              <div v-else class="btn-spinner"></div>
            </button>
          </form>
        </div>
      </main>

      <!-- ========================================== -->
      <!-- PANEL ADMINISTRATIVO                     -->
      <!-- ========================================== -->
      <main v-else-if="currentView === 'admin' && userRole === 'admin'" class="dashboard-grid">
        <section class="panel form-panel">
          <div class="panel-header">
            <span class="panel-icon">📝</span>
            <h2>Acceso Rápido Admin</h2>
          </div>
          <form @submit.prevent="submitRequest" class="modern-form">
            <div class="input-group">
              <label for="title">Título del requerimiento</label>
              <input 
                type="text" 
                id="title" 
                v-model="form.title" 
                placeholder="Ej. Revisión rápida de logs" 
                required 
              />
            </div>
            <div class="input-group">
              <label for="description">Descripción detallada</label>
              <textarea 
                id="description" 
                v-model="form.description" 
                placeholder="Detalles..." 
                rows="4" 
                required
              ></textarea>
            </div>
            <button type="submit" class="btn-submit">
              <span>Crear Rápido</span>
            </button>
          </form>
        </section>

        <section class="panel list-panel">
          <div class="panel-header">
            <div class="header-title">
              <span class="panel-icon">📊</span>
              <h2>Solicitudes Registradas (Ordenadas)</h2>
            </div>
            <span class="counter-badge">{{ requests.length }}</span>
          </div>

          <div v-if="loading" class="state-container">
            <div class="spinner-large"></div>
            <p>Cargando información del servidor...</p>
          </div>

          <div v-else-if="requests.length === 0" class="state-container empty">
            <span class="empty-icon">📂</span>
            <p>No hay solicitudes registradas todavía.</p>
          </div>

          <div class="table-container" v-else>
            <table class="modern-table">
              <thead>
                <tr>
                  <th>Requerimiento / Cliente</th>
                  <th>Categoría / Prioridad</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th class="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="req in sortedRequests" :key="req._id" class="table-row" :class="{ 'inactive-row': req.status === 'Inactivo' }">
                  <td class="row-title">
                    <strong>{{ req.title }}</strong>
                    <span class="client-tag" v-if="req.clientName">👤 {{ req.clientName }}</span>
                  </td>
                  <td>
                    <div class="meta-badges">
                      <span class="category-badge">{{ req.category || 'General' }}</span>
                      <span class="priority-badge" :class="`priority-${req.priority || 'Media'}`">
                        {{ req.priority || 'Media' }}
                      </span>
                    </div>
                  </td>
                  <td class="row-desc">{{ req.description }}</td>
                  <td>
                    <span class="status-pill" :class="getStatusClass(req.status)">
                      {{ req.status || 'Pendiente' }}
                    </span>
                  </td>
                  <td class="text-right actions-cell">
                    <!-- BOTÓN "VER MÁS" -->
                    <button @click="openDetailModal(req)" class="btn-view-more" title="Ver toda la información">
                      🔍 Ver más
                    </button>

                    <select 
                      class="status-select" 
                      :value="req.status || 'Pendiente'" 
                      @change="updateStatus(req._id, $event.target.value)"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Activo">Activo</option>
                      <option value="Respondido">Respondido</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>

                    <button 
                      @click="toggleActiveState(req)" 
                      class="btn-toggle" 
                      :class="req.status === 'Inactivo' ? 'activate' : 'deactivate'"
                    >
                      {{ req.status === 'Inactivo' ? 'Activar' : 'Desactivar' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <section class="metrics-section" v-if="userRole === 'admin'">
        <div class="metrics-container">
          <div class="metric-card">
            <div class="metric-icon total">📦</div>
            <div class="metric-info">
              <span class="metric-value">{{ requests.length }}</span>
              <span class="metric-label">Peticiones Totales</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon active">⚡</div>
            <div class="metric-info">
              <span class="metric-value">{{ activeCount }}</span>
              <span class="metric-label">Activas</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon answered">✅</div>
            <div class="metric-info">
              <span class="metric-value">{{ answeredCount }}</span>
              <span class="metric-label">Respondidas</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon queue">⏳</div>
            <div class="metric-info">
              <span class="metric-value">{{ queueCount }}</span>
              <span class="metric-label">Pendientes / Cola</span>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'App',
  data() {
    return {
      alerts: [],
      selectedRequest: null,
      isLoggedIn: false,
      userRole: 'client',
      selectedRole: 'client',
      adminPassword: '',
      currentView: 'client',
      requests: [],
      form: {
        title: '',
        description: ''
      },
      clientForm: {
        title: '',
        clientName: '',
        category: 'Desarrollo',
        priority: 'Media',
        description: ''
      },
      loading: false,
      loggingIn: false,
      submitting: false,
      isConnected: false
    }
  },
  computed: {
    sortedRequests() {
      return [...this.requests].sort((a, b) => {
        const statusA = (a.status || 'Pendiente').toLowerCase();
        const statusB = (b.status || 'Pendiente').toLowerCase();

        const getPriorityScore = (status) => {
          if (status === 'activo') return 1;
          if (status === 'respondido' || status === 'completado') return 2;
          if (status === 'pendiente') return 3;
          if (status === 'inactivo') return 4;
          return 5;
        };

        return getPriorityScore(statusA) - getPriorityScore(statusB);
      });
    },
    activeCount() {
      return this.requests.filter(r => r.status && r.status.toLowerCase() === 'activo').length
    },
    answeredCount() {
      return this.requests.filter(r => r.status && (r.status.toLowerCase() === 'respondido' || r.status.toLowerCase() === 'completado')).length
    },
    queueCount() {
      return this.requests.filter(r => !r.status || r.status.toLowerCase() === 'pendiente').length
    }
  },
  mounted() {
    this.fetchRequests()
  },
  methods: {
    showAlert(message, type = 'success') {
      const id = Date.now();
      this.alerts.push({ id, message, type });
      
      setTimeout(() => {
        this.removeAlert(id);
      }, 5000);
    },
    removeAlert(id) {
      this.alerts = this.alerts.filter(alert => alert.id !== id);
    },
    openDetailModal(req) {
      this.selectedRequest = req;
      this.showAlert(`Visualizando detalles de: "${req.title}"`, 'success');
    },
    closeDetailModal() {
      this.selectedRequest = null;
    },
    switchView(view) {
      this.currentView = view;
      if (view === 'admin') {
        this.showAlert('Cambiado al Panel de Control Administrativo.', 'success');
      } else {
        this.showAlert('Cambiado al Portal de Clientes.', 'success');
      }
    },
    handleLogin() {
      this.loggingIn = true;

      setTimeout(() => {
        if (this.selectedRole === 'admin') {
          if (this.adminPassword !== '123456') {
            this.showAlert('Credencial incorrecta. Acceso administrativo denegado.', 'error');
            this.adminPassword = '';
            this.loggingIn = false;
            return;
          }
        }

        this.userRole = this.selectedRole;
        this.isLoggedIn = true;
        this.adminPassword = '';
        this.loggingIn = false;

        this.showAlert(`Bienvenido al sistema. Rol activo: ${this.userRole.toUpperCase()}`, 'success');

        if (this.userRole === 'client') {
          this.currentView = 'client';
        } else {
          this.currentView = 'admin';
        }
      }, 600);
    },
    logout() {
      this.isLoggedIn = false;
      this.userRole = 'client';
      this.selectedRole = 'client';
      this.adminPassword = '';
      this.showAlert('Sesión finalizada de forma segura.', 'warning');
    },
    async fetchRequests() {
      this.loading = true
      try {
        const response = await axios.get('http://localhost:5000/api/requests')
        this.requests = response.data
        this.isConnected = true
      } catch (error) {
        console.error('Error al obtener solicitudes:', error)
        this.isConnected = false
        this.showAlert('Error crítico: No se pudo conectar con el servidor backend.', 'error');
      } finally {
        this.loading = false
      }
    },
    async submitRequest() {
      try {
        await axios.post('http://localhost:5000/api/requests', {
          ...this.form,
          status: 'Activo',
          category: 'General',
          priority: 'Media',
          clientName: 'Admin Interno'
        })
        this.form.title = ''
        this.form.description = ''
        this.showAlert('Requerimiento interno registrado con éxito.', 'success');
        this.fetchRequests()
      } catch (error) {
        this.showAlert('Error al procesar el registro rápido.', 'error');
      }
    },
    async submitClientRequest() {
      this.submitting = true;
      try {
        await axios.post('http://localhost:5000/api/requests', {
          ...this.clientForm,
          status: 'Activo'
        })
        this.showAlert('¡Su requerimiento ha sido enviado y registrado correctamente!', 'success');
        this.clientForm = {
          title: '',
          clientName: '',
          category: 'Desarrollo',
          priority: 'Media',
          description: ''
        }
        this.fetchRequests()
        
        if (this.userRole === 'admin') {
          this.currentView = 'admin';
        }
      } catch (error) {
        this.showAlert('No se pudo enviar la solicitud. Verifique los campos.', 'error');
      } finally {
        this.submitting = false;
      }
    },
async updateStatus(id, newStatus) {
      try {
        // Forzamos la petición usando PUT con la URL limpia y completa
        await axios.put(`http://localhost:5000/api/requests/${id}`, { status: newStatus });
        this.showAlert(`Estado actualizado correctamente a: [${newStatus}]`, 'success');
        this.fetchRequests();
      } catch (error) {
        console.error("Error al actualizar:", error);
        this.showAlert('El servidor rechazó la actualización del estado.', 'error');
      }
    },
    async toggleActiveState(req) {
      const newStatus = req.status === 'Inactivo' ? 'Activo' : 'Inactivo';
      this.showAlert(`Cambiando estado de la solicitud...`, 'warning');
      await this.updateStatus(req._id, newStatus);
    },
    getStatusClass(status) {
      if (!status) return 'pendiente';
      const s = status.toLowerCase();
      if (s === 'activo') return 'activo';
      if (s === 'respondido' || s === 'completado') return 'respondido';
      if (s === 'inactivo') return 'inactivo';
      return 'pendiente';
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background-color: #f8fafc;
  color: #1e293b;
  min-height: 100vh;
}

.taskflow-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ========================================== */
/* ESTILOS DEL MODAL "VER MÁS"                */
/* ========================================== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(11, 17, 32, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  animation: fadeIn 0.2s ease forwards;
}

.modal-card {
  background: #ffffff;
  width: 100%;
  max-width: 600px;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-badge-icon {
  font-size: 1.5rem;
  background: #eff6ff;
  padding: 8px;
  border-radius: 10px;
}

.modal-header h2 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
}

.modal-header p {
  font-size: 0.8rem;
  color: #64748b;
}

.btn-close-modal {
  background: transparent;
  border: none;
  font-size: 1.1rem;
  color: #64748b;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-close-modal:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 70vh;
  overflow-y: auto;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-row.full-width {
  grid-column: span 2;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.detail-value {
  font-size: 0.95rem;
  color: #1e293b;
}

.text-highlight {
  font-size: 1.1rem;
  color: #2563eb;
}

.description-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 14px;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #334155;
  line-height: 1.5;
  white-space: pre-wrap;
}

.modal-footer {
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* ========================================== */
/* BOTÓN "VER MÁS" EN TABLA                   */
/* ========================================== */
.btn-view-more {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view-more:hover {
  background: #dbeafe;
  border-color: #93c5fd;
}

/* ========================================== */
/* ALERTAS PROFESIONALES                    */
/* ========================================== */
.custom-alerts-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 999999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.custom-alert-toast {
  pointer-events: auto;
  position: relative;
  background: #0f172a;
  color: #f8fafc;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 340px;
  cursor: pointer;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transition: transform 0.2s ease;
}

.custom-alert-toast:hover {
  transform: translateY(-2px);
}

.alert-content {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.alert-icon {
  font-size: 1.25rem;
  margin-top: 1px;
}

.alert-text-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.alert-title {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: #94a3b8;
}

.alert-message {
  font-size: 0.9rem;
  font-weight: 500;
  color: #f1f5f9;
  line-height: 1.4;
}

.alert-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  animation: shrinkProgress 5s linear forwards;
}

.custom-alert-toast.success .alert-progress-bar { background: #10b981; }
.custom-alert-toast.warning .alert-progress-bar { background: #f59e0b; }
.custom-alert-toast.error .alert-progress-bar { background: #ef4444; }

@keyframes shrinkProgress {
  from { width: 100%; }
  to { width: 0%; }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(60px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* ========================================== */
/* LOGIN CORPORATIVO Y ELEGANTE               */
/* ========================================== */
.login-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #0b1120;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.login-card {
  background: #ffffff;
  padding: 40px;
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.login-header-corporate {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.corporate-icon {
  width: 44px;
  height: 44px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
}

.login-header-corporate h2 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.3px;
}

.login-header-corporate p {
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 2px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  text-align: left;
}

.login-form .input-group label {
  font-weight: 600;
  color: #475569;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.login-form .rich-select,
.login-form input[type="password"] {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #1e293b;
  transition: all 0.2s ease;
  width: 100%;
}

.login-form .rich-select:focus,
.login-form input[type="password"]:focus {
  border-color: #2563eb;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  outline: none;
}

/* ========================================== */
/* SPINNERS Y BOTONES                         */
/* ========================================== */
.btn-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

.spinner-large {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-submit-rich {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #0f172a;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
  width: 100%;
  margin-top: 6px;
}

.btn-submit-rich:hover:not(:disabled) {
  background: #1e293b;
}

.btn-submit-rich:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.user-session-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-badge {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.role-badge.admin { background: #3b82f6; }
.role-badge.client { background: #10b981; }

.btn-logout {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-logout:hover {
  background: rgba(239, 68, 68, 0.3);
}

.hero-bg {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: white;
  padding: 30px 20px 50px;
  box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.1);
}

.hero-content {
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: space-between;
  align-items: center;
}

@media (min-width: 768px) {
  .hero-content {
    flex-direction: row;
    padding: 0 20px;
  }
}

.brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4);
}

.brand h1 {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.brand p {
  color: #94a3b8;
  font-size: 0.875rem;
}

.view-switcher {
  display: flex;
  background: rgba(255, 255, 255, 0.08);
  padding: 5px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  gap: 6px;
}

.switch-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.switch-btn:hover {
  color: #fff;
}

.switch-btn.active {
  background: #3b82f6;
  color: #fff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.server-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.server-status.online {
  background: rgba(16, 185, 129, 0.1);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.2);
}

.server-status.offline {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.2);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
  box-shadow: 0 0 8px currentColor;
}

.client-view-container {
  max-width: 850px;
  width: 100%;
  margin: -30px auto 30px;
  padding: 0 20px;
}

.client-card-rich {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  padding: 35px;
}

.client-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f1f5f9;
}

.client-card-header h2 {
  font-size: 1.35rem;
  color: #0f172a;
  font-weight: 700;
}

.client-card-header p {
  color: #64748b;
  font-size: 0.9rem;
}

.rich-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 640px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.rich-select {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.95rem;
  font-family: inherit;
  color: #1e293b;
  background-color: #f8fafc;
  cursor: pointer;
}

.rich-select:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: #fff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.dashboard-grid {
  max-width: 1300px;
  width: 100%;
  margin: -30px auto 30px;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 380px 1fr;
  }
}

.panel {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f1f5f9;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-icon {
  font-size: 1.25rem;
}

.panel-header h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
}

.counter-badge {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 600;
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 99px;
}

.modern-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.input-group input,
.input-group textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.95rem;
  font-family: inherit;
  color: #1e293b;
  background-color: #f8fafc;
  transition: all 0.2s ease;
}

.input-group input:focus,
.input-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: #fff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 13px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transition: all 0.2s ease;
}

.btn-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
}

.client-tag {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 3px;
}

.meta-badges {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}

.category-badge {
  font-size: 0.75rem;
  font-weight: 600;
  background: #f1f5f9;
  color: #334155;
  padding: 2px 8px;
  border-radius: 6px;
}

.priority-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.priority-Crítica { background: #fee2e2; color: #991b1b; }
.priority-Alta { background: #ffedd5; color: #9a3412; }
.priority-Media { background: #fef9c3; color: #854d0e; }
.priority-Baja { background: #dcfce7; color: #166534; }

.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  text-align: center;
  color: #64748b;
  gap: 12px;
}

.empty-icon {
  font-size: 2.5rem;
}

.table-container {
  width: 100%;
  overflow-x: auto;
  max-height: 480px;
  overflow-y: auto;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  min-width: 750px;
}

.modern-table th {
  padding: 12px 14px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.modern-table td {
  padding: 14px;
  font-size: 0.9rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  vertical-align: middle;
}

.table-row:hover {
  background-color: #f8fafc;
}

.inactive-row {
  opacity: 0.6;
  background-color: #f1f5f9;
}

.row-title {
  color: #0f172a;
}

.row-desc {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #64748b;
}

.status-pill {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background: #f1f5f9;
  color: #475569;
}

.status-pill.pendiente { background: #fef3c7; color: #b45309; }
.status-pill.respondido { background: #d1fae5; color: #065f46; }
.status-pill.activo { background: #e0f2fe; color: #0369a1; }
.status-pill.inactivo { background: #f1f5f9; color: #64748b; }

.actions-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.status-select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background-color: #fff;
  font-size: 0.85rem;
  cursor: pointer;
  color: #1e293b;
}

.btn-toggle {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-toggle.deactivate {
  background-color: #ffeeee;
  color: #dc2626;
}
.btn-toggle.deactivate:hover {
  background-color: #fecaca;
}

.btn-toggle.activate {
  background-color: #ecfdf5;
  color: #059669;
}
.btn-toggle.activate:hover {
  background-color: #d1fae5;
}

.text-right {
  text-align: right;
}

.metrics-section {
  max-width: 1300px;
  width: 100%;
  margin: 0 auto 50px;
  padding: 0 20px;
}

.metrics-container {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
}

@media (min-width: 640px) {
  .metrics-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .metrics-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

.metric-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.metric-icon.total { background: #eff6ff; color: #2563eb; }
.metric-icon.active { background: #e0f2fe; color: #0284c7; }
.metric-icon.answered { background: #f0fdf4; color: #16a34a; }
.metric-icon.queue { background: #fefce8; color: #ca8a04; }

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.metric-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #64748b;
}
</style>