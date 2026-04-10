import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';

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
    path: '**',
    redirectTo: '',
  },
];
