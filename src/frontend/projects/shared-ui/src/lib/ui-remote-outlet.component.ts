import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  ContentChild,
  DestroyRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  Type,
  ViewChild,
  ViewContainerRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { UiSpinnerComponent } from './ui-spinner.component';
import { UiEmptyStateComponent } from './ui-empty-state.component';
import { UiButtonComponent } from './ui-button.component';

/** Funcao que resolve e entrega o Type do Component a ser renderizado no slot. */
export type UiRemoteLoader = () => Promise<Type<unknown>>;

export interface UiRemoteRetryConfig {
  /** Numero maximo de tentativas automaticas antes de mostrar o erro. Default: 3. */
  readonly maxAttempts?: number;
  /** Delay base em ms para backoff exponencial. Default: 500. */
  readonly baseDelayMs?: number;
  /** URL do remoteEntry.json para health check em background. Opcional. */
  readonly healthCheckUrl?: string;
  /** Intervalo do health check em ms. Default: 5000. */
  readonly healthCheckIntervalMs?: number;
}

type State = 'idle' | 'loading' | 'success' | 'error';

/**
 * Wrapper de resiliencia para MFEs.
 *
 * Uso tipico:
 * ```html
 * <ui-remote-outlet
 *   [loader]="carregarSino"
 *   [displayName]="'Notificacoes'"
 *   [retry]="{ maxAttempts: 3, baseDelayMs: 500, healthCheckUrl: 'http://localhost:4204/remoteEntry.json' }">
 * </ui-remote-outlet>
 * ```
 *
 * Estados gerenciados automaticamente:
 *  - `loading`  → UiSpinner
 *  - `success`  → renderiza o component resolvido via ViewContainerRef
 *  - `error`    → UiEmptyState (tone danger) com botao "Tentar novamente"
 *
 * Retry: exponential backoff (500ms, 1.5s, 4s).
 * Health check: se `healthCheckUrl` informado, apos falha o wrapper faz polling
 * do `remoteEntry.json` em background; quando volta a responder 2xx, re-dispara
 * o loader automaticamente.
 */
@Component({
  selector: 'ui-remote-outlet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiSpinnerComponent, UiEmptyStateComponent, UiButtonComponent, NgTemplateOutlet],
  template: `
    @switch (estado()) {
      @case ('loading') {
        @if (compact()) {
          <div class="ui-remote__chip ui-remote__chip--loading" role="status" [attr.aria-label]="'Carregando ' + displayName()">
            <span class="ui-remote__chip-dot"></span>
            <span class="ui-remote__chip-label">{{ displayName() }}</span>
          </div>
        } @else if (skeletonTpl) {
          <div class="ui-remote__skeleton" role="status" aria-live="polite" [attr.aria-label]="'Carregando ' + displayName()">
            <ng-container *ngTemplateOutlet="skeletonTpl" />
          </div>
        } @else {
          <div class="ui-remote__loading" role="status" aria-live="polite">
            <ui-spinner size="lg" [label]="'Carregando ' + displayName()" />
            <p class="ui-remote__loading-text">Carregando {{ displayName() }}…</p>
          </div>
        }
      }
      @case ('error') {
        @if (compact()) {
          <button
            type="button"
            class="ui-remote__chip ui-remote__chip--error"
            (click)="tentarNovamente()"
            [attr.aria-label]="displayName() + ' indisponivel. Clique para tentar novamente.'"
            [title]="descricaoErro()"
          >
            <span class="ui-remote__chip-icon" aria-hidden="true">!</span>
            <span class="ui-remote__chip-label">{{ displayName() }} offline</span>
            <span class="ui-remote__chip-retry" aria-hidden="true">↻</span>
          </button>
        } @else {
          <ui-empty-state
            tone="danger"
            [title]="'Nao foi possivel carregar ' + displayName()"
            [description]="descricaoErro()"
            [defaultIcon]="'⚠'"
          >
            <div empty-actions>
              <ui-button variant="secondary" size="sm" (click)="tentarNovamente()">Tentar novamente</ui-button>
            </div>
          </ui-empty-state>
        }
      }
    }

    <div class="ui-remote__host" [hidden]="estado() !== 'success'">
      <ng-container #slot />
    </div>
  `,
  styles: [`
    :host { display: block; }
    .ui-remote__loading {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: var(--fiap-space-3);
      padding: var(--fiap-space-6);
      min-height: 120px;
      color: var(--fiap-color-text-subtle);
    }
    .ui-remote__loading-text {
      margin: 0; font-family: var(--fiap-font-family);
      font-size: var(--fiap-font-size-sm);
    }
    .ui-remote__host { display: contents; }
    .ui-remote__skeleton { display: block; }

    .ui-remote__chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 38px;
      padding: 0 14px;
      border-radius: 999px;
      font: 500 12px/1 var(--fiap-font-family, system-ui);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.04);
      color: rgba(255,255,255,0.7);
      cursor: default;
      white-space: nowrap;
      transition: background 200ms ease, border-color 200ms ease, color 200ms ease, transform 200ms ease;
    }
    .ui-remote__chip--loading {
      background: rgba(255,255,255,0.04);
    }
    .ui-remote__chip-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #ED1C24;
      box-shadow: 0 0 0 0 rgba(237,28,36,0.65);
      animation: ui-remote-pulse 1.4s ease-out infinite;
    }
    @keyframes ui-remote-pulse {
      0%   { box-shadow: 0 0 0 0 rgba(237,28,36,0.55); transform: scale(1); }
      70%  { box-shadow: 0 0 0 8px rgba(237,28,36,0); transform: scale(1.05); }
      100% { box-shadow: 0 0 0 0 rgba(237,28,36,0); transform: scale(1); }
    }
    .ui-remote__chip--error {
      cursor: pointer;
      background: rgba(237,28,36,0.10);
      border-color: rgba(237,28,36,0.35);
      color: #FFD7D9;
    }
    .ui-remote__chip--error:hover {
      background: rgba(237,28,36,0.18);
      border-color: rgba(237,28,36,0.55);
      color: #FFFFFF;
      transform: translateY(-1px);
    }
    .ui-remote__chip--error:active { transform: translateY(0); }
    .ui-remote__chip-icon {
      display: inline-grid; place-items: center;
      width: 18px; height: 18px;
      border-radius: 50%;
      background: #ED1C24;
      color: #FFFFFF;
      font-weight: 700;
      font-size: 11px;
      line-height: 1;
    }
    .ui-remote__chip-retry {
      font-size: 14px;
      opacity: 0.8;
      transition: transform 400ms ease;
    }
    .ui-remote__chip--error:hover .ui-remote__chip-retry {
      transform: rotate(180deg);
      opacity: 1;
    }
  `],
})
export class UiRemoteOutletComponent implements OnInit, OnDestroy {
  readonly loader = input.required<UiRemoteLoader>();
  readonly displayName = input<string>('este conteudo');
  readonly retry = input<UiRemoteRetryConfig>({});
  /** Renderiza error/loading como pill compacta — ideal para slots de navbar. */
  readonly compact = input<boolean>(false);

  @ContentChild('skeleton', { read: TemplateRef })
  protected skeletonTpl: TemplateRef<unknown> | null = null;

  @ViewChild('slot', { read: ViewContainerRef, static: true })
  private slot!: ViewContainerRef;

  private readonly destroyRef = inject(DestroyRef);

  protected readonly estado = signal<State>('idle');
  private readonly ultimoErro = signal<string>('');
  private readonly tentativas = signal<number>(0);

  protected readonly descricaoErro = computed(() => {
    const err = this.ultimoErro();
    const base = `Falha apos ${this.tentativas()} tentativa${this.tentativas() === 1 ? '' : 's'}.`;
    return err ? `${base} Detalhe: ${err}` : base;
  });

  private componentRef?: ComponentRef<unknown>;
  private healthTimer?: ReturnType<typeof setInterval>;
  private destruido = false;

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => {
      this.destruido = true;
      this.pararHealthCheck();
      this.componentRef?.destroy();
    });
    void this.carregar();
  }

  ngOnDestroy(): void {
    this.pararHealthCheck();
  }

  protected tentarNovamente(): void {
    this.tentativas.set(0);
    void this.carregar();
  }

  private async carregar(): Promise<void> {
    if (this.destruido) return;

    const cfg = this.retry();
    const maxAttempts = cfg.maxAttempts ?? 3;
    const baseDelay = cfg.baseDelayMs ?? 500;

    this.pararHealthCheck();
    this.estado.set('loading');

    try {
      const Cmp = await this.tentarComBackoff(maxAttempts, baseDelay);
      if (this.destruido) return;

      this.slot.clear();
      this.componentRef = this.slot.createComponent(Cmp);
      this.estado.set('success');
    } catch (err) {
      if (this.destruido) return;
      this.ultimoErro.set(this.mensagem(err));
      this.estado.set('error');
      this.logar('falha ao carregar remote', err);
      if (cfg.healthCheckUrl) {
        this.iniciarHealthCheck(cfg.healthCheckUrl, cfg.healthCheckIntervalMs ?? 5000);
      }
    }
  }

  private async tentarComBackoff(
    maxAttempts: number,
    baseDelay: number,
  ): Promise<Type<unknown>> {
    let ultima: unknown;
    const loader = this.loader();
    for (let tentativa = 1; tentativa <= maxAttempts; tentativa++) {
      this.tentativas.set(tentativa);
      try {
        return await loader();
      } catch (err) {
        ultima = err;
        this.logar(`tentativa ${tentativa}/${maxAttempts} falhou`, err);
        if (tentativa < maxAttempts) {
          const delay = baseDelay * Math.pow(3, tentativa - 1);
          await this.esperar(delay);
        }
      }
    }
    throw ultima;
  }

  private iniciarHealthCheck(url: string, intervalMs: number): void {
    this.pararHealthCheck();
    this.healthTimer = setInterval(async () => {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
          this.logar('remote saudavel novamente — recarregando', url);
          this.pararHealthCheck();
          this.tentativas.set(0);
          await this.carregar();
        }
      } catch {
        // continua tentando no proximo tick
      }
    }, intervalMs);
  }

  private pararHealthCheck(): void {
    if (this.healthTimer) {
      clearInterval(this.healthTimer);
      this.healthTimer = undefined;
    }
  }

  private esperar(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  private mensagem(err: unknown): string {
    if (err instanceof Error) return err.message;
    try { return String(err); } catch { return 'erro desconhecido'; }
  }

  private logar(titulo: string, detalhe?: unknown): void {
    // Observabilidade minima — em produ cao substituir por logger estruturado.
    // eslint-disable-next-line no-console
    console.warn(`[ui-remote-outlet] ${this.displayName()}: ${titulo}`, detalhe ?? '');
  }
}
