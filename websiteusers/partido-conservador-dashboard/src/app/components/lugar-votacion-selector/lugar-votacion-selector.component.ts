import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Institucion, ValidationResult } from '../../models/institucion.models';
import { INSTITUCIONES_PREDEFINIDAS } from '../../config/instituciones.constants';
import { 
  normalizarNombreInstitucion, 
  buscarCoincidenciaFuzzy,
  esSoloEspaciosEnBlanco 
} from '../../utils/institucion-normalization.utils';

@Component({
  selector: 'app-lugar-votacion-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lugar-votacion-selector.component.html',
  styleUrl: './lugar-votacion-selector.component.scss'
})
export class LugarVotacionSelectorComponent implements OnInit, OnChanges {
  @Input() valorInicial?: string;
  @Input() disabled: boolean = false;
  @Output() onChange = new EventEmitter<string>();
  @Output() onValidationChange = new EventEmitter<{ isValid: boolean; error?: string }>();

  // Estado del componente
  instituciones: Institucion[] = [];
  modoSeleccion: 'institucion' | 'custom' = 'institucion';
  institucionSeleccionadaId: string | null = null;
  textoCustom: string = '';
  cargando: boolean = false;
  error: string | null = null;
  caracteresRestantes: number = 200;
  readonly MAX_CARACTERES = 200;
  dropdownAbierto: boolean = false;

  ngOnInit(): void {
    this.cargarInstituciones();
    console.log('🔧 LugarVotacionSelector inicializado');
    console.log('📋 Instituciones cargadas:', this.instituciones.length);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['valorInicial'] && changes['valorInicial'].currentValue) {
      this.establecerValorInicial(changes['valorInicial'].currentValue);
    }
  }

  /**
   * Cierra el dropdown cuando se hace click fuera
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.lugar-votacion-selector');
    
    if (!clickedInside && this.dropdownAbierto) {
      this.dropdownAbierto = false;
      console.log('🔽 Dropdown cerrado por click fuera');
    }
  }

  /**
   * Carga la lista de instituciones desde la configuración
   */
  cargarInstituciones(): void {
    try {
      this.cargando = true;
      this.instituciones = this.obtenerInstitucionesDesdeConfig();
      this.cargando = false;
    } catch (err) {
      console.error('Error cargando instituciones:', err);
      this.error = 'No se pudieron cargar las instituciones';
      this.cargando = false;
      // Fallback a modo custom
      this.modoSeleccion = 'custom';
    }
  }

  /**
   * Obtiene las instituciones desde la configuración
   */
  obtenerInstitucionesDesdeConfig(): Institucion[] {
    // Por ahora usamos las constantes, en el futuro se puede cargar desde HTTP
    return INSTITUCIONES_PREDEFINIDAS.filter(inst => inst.activa);
  }

  /**
   * Maneja la selección de una institución
   */
  seleccionarInstitucion(institucionId: string): void {
    if (this.disabled) return;

    this.modoSeleccion = 'institucion';
    this.institucionSeleccionadaId = institucionId;
    this.textoCustom = '';
    
    const institucion = this.instituciones.find(i => i.id === institucionId);
    if (institucion) {
      this.onChange.emit(institucion.nombreCompleto);
      this.validarSeleccion();
    }
  }

  /**
   * Selecciona una institución y cierra el dropdown
   */
  seleccionarInstitucionYCerrar(institucionId: string): void {
    this.seleccionarInstitucion(institucionId);
    this.dropdownAbierto = false;
  }

  /**
   * Activa el modo de entrada personalizada
   */
  seleccionarModoCustom(): void {
    if (this.disabled) return;

    this.modoSeleccion = 'custom';
    this.institucionSeleccionadaId = null;
    this.validarSeleccion();
  }

  /**
   * Selecciona modo custom y cierra el dropdown
   */
  seleccionarModoCustomYCerrar(): void {
    this.seleccionarModoCustom();
    this.dropdownAbierto = false;
  }

  /**
   * Toggle del dropdown
   */
  toggleDropdown(): void {
    if (this.disabled) return;
    this.dropdownAbierto = !this.dropdownAbierto;
    console.log('🔄 Toggle dropdown:', this.dropdownAbierto ? 'ABIERTO' : 'CERRADO');
    console.log('📊 Estado actual:', {
      instituciones: this.instituciones.length,
      modoSeleccion: this.modoSeleccion,
      institucionSeleccionada: this.institucionSeleccionadaId
    });
  }

  /**
   * Obtiene el texto a mostrar en el selector
   */
  obtenerTextoSeleccionado(): string {
    if (this.modoSeleccion === 'institucion' && this.institucionSeleccionadaId) {
      const institucion = this.instituciones.find(i => i.id === this.institucionSeleccionadaId);
      return institucion?.nombreCompleto || 'Seleccione una institución';
    }
    if (this.modoSeleccion === 'custom' && this.textoCustom) {
      return this.textoCustom;
    }
    if (this.modoSeleccion === 'custom') {
      return 'Otro (escribir manualmente)';
    }
    return 'Seleccione una institución';
  }

  /**
   * Actualiza el texto personalizado
   */
  actualizarTextoCustom(texto: string): void {
    this.textoCustom = texto;
    this.caracteresRestantes = this.MAX_CARACTERES - texto.length;
    this.onChange.emit(texto);
    this.validarTextoCustom(texto);
  }

  /**
   * Valida la selección actual
   */
  validarSeleccion(): ValidationResult {
    if (this.modoSeleccion === 'institucion') {
      if (!this.institucionSeleccionadaId) {
        const result = {
          isValid: false,
          error: 'Debe seleccionar una institución'
        };
        this.onValidationChange.emit(result);
        return result;
      }
      const result = { isValid: true };
      this.onValidationChange.emit(result);
      return result;
    }

    return this.validarTextoCustom(this.textoCustom);
  }

  /**
   * Valida el texto personalizado
   */
  validarTextoCustom(texto: string): ValidationResult {
    const textoLimpio = texto.trim();

    if (textoLimpio.length === 0) {
      const result = {
        isValid: false,
        error: 'Debe ingresar un lugar de votación'
      };
      this.onValidationChange.emit(result);
      return result;
    }

    if (esSoloEspaciosEnBlanco(texto)) {
      const result = {
        isValid: false,
        error: 'El lugar de votación no puede estar vacío'
      };
      this.onValidationChange.emit(result);
      return result;
    }

    if (texto.length > this.MAX_CARACTERES) {
      const result = {
        isValid: false,
        error: `El lugar de votación no puede exceder ${this.MAX_CARACTERES} caracteres (actual: ${texto.length}/${this.MAX_CARACTERES})`
      };
      this.onValidationChange.emit(result);
      return result;
    }

    const result = { isValid: true };
    this.onValidationChange.emit(result);
    return result;
  }

  /**
   * Obtiene el valor actual del selector
   */
  obtenerValorActual(): string {
    if (this.modoSeleccion === 'institucion' && this.institucionSeleccionadaId) {
      const institucion = this.instituciones.find(i => i.id === this.institucionSeleccionadaId);
      return institucion?.nombreCompleto || '';
    }
    return this.textoCustom;
  }

  /**
   * Establece el valor inicial del selector
   */
  establecerValorInicial(valor: string): void {
    if (!valor || valor.trim() === '') {
      this.modoSeleccion = 'institucion';
      this.institucionSeleccionadaId = null;
      this.textoCustom = '';
      return;
    }

    const institucion = this.buscarInstitucionPorNombre(valor);
    
    if (institucion) {
      this.modoSeleccion = 'institucion';
      this.institucionSeleccionadaId = institucion.id;
      this.textoCustom = '';
    } else {
      this.modoSeleccion = 'custom';
      this.institucionSeleccionadaId = null;
      this.textoCustom = valor;
      this.caracteresRestantes = this.MAX_CARACTERES - valor.length;
    }
  }

  /**
   * Detecta si un valor es una institución o texto custom
   */
  detectarTipoValor(valor: string): 'institucion' | 'custom' {
    const institucion = this.buscarInstitucionPorNombre(valor);
    return institucion ? 'institucion' : 'custom';
  }

  /**
   * Busca una institución por su nombre
   */
  buscarInstitucionPorNombre(nombre: string): Institucion | null {
    const nombreNormalizado = normalizarNombreInstitucion(nombre);
    
    // Búsqueda exacta
    for (const institucion of this.instituciones) {
      if (normalizarNombreInstitucion(institucion.nombreCompleto) === nombreNormalizado ||
          normalizarNombreInstitucion(institucion.nombre) === nombreNormalizado) {
        return institucion;
      }
    }

    // Búsqueda fuzzy
    const nombresCompletos = this.instituciones.map(i => i.nombreCompleto);
    const coincidencia = buscarCoincidenciaFuzzy(nombre, nombresCompletos);
    
    if (coincidencia) {
      return this.instituciones.find(i => i.nombreCompleto === coincidencia) || null;
    }

    return null;
  }

  /**
   * Verifica si una institución está seleccionada
   */
  esInstitucionSeleccionada(institucionId: string): boolean {
    return this.modoSeleccion === 'institucion' && this.institucionSeleccionadaId === institucionId;
  }

  /**
   * Verifica si el modo custom está activo
   */
  esModoCustomActivo(): boolean {
    return this.modoSeleccion === 'custom';
  }
}
