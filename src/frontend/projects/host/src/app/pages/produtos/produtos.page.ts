import { ChangeDetectionStrategy, Component, Type } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { UiRemoteOutletComponent, type UiRemoteLoader } from '@fiap/shared';

/** Página principal — catálogo full-width com skeleton + error state resilientes. */
@Component({
  selector: 'app-produtos-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiRemoteOutletComponent],
  templateUrl: './produtos.page.html',
  styleUrls: ['./produtos.page.css'],
})
export class ProdutosPage {
  protected readonly placeholders = Array.from({ length: 8 });

  protected readonly carregarProdutos: UiRemoteLoader = async () => {
    const m = await loadRemoteModule({ remoteName: 'mfe-produtos', exposedModule: './Component' });
    return m.ProdutosComponent as Type<unknown>;
  };

  protected readonly retryProdutos = {
    maxAttempts: 3,
    baseDelayMs: 500,
    healthCheckUrl: 'http://localhost:4201/remoteEntry.json',
    healthCheckIntervalMs: 5000,
  };
}
