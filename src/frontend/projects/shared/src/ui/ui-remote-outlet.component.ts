import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  OnDestroy,
  OnInit,
  TemplateRef,
  Type,
  ViewChild,
  ViewContainerRef,
  input,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { UiEmptyStateComponent } from './ui-empty-state.component';
import { UiSpinnerComponent } from './ui-spinner.component';

type Estado = 'loading' | 'success' | 'error';

const ATRASOS_MS = [500, 1500, 4500];
const HEALTH_CHECK_MS = 5000;

/** Indica se o valor exportado pelo remote é um componente Angular. */
function ehComponente(valor: unknown): valor is Type<unknown> {
  return typeof valor === 'function' && 'ɵcmp' in valor;
}

@Component({
  selector: 'ui-remote-outlet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, UiEmptyStateComponent, UiSpinnerComponent],
  template: `
    @switch (estado()) {
      @case ('loading') {
        @if (skeleton) {
          <ng-container [ngTemplateOutlet]="skeleton" />
        } @else {
          <ui-spinner />
        }
      }
      @case ('error') {
        @if (compact()) {
          <button type="button" class="pill" (click)="carregar()">! {{ remote() }} offline ↻</button>
        } @else {
          <ui-empty-state
            title="Serviço indisponível"
            [description]="'Não foi possível carregar ' + remote()"
            action="Tentar novamente"
            (actionClick)="carregar()"
          />
        }
      }
    }
    <ng-container #slot />
  `,
  styles: [`
    :host { display: block; }
    .pill { padding: 4px 10px; border: 1px solid var(--fiap-color-brand); border-radius: 999px; background: transparent; color: var(--fiap-color-brand); font-size: var(--fiap-font-size-sm); cursor: pointer; white-space: nowrap; }
  `],
})
export class UiRemoteOutletComponent implements OnInit, OnDestroy {
  readonly remote = input.required<string>();
  readonly exposed = input.required<string>();
  readonly compact = input(false);
  readonly manifest = input('federation.manifest.json');

  @ContentChild('skeleton', { read: TemplateRef })
  protected skeleton?: TemplateRef<unknown>;

  @ViewChild('slot', { read: ViewContainerRef, static: true })
  private slot!: ViewContainerRef;

  protected readonly estado = signal<Estado>('loading');
  private healthTimer?: ReturnType<typeof setInterval>;
  private destruido = false;

  ngOnInit(): void {
    void this.carregar();
  }

  ngOnDestroy(): void {
    this.destruido = true;
    this.pararHealthCheck();
  }

  /** Carrega o remote com retry exponencial e cai para o estado de erro com health check. */
  protected async carregar(): Promise<void> {
    this.pararHealthCheck();
    this.estado.set('loading');
    this.slot.clear();

    for (let tentativa = 0; tentativa <= ATRASOS_MS.length; tentativa++) {
      try {
        const componente = await this.importar();
        if (this.destruido) return;
        this.slot.createComponent(componente);
        this.estado.set('success');
        return;
      } catch (erro) {
        console.warn(`[ui-remote-outlet] ${this.remote()} ${this.exposed()}: tentativa ${tentativa + 1} falhou`, erro);
        if (this.destruido) return;
        if (tentativa < ATRASOS_MS.length) {
          await new Promise((resolve) => setTimeout(resolve, ATRASOS_MS[tentativa]));
        }
      }
    }

    this.estado.set('error');
    this.iniciarHealthCheck();
  }

  /** Resolve a URL do remote no manifest e importa o primeiro componente do módulo exposto. */
  private async importar(): Promise<Type<unknown>> {
    const remoteEntry = await this.remoteEntryUrl();
    const modulo = await loadRemoteModule({
      remoteName: this.remote(),
      remoteEntry,
      exposedModule: this.exposed(),
    });
    const componente = Object.values(modulo).find(ehComponente);
    if (!componente) {
      throw new Error(`Nenhum componente em ${this.remote()} ${this.exposed()}`);
    }
    return componente;
  }

  /** Lê o manifest ativo do host para descobrir o remoteEntry.json do remote. */
  private async remoteEntryUrl(): Promise<string> {
    const resposta = await fetch(this.manifest(), { cache: 'no-store' });
    const remotes = (await resposta.json()) as Record<string, string>;
    const url = remotes[this.remote()];
    if (!url) {
      throw new Error(`Remote ${this.remote()} não está no manifest`);
    }
    return url;
  }

  /** Faz polling do remoteEntry.json e recarrega sozinho quando o remote sai do ar e volta. */
  private iniciarHealthCheck(): void {
    let caiu = false;
    const verificar = async () => {
      const noAr = await this.remoteNoAr();
      if (noAr && caiu) {
        console.warn(`[ui-remote-outlet] ${this.remote()} voltou — recarregando`);
        void this.carregar();
      }
      caiu = caiu || !noAr;
    };
    void verificar();
    this.healthTimer = setInterval(verificar, HEALTH_CHECK_MS);
  }

  private async remoteNoAr(): Promise<boolean> {
    try {
      const resposta = await fetch(await this.remoteEntryUrl(), { cache: 'no-store' });
      return resposta.ok;
    } catch {
      return false;
    }
  }

  private pararHealthCheck(): void {
    if (this.healthTimer) {
      clearInterval(this.healthTimer);
      this.healthTimer = undefined;
    }
  }
}
