import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Routes } from '@angular/router';
import { NotificacoesConfigComponent } from '../../components/notificacoes-config/notificacoes-config.component';
import { NotificacoesListaComponent } from '../../components/notificacoes-lista/notificacoes-lista.component';

@Component({
  selector: 'mfe-notificacoes-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <section class="pagina">
      <h3>Central de notificações</h3>
      <nav>
        <a routerLink="lista" routerLinkActive="ativa">Lista</a>
        <a routerLink="configuracoes" routerLinkActive="ativa">Configurações</a>
      </nav>
      <router-outlet />
    </section>
  `,
  styles: [`
    .pagina { padding: 16px; border: 1px solid var(--fiap-color-border); border-radius: 8px; background: var(--fiap-color-surface); }
    h3 { margin: 0 0 12px; font-size: 16px; color: var(--fiap-color-text); }
    nav { display: flex; gap: 16px; margin-bottom: 12px; border-bottom: 1px solid var(--fiap-color-border); }
    nav a { padding: 8px 0; color: var(--fiap-color-muted); font-size: 14px; text-decoration: none; border-bottom: 2px solid transparent; }
    nav a.ativa { color: var(--fiap-color-brand); border-bottom-color: var(--fiap-color-brand); font-weight: 600; }
  `],
})
export class NotificacoesPageComponent {}

export const NOTIFICACOES_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'lista' },
  { path: 'lista', component: NotificacoesListaComponent },
  { path: 'configuracoes', component: NotificacoesConfigComponent },
];
