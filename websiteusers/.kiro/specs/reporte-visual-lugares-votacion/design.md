# Design Document - Reporte Visual de Lugares de Votación

## Overview

Este módulo implementa un sistema de reportes visuales interactivos que permite a los administradores analizar la distribución de personas y líderes por lugar de votación. El sistema muestra todos los lugares de votación por defecto, con el total de personas en cada uno y el desglose de líderes que tienen personas asignadas en ese lugar. Incluye filtrado opcional por líder, visualizaciones mediante gráficas (barras y pastel), y capacidades de exportación.

La solución se integra con la arquitectura existente del Sistema de Gestión Electoral del Partido Conservador, construido con Angular 21, y consume datos del API REST existente en AWS Lambda.

## Architecture

### Technology Stack

- **Frontend Framework**: Angular 21 (standalone components)
- **Charting Library**: Chart.js 4.x con ng2-charts
- **HTTP Client**: Angular HttpClient
- **State Management**: RxJS Observables
- **Styling**: SCSS con diseño responsivo
- **Export**: ExcelJS para exportación de datos, html2canvas para exportación de gráficas

### Component Architecture

```
ReporteVisualComponent (Container)
├── FiltroLiderComponent (Presentation)
├── EstadisticasGeneralesComponent (Presentation)
├── TablaDistribucionComponent (Presentation)
├── GraficaBarrasComponent (Presentation)
├── GraficaPastelComponent (Presentation)
└── AccionesExportacionComponent (Presentation)
```

### Service Layer

```
ReporteVisualService
├── obtenerTodasPersonas(): Observable<Persona[]>
├── obtenerLideres(): Observable<Lider[]>
├── calcularDistribucionPorLugar(personas: Persona[], filtroLiderId?: string): DistribucionLugar[]
├── calcularEstadisticas(distribucion: DistribucionLugar[]): Estadisticas
└── agruparPorLugarYLider(personas: Persona[]): Map<string, Map<string, number>>

ExportacionReporteService
├── exportarTablaExcel(distribucion: DistribucionLugar[], filtroLider?: string): Observable<Blob>
└── exportarGraficasImagen(elementIds: string[]): Promise<Blob>
```


## Components and Interfaces

### 1. ReporteVisualComponent (Container)

**Responsibility**: Orquestar el flujo de datos, manejar el estado del módulo y coordinar los componentes hijos.

**Template Structure**:
```html
<div class="reporte-visual-container">
  <h2>Reporte de Lugares de Votación</h2>
  
  <app-filtro-lider 
    [lideres]="lideres$ | async"
    [liderSeleccionado]="filtroLiderId"
    (liderSeleccionado)="onLiderSeleccionado($event)">
  </app-filtro-lider>

  <div *ngIf="!cargando && distribucion.length > 0" class="contenido-reporte">
    <app-estadisticas-generales 
      [estadisticas]="estadisticas">
    </app-estadisticas-generales>

    <app-acciones-exportacion
      [habilitado]="!cargando"
      (exportarExcel)="exportarExcel()"
      (exportarImagen)="exportarImagen()">
    </app-acciones-exportacion>

    <div class="visualizaciones">
      <app-tabla-distribucion 
        [distribucion]="distribucion"
        [cargando]="cargando">
      </app-tabla-distribucion>

      <div class="graficas-container">
        <app-grafica-barras 
          [distribucion]="distribucion"
          [cargando]="cargando">
        </app-grafica-barras>

        <app-grafica-pastel 
          [distribucion]="distribucion"
          [cargando]="cargando">
        </app-grafica-pastel>
      </div>
    </div>
  </div>

  <div *ngIf="!cargando && distribucion.length === 0" class="mensaje-vacio">
    <p>{{ mensajeVacio }}</p>
  </div>

  <div *ngIf="cargando" class="loading-container">
    <span class="spinner"></span>
    <p>Cargando datos...</p>
  </div>

  <div *ngIf="error" class="mensaje-error">
    <p>{{ error }}</p>
  </div>
</div>
```

**State Management**:
```typescript
interface ReporteVisualState {
  personas: Persona[];
  lideres: Lider[];
  filtroLiderId: string | null; // null = "Todos los líderes"
  distribucion: DistribucionLugar[];
  estadisticas: Estadisticas;
  cargando: boolean;
  error: string | null;
  mensajeVacio: string;
}
```

**Component Logic**:
```typescript
export class ReporteVisualComponent implements OnInit {
  personas: Persona[] = [];
  lideres: Lider[] = [];
  filtroLiderId: string | null = null;
  distribucion: DistribucionLugar[] = [];
  estadisticas: Estadisticas = this.estadisticasVacias();
  cargando = true;
  error: string | null = null;
  mensajeVacio = 'No hay datos para mostrar';

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = null;

    forkJoin({
      personas: this.reporteService.obtenerTodasPersonas(),
      lideres: this.reporteService.obtenerLideres()
    }).subscribe({
      next: ({ personas, lideres }) => {
        this.personas = personas;
        this.lideres = lideres;
        this.actualizarVisualizaciones();
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los datos. Intenta nuevamente.';
        this.cargando = false;
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
}
```

### 2. FiltroLiderComponent (Presentation)

**Responsibility**: Renderizar el dropdown de filtro de líderes y emitir eventos de selección.

**Interface**:
```typescript
@Input() lideres: Lider[] = [];
@Input() liderSeleccionado: string | null = null;
@Output() liderSeleccionado = new EventEmitter<string | null>();

interface Lider {
  id: string;
  nombre: string;
  cedula: string;
  zona: string;
  personasAsignadas: number;
}
```

**Template**:
```html
<div class="filtro-lider">
  <label for="lider-select">Filtrar por Líder:</label>
  <select 
    id="lider-select" 
    [(ngModel)]="liderSeleccionadoId"
    (change)="onSeleccionChange()"
    class="form-select">
    <option [value]="null">Todos los líderes</option>
    <option *ngFor="let lider of lideres" [value]="lider.id">
      {{ lider.nombre }} ({{ lider.zona }})
    </option>
  </select>
</div>
```

### 3. TablaDistribucionComponent (Presentation)

**Responsibility**: Renderizar tabla con distribución de personas por lugar con desglose de líderes.

**Interface**:
```typescript
@Input() distribucion: DistribucionLugar[] = [];
@Input() cargando: boolean = false;

interface DistribucionLugar {
  lugar: string;
  cantidadTotal: number;
  porcentaje: number;
  desgloseLideres: DesgloseLider[];
}

interface DesgloseLider {
  liderNombre: string;
  cantidad: number;
}
```

**Template**:
```html
<div class="tabla-distribucion">
  <h3>Distribución por Lugar de Votación</h3>
  <table class="table">
    <thead>
      <tr>
        <th>Lugar de Votación</th>
        <th>Total Personas</th>
        <th>Líderes</th>
        <th>Porcentaje</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let item of distribucion">
        <td>{{ item.lugar }}</td>
        <td>{{ item.cantidadTotal }}</td>
        <td>
          <div class="desglose-lideres">
            <span *ngFor="let desglose of item.desgloseLideres" class="lider-item">
              {{ desglose.liderNombre }}: {{ desglose.cantidad }}
            </span>
          </div>
        </td>
        <td>{{ item.porcentaje | number:'1.2-2' }}%</td>
      </tr>
      <tr class="total-row">
        <td><strong>TOTAL</strong></td>
        <td><strong>{{ calcularTotal() }}</strong></td>
        <td></td>
        <td><strong>100.00%</strong></td>
      </tr>
    </tbody>
  </table>
  <div *ngIf="cargando" class="loading-overlay">
    <span class="spinner"></span>
  </div>
</div>
```


### 4. GraficaBarrasComponent (Presentation)

**Responsibility**: Renderizar gráfica de barras usando Chart.js con tooltips que muestran desglose de líderes.

**Chart Configuration**:
```typescript
private configurarGrafica(): void {
  this.chartData = {
    labels: this.distribucion.map(d => d.lugar),
    datasets: [{
      label: 'Total de Personas',
      data: this.distribucion.map(d => d.cantidadTotal),
      backgroundColor: this.generarColores(this.distribucion.length),
      borderColor: '#003DA5',
      borderWidth: 1
    }]
  };

  this.chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const item = this.distribucion[index];
            const labels = [
              `Total: ${item.cantidadTotal} personas (${item.porcentaje.toFixed(2)}%)`,
              '',
              'Desglose por líder:'
            ];
            
            item.desgloseLideres.forEach(desglose => {
              labels.push(`  ${desglose.liderNombre}: ${desglose.cantidad}`);
            });
            
            return labels;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };
}
```

### 5. GraficaPastelComponent (Presentation)

**Responsibility**: Renderizar gráfica de pastel usando Chart.js con tooltips que muestran desglose de líderes.

**Chart Configuration**:
```typescript
private configurarGrafica(): void {
  this.chartData = {
    labels: this.distribucion.map(d => d.lugar),
    datasets: [{
      data: this.distribucion.map(d => d.cantidadTotal),
      backgroundColor: this.generarColoresPastel(this.distribucion.length),
      borderColor: '#ffffff',
      borderWidth: 2
    }]
  };

  this.chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          generateLabels: (chart) => {
            const data = chart.data;
            return data.labels.map((label, i) => ({
              text: `${label} (${this.distribucion[i].porcentaje.toFixed(2)}%)`,
              fillStyle: data.datasets[0].backgroundColor[i],
              hidden: false,
              index: i
            }));
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const item = this.distribucion[index];
            const labels = [
              `${item.lugar}`,
              `Total: ${item.cantidadTotal} personas (${item.porcentaje.toFixed(2)}%)`,
              '',
              'Desglose por líder:'
            ];
            
            item.desgloseLideres.forEach(desglose => {
              labels.push(`  ${desglose.liderNombre}: ${desglose.cantidad}`);
            });
            
            return labels;
          }
        }
      }
    }
  };
}
```

## Data Models

### Core Entities

```typescript
interface Persona {
  id: string;
  nombre: string;
  cedula: string;
  celular: string;
  correo: string;
  direccion: string;
  mesa: string;
  lugarVotacion: string;  // Puede ser vacío o null
  direccionVotacion?: string;
  zona?: string;
  liderAsignado?: string;  // ID del líder, puede ser null
  liderNombre?: string;
  estado?: 'Activo' | 'Inactivo' | 'Potencial';
  nivelCompromiso?: 'Alto' | 'Medio' | 'Bajo';
  notas?: string;
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

interface DistribucionLugar {
  lugar: string;  // "Sin asignar" para registros sin lugar
  cantidadTotal: number;
  porcentaje: number;
  desgloseLideres: DesgloseLider[];
}

interface DesgloseLider {
  liderId: string;
  liderNombre: string;  // "Sin líder" para personas sin líder asignado
  cantidad: number;
}

interface Estadisticas {
  totalPersonas: number;
  totalLugares: number;
  lugarConMasPersonas: { nombre: string; cantidad: number } | null;
  lugarConMenosPersonas: { nombre: string; cantidad: number } | null;
  promedioPersonasPorLugar: number;
  porcentajeSinAsignar: number;
}
```

### Service Implementation

```typescript
@Injectable({ providedIn: 'root' })
export class ReporteVisualService {
  private readonly API_URL = 'https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api';

  constructor(private http: HttpClient) {}

  obtenerTodasPersonas(): Observable<Persona[]> {
    return this.http.get<{ personas: Persona[] }>(`${this.API_URL}/personas`)
      .pipe(
        map(response => response.personas || []),
        catchError(error => {
          console.error('Error obteniendo personas:', error);
          return throwError(() => error);
        })
      );
  }

  obtenerLideres(): Observable<Lider[]> {
    return this.http.get<{ lideres: Lider[] }>(`${this.API_URL}/lideres`)
      .pipe(
        map(response => response.lideres || []),
        catchError(error => {
          console.error('Error obteniendo líderes:', error);
          return throwError(() => error);
        })
      );
  }

  calcularDistribucionPorLugar(
    personas: Persona[],
    filtroLiderId?: string | null
  ): DistribucionLugar[] {
    // Filtrar personas si se especifica un líder
    let personasFiltradas = personas;
    if (filtroLiderId) {
      personasFiltradas = personas.filter(p => p.liderAsignado === filtroLiderId);
    }

    if (personasFiltradas.length === 0) {
      return [];
    }

    // Agrupar por lugar y líder
    const agrupacion = new Map<string, Map<string, { nombre: string; cantidad: number }>>();

    personasFiltradas.forEach(persona => {
      const lugar = this.normalizarLugar(persona.lugarVotacion);
      const liderId = persona.liderAsignado || 'sin-lider';
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

    return distribucion;
  }

  private normalizarLugar(lugar: string | null | undefined): string {
    if (!lugar || lugar.trim() === '') {
      return 'Sin asignar';
    }
    return lugar.trim();
  }

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
    
    const lugarConMas = lugaresConDatos[0]; // Ya está ordenado descendente
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
```

## Correctness Properties


*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Distribution completeness
*For any* list of people, when grouped by voting location, the sum of all cantidadTotal values across all locations should equal the total number of people.
**Validates: Requirements 2.1, 2.5**

### Property 2: Leader breakdown completeness
*For any* voting location in the distribution, the sum of all cantidad values in desgloseLideres should equal the cantidadTotal for that location.
**Validates: Requirements 3.5**

### Property 3: Unassigned location categorization
*For any* person with an empty, null, or whitespace-only lugarVotacion field, that person should be included in the "Sin asignar" category when grouping by voting location.
**Validates: Requirements 1.2**

### Property 4: Unassigned leader categorization
*For any* person with an empty or null liderAsignado field, that person should be included under "Sin líder" in the desgloseLideres for their voting location.
**Validates: Requirements 3.4**

### Property 5: Distribution sorting
*For any* distribution of people by voting location, the results should be ordered by cantidadTotal in descending order (highest to lowest).
**Validates: Requirements 1.3**

### Property 6: Leader breakdown sorting
*For any* voting location's desgloseLideres, the leaders should be ordered by cantidad in descending order (highest to lowest).
**Validates: Requirements 3.3**

### Property 7: Percentage calculation accuracy
*For any* distribution item, the percentage should equal (item.cantidadTotal / totalPersonas) * 100, calculated to at least 2 decimal places.
**Validates: Requirements 4.5**

### Property 8: Percentage formatting
*For any* percentage value in the distribution, when formatted as a string, it should match the pattern /^\d+\.\d{2}%$/ (number with exactly 2 decimals followed by %).
**Validates: Requirements 4.6**

### Property 9: Total row invariant
*For any* distribution table, the sum of all cantidadTotal values should equal the total shown in the total row, and the sum of all percentages should equal 100% (within 0.01% tolerance for rounding).
**Validates: Requirements 4.7**

### Property 10: Filter application correctness
*For any* leader ID filter applied, all people in the resulting distribution should have their liderAsignado field equal to the filter ID, and no people assigned to that leader should be excluded.
**Validates: Requirements 7.3, 7.4**

### Property 11: Bar chart data completeness
*For any* distribution, the bar chart data should include exactly one data point for each location in the distribution, including "Sin asignar" if present.
**Validates: Requirements 5.1, 5.3**

### Property 12: Pie chart data completeness
*For any* distribution, the pie chart data should include exactly one segment for each location in the distribution, with labels containing both the location name and percentage.
**Validates: Requirements 6.1, 6.4**

### Property 13: Tooltip desglose completeness
*For any* chart tooltip for a voting location, the tooltip should include the desglose of all leaders that have people in that location, matching the desgloseLideres data.
**Validates: Requirements 5.5, 6.5**

### Property 14: Excel export structure
*For any* exported Excel file, it should contain columns named "Lugar de Votación", "Total Personas", "Desglose por Líder", and "Porcentaje", and the number of data rows should equal the number of items in the distribution plus one total row.
**Validates: Requirements 11.2, 11.3**

### Property 15: Excel filename format without filter
*For any* exported Excel file when no leader filter is applied, the filename should match the pattern /^reporte_lugares_todos_\d{8}_\d{6}\.xlsx$/.
**Validates: Requirements 11.4**

### Property 16: Excel filename format with filter
*For any* exported Excel file when a leader filter is applied, the filename should match the pattern /^reporte_lugares_.+_\d{8}_\d{6}\.xlsx$/ and include the leader's name.
**Validates: Requirements 11.5**

### Property 17: Excel total row inclusion
*For any* exported Excel file, the last row should contain the total count equal to the sum of all individual location counts, and a percentage of 100.00%.
**Validates: Requirements 11.6**

### Property 18: Image export format
*For any* exported chart image, the file should be in PNG format (MIME type image/png).
**Validates: Requirements 11.8**

### Property 19: Unique location count
*For any* distribution, the count of unique voting locations should equal the number of distinct non-empty lugarVotacion values plus one if any person has an empty/null lugarVotacion.
**Validates: Requirements 12.1**

### Property 20: Maximum location identification
*For any* distribution with at least one location, the location with the highest cantidadTotal should be correctly identified as the location with the most people.
**Validates: Requirements 12.2**

### Property 21: Minimum location identification
*For any* distribution with at least one location, the location with the lowest cantidadTotal (excluding zero) should be correctly identified as the location with the fewest people.
**Validates: Requirements 12.3**

### Property 22: Average calculation
*For any* distribution, the average people per location should equal the total number of people divided by the number of unique locations.
**Validates: Requirements 12.4**

### Property 23: Unassigned percentage calculation
*For any* distribution, the percentage without assigned voting location should equal the porcentaje value of the "Sin asignar" location if it exists, or 0 if it doesn't.
**Validates: Requirements 12.5**

### Property 24: Filter recalculation correctness
*For any* leader filter applied, the estadisticas should be recalculated based only on the filtered distribution, not the original full dataset.
**Validates: Requirements 12.6**

## Error Handling

### Client-Side Error Handling

**Network Errors**:
```typescript
private handleNetworkError(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión.';
  }
  if (error.status === 404) {
    return 'No se encontraron datos.';
  }
  if (error.status >= 500) {
    return 'Error del servidor. Intenta nuevamente más tarde.';
  }
  return 'Error al cargar los datos. Intenta nuevamente.';
}
```

**Data Validation Errors**:
```typescript
private validateDistribucion(distribucion: DistribucionLugar[]): void {
  if (!Array.isArray(distribucion)) {
    throw new Error('Formato de datos inválido');
  }
  
  // Validate leader breakdown sums match total
  distribucion.forEach(item => {
    const sumaDesglose = item.desgloseLideres.reduce((sum, d) => sum + d.cantidad, 0);
    if (sumaDesglose !== item.cantidadTotal) {
      console.warn(`Inconsistencia en ${item.lugar}: desglose=${sumaDesglose}, total=${item.cantidadTotal}`);
    }
  });
  
  const totalPercentage = distribucion.reduce((sum, item) => sum + item.porcentaje, 0);
  if (Math.abs(totalPercentage - 100) > 0.1) {
    console.warn('Los porcentajes no suman 100%:', totalPercentage);
  }
}
```

**Empty State Handling**:
```typescript
private handleEmptyData(filtroLiderId?: string | null): void {
  this.distribucion = [];
  this.estadisticas = {
    totalPersonas: 0,
    totalLugares: 0,
    lugarConMasPersonas: null,
    lugarConMenosPersonas: null,
    promedioPersonasPorLugar: 0,
    porcentajeSinAsignar: 0
  };
  
  if (filtroLiderId) {
    const lider = this.lideres.find(l => l.id === filtroLiderId);
    this.mensajeVacio = `El líder ${lider?.nombre || ''} no tiene personas asignadas`;
  } else {
    this.mensajeVacio = 'No hay datos para mostrar';
  }
}
```


## Testing Strategy

### Unit Testing

**Service Layer Tests**:
- Test `calcularDistribucionPorLugar()` with various person arrays and filters
- Test `calcularEstadisticas()` with different distributions
- Test edge cases: empty arrays, all "Sin asignar", all "Sin líder", single location
- Test percentage calculations for accuracy
- Test sorting logic for distributions and leader breakdowns
- Test leader breakdown sum matches total

**Component Tests**:
- Test component initialization and lifecycle
- Test event emission from child components
- Test data binding and template rendering
- Test error state rendering
- Test loading state rendering
- Test filter application and visualization updates

**Example Unit Tests**:
```typescript
describe('ReporteVisualService', () => {
  describe('calcularDistribucionPorLugar', () => {
    it('should group people by voting location with leader breakdown', () => {
      const personas: Persona[] = [
        { id: '1', nombre: 'Juan', lugarVotacion: 'Colegio A', liderAsignado: 'L1', liderNombre: 'Líder 1' },
        { id: '2', nombre: 'Maria', lugarVotacion: 'Colegio A', liderAsignado: 'L1', liderNombre: 'Líder 1' },
        { id: '3', nombre: 'Pedro', lugarVotacion: 'Colegio A', liderAsignado: 'L2', liderNombre: 'Líder 2' },
        { id: '4', nombre: 'Ana', lugarVotacion: 'Colegio B', liderAsignado: 'L1', liderNombre: 'Líder 1' }
      ];
      
      const result = service.calcularDistribucionPorLugar(personas);
      
      expect(result).toHaveLength(2);
      expect(result[0].lugar).toBe('Colegio A');
      expect(result[0].cantidadTotal).toBe(3);
      expect(result[0].desgloseLideres).toHaveLength(2);
      expect(result[0].desgloseLideres[0].liderNombre).toBe('Líder 1');
      expect(result[0].desgloseLideres[0].cantidad).toBe(2);
    });

    it('should categorize people without location as "Sin asignar"', () => {
      const personas: Persona[] = [
        { id: '1', nombre: 'Juan', lugarVotacion: '', liderAsignado: 'L1', liderNombre: 'Líder 1' },
        { id: '2', nombre: 'Maria', lugarVotacion: null, liderAsignado: 'L1', liderNombre: 'Líder 1' }
      ];
      
      const result = service.calcularDistribucionPorLugar(personas);
      
      expect(result).toHaveLength(1);
      expect(result[0].lugar).toBe('Sin asignar');
      expect(result[0].cantidadTotal).toBe(2);
    });

    it('should categorize people without leader as "Sin líder"', () => {
      const personas: Persona[] = [
        { id: '1', nombre: 'Juan', lugarVotacion: 'Colegio A', liderAsignado: null },
        { id: '2', nombre: 'Maria', lugarVotacion: 'Colegio A', liderAsignado: '' }
      ];
      
      const result = service.calcularDistribucionPorLugar(personas);
      
      expect(result[0].desgloseLideres).toHaveLength(1);
      expect(result[0].desgloseLideres[0].liderNombre).toBe('Sin líder');
      expect(result[0].desgloseLideres[0].cantidad).toBe(2);
    });

    it('should filter by leader when filtroLiderId is provided', () => {
      const personas: Persona[] = [
        { id: '1', nombre: 'Juan', lugarVotacion: 'Colegio A', liderAsignado: 'L1', liderNombre: 'Líder 1' },
        { id: '2', nombre: 'Maria', lugarVotacion: 'Colegio A', liderAsignado: 'L2', liderNombre: 'Líder 2' },
        { id: '3', nombre: 'Pedro', lugarVotacion: 'Colegio B', liderAsignado: 'L1', liderNombre: 'Líder 1' }
      ];
      
      const result = service.calcularDistribucionPorLugar(personas, 'L1');
      
      expect(result).toHaveLength(2);
      expect(result.every(d => d.desgloseLideres.every(l => l.liderId === 'L1'))).toBe(true);
    });
  });
});
```

### Property-Based Testing

We will use **fast-check** (for TypeScript/JavaScript) as our property-based testing library. Each property test should run a minimum of 100 iterations.

**Generator Functions**:
```typescript
// Generator for random Persona
const personaArbitrary = fc.record({
  id: fc.uuid(),
  nombre: fc.string({ minLength: 3, maxLength: 50 }),
  cedula: fc.string({ minLength: 6, maxLength: 15 }),
  celular: fc.string({ minLength: 10, maxLength: 15 }),
  correo: fc.emailAddress(),
  direccion: fc.string(),
  mesa: fc.string(),
  lugarVotacion: fc.option(fc.string(), { nil: null }),
  liderAsignado: fc.option(fc.uuid(), { nil: null }),
  liderNombre: fc.option(fc.string({ minLength: 3, maxLength: 50 }), { nil: null })
});

// Generator for array of Personas
const personasArrayArbitrary = fc.array(personaArbitrary, { minLength: 0, maxLength: 100 });
```

**Property Test Examples**:
```typescript
describe('ReporteVisualService - Property Tests', () => {
  it('Property 1: Distribution completeness - sum equals total', () => {
    fc.assert(
      fc.property(personasArrayArbitrary, (personas) => {
        const distribucion = service.calcularDistribucionPorLugar(personas);
        const sumaCantidades = distribucion.reduce((sum, item) => sum + item.cantidadTotal, 0);
        return sumaCantidades === personas.length;
      }),
      { numRuns: 100 }
    );
  });

  it('Property 2: Leader breakdown completeness - desglose sums match total', () => {
    fc.assert(
      fc.property(personasArrayArbitrary, (personas) => {
        fc.pre(personas.length > 0);
        
        const distribucion = service.calcularDistribucionPorLugar(personas);
        
        return distribucion.every(item => {
          const sumaDesglose = item.desgloseLideres.reduce((sum, d) => sum + d.cantidad, 0);
          return sumaDesglose === item.cantidadTotal;
        });
      }),
      { numRuns: 100 }
    );
  });

  it('Property 7: Percentage calculation accuracy', () => {
    fc.assert(
      fc.property(personasArrayArbitrary, (personas) => {
        fc.pre(personas.length > 0);
        
        const distribucion = service.calcularDistribucionPorLugar(personas);
        const total = personas.length;
        
        return distribucion.every(item => {
          const expectedPercentage = (item.cantidadTotal / total) * 100;
          return Math.abs(item.porcentaje - expectedPercentage) < 0.01;
        });
      }),
      { numRuns: 100 }
    );
  });

  it('Property 9: Total row invariant - percentages sum to 100', () => {
    fc.assert(
      fc.property(personasArrayArbitrary, (personas) => {
        fc.pre(personas.length > 0);
        
        const distribucion = service.calcularDistribucionPorLugar(personas);
        const sumaPercentajes = distribucion.reduce((sum, item) => sum + item.porcentaje, 0);
        
        return Math.abs(sumaPercentajes - 100) < 0.01;
      }),
      { numRuns: 100 }
    );
  });

  it('Property 10: Filter application correctness', () => {
    fc.assert(
      fc.property(personasArrayArbitrary, fc.uuid(), (personas, filtroLiderId) => {
        const distribucion = service.calcularDistribucionPorLugar(personas, filtroLiderId);
        
        // All people in distribution should belong to the filtered leader
        return distribucion.every(lugar => 
          lugar.desgloseLideres.every(desglose => 
            desglose.liderId === filtroLiderId || desglose.liderId === 'sin-lider'
          )
        );
      }),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**End-to-End Flow Tests**:
- Test complete user flow: load data → view all locations → apply leader filter → export data
- Test filter switching and data updates
- Test error scenarios with mocked API failures
- Test responsive behavior on different screen sizes

**API Integration Tests**:
- Test actual API calls with test data
- Verify response format matches expected interfaces
- Test error handling with various HTTP error codes

### Test Coverage Goals

- Unit test coverage: > 80% for service layer
- Property test coverage: All 24 correctness properties implemented
- Integration test coverage: All critical user flows
- Component test coverage: > 70% for presentation components

## Implementation Notes

### Chart.js Configuration

**Installation**:
```bash
npm install chart.js ng2-charts --save
```

**Module Import**:
```typescript
import { NgChartsModule } from 'ng2-charts';

@Component({
  imports: [CommonModule, FormsModule, NgChartsModule]
})
```

### Color Palette

**Primary Colors** (matching partido conservador brand):
- Primary Blue: #003DA5
- Gold: #FFD700
- White: #FFFFFF

**Chart Colors** (for multiple data series):
```typescript
private readonly CHART_COLORS = [
  '#003DA5', // Primary blue
  '#FFD700', // Gold
  '#4A90E2', // Light blue
  '#F5A623', // Orange
  '#7ED321', // Green
  '#BD10E0', // Purple
  '#50E3C2', // Teal
  '#FF6B6B', // Red
];

generarColores(cantidad: number): string[] {
  return Array.from({ length: cantidad }, (_, i) => 
    this.CHART_COLORS[i % this.CHART_COLORS.length]
  );
}
```

### Performance Optimization

**Lazy Loading**:
```typescript
// In app.routes.ts
{
  path: 'reporte-visual',
  loadComponent: () => import('./components/reporte-visual/reporte-visual.component')
    .then(m => m.ReporteVisualComponent)
}
```

**Change Detection Strategy**:
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GraficaBarrasComponent {
  // Use OnPush for better performance with large datasets
}
```

**Memoization for Calculations**:
```typescript
private distribucionCache = new Map<string, DistribucionLugar[]>();

calcularDistribucionPorLugar(personas: Persona[], filtroLiderId?: string | null): DistribucionLugar[] {
  const cacheKey = `${JSON.stringify(personas.map(p => p.id).sort())}_${filtroLiderId || 'all'}`;
  
  if (this.distribucionCache.has(cacheKey)) {
    return this.distribucionCache.get(cacheKey)!;
  }
  
  const distribucion = this.calcularDistribucion(personas, filtroLiderId);
  this.distribucionCache.set(cacheKey, distribucion);
  
  return distribucion;
}
```

### Accessibility Considerations

**ARIA Labels**:
```html
<select 
  id="lider-select"
  aria-label="Filtrar por líder para visualizar reporte"
  [(ngModel)]="filtroLiderId">
</select>

<canvas 
  aria-label="Gráfica de barras mostrando distribución de personas por lugar de votación con desglose de líderes">
</canvas>
```

**Keyboard Navigation**:
- Ensure all interactive elements are keyboard accessible
- Provide focus indicators for all focusable elements
- Support Tab navigation through all controls

**Screen Reader Support**:
- Provide text alternatives for charts
- Include summary statistics in accessible format
- Announce dynamic content changes

### Responsive Design Breakpoints

```scss
// Mobile
@media (max-width: 767px) {
  .graficas-container {
    flex-direction: column;
  }
  
  .grafica-barras, .grafica-pastel {
    width: 100%;
    height: 300px;
  }
  
  .desglose-lideres {
    flex-direction: column;
    font-size: 0.85rem;
  }
}

// Tablet
@media (min-width: 768px) and (max-width: 1023px) {
  .graficas-container {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .grafica-barras, .grafica-pastel {
    height: 400px;
  }
}

// Desktop
@media (min-width: 1024px) {
  .graficas-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }
  
  .grafica-barras, .grafica-pastel {
    height: 500px;
  }
}
```

### ExcelJS Configuration for Export

**Installation**:
```bash
npm install exceljs --save
```

**Export Implementation**:
```typescript
async exportarTablaExcel(
  distribucion: DistribucionLugar[],
  filtroLider?: string | null
): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Distribución por Lugar');

  // Add headers
  worksheet.columns = [
    { header: 'Lugar de Votación', key: 'lugar', width: 30 },
    { header: 'Total Personas', key: 'total', width: 15 },
    { header: 'Desglose por Líder', key: 'desglose', width: 40 },
    { header: 'Porcentaje', key: 'porcentaje', width: 12 }
  ];

  // Add data rows
  distribucion.forEach(item => {
    const desgloseText = item.desgloseLideres
      .map(d => `${d.liderNombre}: ${d.cantidad}`)
      .join(', ');
    
    worksheet.addRow({
      lugar: item.lugar,
      total: item.cantidadTotal,
      desglose: desgloseText,
      porcentaje: `${item.porcentaje.toFixed(2)}%`
    });
  });

  // Add total row
  const totalPersonas = distribucion.reduce((sum, d) => sum + d.cantidadTotal, 0);
  const totalRow = worksheet.addRow({
    lugar: 'TOTAL',
    total: totalPersonas,
    desglose: '',
    porcentaje: '100.00%'
  });
  totalRow.font = { bold: true };

  // Style headers
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF003DA5' }
  };
  worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

  // Generate buffer and create blob
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
}
```
