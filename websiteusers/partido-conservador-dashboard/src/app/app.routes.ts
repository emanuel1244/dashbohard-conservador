import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login';
import { LiderPanelComponent } from './components/lider-panel/lider-panel';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'lider-panel', component: LiderPanelComponent },
  { 
    path: 'reporte-visual', 
    loadComponent: () => import('./components/reporte-visual/reporte-visual.component')
      .then(m => m.ReporteVisualComponent)
  },
  { path: '**', redirectTo: '' }
];
