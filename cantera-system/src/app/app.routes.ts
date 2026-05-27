import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio';
import { Catalogo } from './pages/catalogo/catalogo';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: InicioComponent },
  { path: 'catalogo', component: Catalogo },
];
