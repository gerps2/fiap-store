import { Component } from '@angular/core';
import { CarrinhoComponent } from './carrinho.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CarrinhoComponent],
  template: `<mfe-carrinho />`,
})
export class App {}
