import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { NotificacoesService, Notificacao } from '../../services/notificacoes.service';
import { ToastService } from '../../services/toast.service';

/** Sino de notificações com painel dropdown e stack global de toasts. */
@Component({
  selector: 'mfe-sino-notificacoes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './sino-notificacoes.component.html',
  styleUrls: ['./sino-notificacoes.component.css'],
})
export class SinoNotificacoesComponent {
  protected readonly servico = inject(NotificacoesService);
  protected readonly toast = inject(ToastService);
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly aberto = signal(false);

  constructor() {
    window.addEventListener('fiap:notify', this.onNotify as EventListener);
    inject(DestroyRef).onDestroy(() =>
      window.removeEventListener('fiap:notify', this.onNotify as EventListener),
    );
  }

  private readonly onNotify = (ev: Event): void => {
    const d = (ev as CustomEvent<{ tipo?: 'success' | 'warning' | 'info' | 'error'; titulo: string; mensagem?: string }>).detail;
    if (!d) return;
    this.toast.mostrar({ variante: d.tipo ?? 'info', titulo: d.titulo, body: d.mensagem });
    this.servico.adicionar(d.titulo);
  };

  /** Alterna visibilidade do painel dropdown. */
  protected alternarPainel(event: MouseEvent): void {
    event.stopPropagation();
    this.aberto.update((v) => !v);
  }

  /** Fecha o painel. */
  protected fechar(): void {
    this.aberto.set(false);
  }

  /** Marca todas as notificações como lidas sem fechar o painel. */
  protected marcarTodas(event: MouseEvent): void {
    event.stopPropagation();
    this.servico.marcarTodasComoLidas();
  }

  /** Formata timestamp relativo simulado. */
  protected formatarTempo(n: Notificacao): string {
    const idx = this.servico.itens().indexOf(n);
    const mock = ['agora', '5 min atrás', '1 h atrás', 'ontem', '2 dias atrás'];
    return mock[idx % mock.length];
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.aberto()) return;
    const target = event.target as Node;
    if (!this.host.nativeElement.contains(target)) {
      this.aberto.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.aberto()) this.aberto.set(false);
  }
}
