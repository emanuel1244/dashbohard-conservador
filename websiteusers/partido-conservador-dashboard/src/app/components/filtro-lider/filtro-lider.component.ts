import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Lider } from '../../models/reporte-visual.models';

@Component({
  selector: 'app-filtro-lider',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtro-lider.component.html',
  styleUrl: './filtro-lider.component.scss'
})
export class FiltroLiderComponent implements OnChanges {
  @Input() lideres: Lider[] = [];
  @Input() liderSeleccionado: string | null = null;
  @Output() liderSeleccionadoChange = new EventEmitter<string | null>();

  liderSeleccionadoId: string = '';

  ngOnChanges() {
    this.liderSeleccionadoId = this.liderSeleccionado || '';
  }

  onSeleccionChange(): void {
    console.log('🔄 Filtro cambiado:', this.liderSeleccionadoId);
    const valor = this.liderSeleccionadoId === '' ? null : this.liderSeleccionadoId;
    console.log('📤 Emitiendo valor:', valor);
    this.liderSeleccionadoChange.emit(valor);
  }
}
