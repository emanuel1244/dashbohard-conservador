import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { DistribucionLugar } from '../../models/reporte-visual.models';

@Component({
  selector: 'app-grafica-pastel',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './grafica-pastel.component.html',
  styleUrl: './grafica-pastel.component.scss'
})
export class GraficaPastelComponent implements OnChanges {
  @Input() distribucion: DistribucionLugar[] = [];
  @Input() cargando: boolean = false;

  chartData: ChartData<'pie'> = {
    labels: [],
    datasets: []
  };

  chartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          generateLabels: (chart) => {
            const data = chart.data;
            if (!data.labels) return [];
            return data.labels.map((label, i) => ({
              text: `${label} (${this.distribucion[i]?.porcentaje.toFixed(2)}%)`,
              fillStyle: (data.datasets[0].backgroundColor as string[])[i],
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
        data: this.distribucion.map(d => d.cantidadTotal),
        backgroundColor: this.generarColoresPastel(this.distribucion.length),
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    };
  }

  private generarColoresPastel(cantidad: number): string[] {
    return Array.from({ length: cantidad }, (_, i) => 
      this.CHART_COLORS[i % this.CHART_COLORS.length]
    );
  }
}
