import { ChangeDetectionStrategy, Component, Type } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { UiRemoteOutletComponent, type UiRemoteLoader } from '@fiap/shared';

/** Página /checkout — wrapper resiliente ao MFE de checkout com skeleton dedicado. */
@Component({
  selector: 'app-checkout-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiRemoteOutletComponent],
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.css'],
})
export class CheckoutPage {
  protected readonly carregarCheckout: UiRemoteLoader = async () => {
    const m = await loadRemoteModule({ remoteName: 'mfe-checkout', exposedModule: './Component' });
    return m.CheckoutComponent as Type<unknown>;
  };

  protected readonly retryCheckout = {
    maxAttempts: 3,
    baseDelayMs: 500,
    healthCheckUrl: 'http://localhost:4203/remoteEntry.json',
    healthCheckIntervalMs: 5000,
  };
}
