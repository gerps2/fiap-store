import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Type,
  signal,
} from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { UiRemoteOutletComponent, type UiRemoteLoader } from '@fiap/shared';

/** Shell principal — navbar dark sticky com wordmark, nav central e acoes a direita. */
@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, UiRemoteOutletComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  protected readonly scrolled = signal(false);
  protected readonly menuOpen = signal(false);

  /** Loader do sino — expose real e SinoNotificacoesComponent (fix NG0919). */
  protected readonly carregarSino: UiRemoteLoader = async () => {
    const m = await loadRemoteModule({
      remoteName: 'mfe-notificacoes',
      exposedModule: './Sino',
    });
    return m.SinoNotificacoesComponent as Type<unknown>;
  };

  protected readonly retrySino = {
    maxAttempts: 3,
    baseDelayMs: 500,
    healthCheckUrl: 'http://localhost:4204/remoteEntry.json',
    healthCheckIntervalMs: 5000,
  };

  protected readonly carregarCarrinho: UiRemoteLoader = async () => {
    const m = await loadRemoteModule({
      remoteName: 'mfe-carrinho',
      exposedModule: './Component',
    });
    return m.CarrinhoComponent as Type<unknown>;
  };

  protected readonly retryCarrinho = {
    maxAttempts: 3,
    baseDelayMs: 500,
    healthCheckUrl: 'http://localhost:4202/remoteEntry.json',
    healthCheckIntervalMs: 5000,
  };

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
