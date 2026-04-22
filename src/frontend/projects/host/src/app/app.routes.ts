import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'auth/signup',
    loadComponent: () => import('./auth/signup.page').then((m) => m.SignupPage),
  },
  {
    path: '',
    pathMatch: 'full',
    canMatch: [authGuard],
    loadComponent: () => import('./pages/produtos/produtos.page').then((m) => m.ProdutosPage),
  },
  {
    path: 'checkout',
    canMatch: [authGuard],
    loadComponent: () => import('./pages/checkout/checkout.page').then((m) => m.CheckoutPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
