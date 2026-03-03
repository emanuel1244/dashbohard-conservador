import { Institucion } from '../models/institucion.models';

/**
 * Lista predefinida de instituciones de votación
 * Basado en el análisis de datos existentes en el sistema
 */
export const INSTITUCIONES_PREDEFINIDAS: Institucion[] = [
  {
    id: 'maria-auxiliadora-principal',
    nombre: 'MARIA AUXILIADORA',
    nombreCompleto: 'MARIA AUXILIADORA SEDE PRINCIPAL',
    tipo: 'colegio',
    sedes: ['PRINCIPAL'],
    activa: true
  },
  {
    id: 'maria-auxiliadora-sede-2',
    nombre: 'MARIA AUXILIADORA',
    nombreCompleto: 'MARIA AUXILIADORA SEDE 2',
    tipo: 'colegio',
    sedes: ['2'],
    activa: true
  },
  {
    id: 'francisco-de-paula-principal',
    nombre: 'FRANCISCO DE PAULA',
    nombreCompleto: 'FRANCISCO DE PAULA PRINCIPAL',
    tipo: 'colegio',
    sedes: ['PRINCIPAL'],
    activa: true
  },
  {
    id: 'petronitas',
    nombre: 'PETRONITAS',
    nombreCompleto: 'PETRONITAS',
    tipo: 'colegio',
    activa: true
  },
  {
    id: 'megacolegio-villa-olimpica',
    nombre: 'MEGACOLEGIO VILLA OLIMPICA',
    nombreCompleto: 'MEGACOLEGIO VILLA OLIMPICA',
    tipo: 'colegio',
    activa: true
  },
  {
    id: 'carruages',
    nombre: 'CARRUAGES',
    nombreCompleto: 'CARRUAGES',
    tipo: 'colegio',
    activa: true
  }
];

/**
 * Mapa de correcciones comunes para normalización
 * Usado para corregir variaciones y errores tipográficos
 */
export const CORRECCIONES_INSTITUCIONES: { [key: string]: string } = {
  'MARIAAUXILIADORA': 'MARIA AUXILIADORA',
  'FRANCISCODEPAULA': 'FRANCISCO DE PAULA',
  'FCO DE PAULA': 'FRANCISCO DE PAULA',
  'FCO. DE PAULA': 'FRANCISCO DE PAULA',
  'VILLAOLIMPICA': 'VILLA OLIMPICA',
  'SEDEPRINCIPAL': 'SEDE PRINCIPAL',
  'SEDE2': 'SEDE 2',
  'SEDE3': 'SEDE 3',
  'SEDE1': 'SEDE 1',
  'SD PRINCIPAL': 'SEDE PRINCIPAL',
  'SD 2': 'SEDE 2',
  'PPAL': 'PRINCIPAL',
  'AUXIOLADORA': 'AUXILIADORA'
};
