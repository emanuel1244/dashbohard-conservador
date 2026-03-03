import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import '../../chart.config'; // Registrar componentes de Chart.js
import { ReporteVisualService } from '../../services/reporte-visual.service';
import { ExportacionReporteService } from '../../services/exportacion-reporte.service';
import { 
  Persona, 
  Lider, 
  DistribucionLugar, 
  Estadisticas 
} from '../../models/reporte-visual.models';
import { FiltroLiderComponent } from '../filtro-lider/filtro-lider.component';
import { EstadisticasGeneralesComponent } from '../estadisticas-generales/estadisticas-generales.component';
import { TablaDistribucionComponent } from '../tabla-distribucion/tabla-distribucion.component';
import { GraficaBarrasComponent } from '../grafica-barras/grafica-barras.component';
import { GraficaPastelComponent } from '../grafica-pastel/grafica-pastel.component';
import { AccionesExportacionComponent } from '../acciones-exportacion/acciones-exportacion.component';

@Component({
  selector: 'app-reporte-visual',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FiltroLiderComponent,
    EstadisticasGeneralesComponent,
    TablaDistribucionComponent,
    GraficaBarrasComponent,
    GraficaPastelComponent,
    AccionesExportacionComponent
  ],
  templateUrl: './reporte-visual.component.html',
  styleUrl: './reporte-visual.component.scss'
})
export class ReporteVisualComponent implements OnInit, AfterViewInit, OnDestroy {
  personas: Persona[] = [];
  lideres: Lider[] = [];
  filtroLiderId: string | null = null;
  distribucion: DistribucionLugar[] = [];
  estadisticas: Estadisticas = this.estadisticasVacias();
  cargando = true;
  error: string | null = null;
  mensajeVacio = 'No hay datos para mostrar';

  // Modal de personas por lugar
  mostrarModalPersonas = false;
  lugarSeleccionado = '';
  personasLugarSeleccionado: Persona[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private reporteService: ReporteVisualService,
    private exportacionService: ExportacionReporteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // No cargar datos aquí para evitar ExpressionChangedAfterItHasBeenCheckedError
  }

  ngAfterViewInit(): void {
    // Cargar datos después de que la vista esté completamente inicializada
    setTimeout(() => {
      this.cargarDatos();
    }, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = null;

    // Agregar un timeout de seguridad
    const timeout = setTimeout(() => {
      if (this.cargando) {
        this.cargando = false;
        this.error = 'La carga tomó demasiado tiempo. Por favor, intenta nuevamente.';
        this.cdr.detectChanges();
      }
    }, 10000); // 10 segundos

    forkJoin({
      personas: this.reporteService.obtenerTodasPersonas(),
      lideres: this.reporteService.obtenerLideres()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ({ personas, lideres }) => {
        clearTimeout(timeout);
        this.personas = personas;
        this.lideres = lideres;
        this.actualizarVisualizaciones();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        clearTimeout(timeout);
        console.error('❌ Error cargando datos:', err);
        this.error = 'Error al cargar los datos. Intenta nuevamente.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  onLiderSeleccionado(liderId: string | null): void {
    this.filtroLiderId = liderId;
    this.actualizarVisualizaciones();
  }

  actualizarVisualizaciones(): void {
    this.distribucion = this.reporteService.calcularDistribucionPorLugar(
      this.personas,
      this.filtroLiderId
    );
    
    this.estadisticas = this.reporteService.calcularEstadisticas(this.distribucion);
    
    if (this.distribucion.length === 0) {
      if (this.filtroLiderId) {
        const lider = this.lideres.find(l => l.id === this.filtroLiderId);
        this.mensajeVacio = `El líder ${lider?.nombre || ''} no tiene personas asignadas`;
      } else {
        this.mensajeVacio = 'No hay datos para mostrar';
      }
    }
  }

  async exportarExcel(): Promise<void> {
    try {
      const liderNombre = this.filtroLiderId 
        ? this.lideres.find(l => l.id === this.filtroLiderId)?.nombre 
        : null;
      
      await this.exportacionService.exportarTablaExcel(this.distribucion, liderNombre);
    } catch (error) {
      console.error('Error exportando a Excel:', error);
      alert('Error al exportar a Excel. Intenta nuevamente.');
    }
  }

  async exportarImagen(): Promise<void> {
    try {
      await this.exportacionService.exportarGraficasImagen(['grafica-barras', 'grafica-pastel']);
    } catch (error) {
      console.error('Error exportando gráficas:', error);
      alert('Error al exportar las gráficas. Intenta nuevamente.');
    }
  }

  async exportarPersonasCompleto(): Promise<void> {
    try {
      // Filtrar personas si hay un líder seleccionado
      const personasAExportar = this.filtroLiderId
        ? this.personas.filter(p => p.liderId === this.filtroLiderId)
        : this.personas;

      if (personasAExportar.length === 0) {
        alert('No hay personas para exportar');
        return;
      }

      const liderNombre = this.filtroLiderId 
        ? this.lideres.find(l => l.id === this.filtroLiderId)?.nombre 
        : null;
      
      await this.exportacionService.exportarPersonasExcel(personasAExportar, liderNombre);
    } catch (error) {
      console.error('Error exportando personas:', error);
      alert('Error al exportar el listado de personas. Intenta nuevamente.');
    }
  }

  mostrarPersonasPorLugar(lugar: string): void {
    this.lugarSeleccionado = lugar;
    
    // Normalizar el lugar de la misma forma que en el servicio
    const lugarNormalizado = lugar.trim().toUpperCase();
    
    // Filtrar personas por lugar
    this.personasLugarSeleccionado = this.personas.filter(p => {
      const lugarPersona = p.lugarVotacion?.trim().toUpperCase() || 'SIN ASIGNAR';
      return lugarPersona === lugarNormalizado || 
             (lugarNormalizado === 'SIN ASIGNAR' && (!p.lugarVotacion || p.lugarVotacion.trim() === ''));
    });

    // Aplicar filtro de líder si está activo
    if (this.filtroLiderId) {
      this.personasLugarSeleccionado = this.personasLugarSeleccionado.filter(
        p => p.liderId === this.filtroLiderId
      );
    }

    // Ordenar alfabéticamente por nombre
    this.personasLugarSeleccionado.sort((a, b) => {
      const nombreA = a.nombre?.toLowerCase() || '';
      const nombreB = b.nombre?.toLowerCase() || '';
      return nombreA.localeCompare(nombreB);
    });

    this.mostrarModalPersonas = true;
  }

  cerrarModalPersonas(): void {
    this.mostrarModalPersonas = false;
    this.lugarSeleccionado = '';
    this.personasLugarSeleccionado = [];
  }

  async descargarPersonasPorLugar(lugar: string): Promise<void> {
    try {
      // Normalizar el lugar
      const lugarNormalizado = lugar.trim().toUpperCase();
      
      // Filtrar personas por lugar
      let personasLugar = this.personas.filter(p => {
        const lugarPersona = p.lugarVotacion?.trim().toUpperCase() || 'SIN ASIGNAR';
        return lugarPersona === lugarNormalizado || 
               (lugarNormalizado === 'SIN ASIGNAR' && (!p.lugarVotacion || p.lugarVotacion.trim() === ''));
      });

      // Aplicar filtro de líder si está activo
      if (this.filtroLiderId) {
        personasLugar = personasLugar.filter(p => p.liderId === this.filtroLiderId);
      }

      if (personasLugar.length === 0) {
        alert('No hay personas para exportar en este lugar');
        return;
      }

      const liderNombre = this.filtroLiderId 
        ? this.lideres.find(l => l.id === this.filtroLiderId)?.nombre 
        : null;
      
      await this.exportacionService.exportarPersonasExcel(personasLugar, liderNombre);
    } catch (error) {
      console.error('Error exportando personas por lugar:', error);
      alert('Error al exportar el listado de personas. Intenta nuevamente.');
    }
  }

  private estadisticasVacias(): Estadisticas {
    return {
      totalPersonas: 0,
      totalLugares: 0,
      lugarConMasPersonas: null,
      lugarConMenosPersonas: null,
      promedioPersonasPorLugar: 0,
      porcentajeSinAsignar: 0
    };
  }
}
