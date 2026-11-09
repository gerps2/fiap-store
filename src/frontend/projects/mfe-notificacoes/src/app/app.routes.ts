import { Routes } from '@angular/router';
import { SinoNotificacoesComponent } from './components/sino-notificacoes/sino-notificacoes.component';
import { NOTIFICACOES_ROUTES, NotificacoesPageComponent } from './pages/notificacoes/notificacoes.page';

export const routes: Routes = [
  { path: 'sino', component: SinoNotificacoesComponent },
  { path: '', component: NotificacoesPageComponent, children: NOTIFICACOES_ROUTES },
];
