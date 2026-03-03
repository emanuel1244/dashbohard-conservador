import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Estadisticas } from '../../models/reporte-visual.models';

@Component({
  selector: 'app-estadisticas-generales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadisticas-generales.component.html',
  styleUrl: './estadisticas-generales.component.scss'
})
export class EstadisticasGeneralesComponent {
  @Input() estadisticas!: Estadisticas;
  @Output() exportarPersonas = new EventEmitter<void>();

  onExportarPersonas(): void {
    this.exportarPersonas.emit();
  }
}
