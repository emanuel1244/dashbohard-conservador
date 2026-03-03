import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { timeout, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ExportService } from '../../services/export.service';

interface Persona {
  id: string;
  nombre: string;
  cedula: string;
  lugarVotacion: string;
  direccionVotacion: string;
  mesa: string;
  direccion: string;
  correo: string;
  celular: string;
  zona?: string;
  liderId?: string;
  liderNombre?: string;
  estado?: 'Activo' | 'Inactivo' | 'Potencial';
  nivelCompromiso?: 'Alto' | 'Medio' | 'Bajo';
  notas?: string;
  fechaAsignacion?: string;
  fechaActualizacion?: string;
}

interface Lider {
  id: string;
  nombre: string;
  cedula: string;
  celular: string;
  correo: string;
  zona: string;
  personasAsignadas: number;
}

interface Estadisticas {
  totalPersonas: number;
  totalLideres: number;
  porMesa: { [key: string]: number };
  porLugarVotacion: { [key: string]: number };
}

interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface SuccessModal {
  show: boolean;
  message: string;
  icon: string;
}

interface ConfirmationModal {
  show: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  confirmAction: () => void;
  type: 'danger' | 'warning' | 'info';
}

interface ErrorResponse {
  status: number;
  message?: string;
  error?: string;
  details?: { [key: string]: string };
}

// Constantes de mensajes
const TOAST_MESSAGES = {
  PERSONA: {
    CREATE_SUCCESS: 'Usuario creado correctamente',
    UPDATE_SUCCESS: 'Usuario actualizado correctamente',
    DELETE_SUCCESS: 'Usuario eliminado correctamente'
  },
  LIDER: {
    CREATE_SUCCESS: 'Líder creado correctamente',
    UPDATE_SUCCESS: 'Líder actualizado correctamente',
    DELETE_SUCCESS: 'Líder eliminado correctamente'
  },
  ERROR: {
    GENERIC: 'Ocurrió un error al procesar la solicitud. Intenta nuevamente.',
    NETWORK: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
    UNAUTHORIZED: 'No tienes autorización para realizar esta acción',
    FORBIDDEN: 'Acceso denegado a este recurso',
    NOT_FOUND: 'El recurso solicitado no fue encontrado',
    SERVER_ERROR: 'Error interno del servidor. Por favor contacta al administrador'
  }
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private apiUrl = 'https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api';
  
  // Exponer Object.keys para usar en el template
  Object = Object;
  
  // Sistema de Notificaciones Toast
  toasts: Toast[] = [];
  private toastIdCounter = 0;
  
  // Modal de Éxito
  successModal: SuccessModal = {
    show: false,
    message: '',
    icon: '✓'
  };
  
  // Modal de Confirmación
  confirmationModal: ConfirmationModal = {
    show: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    confirmAction: () => {},
    type: 'danger'
  };
  
  // Estados de carga
  isDeletingPersona = false;
  isDeletingLider = false;
  isExporting = false;
  
  personas: Persona[] = [];
  lideres: Lider[] = [];
  estadisticas: Estadisticas = {
    totalPersonas: 0,
    totalLideres: 0,
    porMesa: {},
    porLugarVotacion: {}
  };
  
  vistaActual: 'dashboard' | 'personas' | 'lideres' | 'mesas' = 'dashboard';
  busqueda: string = '';
  personasFiltradas: Persona[] = [];
  
  // Filtros avanzados
  filtroLider: string = '';
  filtroEstado: string = '';
  filtroCompromiso: string = '';
  filtroZona: string = '';
  
  // Vista Mesas
  mesaActiva: string = '';
  
  // Modal Líder
  mostrarModalLider = false;
  liderEditando: Lider | null = null;
  nuevoLider: Partial<Lider> = {};
  
  // Modal Persona
  mostrarModalPersona = false;
  personaEditando: Persona | null = null;
  personaForm: Partial<Persona> = {};
  validationErrors: { [key: string]: string } = {};
  isSubmitting = false;
  
  // Upload
  archivoSeleccionado: File | null = null;
  cargando = false;
  mensajeUpload = '';
  duplicadosEncontrados: any[] = [];
  isExportingDuplicates = false;
  mostrandoDuplicados = false;
  duplicadosVisibles = 5;
  estadisticasUpload: {
    agregadas: number;
    duplicados: number;
    errores: number;
  } | null = null;
  
  // Modal Personas por Mesa
  modalPersonasMesa = false;
  personasMesaActual: Persona[] = [];
  mesaSeleccionada = '';
  institucionSeleccionada = '';
  cargandoPersonasMesa = false;
  errorPersonasMesa: string | null = null;
  searchTermMesa = '';

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private exportService: ExportService
  ) {}
  
  @HostListener('document:keydown.escape')
  handleEscapeKey() {
    if (this.confirmationModal.show) {
      this.cerrarModalConfirmacion();
    }
  }

  ngOnInit() {
    // Usar setTimeout para evitar problemas de detección de cambios
    setTimeout(() => {
      this.cargarDatos();
    }, 0);
  }

  cargarDatos() {
    this.http.get<Persona[]>(`${this.apiUrl}/personas`).subscribe(data => {
      this.personas = data;
      this.filtrarPersonas(); // Aplicar filtros después de cargar
      this.cdr.detectChanges(); // Forzar detección de cambios
    });
    
    this.http.get<Lider[]>(`${this.apiUrl}/lideres`).subscribe(data => {
      this.lideres = data;
      this.cdr.detectChanges(); // Forzar detección de cambios
    });
    
    this.http.get<Estadisticas>(`${this.apiUrl}/estadisticas`).subscribe(data => {
      this.estadisticas = data;
      this.cdr.detectChanges(); // Forzar detección de cambios
    });
  }

  cambiarVista(vista: 'dashboard' | 'personas' | 'lideres' | 'mesas') {
    this.vistaActual = vista;
  }

  onFileSelected(event: any) {
    this.archivoSeleccionado = event.target.files[0];
  }

  subirArchivo() {
    if (!this.archivoSeleccionado) {
      this.mostrarMensajeAdvertencia('Por favor selecciona un archivo Excel');
      return;
    }

    this.cargando = true;
    this.mensajeUpload = '';
    this.duplicadosEncontrados = [];
    this.estadisticasUpload = null;

    const formData = new FormData();
    formData.append('file', this.archivoSeleccionado);

    this.http.post<any>(`${this.apiUrl}/upload-excel`, formData).subscribe({
      next: (response) => {
        this.cargando = false;
        
        // Guardar estadísticas
        this.estadisticasUpload = response.estadisticas;
        
        // Mostrar toast de éxito
        this.mostrarMensajeExito('✓ Archivo cargado con éxito');
        
        let mensaje = `✓ ${response.estadisticas.agregadas} personas agregadas.`;
        
        if (response.lider) {
          mensaje += `\n✓ Asignadas al líder: ${response.lider.nombre}`;
          mensaje += `\n✓ Total de personas del líder: ${response.lider.personasAsignadas}`;
        }
        
        if (response.estadisticas.duplicados > 0) {
          mensaje += `\n⚠ ${response.estadisticas.duplicados} duplicados encontrados.`;
        }
        
        if (response.estadisticas.errores > 0) {
          mensaje += `\n✗ ${response.estadisticas.errores} errores.`;
        }
        
        this.mensajeUpload = mensaje;
        this.duplicadosEncontrados = response.duplicados;
        console.log('=== DUPLICADOS RECIBIDOS DEL BACKEND ===');
        console.log('Total duplicados:', response.duplicados ? response.duplicados.length : 0);
        console.log('Duplicados completos:', response.duplicados);
        this.cargarDatos();
        
        // Limpiar el archivo seleccionado después del ciclo de detección de cambios
        setTimeout(() => {
          this.archivoSeleccionado = null;
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
        }, 0);
      },
      error: (error) => {
        this.cargando = false;
        this.mensajeUpload = '✗ Error al procesar el archivo';
        this.estadisticasUpload = null;
        this.mostrarMensajeError('Error al procesar el archivo Excel');
        console.error(error);
      }
    });
  }

  buscarPersonas() {
    this.filtrarPersonas();
  }

  filtrarPersonas() {
    let resultado = [...this.personas];
    
    // Filtro por búsqueda de texto
    if (this.busqueda) {
      const termino = this.busqueda.toLowerCase();
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(termino) ||
        p.cedula.includes(termino) ||
        p.celular?.includes(termino)
      );
    }
    
    // Filtro por líder
    if (this.filtroLider) {
      resultado = resultado.filter(p => p.liderId === this.filtroLider);
    }
    
    // Filtro por estado
    if (this.filtroEstado) {
      resultado = resultado.filter(p => (p.estado || 'Activo') === this.filtroEstado);
    }
    
    // Filtro por nivel de compromiso
    if (this.filtroCompromiso) {
      resultado = resultado.filter(p => (p.nivelCompromiso || 'Medio') === this.filtroCompromiso);
    }
    
    // Filtro por zona
    if (this.filtroZona) {
      resultado = resultado.filter(p => p.zona === this.filtroZona);
    }
    
    this.personasFiltradas = resultado;
  }

  limpiarFiltros() {
    this.busqueda = '';
    this.filtroLider = '';
    this.filtroEstado = '';
    this.filtroCompromiso = '';
    this.filtroZona = '';
    this.filtrarPersonas();
  }

  abrirModalLider(lider?: Lider) {
    console.log('Abriendo modal líder con:', lider);
    this.mostrarModalLider = true;
    if (lider) {
      this.liderEditando = lider;
      this.nuevoLider = { ...lider };
      console.log('Datos cargados en nuevoLider:', this.nuevoLider);
    } else {
      this.liderEditando = null;
      this.nuevoLider = {};
    }
  }

  cerrarModalLider() {
    this.mostrarModalLider = false;
    this.liderEditando = null;
    this.nuevoLider = {};
  }

  guardarLider() {
    console.log('=== INICIO GUARDAR LÍDER ===');
    console.log('Datos del formulario:', JSON.stringify(this.nuevoLider, null, 2));
    console.log('Es edición:', !!this.liderEditando);
    
    if (this.liderEditando) {
      const url = `${this.apiUrl}/lideres/${this.liderEditando.id}`;
      console.log('PUT Request a:', url);
      this.http.put(url, this.nuevoLider)
        .pipe(
          timeout(30000),
          catchError(error => {
            if (error.name === 'TimeoutError') {
              console.error('=== TIMEOUT: La solicitud tardó más de 30 segundos ===');
              return throwError(() => ({
                status: 0,
                message: 'La solicitud tardó demasiado tiempo. Verifica tu conexión o intenta nuevamente.'
              }));
            }
            return throwError(() => error);
          })
        )
        .subscribe({
          next: () => {
            console.log('=== ÉXITO: Líder actualizado ===');
            this.cerrarModalLider();
            this.mostrarMensajeExito(TOAST_MESSAGES.LIDER.UPDATE_SUCCESS);
            this.cargarDatos(); // Recarga instantánea
          },
          error: (error) => {
            console.error('=== ERROR AL ACTUALIZAR LÍDER ===', error);
            this.handleError(error, 'actualizar líder');
          }
        });
    } else {
      const url = `${this.apiUrl}/lideres`;
      console.log('POST Request a:', url);
      this.http.post(url, this.nuevoLider)
        .pipe(
          timeout(30000),
          catchError(error => {
            if (error.name === 'TimeoutError') {
              console.error('=== TIMEOUT: La solicitud tardó más de 30 segundos ===');
              return throwError(() => ({
                status: 0,
                message: 'La solicitud tardó demasiado tiempo. Verifica tu conexión o intenta nuevamente.'
              }));
            }
            return throwError(() => error);
          })
        )
        .subscribe({
          next: () => {
            console.log('=== ÉXITO: Líder creado ===');
            this.cerrarModalLider();
            this.mostrarMensajeExito(TOAST_MESSAGES.LIDER.CREATE_SUCCESS);
            this.cargarDatos(); // Recarga instantánea
          },
          error: (error) => {
            console.error('=== ERROR AL CREAR LÍDER ===', error);
            this.handleError(error, 'crear líder');
          }
        });
    }
  }

  eliminarLider(id: string) {
    this.abrirModalConfirmacion(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este líder? Esta acción no se puede deshacer.',
      () => {
        console.log('=== INICIO ELIMINAR LÍDER ===', id);
        this.cerrarModalConfirmacion();
        this.isDeletingLider = true;
        
        setTimeout(() => {
          const url = `${this.apiUrl}/lideres/${id}`;
          console.log('DELETE Request a:', url);
          this.http.delete(url)
            .pipe(
              timeout(30000),
              catchError(error => {
                if (error.name === 'TimeoutError') {
                  console.error('=== TIMEOUT: La solicitud tardó más de 30 segundos ===');
                  return throwError(() => ({
                    status: 0,
                    message: 'La solicitud tardó demasiado tiempo. Verifica tu conexión o intenta nuevamente.'
                  }));
                }
                return throwError(() => error);
              })
            )
            .subscribe({
              next: () => {
                console.log('=== ÉXITO: Líder eliminado ===');
                this.isDeletingLider = false;
                this.mostrarMensajeExito(TOAST_MESSAGES.LIDER.DELETE_SUCCESS);
                this.cargarDatos(); // Recarga instantánea
              },
              error: (error) => {
                console.error('=== ERROR AL ELIMINAR LÍDER ===', error);
                this.isDeletingLider = false;
                this.handleError(error, 'eliminar líder');
              }
            });
        }, 100);
      },
      'danger',
      'Confirmar eliminación',
      'Cancelar'
    );
  }

  // ========== GESTIÓN DE PERSONAS ==========
  
  abrirModalPersona(persona?: Persona) {
    this.mostrarModalPersona = true;
    this.validationErrors = {};
    this.isSubmitting = false;
    
    if (persona) {
      this.personaEditando = persona;
      this.personaForm = { ...persona };
    } else {
      this.personaEditando = null;
      this.personaForm = {
        nombre: '',
        cedula: '',
        celular: '',
        correo: '',
        direccion: '',
        mesa: '',
        lugarVotacion: '',
        direccionVotacion: '',
        zona: '',
        liderId: '',
        estado: 'Activo',
        nivelCompromiso: 'Medio',
        notas: ''
      };
    }
  }

  cerrarModalPersona() {
    console.log('=== CERRANDO MODAL PERSONA ===');
    this.mostrarModalPersona = false;
    this.personaEditando = null;
    this.personaForm = {};
    this.validationErrors = {};
    this.isSubmitting = false;
    this.cdr.detectChanges(); // Forzar detección de cambios
    console.log('Modal cerrado, isSubmitting:', this.isSubmitting);
  }

  validateForm(): boolean {
    this.validationErrors = {};
    let isValid = true;

    // Validar campos requeridos
    if (!this.personaForm.nombre || this.personaForm.nombre.trim() === '') {
      this.validationErrors['nombre'] = 'El nombre es requerido';
      isValid = false;
    }

    if (!this.personaForm.cedula || this.personaForm.cedula.trim() === '') {
      this.validationErrors['cedula'] = 'La cédula es requerida';
      isValid = false;
    }

    // Validar formato de email
    if (this.personaForm.correo && this.personaForm.correo.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.personaForm.correo)) {
        this.validationErrors['correo'] = 'El correo electrónico no tiene un formato válido';
        isValid = false;
      }
    }

    // Validar formato de teléfono
    if (this.personaForm.celular && this.personaForm.celular.trim() !== '') {
      const phoneRegex = /^[0-9]+$/;
      if (!phoneRegex.test(this.personaForm.celular)) {
        this.validationErrors['celular'] = 'El celular debe contener solo números';
        isValid = false;
      }
    }

    // Validar límite de caracteres en notas
    if (this.personaForm.notas && this.personaForm.notas.length > 1000) {
      this.validationErrors['notas'] = 'Las notas no pueden exceder 1000 caracteres';
      isValid = false;
    }

    return isValid;
  }

  guardarPersona() {
    // Validar formulario
    if (!this.validateForm()) {
      console.log('Validación falló:', this.validationErrors);
      return;
    }

    this.isSubmitting = true;
    console.log('=== INICIO GUARDAR PERSONA ===');
    console.log('Datos del formulario:', JSON.stringify(this.personaForm, null, 2));
    console.log('Es edición:', !!this.personaEditando);

    // Si hay un líder seleccionado, agregar el nombre del líder
    if (this.personaForm.liderId) {
      const lider = this.lideres.find(l => l.id === this.personaForm.liderId);
      if (lider) {
        this.personaForm.liderNombre = lider.nombre;
        console.log('Líder asignado:', lider.nombre);
      }
    }

    const handleSuccess = (response: any) => {
      console.log('=== ÉXITO EN GUARDAR ===');
      console.log('Respuesta del servidor:', response);
      
      // Guardar si era edición ANTES de cerrar el modal
      const esEdicion = !!this.personaEditando;
      console.log('Era edición:', esEdicion);
      
      this.isSubmitting = false;
      this.cerrarModalPersona();
      
      const mensaje = esEdicion ? 
        TOAST_MESSAGES.PERSONA.UPDATE_SUCCESS : 
        TOAST_MESSAGES.PERSONA.CREATE_SUCCESS;
      console.log('Mostrando toast:', mensaje);
      this.mostrarMensajeExito(mensaje);
      console.log('Recargando datos...');
      this.cargarDatos(); // Recarga instantánea
      this.cdr.detectChanges(); // Forzar detección de cambios
    };

    const handleError = (error: any) => {
      console.error('=== ERROR EN GUARDAR ===');
      console.error('Error completo:', error);
      console.error('Status:', error.status);
      console.error('Message:', error.message);
      console.error('Error body:', error.error);
      this.isSubmitting = false;
      this.handleError(error, this.personaEditando ? 'actualizar persona' : 'crear persona');
    };

    if (this.personaEditando) {
      // Actualizar persona existente
      const url = `${this.apiUrl}/personas/${this.personaEditando.id}`;
      console.log('PUT Request a:', url);
      this.http.put<any>(url, this.personaForm)
        .pipe(
          timeout(30000), // 30 segundos de timeout
          catchError(error => {
            if (error.name === 'TimeoutError') {
              console.error('=== TIMEOUT: La solicitud tardó más de 30 segundos ===');
              return throwError(() => ({
                status: 0,
                message: 'La solicitud tardó demasiado tiempo. Verifica tu conexión o intenta nuevamente.'
              }));
            }
            return throwError(() => error);
          })
        )
        .subscribe({
          next: handleSuccess,
          error: handleError,
          complete: () => console.log('=== REQUEST COMPLETADO ===')
        });
    } else {
      // Crear nueva persona
      const url = `${this.apiUrl}/personas`;
      console.log('POST Request a:', url);
      this.http.post<any>(url, this.personaForm)
        .pipe(
          timeout(30000), // 30 segundos de timeout
          catchError(error => {
            if (error.name === 'TimeoutError') {
              console.error('=== TIMEOUT: La solicitud tardó más de 30 segundos ===');
              return throwError(() => ({
                status: 0,
                message: 'La solicitud tardó demasiado tiempo. Verifica tu conexión o intenta nuevamente.'
              }));
            }
            return throwError(() => error);
          })
        )
        .subscribe({
          next: handleSuccess,
          error: handleError,
          complete: () => console.log('=== REQUEST COMPLETADO ===')
        });
    }
  }

  manejarErrorAPI(error: any) {
    console.error('Error:', error);
    
    if (error.error && error.error.details) {
      // Errores de validación del servidor
      this.validationErrors = error.error.details;
    } else if (error.error && error.error.error) {
      // Error general
      this.mostrarMensajeError(`Error: ${error.error.error}`);
    } else {
      this.mostrarMensajeError('Error al guardar la persona. Por favor intente nuevamente.');
    }
  }
  
  // ========== MANEJO CENTRALIZADO DE ERRORES ==========
  
  handleError(error: any, operation: string) {
    console.error(`Error en ${operation}:`, error);
    let message: string;
    
    // Errores de red (sin conexión, timeout, etc.)
    if (error.status === 0 || error.name === 'HttpErrorResponse' && !error.status) {
      message = TOAST_MESSAGES.ERROR.NETWORK;
    }
    // Errores HTTP con código de estado
    else if (error.status) {
      switch (error.status) {
        case 400:
          // Bad Request - mostrar mensaje del backend o genérico
          message = error.error?.message || error.error?.error || TOAST_MESSAGES.ERROR.GENERIC;
          // Si hay detalles de validación, también guardarlos
          if (error.error?.details) {
            this.validationErrors = error.error.details;
          }
          break;
        case 401:
          message = TOAST_MESSAGES.ERROR.UNAUTHORIZED;
          break;
        case 403:
          message = TOAST_MESSAGES.ERROR.FORBIDDEN;
          break;
        case 404:
          message = TOAST_MESSAGES.ERROR.NOT_FOUND;
          break;
        case 500:
          message = TOAST_MESSAGES.ERROR.SERVER_ERROR;
          break;
        default:
          // Intentar extraer mensaje del backend
          message = error.error?.message || error.error?.error || TOAST_MESSAGES.ERROR.GENERIC;
      }
    }
    // Errores desconocidos
    else {
      message = TOAST_MESSAGES.ERROR.GENERIC;
    }
    
    this.mostrarMensajeError(message);
  }

  // ========== SISTEMA DE NOTIFICACIONES TOAST ==========
  
  showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 3000) {
    const id = this.toastIdCounter++;
    const toast: Toast = { id, type, message, duration };
    
    console.log('=== AGREGANDO TOAST ===');
    console.log('Toast:', toast);
    console.log('Toasts antes:', this.toasts.length);
    
    this.toasts.push(toast);
    this.cdr.detectChanges(); // Forzar detección de cambios
    
    console.log('Toasts después:', this.toasts.length);
    console.log('Array de toasts:', this.toasts);
    
    // Auto-remover después de la duración especificada
    setTimeout(() => {
      console.log('=== REMOVIENDO TOAST ===', id);
      this.removeToast(id);
      this.cdr.detectChanges(); // Forzar detección de cambios al remover
    }, duration);
  }
  
  removeToast(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
  
  mostrarMensajeExito(mensaje: string) {
    this.showToast(mensaje, 'success');
  }
  
  mostrarMensajeError(mensaje: string) {
    this.showToast(mensaje, 'error');
  }
  
  mostrarMensajeAdvertencia(mensaje: string) {
    this.showToast(mensaje, 'warning');
  }
  
  mostrarMensajeInfo(mensaje: string) {
    this.showToast(mensaje, 'info');
  }
  
  // ========== MODAL DE ÉXITO ==========
  
  mostrarModalExito(mensaje: string, icon: string = '✓') {
    this.successModal = {
      show: true,
      message: mensaje,
      icon: icon
    };
    
    // Auto-cerrar después de 2 segundos
    setTimeout(() => {
      this.cerrarModalExito();
    }, 2000);
  }
  
  cerrarModalExito() {
    this.successModal.show = false;
  }
  
  // ========== MODAL DE CONFIRMACIÓN ==========
  
  abrirModalConfirmacion(
    title: string,
    message: string,
    confirmAction: () => void,
    type: 'danger' | 'warning' | 'info' = 'danger',
    confirmText: string = 'Confirmar eliminación',
    cancelText: string = 'Cancelar'
  ) {
    this.confirmationModal = {
      show: true,
      title,
      message,
      confirmText,
      cancelText,
      confirmAction,
      type
    };
  }
  
  cerrarModalConfirmacion() {
    this.confirmationModal = {
      show: false,
      title: '',
      message: '',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      confirmAction: () => {},
      type: 'danger'
    };
  }
  
  ejecutarAccionConfirmada() {
    if (this.confirmationModal.confirmAction) {
      this.confirmationModal.confirmAction();
    }
  }

  eliminarPersona(id: string) {
    this.abrirModalConfirmacion(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.',
      () => {
        console.log('=== INICIO ELIMINAR PERSONA ===', id);
        this.cerrarModalConfirmacion();
        this.isDeletingPersona = true;
        
        setTimeout(() => {
          const url = `${this.apiUrl}/personas/${id}`;
          console.log('DELETE Request a:', url);
          this.http.delete(url)
            .pipe(
              timeout(30000),
              catchError(error => {
                if (error.name === 'TimeoutError') {
                  console.error('=== TIMEOUT: La solicitud tardó más de 30 segundos ===');
                  return throwError(() => ({
                    status: 0,
                    message: 'La solicitud tardó demasiado tiempo. Verifica tu conexión o intenta nuevamente.'
                  }));
                }
                return throwError(() => error);
              })
            )
            .subscribe({
              next: () => {
                console.log('=== ÉXITO: Persona eliminada ===');
                this.isDeletingPersona = false;
                this.mostrarMensajeExito(TOAST_MESSAGES.PERSONA.DELETE_SUCCESS);
                this.cargarDatos(); // Recarga instantánea
              },
              error: (error) => {
                console.error('=== ERROR AL ELIMINAR PERSONA ===', error);
                this.isDeletingPersona = false;
                this.handleError(error, 'eliminar persona');
              }
            });
        }, 100);
      },
      'danger',
      'Confirmar eliminación',
      'Cancelar'
    );
  }

  asignarLider(personaId: string, liderId: string) {
    this.http.put(`${this.apiUrl}/personas/${personaId}/asignar-lider`, { liderId })
      .subscribe({
        next: () => {
          this.mostrarMensajeExito('Líder asignado exitosamente');
          this.cargarDatos();
        },
        error: (error) => {
          console.error('Error:', error);
          this.mostrarMensajeError('Error al asignar líder');
        }
      });
  }

  cambiarEstado(personaId: string, estado: string) {
    this.http.put(`${this.apiUrl}/personas/${personaId}`, { estado })
      .subscribe({
        next: () => {
          this.cargarDatos();
        },
        error: (error) => {
          console.error('Error:', error);
          this.mostrarMensajeError('Error al cambiar estado');
        }
      });
  }

  // ========== EXPORTACIÓN ==========
  
  exportarPersonasExcel() {
    if (this.isExporting) return;
    
    this.isExporting = true;
    const filters = {
      liderId: this.filtroLider || undefined,
      liderNombre: this.filtroLider ? this.lideres.find(l => l.id === this.filtroLider)?.nombre : undefined,
      zona: this.filtroZona || undefined,
      mesa: undefined,
      estado: this.filtroEstado || undefined,
      nivelCompromiso: this.filtroCompromiso || undefined,
      busqueda: this.busqueda || undefined
    };
    
    this.exportService.exportarPersonasExcel(filters).subscribe({
      next: () => {
        this.isExporting = false;
        this.mostrarMensajeExito('Archivo Excel generado exitosamente');
      },
      error: (error) => {
        this.isExporting = false;
        this.mostrarMensajeError(error.message || 'Error al generar el archivo Excel');
      }
    });
  }
  
  exportarLideresExcel() {
    if (this.isExporting) return;
    
    this.isExporting = true;
    this.exportService.exportarLideresExcel().subscribe({
      next: () => {
        this.isExporting = false;
        this.mostrarMensajeExito('Archivo Excel de líderes generado exitosamente');
      },
      error: (error) => {
        this.isExporting = false;
        this.mostrarMensajeError(error.message || 'Error al generar el archivo Excel');
      }
    });
  }

  exportarPersonas() {
    this.exportarPersonasExcel();
  }

  exportarPorLider(liderId: string) {
    const lider = this.lideres.find(l => l.id === liderId);
    if (!lider) return;
    
    if (this.isExporting) return;
    
    this.isExporting = true;
    this.exportService.exportarPersonasExcel({
      liderId: liderId,
      liderNombre: lider.nombre
    }).subscribe({
      next: () => {
        this.isExporting = false;
        this.mostrarMensajeExito('Archivo Excel generado exitosamente');
      },
      error: (error) => {
        this.isExporting = false;
        this.mostrarMensajeError(error.message || 'Error al generar el archivo Excel');
      }
    });
  }

  // ========== UTILIDADES ==========
  
  getZonasUnicas(): string[] {
    const zonas = new Set(
      this.personas
        .map(p => p.zona)
        .filter((z): z is string => !!z)
    );
    return Array.from(zonas).sort();
  }

  getPersonasPorLider(liderId: string): Persona[] {
    return this.personas.filter(p => p.liderId === liderId);
  }

  getEstadisticasLider(liderId: string) {
    const personas = this.getPersonasPorLider(liderId);
    return {
      total: personas.length,
      activos: personas.filter(p => (p.estado || 'Activo') === 'Activo').length,
      altoCompromiso: personas.filter(p => (p.nivelCompromiso || 'Medio') === 'Alto').length
    };
  }

  getTopMesas(): Array<{mesa: string, cantidad: number}> {
    return Object.entries(this.estadisticas.porMesa)
      .map(([mesa, cantidad]) => ({ mesa, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  }
  
  // ========== MODAL PERSONAS POR MESA ==========
  
  abrirModalPersonasMesa(parametro: string) {
    // Detectar si es un número de mesa o un nombre de institución
    // Si es un número corto (1-3 dígitos), es una mesa
    // Si es más largo, es un nombre de institución
    const esNumeroMesa = /^\d{1,3}$/.test(parametro);
    
    if (esNumeroMesa) {
      // Es un número de mesa - buscar la institución
      const personaConMesa = this.personas.find(p => p.mesa === parametro);
      const institucionOriginal = personaConMesa?.lugarVotacion || 'Institución Desconocida';
      const institucionNormalizada = this.normalizarNombreInstitucion(institucionOriginal);
      
      this.institucionSeleccionada = institucionNormalizada;
      this.mesaSeleccionada = parametro;
    } else {
      // Es un nombre de institución normalizado
      this.institucionSeleccionada = parametro;
      this.mesaSeleccionada = '';
    }
    
    this.modalPersonasMesa = true;
    this.searchTermMesa = '';
    this.cargarPersonasPorInstitucion(this.institucionSeleccionada);
  }
  
  cerrarModalPersonasMesa() {
    this.modalPersonasMesa = false;
    this.personasMesaActual = [];
    this.mesaSeleccionada = '';
    this.institucionSeleccionada = '';
    this.errorPersonasMesa = null;
    this.searchTermMesa = '';
  }
  
  cargarPersonasPorInstitucion(institucion: string) {
    this.cargandoPersonasMesa = true;
    this.errorPersonasMesa = null;
    
    console.log('Cargando personas para institución:', institucion);
    
    // Normalizar el nombre de la institución para la búsqueda
    const institucionNormalizada = this.normalizarNombreInstitucion(institucion);
    
    // Filtrar personas localmente por institución normalizada
    this.personasMesaActual = this.personas.filter(p => {
      const nombreNormalizado = this.normalizarNombreInstitucion(p.lugarVotacion || '');
      return nombreNormalizado === institucionNormalizada;
    });
    
    console.log('Personas encontradas:', this.personasMesaActual.length);
    this.cargandoPersonasMesa = false;
  }
  
  reintentarCargarPersonasMesa() {
    if (this.institucionSeleccionada) {
      this.cargarPersonasPorInstitucion(this.institucionSeleccionada);
    }
  }
  
  get personasMesaFiltradas(): Persona[] {
    let resultado = this.personasMesaActual;
    
    // Filtrar por mesa seleccionada
    if (this.mesaSeleccionada) {
      resultado = resultado.filter(p => p.mesa === this.mesaSeleccionada);
    }
    
    // Filtrar por término de búsqueda
    if (this.searchTermMesa.trim()) {
      const term = this.searchTermMesa.toLowerCase();
      resultado = resultado.filter(persona => 
        (persona.nombre && persona.nombre.toLowerCase().includes(term)) ||
        (persona.cedula && persona.cedula.includes(term)) ||
        (persona.mesa && persona.mesa.includes(term)) ||
        (persona.liderNombre && persona.liderNombre.toLowerCase().includes(term))
      );
    }
    
    // Ordenar alfabéticamente por nombre
    resultado.sort((a, b) => {
      const nombreA = a.nombre?.toLowerCase() || '';
      const nombreB = b.nombre?.toLowerCase() || '';
      return nombreA.localeCompare(nombreB);
    });
    
    return resultado;
  }

  filtrarPorMesa(mesa: string): void {
    if (this.mesaSeleccionada === mesa) {
      // Si ya está seleccionada, deseleccionar
      this.mesaSeleccionada = '';
    } else {
      // Seleccionar la mesa
      this.mesaSeleccionada = mesa;
    }
  }

  limpiarFiltroMesa(): void {
    this.mesaSeleccionada = '';
  }

  descargarExcelMesa(): void {
    if (this.isExporting || this.personasMesaFiltradas.length === 0) {
      if (this.personasMesaFiltradas.length === 0) {
        this.mostrarMensajeAdvertencia('No hay personas para exportar');
      }
      return;
    }

    this.isExporting = true;
    
    // Usar ExcelJS para generar el archivo localmente
    this.generarExcelLocal();
  }

  async generarExcelLocal(): Promise<void> {
    try {
      // Importar ExcelJS dinámicamente
      const ExcelJS = await import('exceljs');
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Personas');

      // Configurar columnas
      worksheet.columns = [
        { header: 'Nombre', key: 'nombre', width: 30 },
        { header: 'Cédula', key: 'cedula', width: 15 },
        { header: 'Celular', key: 'celular', width: 15 },
        { header: 'Correo', key: 'correo', width: 30 },
        { header: 'Mesa', key: 'mesa', width: 10 },
        { header: 'Lugar de Votación', key: 'lugarVotacion', width: 30 },
        { header: 'Dirección', key: 'direccion', width: 35 },
        { header: 'Líder Asignado', key: 'liderNombre', width: 25 },
        { header: 'Estado', key: 'estado', width: 12 }
      ];

      // Agregar filas de datos
      this.personasMesaFiltradas.forEach(persona => {
        worksheet.addRow({
          nombre: persona.nombre || '',
          cedula: persona.cedula || '',
          celular: persona.celular || '',
          correo: persona.correo || '',
          mesa: persona.mesa || '',
          lugarVotacion: persona.lugarVotacion || '',
          direccion: persona.direccion || '',
          liderNombre: persona.liderNombre || 'Sin líder',
          estado: persona.estado || 'Activo'
        });
      });

      // Estilizar encabezados
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF003DA5' }
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'left' };

      // Agregar filtros automáticos
      worksheet.autoFilter = {
        from: 'A1',
        to: 'I1'
      };

      // Generar nombre de archivo
      const fecha = new Date();
      const timestamp = fecha.toISOString().split('T')[0];
      let nombreArchivo = this.institucionSeleccionada.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      if (this.mesaSeleccionada) {
        nombreArchivo += `_Mesa_${this.mesaSeleccionada}`;
      }
      const filename = `personas_${nombreArchivo}_${timestamp}.xlsx`;

      // Generar y descargar archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Usar FileSaver para descargar
      const FileSaver = await import('file-saver');
      FileSaver.saveAs(blob, filename);

      this.isExporting = false;
      this.mostrarMensajeExito('Archivo Excel generado exitosamente');
    } catch (error) {
      console.error('Error generando Excel:', error);
      this.isExporting = false;
      this.mostrarMensajeError('Error al generar el archivo Excel');
    }
  }
  
  get mesasEnInstitucion(): Array<{mesa: string, cantidad: number}> {
    const mesasMap = new Map<string, number>();
    
    this.personasMesaActual.forEach(persona => {
      if (persona.mesa) {
        mesasMap.set(persona.mesa, (mesasMap.get(persona.mesa) || 0) + 1);
      }
    });
    
    return Array.from(mesasMap.entries())
      .map(([mesa, cantidad]) => ({ mesa, cantidad }))
      .sort((a, b) => a.mesa.localeCompare(b.mesa));
  }
  
  // ========== VISTA MESAS ==========
  
  // Función para normalizar nombres de instituciones
  private normalizarNombreInstitucion(nombre: string): string {
    if (!nombre) return 'Sin Institución';
    
    let normalizado = nombre
      .toUpperCase() // Convertir a mayúsculas
      .trim() // Eliminar espacios al inicio y final
      .replace(/\s+/g, ' ') // Reemplazar múltiples espacios por uno solo
      .replace(/\./g, '') // Eliminar todos los puntos
      .replace(/\t/g, ' ') // Reemplazar tabs por espacios
      .replace(/I\s*E\s*/g, 'IE ') // Normalizar "I E", "I.E", "I.E.", etc. a "IE "
      .replace(/SEDE\s+(\d+)/g, 'SEDE $1') // Normalizar "SEDE  2" a "SEDE 2"
      .trim();
    
    // Correcciones ortográficas comunes
    normalizado = normalizado
      .replace(/AUXIOLADORA/g, 'AUXILIADORA') // Corregir AUXIOLADORA a AUXILIADORA
      .replace(/FCO\s+DE\s+PAULA/g, 'FRANCISCO DE PAULA') // Expandir FCO
      .replace(/SD\s+/g, 'SEDE ') // SD a SEDE
      .replace(/\bPPAL\b/g, 'PRINCIPAL'); // PPAL a PRINCIPAL
    
    return normalizado.trim();
  }
  
  get institucionesAgrupadas(): Array<{
    nombre: string,
    nombreOriginal: string,
    totalPersonas: number,
    mesas: Array<{mesa: string, cantidad: number}>,
    direccion: string
  }> {
    const institucionesMap = new Map<string, {personas: Persona[], nombreOriginal: string}>();
    
    // Agrupar personas por institución normalizada
    this.personas.forEach(persona => {
      const nombreOriginal = persona.lugarVotacion || 'Sin Institución';
      const nombreNormalizado = this.normalizarNombreInstitucion(nombreOriginal);
      
      if (!institucionesMap.has(nombreNormalizado)) {
        institucionesMap.set(nombreNormalizado, {personas: [], nombreOriginal});
      }
      institucionesMap.get(nombreNormalizado)!.personas.push(persona);
    });
    
    // Convertir a array con estadísticas
    return Array.from(institucionesMap.entries())
      .map(([nombreNormalizado, {personas, nombreOriginal}]) => {
        // Agrupar mesas
        const mesasMap = new Map<string, number>();
        let direccion = '';
        
        personas.forEach(p => {
          if (p.mesa) {
            mesasMap.set(p.mesa, (mesasMap.get(p.mesa) || 0) + 1);
          }
          if (!direccion && p.direccionVotacion) {
            direccion = p.direccionVotacion;
          }
        });
        
        const mesas = Array.from(mesasMap.entries())
          .map(([mesa, cantidad]) => ({ mesa, cantidad }))
          .sort((a, b) => a.mesa.localeCompare(b.mesa));
        
        return {
          nombre: nombreNormalizado,
          nombreOriginal,
          totalPersonas: personas.length,
          mesas,
          direccion
        };
      })
      .sort((a, b) => b.totalPersonas - a.totalPersonas);
  }
  
  getPersonasPorMesa(institucion: string, mesa: string): Persona[] {
    return this.personas.filter(p => 
      p.lugarVotacion === institucion && p.mesa === mesa
    );
  }
  
  // ========== GESTIÓN DE DUPLICADOS ==========
  
  descargarExcelDuplicados(): void {
    if (this.isExportingDuplicates || this.duplicadosEncontrados.length === 0) {
      if (this.duplicadosEncontrados.length === 0) {
        this.mostrarMensajeAdvertencia('No hay duplicados para exportar');
      }
      return;
    }
    
    console.log('=== EXPORTANDO DUPLICADOS ===');
    console.log('Total de duplicados a exportar:', this.duplicadosEncontrados.length);
    console.log('Duplicados:', this.duplicadosEncontrados);
    
    this.isExportingDuplicates = true;
    
    this.exportService.exportarDuplicadosExcel(this.duplicadosEncontrados).subscribe({
      next: () => {
        this.isExportingDuplicates = false;
        this.mostrarMensajeExito('Archivo de duplicados descargado correctamente');
      },
      error: (error) => {
        this.isExportingDuplicates = false;
        this.mostrarMensajeError(error.message || 'Error al generar el archivo de duplicados. Intenta nuevamente.');
      }
    });
  }
  
  toggleDuplicados(): void {
    this.mostrandoDuplicados = !this.mostrandoDuplicados;
  }
  
  mostrarTodosDuplicados(): void {
    this.duplicadosVisibles = this.duplicadosEncontrados.length;
  }
  
  get duplicadosParaMostrar(): any[] {
    return this.duplicadosEncontrados.slice(0, this.duplicadosVisibles);
  }
}

