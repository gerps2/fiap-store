import { Component } from '@angular/core';
import { ProdutosComponent } from './pages/produtos/produtos.page';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ProdutosComponent],
  template: `<mfe-produtos />`,
})
export class App {}
