import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
export class ReporteVisualComponent implements OnInit, OnDestroy {
  personas: Persona[] = [];
  lideres: Lider[] = [];
  filtroLiderId: string | null = null;
  distribucion: DistribucionLugar[] = [];
  estadisticas: Estadisticas = this.estadisticasVacias();
  cargando = true;
  error: string | null = null;
  mensajeVacio = 'No hay datos para mostrar';

  private destroy$ = new Subject<void>();

  constructor(
    private reporteService: ReporteVisualService,
    private exportacionService: ExportacionReporteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Cargar datos después de que el componente esté completamente inicializado
    setTimeout(() => {
      this.cargarDatos();
    }, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarDatos(): void {
    console.log('🔄 cargarDatos() llamado');
    console.log('Estado inicial - cargando:', this.cargando);
    
    this.cargando = true;
    this.error = null;

    console.log('🔄 Iniciando carga de datos...');
    console.log('Estado después de setear true - cargando:', this.cargando);

    // Agregar un timeout de seguridad
    const timeout = setTimeout(() => {
      if (this.cargando) {
        console.warn('⚠️ Timeout alcanzado, forzando fin de carga');
        this.cargando = false;
        this.error = 'La carga tomó demasiado tiempo. Por favor, intenta nuevamente.';
      }
    }, 10000); // 10 segundos

    forkJoin({
      personas: this.reporteService.obtenerTodasPersonas(),
      lideres: this.reporteService.obtenerLideres()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ({ personas, lideres }) => {
        console.log('📦 Callback next() ejecutado');
        clearTimeout(timeout);
        console.log('✅ Datos recibidos:', { 
          totalPersonas: personas.length, 
          totalLideres: lideres.length 
        });
        this.personas = personas;
        this.lideres = lideres;
        console.log('📊 Llamando actualizarVisualizaciones()');
        this.actualizarVisualizaciones();
        console.log('🏁 Seteando cargando = false');
        this.cargando = false;
        console.log('Estado final - cargando:', this.cargando);
        // Forzar detección de cambios
        console.log('🔄 Llamando detectChanges()');
        this.cdr.detectChanges();
        console.log('✅ detectChanges() completado');
      },
      error: (err) => {
        console.log('❌ Callback error() ejecutado');
        clearTimeout(timeout);
        console.error('❌ Error cargando datos:', err);
        this.error = 'Error al cargar los datos. Intenta nuevamente.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
    
    console.log('🔄 Subscripción creada, esperando respuesta...');
  }

  onLiderSeleccionado(liderId: string | null): void {
    console.log('📥 Líder seleccionado recibido:', liderId);
    this.filtroLiderId = liderId;
    this.actualizarVisualizaciones();
  }

  actualizarVisualizaciones(): void {
    console.log('📊 Actualizando visualizaciones...');
    console.log('Filtro líder ID:', this.filtroLiderId);
    console.log('Total personas antes de filtrar:', this.personas.length);
    
    this.distribucion = this.reporteService.calcularDistribucionPorLugar(
      this.personas,
      this.filtroLiderId
    );
    
    console.log('Distribución calculada:', this.distribucion);
    console.log('Total lugares:', this.distribucion.length);
    
    this.estadisticas = this.reporteService.calcularEstadisticas(this.distribucion);
    
    console.log('Estadísticas calculadas:', this.estadisticas);
    
    if (this.distribucion.length === 0) {
      if (this.filtroLiderId) {
        const lider = this.lideres.find(l => l.id === this.filtroLiderId);
        this.mensajeVacio = `El líder ${lider?.nombre || ''} no tiene personas asignadas`;
      } else {
        this.mensajeVacio = 'No hay datos para mostrar';
      }
      console.log('⚠️ Sin datos para mostrar:', this.mensajeVacio);
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
