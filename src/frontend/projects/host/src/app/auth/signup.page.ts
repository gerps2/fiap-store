import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="auth-card">
      <h1>Criar conta</h1>
      <p class="muted">Senha precisa ter ao menos 8 caracteres.</p>

      <form (ngSubmit)="submit()" #f="ngForm">
        <label>
          <span>Email</span>
          <input type="email" name="email" [(ngModel)]="email" required autocomplete="username" />
        </label>

        <label>
          <span>Senha</span>
          <input type="password" name="password" [(ngModel)]="password" required minlength="8" autocomplete="new-password" />
        </label>

        @if (errorMsg()) {
          <p class="error">{{ errorMsg() }}</p>
        }

        <button type="submit" [disabled]="loading() || !f.valid">
          {{ loading() ? 'Criando…' : 'Criar conta' }}
        </button>

        <p class="muted">Já tem conta? <a routerLink="/auth/login">Entrar</a></p>
      </form>
    </section>
  `,
  styles: [`
    :host { display: block; max-width: 420px; margin: 3rem auto; padding: 0 1rem; }
    .auth-card { background: #fff; padding: 2rem; border-radius: 12px; box-shadow: 0 6px 24px rgba(0,0,0,0.06); }
    h1 { margin: 0 0 0.5rem; }
    .muted { color: #666; font-size: 0.9rem; margin: 0 0 1.5rem; }
    form { display: grid; gap: 1rem; }
    label { display: grid; gap: 0.4rem; font-size: 0.9rem; }
    input { padding: 0.6rem 0.8rem; border: 1px solid #ccc; border-radius: 8px; font-size: 1rem; }
    button { padding: 0.75rem; border: none; background: var(--fiap-color-brand, #e63946); color: #fff; border-radius: 8px; font-weight: 600; cursor: pointer; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .error { color: #c0392b; background: #fde3df; padding: 0.6rem 0.8rem; border-radius: 6px; margin: 0; font-size: 0.9rem; }
  `],
})
export class SignupPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly password = signal('');
  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);

  async submit(): Promise<void> {
    this.errorMsg.set(null);
    this.loading.set(true);
    try {
      await this.auth.signup(this.email(), this.password());
      await this.router.navigateByUrl('/');
    } catch (err: unknown) {
      this.errorMsg.set(this.extractMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  private extractMessage(err: unknown): string {
    const e = err as { error?: { message?: string }; message?: string };
    return e?.error?.message ?? e?.message ?? 'Erro ao criar conta.';
  }
}
