import { Component, DOCUMENT, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UiButtonComponent, UiRemoteOutletComponent, UserContextService } from '@fiap/shared';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, UiButtonComponent, UiRemoteOutletComponent],
  template: `
    <header class="topbar">
      <h1 class="brand">FIAP Store · v1.1</h1>
      <nav class="menu">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
        <a routerLink="/produtos" routerLinkActive="active">Produtos</a>
        <a routerLink="/carrinho" routerLinkActive="active">Carrinho</a>
        <a routerLink="/checkout" routerLinkActive="active">Checkout</a>
        <a routerLink="/notificacoes" routerLinkActive="active">Notificações</a>
      </nav>
      <div class="acoes">
        <ui-button variant="ghost" size="sm" (click)="alternarTema()">Tema: {{ tema() }}</ui-button>
        <ui-remote-outlet remote="mfe-notificacoes" exposed="./Sino" [compact]="true" />
        @if (ctx.user(); as usuario) {
          <span class="usuario">{{ usuario.email }}</span>
          <ui-button variant="secondary" size="sm" (click)="sair()">Sair</ui-button>
        } @else {
          <a routerLink="/auth/login" class="entrar">Entrar</a>
        }
      </div>
    </header>

    <main class="shell">
      <router-outlet />
    </main>
  `,
  styles: [`
    :host { display: block; font-family: var(--fiap-font-family); color: var(--fiap-color-text); }
    .topbar { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 2px solid var(--fiap-color-brand); background: var(--fiap-color-surface); }
    .brand { margin: 0; font-size: 20px; color: var(--fiap-color-brand); letter-spacing: 0.5px; }
    .menu { display: flex; gap: 16px; }
    .menu a { text-decoration: none; color: var(--fiap-color-text); padding: 6px 12px; border-radius: 6px; font-weight: 500; }
    .menu a.active { background: var(--fiap-color-brand); color: var(--fiap-color-on-brand); }
    .acoes { display: flex; align-items: center; gap: 12px; }
    .usuario { color: var(--fiap-color-muted); font-size: var(--fiap-font-size-sm); }
    .entrar { color: var(--fiap-color-brand); font-weight: 600; text-decoration: none; }
    .shell { padding: 24px; max-width: 960px; margin: 0 auto; }
  `]
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly auth = inject(AuthService);
  protected readonly ctx = inject(UserContextService);
  protected readonly tema = signal<'light' | 'dark'>('light');

  protected alternarTema(): void {
    const novo = this.tema() === 'light' ? 'dark' : 'light';
    this.tema.set(novo);
    this.document.documentElement.setAttribute('data-theme', novo);
  }

  protected async sair(): Promise<void> {
    await this.auth.logout();
  }
}
