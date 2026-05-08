import { Component } from '@angular/core';
import { CarrinhoComponent } from './pages/carrinho/carrinho.page';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CarrinhoComponent],
  template: `<mfe-carrinho />`,
})
export class App {}
