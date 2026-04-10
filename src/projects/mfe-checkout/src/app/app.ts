import { Component } from '@angular/core';
import { CheckoutComponent } from './checkout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CheckoutComponent],
  template: `<mfe-checkout />`,
})
export class App {}
