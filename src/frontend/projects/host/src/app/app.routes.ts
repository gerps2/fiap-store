import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { adminGuard } from './auth/admin.guard';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home').then(m => m.Home),
  },
  {
    path: 'produtos',
    loadComponent: () =>
      loadRemoteModule({
        remoteName: 'mfe-produtos',
        exposedModule: './Component',
      }).then(m => m.ProdutosComponent),
  },
  {
    path: 'carrinho',
    loadComponent: () =>
      loadRemoteModule({
        remoteName: 'mfe-carrinho',
        exposedModule: './Component',
      }).then(m => m.CarrinhoComponent),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      loadRemoteModule({
        remoteName: 'mfe-checkout',
        exposedModule: './Component',
      }).then(m => m.CheckoutComponent),
  },
  {
    path: 'notificacoes',
    loadComponent: () =>
      loadRemoteModule({
        remoteName: 'mfe-notificacoes',
        exposedModule: './Pagina',
      }).then(m => m.NotificacoesPageComponent),
    loadChildren: () =>
      loadRemoteModule({
        remoteName: 'mfe-notificacoes',
        exposedModule: './Pagina',
      }).then(m => m.NOTIFICACOES_ROUTES),
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/auth.page').then(m => m.AuthPage),
  },
  {
    path: 'auth/signup',
    data: { cadastro: true },
    loadComponent: () => import('./auth/auth.page').then(m => m.AuthPage),
  },
  {
    path: 'admin/products/new',
    canMatch: [authGuard, adminGuard],
    loadComponent: () => import('./pages/admin/new-product.page').then(m => m.NewProductPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
