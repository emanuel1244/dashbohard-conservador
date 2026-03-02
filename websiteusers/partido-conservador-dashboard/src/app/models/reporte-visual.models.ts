/**
 * Interfaces for Reporte Visual de Lugares de Votación
 */

export interface Persona {
  id: string;
  nombre: string;
  cedula: string;
  celular: string;
  correo: string;
  direccion: string;
  mesa: string;
  lugarVotacion: string;
  direccionVotacion?: string;
  zona?: string;
  liderId?: string;  // Cambiado de liderAsignado a liderId
  liderNombre?: string;
  estado?: 'Activo' | 'Inactivo' | 'Potencial';
  nivelCompromiso?: 'Alto' | 'Medio' | 'Bajo';
  notas?: string;
}

export interface Lider {
  id: string;
  nombre: string;
  cedula: string;
  celular: string;
  correo: string;
  zona: string;
  personasAsignadas: number;
}

export interface DesgloseLider {
  liderId: string;
  liderNombre: string;
  cantidad: number;
}

export interface DistribucionLugar {
  lugar: string;
  cantidadTotal: number;
  porcentaje: number;
  desgloseLideres: DesgloseLider[];
}

export interface Estadisticas {
  totalPersonas: number;
  totalLugares: number;
  lugarConMasPersonas: { nombre: string; cantidad: number } | null;
  lugarConMenosPersonas: { nombre: string; cantidad: number } | null;
  promedioPersonasPorLugar: number;
  porcentajeSinAsignar: number;
}
