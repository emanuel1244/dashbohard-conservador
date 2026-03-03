import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { saveAs } from 'file-saver';

export interface ExportOptions {
  type: 'personas' | 'lideres';
  filters?: {
    liderId?: string;
    liderNombre?: string;
    zona?: string;
    mesa?: string;
    estado?: string;
    nivelCompromiso?: string;
    busqueda?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private readonly API_URL = 'https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api';

  constructor(private http: HttpClient) {}

  /**
   * Decode base64 string to Blob
   * @param base64 Base64 encoded string
   * @param mimeType MIME type for the Blob
   * @returns Blob object
   */
  private base64ToBlob(base64: string, mimeType: string): Blob {
    try {
      // Decode base64 to binary string
      const binaryString = atob(base64);
      
      // Convert binary string to byte array
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Create and return Blob
      return new Blob([bytes], { type: mimeType });
    } catch (error) {
      throw new Error('El archivo recibido está corrupto o no es válido');
    }
  }

  /**
   * Get MIME type for Excel
   */
  private getMimeType(): string {
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }

  /**
   * Extract filename from Content-Disposition header
   * @param headers HTTP headers
   * @returns Extracted filename or default
   */
  private extractFilename(headers: HttpHeaders, defaultName: string): string {
    const contentDisposition = headers.get('Content-Disposition');
    
    if (contentDisposition) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
      if (matches && matches[1]) {
        return matches[1].replace(/['"]/g, '');
      }
    }
    
    return defaultName;
  }

  /**
   * Build export URL with query parameters
   */
  buildExportUrl(options: ExportOptions): string {
    let url = `${this.API_URL}/export/excel?type=${options.type}`;

    if (options.filters && Object.keys(options.filters).length > 0) {
      url += `&filters=${encodeURIComponent(JSON.stringify(options.filters))}`;
    }

    return url;
  }

  /**
   * Export to Excel
   */
  exportToExcel(options: ExportOptions): Observable<Blob> {
    const url = this.buildExportUrl(options);
    
    return this.http.get(url, { 
      responseType: 'text',  // Receive base64 as text
      observe: 'response'
    }).pipe(
      map(response => {
        if (!response.body) {
          throw new Error('No se recibió el archivo');
        }
        
        // Decode base64 to Blob
        const mimeType = this.getMimeType();
        const blob = this.base64ToBlob(response.body, mimeType);
        
        // Extract filename
        const filename = this.extractFilename(response.headers, 'export.xlsx');
        
        // Download file
        this.downloadFile(blob, filename);
        
        return blob;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Download file using FileSaver
   */
  downloadFile(blob: Blob, filename: string): void {
    saveAs(blob, filename);
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error al generar el archivo. Intenta nuevamente.';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.message && error.message.includes('corrupto')) {
      // Base64 decoding error
      errorMessage = error.message;
    } else {
      // Server-side error
      if (error.status === 404) {
        errorMessage = 'No hay datos para exportar con los filtros seleccionados';
      } else if (error.status === 0) {
        errorMessage = 'No se pudo conectar con el servidor';
      } else if (error.status >= 500) {
        errorMessage = 'Error del servidor. Intenta nuevamente más tarde.';
      } else if (error.error && typeof error.error === 'string') {
        // Try to parse error message from text response
        try {
          const errorObj = JSON.parse(error.error);
          if (errorObj.error) {
            errorMessage = errorObj.error;
          }
        } catch (e) {
          // If not JSON, use the error text directly if it's meaningful
          if (error.error.length < 200) {
            errorMessage = error.error;
          }
        }
      }
    }

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Exportar personas a Excel
   */
  exportarPersonasExcel(filters?: ExportOptions['filters']): Observable<Blob> {
    return this.exportToExcel({
      type: 'personas',
      filters
    });
  }

  /**
   * Exportar líderes a Excel
   */
  exportarLideresExcel(): Observable<Blob> {
    return this.exportToExcel({
      type: 'lideres'
    });
  }

  /**
   * Exportar duplicados a Excel
   */
  exportarDuplicadosExcel(duplicados: any[]): Observable<Blob> {
    console.log('=== EXPORT SERVICE: exportarDuplicadosExcel ===');
    console.log('Duplicados recibidos:', duplicados.length);
    console.log('Datos:', duplicados);
    
    // Usar POST para enviar duplicados (evitar límite de URL)
    const url = `${this.API_URL}/export/excel`;
    
    return this.http.post(url, {
      type: 'duplicados',
      duplicados: duplicados
    }, { 
      responseType: 'text',
      observe: 'response'
    }).pipe(
      map(response => {
        if (!response.body) {
          throw new Error('No se recibió el archivo');
        }
        
        // Decode base64 to Blob
        const mimeType = this.getMimeType();
        const blob = this.base64ToBlob(response.body, mimeType);
        
        // Extract filename
        const filename = this.extractFilename(response.headers, 'duplicados.xlsx');
        
        // Download file
        this.downloadFile(blob, filename);
        
        return blob;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Exportar personas a Excel con nombre personalizado
   * Útil para exportar por mesa o institución específica
   */
  exportarPersonasExcelConNombre(personas: any[], nombreDescriptivo: string): Observable<Blob> {
    console.log('=== EXPORT SERVICE: exportarPersonasExcelConNombre ===');
    console.log('Personas a exportar:', personas.length);
    console.log('Nombre descriptivo:', nombreDescriptivo);
    
    // Usar POST para enviar personas directamente
    const url = `${this.API_URL}/export/excel`;
    
    // Generar nombre de archivo limpio
    const nombreArchivo = nombreDescriptivo
      .replace(/[^a-zA-Z0-9\s]/g, '') // Eliminar caracteres especiales
      .replace(/\s+/g, '_') // Reemplazar espacios por guiones bajos
      .toLowerCase();
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `personas_${nombreArchivo}_${timestamp}.xlsx`;
    
    return this.http.post(url, {
      type: 'personas-custom',
      personas: personas,
      filename: filename
    }, { 
      responseType: 'text',
      observe: 'response'
    }).pipe(
      map(response => {
        if (!response.body) {
          throw new Error('No se recibió el archivo');
        }
        
        // Decode base64 to Blob
        const mimeType = this.getMimeType();
        const blob = this.base64ToBlob(response.body, mimeType);
        
        // Download file
        this.downloadFile(blob, filename);
        
        return blob;
      }),
      catchError(this.handleError)
    );
  }
}
