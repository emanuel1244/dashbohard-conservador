import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { DistribucionLugar } from '../../models/reporte-visual.models';

@Component({
  selector: 'app-grafica-barras',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './grafica-barras.component.html',
  styleUrl: './grafica-barras.component.scss'
})
export class GraficaBarrasComponent implements OnChanges {
  @Input() distribucion: DistribucionLugar[] = [];
  @Input() cargando: boolean = false;

  chartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  chartOptions: ChartOptions<'bar'> = {
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['distribucion']) {
      this.configurarGrafica();
    }
  }

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
  }

  private generarColores(cantidad: number): string[] {
    return Array.from({ length: cantidad }, (_, i) => 
      this.CHART_COLORS[i % this.CHART_COLORS.length]
    );
  }
}
