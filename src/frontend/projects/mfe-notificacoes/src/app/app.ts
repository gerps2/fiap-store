import { Component } from '@angular/core';
import { SinoNotificacoesComponent } from './components/sino-notificacoes/sino-notificacoes.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SinoNotificacoesComponent],
  template: `<mfe-sino-notificacoes />`,
})
export class App {}
