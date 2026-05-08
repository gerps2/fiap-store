import { Component } from '@angular/core';
import { CheckoutComponent } from './pages/checkout/checkout.page';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CheckoutComponent],
  template: `<mfe-checkout />`,
})
export class App {}
