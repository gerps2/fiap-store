import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UiButtonComponent, UiCardComponent, UiInputComponent } from '@fiap/shared';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [FormsModule, RouterLink, UiButtonComponent, UiCardComponent, UiInputComponent],
  template: `
    <ui-card class="auth">
      <h2>{{ cadastro ? 'Criar conta' : 'Entrar' }}</h2>
      <form (ngSubmit)="enviar()" #form="ngForm">
        <ui-input label="E-mail" type="email" name="email" [(ngModel)]="email" required />
        <ui-input label="Senha" type="password" name="password" [(ngModel)]="password" required />
        @if (erro()) {
          <p class="erro">{{ erro() }}</p>
        }
        <ui-button type="submit" [disabled]="!form.valid">{{ cadastro ? 'Criar conta' : 'Entrar' }}</ui-button>
      </form>
      @if (cadastro) {
        <a routerLink="/auth/login">Já tenho conta</a>
      } @else {
        <a routerLink="/auth/signup">Criar conta</a>
      }
    </ui-card>
  `,
  styles: [`
    .auth { display: block; max-width: 360px; margin: 0 auto; }
    h2 { margin: 0 0 12px; }
    form { display: flex; flex-direction: column; gap: 12px; margin-bottom: 12px; }
    .erro { margin: 0; color: var(--fiap-color-brand); font-size: var(--fiap-font-size-sm); }
    a { color: var(--fiap-color-brand); font-size: var(--fiap-font-size-sm); }
  `],
})
export class AuthPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly cadastro = inject(ActivatedRoute).snapshot.data['cadastro'] === true;
  protected readonly erro = signal('');
  protected email = '';
  protected password = '';

  protected async enviar(): Promise<void> {
    this.erro.set('');
    try {
      if (this.cadastro) {
        await this.auth.signup(this.email, this.password);
      } else {
        await this.auth.login(this.email, this.password);
      }
      await this.router.navigateByUrl('/');
    } catch {
      this.erro.set('Não foi possível autenticar. Confira e-mail e senha.');
    }
  }
}
