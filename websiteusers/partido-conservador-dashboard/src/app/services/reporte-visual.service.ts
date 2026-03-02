import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import {
  Persona,
  Lider,
  DistribucionLugar,
  DesgloseLider,
  Estadisticas
} from '../models/reporte-visual.models';

@Injectable({
  providedIn: 'root'
})
export class ReporteVisualService {
  private readonly API_URL = 'https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api';

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las personas del sistema
   */
  obtenerTodasPersonas(): Observable<Persona[]> {
    return this.http.get<Persona[]>(`${this.API_URL}/personas`)
      .pipe(
        retry({
          count: 2,
          delay: 1000
        }),
        map(response => {
          console.log('📥 Respuesta API personas:', response);
          // El API devuelve directamente un array, no un objeto con propiedad personas
          return Array.isArray(response) ? response : [];
        }),
        catchError(error => {
          console.error('Error obteniendo personas:', error);
          return throwError(() => new Error('Error al cargar las personas'));
        })
      );
  }

  /**
   * Obtener todos los líderes del sistema
   */
  obtenerLideres(): Observable<Lider[]> {
    return this.http.get<Lider[]>(`${this.API_URL}/lideres`)
      .pipe(
        retry({
          count: 2,
          delay: 1000
        }),
        map(response => {
          console.log('📥 Respuesta API líderes:', response);
          // El API devuelve directamente un array, no un objeto con propiedad lideres
          return Array.isArray(response) ? response : [];
        }),
        catchError(error => {
          console.error('Error obteniendo líderes:', error);
          return throwError(() => new Error('Error al cargar los líderes'));
        })
      );
  }

  /**
   * Normalizar lugar de votación (manejar vacíos como "Sin asignar")
   */
  private normalizarLugar(lugar: string | null | undefined): string {
    if (!lugar || lugar.trim() === '') {
      return 'Sin asignar';
    }
    return lugar.trim();
  }

  /**
   * Agrupar personas por lugar de votación y líder
   */
  private agruparPorLugarYLider(personas: Persona[]): Map<string, Map<string, { nombre: string; cantidad: number }>> {
    const agrupacion = new Map<string, Map<string, { nombre: string; cantidad: number }>>();

    personas.forEach(persona => {
      const lugar = this.normalizarLugar(persona.lugarVotacion);
      const liderId = persona.liderId || 'sin-lider';
      const liderNombre = persona.liderNombre || 'Sin líder';

      if (!agrupacion.has(lugar)) {
        agrupacion.set(lugar, new Map());
      }

      const lideresEnLugar = agrupacion.get(lugar)!;
      if (!lideresEnLugar.has(liderId)) {
        lideresEnLugar.set(liderId, { nombre: liderNombre, cantidad: 0 });
      }

      lideresEnLugar.get(liderId)!.cantidad++;
    });

    return agrupacion;
  }

  /**
   * Calcular distribución de personas por lugar de votación
   * @param personas Lista de personas a agrupar
   * @param filtroLiderId ID del líder para filtrar (opcional)
   * @returns Array de distribución por lugar con desglose de líderes
   */
  calcularDistribucionPorLugar(
    personas: Persona[],
    filtroLiderId?: string | null
  ): DistribucionLugar[] {
    console.log('🔍 calcularDistribucionPorLugar - Inicio');
    console.log('Total personas recibidas:', personas.length);
    console.log('Filtro líder ID:', filtroLiderId);
    
    // Mostrar una muestra de personas para ver su estructura
    if (personas.length > 0) {
      console.log('📋 Muestra de persona:', personas[0]);
      console.log('📋 Campos de liderId en primeras 5 personas:', 
        personas.slice(0, 5).map(p => ({ 
          nombre: p.nombre, 
          liderId: p.liderId,
          liderNombre: p.liderNombre 
        }))
      );
    }
    
    // Filtrar personas si se especifica un líder
    let personasFiltradas = personas;
    if (filtroLiderId) {
      console.log('🔎 Filtrando por líder:', filtroLiderId);
      personasFiltradas = personas.filter(p => {
        const coincide = p.liderId === filtroLiderId;
        if (coincide) {
          console.log('✅ Persona coincide:', p.nombre, 'líder:', p.liderId);
        }
        return coincide;
      });
      console.log('Personas después de filtrar por líder:', personasFiltradas.length);
    }

    if (personasFiltradas.length === 0) {
      console.log('⚠️ No hay personas para procesar');
      return [];
    }

    // Agrupar por lugar y líder
    const agrupacion = this.agruparPorLugarYLider(personasFiltradas);
    console.log('Lugares agrupados:', agrupacion.size);

    // Convertir a array de DistribucionLugar
    const distribucion: DistribucionLugar[] = [];
    const totalPersonas = personasFiltradas.length;

    agrupacion.forEach((lideresMap, lugar) => {
      const desgloseLideres: DesgloseLider[] = [];
      let cantidadTotal = 0;

      lideresMap.forEach((info, liderId) => {
        desgloseLideres.push({
          liderId,
          liderNombre: info.nombre,
          cantidad: info.cantidad
        });
        cantidadTotal += info.cantidad;
      });

      // Ordenar desglose por cantidad descendente
      desgloseLideres.sort((a, b) => b.cantidad - a.cantidad);

      distribucion.push({
        lugar,
        cantidadTotal,
        porcentaje: (cantidadTotal / totalPersonas) * 100,
        desgloseLideres
      });
    });

    // Ordenar por cantidad total descendente
    distribucion.sort((a, b) => b.cantidadTotal - a.cantidadTotal);

    console.log('✅ Distribución final:', distribucion.length, 'lugares');
    console.log('Primeros 3 lugares:', distribucion.slice(0, 3));

    return distribucion;
  }

  /**
   * Calcular estadísticas generales de la distribución
   * @param distribucion Array de distribución por lugar
   * @returns Objeto con estadísticas calculadas
   */
  calcularEstadisticas(distribucion: DistribucionLugar[]): Estadisticas {
    if (distribucion.length === 0) {
      return {
        totalPersonas: 0,
        totalLugares: 0,
        lugarConMasPersonas: null,
        lugarConMenosPersonas: null,
        promedioPersonasPorLugar: 0,
        porcentajeSinAsignar: 0
      };
    }

    const totalPersonas = distribucion.reduce((sum, d) => sum + d.cantidadTotal, 0);
    const lugaresConDatos = distribucion.filter(d => d.cantidadTotal > 0);
    
    // Ya está ordenado descendente, el primero es el máximo
    const lugarConMas = lugaresConDatos[0];
    // El último es el mínimo
    const lugarConMenos = lugaresConDatos[lugaresConDatos.length - 1];
    
    const sinAsignar = distribucion.find(d => d.lugar === 'Sin asignar');
    const porcentajeSinAsignar = sinAsignar ? sinAsignar.porcentaje : 0;

    return {
      totalPersonas,
      totalLugares: distribucion.length,
      lugarConMasPersonas: lugarConMas ? {
        nombre: lugarConMas.lugar,
        cantidad: lugarConMas.cantidadTotal
      } : null,
      lugarConMenosPersonas: lugarConMenos ? {
        nombre: lugarConMenos.lugar,
        cantidad: lugarConMenos.cantidadTotal
      } : null,
      promedioPersonasPorLugar: totalPersonas / distribucion.length,
      porcentajeSinAsignar
    };
  }
}
