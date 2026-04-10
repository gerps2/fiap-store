import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="topbar">
      <h1 class="brand">FIAP Store</h1>
      <nav class="menu">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
        <a routerLink="/produtos" routerLinkActive="active">Produtos</a>
        <a routerLink="/carrinho" routerLinkActive="active">Carrinho</a>
        <a routerLink="/checkout" routerLinkActive="active">Checkout</a>
      </nav>
    </header>

    <main class="shell">
      <router-outlet />
    </main>
  `,
  styles: [`
    :host {
      display: block;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      color: #1a1a1a;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      border-bottom: 2px solid #ed145b;
      background: #fff;
    }

    .brand {
      margin: 0;
      font-size: 20px;
      color: #ed145b;
      letter-spacing: 0.5px;
    }

    .menu {
      display: flex;
      gap: 16px;
    }

    .menu a {
      text-decoration: none;
      color: #333;
      padding: 6px 12px;
      border-radius: 6px;
      font-weight: 500;
    }

    .menu a.active {
      background: #ed145b;
      color: #fff;
    }

    .shell {
      padding: 24px;
      max-width: 960px;
      margin: 0 auto;
    }
  `]
})
export class App {}
