import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-acciones-exportacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './acciones-exportacion.component.html',
  styleUrl: './acciones-exportacion.component.scss'
})
export class AccionesExportacionComponent {
  @Input() habilitado: boolean = true;
  @Output() exportarExcel = new EventEmitter<void>();
  @Output() exportarImagen = new EventEmitter<void>();

  onExportarExcel(): void {
    if (this.habilitado) {
      this.exportarExcel.emit();
    }
  }

  onExportarImagen(): void {
    if (this.habilitado) {
      this.exportarImagen.emit();
    }
  }
}
