import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { DistribucionLugar, Persona } from '../models/reporte-visual.models';

@Injectable({
  providedIn: 'root'
})
export class ExportacionReporteService {

  /**
   * Exportar tabla de distribución a Excel
   * @param distribucion Array de distribución por lugar
   * @param filtroLider Nombre del líder filtrado (opcional)
   */
  async exportarTablaExcel(
    distribucion: DistribucionLugar[],
    filtroLider?: string | null
  ): Promise<void> {
    if (!distribucion || distribucion.length === 0) {
      throw new Error('No hay datos para exportar');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Distribución por Lugar');

    // Configurar columnas
    worksheet.columns = [
      { header: 'Lugar de Votación', key: 'lugar', width: 30 },
      { header: 'Total Personas', key: 'total', width: 15 },
      { header: 'Desglose por Líder', key: 'desglose', width: 40 },
      { header: 'Porcentaje', key: 'porcentaje', width: 12 }
    ];

    // Agregar filas de datos
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

    // Agregar fila de totales
    const totalPersonas = distribucion.reduce((sum, d) => sum + d.cantidadTotal, 0);
    const totalRow = worksheet.addRow({
      lugar: 'TOTAL',
      total: totalPersonas,
      desglose: '',
      porcentaje: '100.00%'
    });
    totalRow.font = { bold: true };

    // Estilizar encabezados
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF003DA5' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'left' };

    // Generar nombre de archivo
    const fecha = new Date();
    const timestamp = fecha.toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '_');
    const nombreLider = filtroLider ? filtroLider.replace(/\s+/g, '_') : 'todos';
    const filename = `reporte_lugares_${nombreLider}_${timestamp}.xlsx`;

    // Generar y descargar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    saveAs(blob, filename);
  }

  /**
   * Exportar gráficas como imagen PNG
   * @param elementIds IDs de los elementos HTML a capturar
   */
  async exportarGraficasImagen(elementIds: string[]): Promise<void> {
    try {
      const html2canvas = (await import('html2canvas')).default;
      
      // Capturar cada elemento
      const captures: HTMLCanvasElement[] = [];
      for (const id of elementIds) {
        const element = document.getElementById(id);
        if (element) {
          const canvas = await html2canvas(element);
          captures.push(canvas);
        }
      }

      if (captures.length === 0) {
        throw new Error('No se encontraron elementos para capturar');
      }

      // Si hay múltiples capturas, combinarlas en una sola imagen
      const finalCanvas = document.createElement('canvas');
      const ctx = finalCanvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('No se pudo crear el contexto del canvas');
      }

      // Calcular dimensiones totales
      const totalHeight = captures.reduce((sum, canvas) => sum + canvas.height, 0);
      const maxWidth = Math.max(...captures.map(canvas => canvas.width));
      
      finalCanvas.width = maxWidth;
      finalCanvas.height = totalHeight;

      // Dibujar todas las capturas
      let currentY = 0;
      captures.forEach(canvas => {
        ctx.drawImage(canvas, 0, currentY);
        currentY += canvas.height;
      });

      // Convertir a blob y descargar
      finalCanvas.toBlob((blob) => {
        if (blob) {
          const fecha = new Date();
          const timestamp = fecha.toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '_');
          const filename = `graficas_reporte_${timestamp}.png`;
          saveAs(blob, filename);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error exportando gráficas:', error);
      throw new Error('Error al exportar las gráficas como imagen');
    }
  }

  /**
   * Exportar listado completo de personas a Excel
   * @param personas Array de personas a exportar
   * @param filtroLider Nombre del líder filtrado (opcional)
   */
  async exportarPersonasExcel(
    personas: Persona[],
    filtroLider?: string | null
  ): Promise<void> {
    if (!personas || personas.length === 0) {
      throw new Error('No hay personas para exportar');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Listado de Personas');

    // Configurar columnas
    worksheet.columns = [
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Cédula', key: 'cedula', width: 15 },
      { header: 'Celular', key: 'celular', width: 15 },
      { header: 'Correo', key: 'correo', width: 30 },
      { header: 'Lugar de Votación', key: 'lugarVotacion', width: 30 },
      { header: 'Mesa', key: 'mesa', width: 10 },
      { header: 'Dirección', key: 'direccion', width: 35 },
      { header: 'Zona', key: 'zona', width: 20 },
      { header: 'Líder Asignado', key: 'liderNombre', width: 25 },
      { header: 'Estado', key: 'estado', width: 12 },
      { header: 'Nivel Compromiso', key: 'nivelCompromiso', width: 18 }
    ];

    // Agregar filas de datos
    personas.forEach(persona => {
      worksheet.addRow({
        nombre: persona.nombre || '',
        cedula: persona.cedula || '',
        celular: persona.celular || '',
        correo: persona.correo || '',
        lugarVotacion: persona.lugarVotacion || '',
        mesa: persona.mesa || '',
        direccion: persona.direccion || '',
        zona: persona.zona || '',
        liderNombre: persona.liderNombre || 'Sin líder',
        estado: persona.estado || 'Activo',
        nivelCompromiso: persona.nivelCompromiso || 'Medio'
      });
    });

    // Estilizar encabezados
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF003DA5' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'left' };

    // Agregar filtros automáticos
    worksheet.autoFilter = {
      from: 'A1',
      to: 'K1'
    };

    // Generar nombre de archivo
    const fecha = new Date();
    const timestamp = fecha.toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '_');
    const nombreLider = filtroLider ? filtroLider.replace(/\s+/g, '_') : 'todos';
    const filename = `listado_personas_${nombreLider}_${timestamp}.xlsx`;

    // Generar y descargar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    saveAs(blob, filename);
  }
}
