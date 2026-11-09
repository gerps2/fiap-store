import { Component } from '@angular/core';
import { UiRemoteOutletComponent } from '@fiap/shared';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [UiRemoteOutletComponent],
  template: `
    <section class="home">
      <header class="hero">
        <h2>Bem-vindo a FIAP Store</h2>
        <p>Home composta por 3 microfrontends carregados em runtime.</p>
      </header>

      <div class="mfe-slot">
        <h3>Produtos em destaque</h3>
        <ui-remote-outlet remote="mfe-produtos" exposed="./Component">
          <ng-template #skeleton>
            <div class="skeleton"></div>
          </ng-template>
        </ui-remote-outlet>
      </div>

      <div class="mfe-slot">
        <h3>Seu carrinho</h3>
        <ui-remote-outlet remote="mfe-carrinho" exposed="./Component" />
      </div>

      <div class="mfe-slot">
        <h3>Checkout rapido</h3>
        <ui-remote-outlet remote="mfe-checkout" exposed="./Component" />
      </div>
    </section>
  `,
  styles: [`
    .home { display: flex; flex-direction: column; gap: 24px; }
    .hero { padding: 24px; border-radius: 12px; background: linear-gradient(135deg, var(--fiap-color-brand), #8a0c38); color: var(--fiap-color-on-brand); }
    .hero h2 { margin: 0 0 6px; }
    .hero p { margin: 0; opacity: 0.9; }
    .mfe-slot { border: 1px dashed var(--fiap-color-border); border-radius: 12px; padding: 16px; background: var(--fiap-color-surface-alt); }
    .mfe-slot h3 { margin: 0 0 12px; color: var(--fiap-color-muted); font-size: 14px; text-transform: uppercase; letter-spacing: 0.8px; }
    .skeleton { height: 120px; border-radius: 8px; background: var(--fiap-color-border); opacity: 0.6; }
  `]
})
export class Home {}
