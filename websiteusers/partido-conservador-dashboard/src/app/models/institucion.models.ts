/**
 * Modelos de datos para instituciones de votación
 */

/**
 * Representa una institución de votación predefinida
 */
export interface Institucion {
  id: string;                    // Identificador único
  nombre: string;                // Nombre normalizado (ej: "MARIA AUXILIADORA")
  nombreCompleto: string;        // Nombre completo con sede (ej: "MARIA AUXILIADORA SEDE PRINCIPAL")
  tipo: 'colegio' | 'universidad' | 'otro';
  sedes?: string[];              // Sedes adicionales si aplica
  activa: boolean;               // Si está disponible para selección
}

/**
 * Configuración de instituciones del sistema
 */
export interface ConfiguracionInstituciones {
  instituciones: Institucion[];
  version: string;
  ultimaActualizacion: string;
}

/**
 * Estado interno del selector de lugar de votación
 */
export interface LugarVotacionState {
  instituciones: Institucion[];
  seleccionTipo: 'institucion' | 'custom';
  institucionSeleccionada: string | null;
  textoCustom: string;
  validationError: string | null;
}

/**
 * Resultado de validación
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}
