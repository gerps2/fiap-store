import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';

/** Home editorial — hero dark, destaques remotos, categorias e CTA final. */
@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.css'],
})
export class Home implements AfterViewInit {
  @ViewChild('slotProdutos', { read: ViewContainerRef, static: true })
  private slotProdutos!: ViewContainerRef;

  @ViewChild('slotCarrinho', { read: ViewContainerRef, static: true })
  private slotCarrinho!: ViewContainerRef;

  @ViewChild('slotCheckout', { read: ViewContainerRef, static: true })
  private slotCheckout!: ViewContainerRef;

  async ngAfterViewInit(): Promise<void> {
    const [produtos, carrinho, checkout] = await Promise.all([
      loadRemoteModule({ remoteName: 'mfe-produtos', exposedModule: './Component' }),
      loadRemoteModule({ remoteName: 'mfe-carrinho', exposedModule: './Component' }),
      loadRemoteModule({ remoteName: 'mfe-checkout', exposedModule: './Component' }),
    ]);

    this.slotProdutos.createComponent(produtos.ProdutosComponent);
    this.slotCarrinho.createComponent(carrinho.CarrinhoComponent);
    this.slotCheckout.createComponent(checkout.CheckoutComponent);
  }
}
