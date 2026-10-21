<template>
  <div class="client-portal">
    <header class="client-header">
      <h1>Portal de Clientes - TASKFLOW</h1>
      <p>Envía tus requerimientos y hazles seguimiento en tiempo real.</p>
    </header>

    <div class="client-container">
      <!-- Formulario enriquecido -->
      <form @submit.prevent="submitRequest" class="rich-form">
        <h2>Nueva Solicitud de Servicio</h2>
        
        <div class="form-group">
          <label>Título del requerimiento</label>
          <input v-model="form.title" type="text" placeholder="Ej. Integración pasarela de pagos" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Categoría</label>
            <select v-model="form.category">
              <option value="Desarrollo">Desarrollo Backend / Frontend</option>
              <option value="Base de Datos">Base de Datos</option>
              <option value="Seguridad">Seguridad & DevOps</option>
              <option value="Diseño UI/UX">Diseño UI/UX</option>
            </select>
          </div>

          <div class="form-group">
            <label>Prioridad</label>
            <select v-model="form.priority">
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Nombre del Cliente / Empresa</label>
          <input v-model="form.clientName" type="text" placeholder="Tu nombre o empresa" required />
        </div>

        <div class="form-group">
          <label>Descripción detallada</label>
          <textarea v-model="form.description" rows="4" placeholder="Explica detalladamente los objetivos..." required></textarea>
        </div>

        <button type="submit" class="btn-submit">Enviar Solicitud con Prioridad</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      form: {
        title: '',
        category: 'Desarrollo',
        priority: 'Media',
        clientName: '',
        description: ''
      }
    };
  },
  methods: {
    async submitRequest() {
      try {
        await axios.post('http://localhost:5000/api/requests', this.form);
        alert('¡Solicitud enviada con éxito!');
        this.form = { title: '', category: 'Desarrollo', priority: 'Media', clientName: '', description: '' };
      } catch (error) {
        alert('Error al enviar la solicitud');
      }
    }
  }
};
</script>

<style scoped>
.client-portal {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #fff;
  background: #0f172a;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}
.client-header {
  text-align: center;
  margin-bottom: 30px;
}
.rich-form {
  background: #1e293b;
  padding: 30px;
  border-radius: 8px;
  border: 1px solid #334155;
}
.form-group {
  margin-bottom: 20px;
}
.form-row {
  display: flex;
  gap: 15px;
}
.form-row .form-group {
  flex: 1;
}
label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #94a3b8;
}
input, select, textarea {
  width: 100%;
  padding: 12px;
  background: #0f172a;
  border: 1px solid #475569;
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
}
input:focus, select:focus, textarea:focus {
  border-color: #3b82f6;
  outline: none;
}
.btn-submit {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-submit:hover {
  opacity: 0.9;
}
</style>