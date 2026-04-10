import { Component } from '@angular/core';
import { ProdutosComponent } from './produtos.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ProdutosComponent],
  template: `<mfe-produtos />`,
})
export class App {}
