import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  cedula: string = '';
  password: string = '';
  cargando: boolean = false;
  error: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Si ya está autenticado, redirigir al panel
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/lider-panel']);
    }
  }

  login() {
    if (!this.cedula || !this.password) {
      this.error = 'Por favor ingresa tu cédula y contraseña';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.authService.login(this.cedula, this.password).subscribe({
      next: (response) => {
        this.cargando = false;
        if (response.success) {
          this.router.navigate(['/lider-panel']);
        }
      },
      error: (error) => {
        this.cargando = false;
        this.error = error.error?.error || 'Error al iniciar sesión. Verifica tus credenciales.';
      }
    });
  }

  volverAlDashboard() {
    this.router.navigate(['/']);
  }
}
