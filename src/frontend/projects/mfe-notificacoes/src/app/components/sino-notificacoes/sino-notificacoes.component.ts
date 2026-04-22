import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import {
  MARK_AS_READ,
  MY_NOTIFICATIONS,
  NotificationHubService,
  NotificationsSocketService,
  UserContextService,
  type HubToast,
  type NotificationDto,
} from '@fiap/shared-context';

interface NotifView {
  id: string;
  titulo: string;
  lida: boolean;
  criadaEm: Date;
}

/**
 * Sino de notificações — UI do hub central.
 *
 * - Query GraphQL `myNotifications` carrega histórico.
 * - `NotificationsSocketService` abre Socket.IO (cookie httpOnly no handshake)
 *   e cada `notification:new` cai no `NotificationHubService` como toast.
 * - O hub é compartilhado com todos os MFEs — qualquer MFE que injete
 *   `NotificationHubService` pode disparar um toast que sai por aqui.
 */
@Component({
  selector: 'mfe-sino-notificacoes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './sino-notificacoes.component.html',
  styleUrls: ['./sino-notificacoes.component.css'],
})
export class SinoNotificacoesComponent {
  private readonly apollo = inject(Apollo);
  private readonly hub = inject(NotificationHubService);
  private readonly socket = inject(NotificationsSocketService);
  private readonly ctx = inject(UserContextService);
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly aberto = signal(false);
  private readonly _itens = signal<NotifView[]>([]);
  private queryRef?: QueryRef<{ myNotifications: NotificationDto[] }>;

  /** Alias do template antigo (servico.itens / servico.naoLidas / servico.marcar...). */
  protected readonly servico = {
    itens: this._itens.asReadonly(),
    naoLidas: computed(() => this._itens().filter((n) => !n.lida).length),
    marcarComoLida: (id: string): void => {
      this.apollo
        .mutate<{ markAsRead: { id: string; readAt: string } }>({
          mutation: MARK_AS_READ,
          variables: { id },
          refetchQueries: ['MyNotifications'],
        })
        .subscribe({ error: () => this.hub.error('Erro', 'Falha ao marcar como lida.') });
      this._itens.update((list) => list.map((n) => (n.id === id ? { ...n, lida: true } : n)));
    },
    marcarTodasComoLidas: (): void => {
      for (const n of this._itens().filter((x) => !x.lida)) {
        this.servico.marcarComoLida(n.id);
      }
    },
  };

  /** Bridge do template: `toast.toasts()` / `toast.remover(id)` → hub central. */
  protected readonly toast = {
    toasts: computed(() =>
      this.hub.toasts().map((t: HubToast) => ({
        id: t.id,
        titulo: t.title,
        body: t.body,
        variante: t.kind,
        leaving: false,
      })),
    ),
    remover: (id: number): void => this.hub.dismiss(id),
  };

  constructor() {
    const destroyRef = inject(DestroyRef);

    this.queryRef = this.apollo.watchQuery<{ myNotifications: NotificationDto[] }>({
      query: MY_NOTIFICATIONS,
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    });
    const histSub = this.queryRef.valueChanges.subscribe((r) => {
      const list = (r.data?.myNotifications ?? []) as NotificationDto[];
      this._itens.set(
        list.map<NotifView>((n) => ({
          id: n.id,
          titulo: n.title,
          lida: !!n.readAt,
          criadaEm: new Date(n.createdAt),
        })),
      );
    });
    destroyRef.onDestroy(() => histSub.unsubscribe());

    // Conecta o socket. Se não houver cookie httpOnly ainda, o handshake do
    // server rejeita com `connect_error` → reconnect automático continua
    // tentando, e na hora do login o próximo handshake já tem o cookie.
    this.socket.connect();
    destroyRef.onDestroy(() => this.socket.disconnect());

    // Quando um toast chega via socket, refetch do histórico pra refletir o novo item
    effect(() => {
      if (this.hub.toasts().length > 0) this.queryRef?.refetch();
    });
  }

  protected alternarPainel(event: MouseEvent): void {
    event.stopPropagation();
    const novo = !this.aberto();
    this.aberto.set(novo);
    if (novo) this.hub.resetUnread();
  }

  protected fechar(): void {
    this.aberto.set(false);
  }

  protected marcarTodas(event: MouseEvent): void {
    event.stopPropagation();
    this.servico.marcarTodasComoLidas();
  }

  protected formatarTempo(n: NotifView): string {
    const diff = Date.now() - n.criadaEm.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `${mins} min atrás`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} h atrás`;
    return `${Math.floor(hrs / 24)} d atrás`;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.aberto()) return;
    const target = event.target as Node;
    if (!this.host.nativeElement.contains(target)) this.aberto.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.aberto()) this.aberto.set(false);
  }
}
