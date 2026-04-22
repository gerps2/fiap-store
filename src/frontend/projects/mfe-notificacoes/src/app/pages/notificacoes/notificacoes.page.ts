import { ChangeDetectionStrategy, Component, HostBinding, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Routes } from '@angular/router';
import { NotificacoesService, Notificacao } from '../../services/notificacoes.service';
import { ToastService } from '../../services/toast.service';
import { NotificacoesListaComponent } from '../../components/notificacoes-lista/notificacoes-lista.component';
import { NotificacoesConfigComponent } from '../../components/notificacoes-config/notificacoes-config.component';

type Filtro = 'todas' | 'pedidos' | 'promocoes' | 'sistema';
type TipoNotificacao = 'pedido' | 'promo' | 'sistema';

interface NotificacaoVisual extends Notificacao {
  tipo: TipoNotificacao;
  descricao: string;
  tempo: string;
}

/** Página premium de notificações com filtros, timeline e demo de toasts. */
@Component({
  selector: 'mfe-notificacoes-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="fiap-container pagina">
      <header class="cabecalho">
        <span class="fiap-eyebrow">NOTIFICAÇÕES CENTER</span>
        <h1>Tudo que aconteceu por aqui</h1>
        <p class="subtexto">
          Acompanhe pedidos, promoções e avisos da FIAP Store em um só lugar — organizado,
          filtrável e em tempo real.
        </p>
      </header>

      <div class="tabs" role="tablist" aria-label="Filtrar notificações">
        @for (f of filtros; track f.id) {
          <button
            type="button"
            role="tab"
            class="fiap-chip"
            [class.ativo]="filtro() === f.id"
            [attr.aria-selected]="filtro() === f.id"
            (click)="filtro.set(f.id)"
          >
            {{ f.label }}
          </button>
        }
      </div>

      <section class="demo-toasts" aria-label="Disparar toast de exemplo">
        <h3>Teste o sistema de toasts</h3>
        <div class="demo-chips">
          <button type="button" class="fiap-chip" (click)="dispararSucesso()">Disparar sucesso</button>
          <button type="button" class="fiap-chip" (click)="dispararErro()">Disparar erro</button>
          <button type="button" class="fiap-chip" (click)="dispararAviso()">Disparar aviso</button>
          <button type="button" class="fiap-chip" (click)="dispararInfo()">Disparar info</button>
        </div>
      </section>

      <section class="lista-principal">
        @for (n of filtradas(); track n.id) {
          <article class="card" [class.nao-lida]="!n.lida">
            <div class="icone" [attr.data-tipo]="n.tipo" aria-hidden="true">
              @switch (n.tipo) {
                @case ('pedido') {
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                }
                @case ('promo') {
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8Z" />
                    <circle cx="7" cy="7" r="1.5" />
                  </svg>
                }
                @default {
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
                  </svg>
                }
              }
            </div>

            <div class="texto">
              <h2 class="titulo">{{ n.titulo }}</h2>
              <p class="descricao">{{ n.descricao }}</p>
              <span class="meta">{{ n.tempo }} · {{ rotulo(n.tipo) }}</span>
            </div>

            <button
              type="button"
              class="acao-menu"
              aria-label="Opções"
              (click)="servico.marcarComoLida(n.id)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
          </article>
        } @empty {
          <div class="vazio">Nenhuma notificação neste filtro.</div>
        }
      </section>

      <nav class="subnav" aria-label="Seções">
        <a routerLink="lista" routerLinkActive="ativo" class="subnav-link">Lista detalhada</a>
        <a routerLink="configuracoes" routerLinkActive="ativo" class="subnav-link">Configurações</a>
      </nav>

      <section class="subrota">
        <router-outlet />
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background: var(--fiap-surface);
      padding: var(--space-8) 0;
      font-family: var(--font-body);
      color: var(--fiap-dark);
      min-height: 100%;
    }

    .pagina { display: flex; flex-direction: column; gap: var(--space-8); }

    .cabecalho { display: flex; flex-direction: column; gap: var(--space-3); max-width: 720px; }
    .cabecalho h1 {
      font-family: var(--font-heading);
      font-weight: var(--weight-bold);
      font-size: 44px;
      line-height: 1.1;
      margin: 0;
      color: var(--fiap-dark);
      letter-spacing: -0.02em;
    }
    .subtexto {
      margin: 0;
      font-size: var(--text-base);
      color: var(--fiap-color-text-subtle);
      line-height: 1.55;
    }

    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }
    .tabs .fiap-chip.ativo {
      background: var(--fiap-dark);
      color: var(--fiap-white);
      border-color: var(--fiap-dark);
    }

    .demo-toasts {
      background: var(--fiap-white);
      border: 1px solid var(--fiap-color-border-subtle);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      box-shadow: var(--shadow-sm);
    }
    .demo-toasts h3 {
      margin: 0;
      font-family: var(--font-heading);
      font-weight: var(--weight-semibold);
      font-size: var(--text-base);
    }
    .demo-chips { display: flex; flex-wrap: wrap; gap: var(--space-2); }

    .lista-principal {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-3);
    }

    .card {
      display: grid;
      grid-template-columns: 48px 1fr auto;
      gap: var(--space-4);
      align-items: flex-start;
      background: var(--fiap-white);
      border: 1px solid var(--fiap-color-border-subtle);
      border-radius: var(--radius-lg);
      padding: var(--space-4) var(--space-5);
      box-shadow: var(--shadow-sm);
      transition: var(--transition-base);
    }
    .card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }
    .card.nao-lida { border-left: 4px solid var(--fiap-red); }

    .icone {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--fiap-white);
    }
    .icone[data-tipo="pedido"] { background: var(--fiap-red); }
    .icone[data-tipo="promo"] { background: var(--fiap-color-warning); }
    .icone[data-tipo="sistema"] {
      background: var(--fiap-surface);
      color: var(--fiap-dark);
      border: 1px solid var(--fiap-color-border);
    }

    .texto { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
    .titulo {
      margin: 0;
      font-family: var(--font-heading);
      font-weight: var(--weight-semibold);
      font-size: var(--text-base);
      color: var(--fiap-dark);
    }
    .descricao {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--fiap-color-text-subtle);
      line-height: 1.5;
    }
    .meta {
      font-size: var(--text-xs);
      color: var(--fiap-color-text-subtle);
      margin-top: var(--space-1);
    }

    .acao-menu {
      background: transparent;
      border: 1px solid transparent;
      color: var(--fiap-color-text-subtle);
      cursor: pointer;
      padding: var(--space-2);
      border-radius: var(--radius-sm);
      transition: var(--transition-base);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .acao-menu:hover {
      background: var(--fiap-surface);
      color: var(--fiap-dark);
      border-color: var(--fiap-color-border);
    }

    .vazio {
      padding: var(--space-8);
      text-align: center;
      color: var(--fiap-color-text-subtle);
      background: var(--fiap-white);
      border: 1px dashed var(--fiap-color-border);
      border-radius: var(--radius-lg);
    }

    .subnav {
      display: flex;
      gap: var(--space-5);
      border-bottom: 1px solid var(--fiap-color-border);
      padding-bottom: 0;
    }
    .subnav-link {
      padding: var(--space-3) 0;
      color: var(--fiap-color-text-subtle);
      text-decoration: none;
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      border-bottom: 2px solid transparent;
      transition: var(--transition-base);
    }
    .subnav-link:hover { color: var(--fiap-dark); }
    .subnav-link.ativo {
      color: var(--fiap-red);
      border-bottom-color: var(--fiap-red);
      font-weight: var(--weight-semibold);
    }

    .subrota { padding-top: var(--space-3); }
  `],
})
export default class NotificacoesPageComponent {
  @HostBinding('class.mfe-boundary') readonly isMfeBoundary = true;
  @HostBinding('attr.data-mfe') readonly dataMfe = 'mfe-notificacoes';

  protected readonly servico = inject(NotificacoesService);
  protected readonly toastSvc = inject(ToastService);

  protected readonly filtros = [
    { id: 'todas' as Filtro, label: 'Todas' },
    { id: 'pedidos' as Filtro, label: 'Pedidos' },
    { id: 'promocoes' as Filtro, label: 'Promoções' },
    { id: 'sistema' as Filtro, label: 'Sistema' },
  ];

  protected readonly filtro = signal<Filtro>('todas');

  protected readonly notificacoesVisuais = computed<NotificacaoVisual[]>(() => {
    return this.servico.itens().map((n, idx) => ({
      ...n,
      tipo: this.deduzirTipo(n, idx),
      descricao: this.deduzirDescricao(n, idx),
      tempo: ['agora', '5 min atrás', '1 h atrás', 'ontem'][idx % 4],
    }));
  });

  protected readonly filtradas = computed(() => {
    const f = this.filtro();
    const todas = this.notificacoesVisuais();
    if (f === 'todas') return todas;
    if (f === 'pedidos') return todas.filter((n) => n.tipo === 'pedido');
    if (f === 'promocoes') return todas.filter((n) => n.tipo === 'promo');
    return todas.filter((n) => n.tipo === 'sistema');
  });

  /** Retorna rótulo amigável por tipo. */
  protected rotulo(tipo: TipoNotificacao): string {
    if (tipo === 'pedido') return 'Pedido';
    if (tipo === 'promo') return 'Promoção';
    return 'Sistema';
  }

  /** Dispara toast de sucesso demo. */
  protected dispararSucesso(): void {
    this.toastSvc.sucesso('Tudo certo!', 'Operação concluída com sucesso.');
  }

  /** Dispara toast de erro demo. */
  protected dispararErro(): void {
    this.toastSvc.erro('Algo deu errado', 'Não foi possível concluir a ação.');
  }

  /** Dispara toast de aviso demo. */
  protected dispararAviso(): void {
    this.toastSvc.aviso('Atenção', 'Confira os detalhes antes de continuar.');
  }

  /** Dispara toast informativo demo. */
  protected dispararInfo(): void {
    this.toastSvc.info('Dica rápida', 'Você pode filtrar notificações pelas tabs acima.');
  }

  private deduzirTipo(n: Notificacao, idx: number): TipoNotificacao {
    const t = n.titulo.toLowerCase();
    if (t.includes('pedido')) return 'pedido';
    if (t.includes('promo') || t.includes('black')) return 'promo';
    if (t.includes('news') || t.includes('sistema')) return 'sistema';
    const fallback: TipoNotificacao[] = ['pedido', 'promo', 'sistema'];
    return fallback[idx % fallback.length];
  }

  private deduzirDescricao(n: Notificacao, idx: number): string {
    const descricoes = [
      'Acompanhe o status completo na sua área de pedidos.',
      'Ofertas selecionadas só para você — aproveite enquanto duram.',
      'Atualização importante sobre sua conta e preferências.',
    ];
    return descricoes[idx % descricoes.length];
  }
}

export const NOTIFICACOES_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'lista' },
  { path: 'lista', component: NotificacoesListaComponent },
  { path: 'configuracoes', component: NotificacoesConfigComponent },
];
