import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DistribucionLugar } from '../../models/reporte-visual.models';

@Component({
  selector: 'app-tabla-distribucion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla-distribucion.component.html',
  styleUrl: './tabla-distribucion.component.scss'
})
export class TablaDistribucionComponent {
  @Input() distribucion: DistribucionLugar[] = [];
  @Input() cargando: boolean = false;
  @Output() verPersonasPorLugar = new EventEmitter<string>();
  @Output() descargarPersonasPorLugar = new EventEmitter<string>();

  calcularTotal(): number {
    return this.distribucion.reduce((sum, item) => sum + item.cantidadTotal, 0);
  }

  onVerPersonas(lugar: string): void {
    this.verPersonasPorLugar.emit(lugar);
  }

  onDescargarPersonas(event: Event, lugar: string): void {
    event.stopPropagation(); // Evitar que se dispare el evento de ver personas
    this.descargarPersonasPorLugar.emit(lugar);
  }
}
