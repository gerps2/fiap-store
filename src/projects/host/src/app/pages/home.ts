import {
  AfterViewInit,
  Component,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { loadRemoteModule } from '@angular-architects/native-federation';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <section class="home">
      <header class="hero">
        <h2>Bem-vindo a FIAP Store</h2>
        <p>Home composta por 3 microfrontends carregados em runtime.</p>
      </header>

      <div class="mfe-slot">
        <h3>Produtos em destaque</h3>
        <ng-container #slotProdutos />
      </div>

      <div class="mfe-slot">
        <h3>Seu carrinho</h3>
        <ng-container #slotCarrinho />
      </div>

      <div class="mfe-slot">
        <h3>Checkout rapido</h3>
        <ng-container #slotCheckout />
      </div>
    </section>
  `,
  styles: [`
    .home {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .hero {
      padding: 24px;
      border-radius: 12px;
      background: linear-gradient(135deg, #ed145b, #8a0c38);
      color: #fff;
    }

    .hero h2 {
      margin: 0 0 6px;
    }

    .hero p {
      margin: 0;
      opacity: 0.9;
    }

    .mfe-slot {
      border: 1px dashed #cfcfcf;
      border-radius: 12px;
      padding: 16px;
      background: #fafafa;
    }

    .mfe-slot h3 {
      margin: 0 0 12px;
      color: #555;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
  `]
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
