import { Component, Input } from '@angular/core';
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

  calcularTotal(): number {
    return this.distribucion.reduce((sum, item) => sum + item.cantidadTotal, 0);
  }
}
