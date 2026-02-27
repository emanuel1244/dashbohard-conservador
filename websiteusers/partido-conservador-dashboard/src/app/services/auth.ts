import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

interface Lider {
  id: string;
  nombre: string;
  cedula: string;
  celular: string;
  correo: string;
  zona: string;
  personasAsignadas: number;
}

interface LoginResponse {
  success: boolean;
  token: string;
  lider: Lider;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api';
  private liderActualSubject = new BehaviorSubject<Lider | null>(null);
  public liderActual$ = this.liderActualSubject.asObservable();

  constructor(private http: HttpClient) {
    this.verificarSesion();
  }

  login(cedula: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
      cedula,
      password
    }).pipe(
      tap(response => {
        if (response.success) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('lider', JSON.stringify(response.lider));
          this.liderActualSubject.next(response.lider);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('lider');
    this.liderActualSubject.next(null);
  }

  verificarSesion() {
    const token = localStorage.getItem('token');
    const liderStr = localStorage.getItem('lider');
    
    if (token && liderStr) {
      try {
        const lider = JSON.parse(liderStr);
        this.liderActualSubject.next(lider);
      } catch (error) {
        this.logout();
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getLiderActual(): Lider | null {
    return this.liderActualSubject.value;
  }

  getMisPersonas(): Observable<any[]> {
    const token = this.getToken();
    return this.http.get<any[]>(`${this.apiUrl}/auth/mis-personas`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
}
