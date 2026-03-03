import { CORRECCIONES_INSTITUCIONES } from '../config/instituciones.constants';

/**
 * Utilidades para normalización de nombres de instituciones
 */

/**
 * Normaliza el nombre de una institución aplicando correcciones comunes
 * @param nombre Nombre de la institución a normalizar
 * @returns Nombre normalizado en mayúsculas sin espacios extras
 */
export function normalizarNombreInstitucion(nombre: string | null | undefined): string {
  if (!nombre || nombre.trim() === '') {
    return 'SIN ASIGNAR';
  }

  let normalizado = nombre.trim().toUpperCase();

  // Aplicar correcciones comunes
  Object.keys(CORRECCIONES_INSTITUCIONES).forEach(incorrecto => {
    const regex = new RegExp(incorrecto, 'g');
    normalizado = normalizado.replace(regex, CORRECCIONES_INSTITUCIONES[incorrecto]);
  });

  // Eliminar múltiples espacios consecutivos
  normalizado = normalizado.replace(/\s+/g, ' ').trim();

  return normalizado;
}

/**
 * Compara dos nombres de instituciones considerando normalización
 * @param nombre1 Primer nombre a comparar
 * @param nombre2 Segundo nombre a comparar
 * @returns true si los nombres normalizados son iguales
 */
export function compararInstituciones(nombre1: string, nombre2: string): boolean {
  return normalizarNombreInstitucion(nombre1) === normalizarNombreInstitucion(nombre2);
}

/**
 * Calcula la distancia de Levenshtein entre dos strings
 * Usado para fuzzy matching de instituciones
 * @param str1 Primera cadena
 * @param str2 Segunda cadena
 * @returns Distancia de edición entre las cadenas
 */
export function calcularDistanciaLevenshtein(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Inicializar matriz
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Calcular distancia
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // Eliminación
        matrix[i][j - 1] + 1,      // Inserción
        matrix[i - 1][j - 1] + cost // Sustitución
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Busca coincidencias fuzzy de un nombre con una lista de nombres
 * @param nombre Nombre a buscar
 * @param candidatos Lista de nombres candidatos
 * @param umbral Umbral máximo de distancia (default: 3)
 * @returns Mejor coincidencia encontrada o null
 */
export function buscarCoincidenciaFuzzy(
  nombre: string,
  candidatos: string[],
  umbral: number = 3
): string | null {
  const nombreNormalizado = normalizarNombreInstitucion(nombre);
  let mejorCoincidencia: string | null = null;
  let menorDistancia = Infinity;

  for (const candidato of candidatos) {
    const candidatoNormalizado = normalizarNombreInstitucion(candidato);
    
    // Primero intentar coincidencia exacta
    if (nombreNormalizado === candidatoNormalizado) {
      return candidato;
    }

    // Calcular distancia de Levenshtein
    const distancia = calcularDistanciaLevenshtein(nombreNormalizado, candidatoNormalizado);
    
    if (distancia < menorDistancia && distancia <= umbral) {
      menorDistancia = distancia;
      mejorCoincidencia = candidato;
    }
  }

  return mejorCoincidencia;
}

/**
 * Verifica si un texto contiene solo espacios en blanco
 * @param texto Texto a verificar
 * @returns true si el texto es solo whitespace
 */
export function esSoloEspaciosEnBlanco(texto: string): boolean {
  return texto.trim().length === 0;
}

/**
 * Trunca un texto a una longitud máxima
 * @param texto Texto a truncar
 * @param longitudMaxima Longitud máxima permitida
 * @returns Texto truncado
 */
export function truncarTexto(texto: string, longitudMaxima: number): string {
  if (texto.length <= longitudMaxima) {
    return texto;
  }
  return texto.substring(0, longitudMaxima);
}
