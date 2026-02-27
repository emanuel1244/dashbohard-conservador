import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth';

interface Persona {
  id: string;
  nombre: string;
  cedula: string;
  celular: string;
  correo: string;
  direccion: string;
  mesa: string;
  lugarVotacion: string;
  zona?: string;
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

@Component({
  selector: 'app-lider-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './lider-panel.html',
  styleUrls: ['./lider-panel.scss']
})
export class LiderPanelComponent implements OnInit {
  private apiUrl = 'https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api';
  
  lider: Lider | null = null;
  personas: Persona[] = [];
  personasFiltradas: Persona[] = [];
  busqueda: string = '';
  filtroEstado: string = '';
  filtroCompromiso: string = '';
  
  // Modal editar persona
  mostrarModalPersona = false;
  personaEditando: Persona | null = null;
  personaForm: Partial<Persona> = {};
  
  // Modal editar perfil
  mostrarModalPerfil = false;
  perfilForm: Partial<Lider> = {};
  
  // Estadísticas
  estadisticas = {
    total: 0,
    activos: 0,
    inactivos: 0,
    potenciales: 0,
    altoCompromiso: 0,
    medioCompromiso: 0,
    bajoCompromiso: 0
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.lider = this.authService.getLiderActual();
    this.cargarMisPersonas();
  }

  cargarMisPersonas() {
    this.authService.getMisPersonas().subscribe({
      next: (data) => {
        this.personas = data;
        this.personasFiltradas = data;
        this.calcularEstadisticas();
      },
      error: (error) => {
        console.error('Error cargando personas:', error);
      }
    });
  }

  calcularEstadisticas() {
    this.estadisticas = {
      total: this.personas.length,
      activos: this.personas.filter(p => (p.estado || 'Activo') === 'Activo').length,
      inactivos: this.personas.filter(p => p.estado === 'Inactivo').length,
      potenciales: this.personas.filter(p => p.estado === 'Potencial').length,
      altoCompromiso: this.personas.filter(p => (p.nivelCompromiso || 'Medio') === 'Alto').length,
      medioCompromiso: this.personas.filter(p => (p.nivelCompromiso || 'Medio') === 'Medio').length,
      bajoCompromiso: this.personas.filter(p => p.nivelCompromiso === 'Bajo').length
    };
  }

  filtrarPersonas() {
    let resultado = [...this.personas];
    
    if (this.busqueda) {
      const termino = this.busqueda.toLowerCase();
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(termino) ||
        p.cedula.includes(termino) ||
        p.celular?.includes(termino)
      );
    }
    
    if (this.filtroEstado) {
      resultado = resultado.filter(p => (p.estado || 'Activo') === this.filtroEstado);
    }
    
    if (this.filtroCompromiso) {
      resultado = resultado.filter(p => (p.nivelCompromiso || 'Medio') === this.filtroCompromiso);
    }
    
    this.personasFiltradas = resultado;
  }

  limpiarFiltros() {
    this.busqueda = '';
    this.filtroEstado = '';
    this.filtroCompromiso = '';
    this.filtrarPersonas();
  }

  abrirModalPersona(persona: Persona) {
    this.mostrarModalPersona = true;
    this.personaEditando = persona;
    this.personaForm = { ...persona };
  }

  cerrarModalPersona() {
    this.mostrarModalPersona = false;
    this.personaEditando = null;
    this.personaForm = {};
  }

  guardarPersona() {
    if (!this.personaEditando) return;

    this.http.put(`${this.apiUrl}/personas/${this.personaEditando.id}`, this.personaForm)
      .subscribe({
        next: () => {
          this.cargarMisPersonas();
          this.cerrarModalPersona();
          alert('Persona actualizada exitosamente');
        },
        error: (error) => {
          console.error('Error:', error);
          alert('Error al actualizar persona');
        }
      });
  }

  abrirModalPerfil() {
    this.mostrarModalPerfil = true;
    this.perfilForm = { ...this.lider! };
  }

  cerrarModalPerfil() {
    this.mostrarModalPerfil = false;
    this.perfilForm = {};
  }

  guardarPerfil() {
    if (!this.lider) return;

    this.http.put(`${this.apiUrl}/lideres/${this.lider.id}`, this.perfilForm)
      .subscribe({
        next: () => {
          // Actualizar datos locales
          this.lider = { ...this.lider!, ...this.perfilForm as Lider };
          localStorage.setItem('lider', JSON.stringify(this.lider));
          this.cerrarModalPerfil();
          alert('Perfil actualizado exitosamente');
        },
        error: (error) => {
          console.error('Error:', error);
          alert('Error al actualizar perfil');
        }
      });
  }

  exportarMisPersonas() {
    const url = `${this.apiUrl}/export/personas?tipo=por-lider&liderId=${this.lider?.id}`;
    window.open(url, '_blank');
  }

  cerrarSesion() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
