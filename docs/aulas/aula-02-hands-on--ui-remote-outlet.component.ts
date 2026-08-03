// Aula 02 - Hands on
// Wrapper que carrega um componente remoto via native-federation, com retry
// exponencial (3 tentativas, 500ms * 3^n) e fallback de erro com health check.
//
// Uso:
//   <ui-remote-outlet remote="mfe-notificacoes" exposed="./Sino" />
//
// Trecho como veio na aula: os imports (@angular/core, loadRemoteModule,
// UiSpinnerComponent, UiEmptyStateComponent) e a declaracao do viewChild `slot`
// nao faziam parte do material.

type RemoteState = 'loading' | 'success' | 'error';

@Component({

  selector: 'ui-remote-outlet',

  standalone: true,

  imports: [UiSpinnerComponent, UiEmptyStateComponent],

  template: `

    @switch (state()) {

      @case ('loading') { <ui-spinner /> }

      @case ('error')   { <ui-empty-state title="Serviço indisponível"

                                          action="Tentar novamente"

                                          (actionClick)="carregar()" /> }

      @case ('success') { <ng-container #slot /> }

    }

  `,

})

export class UiRemoteOutletComponent implements OnInit, OnDestroy {

  readonly remote  = input.required<string>();

  readonly exposed = input.required<string>();

  protected readonly state = signal<RemoteState>('loading');

  private readonly MAX_TENTATIVAS = 3;

  private readonly BASE_MS        = 500;

  private readonly FATOR          = 3;

  async carregar(tentativa = 0): Promise<void> {

    this.state.set('loading');

    try {

      const modulo = await loadRemoteModule({

        remoteName: this.remote(),

        exposedModule: this.exposed(),

      });

      this.slot.createComponent(modulo.default ?? Object.values(modulo)[0]);

      this.state.set('success');

      this.pararHealthCheck();

    } catch (erro) {

      console.warn(`[ui-remote-outlet] falha ao carregar ${this.remote()}${this.exposed()} (tentativa ${tentativa + 1})`, erro);

      if (tentativa + 1 < this.MAX_TENTATIVAS) {

        const delay = this.BASE_MS * Math.pow(this.FATOR, tentativa);

        setTimeout(() => this.carregar(tentativa + 1), delay);

      } else {

        this.state.set('error');

        this.iniciarHealthCheck();

      }

    }

  }

  private iniciarHealthCheck(): void { /* polling HEAD em remoteEntry.json */ }

  private pararHealthCheck():  void { /* clearInterval */ }

}
