import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPasswordPage {
  private auth = inject(AuthService);

  email = '';
  loading = signal(false);
  sent = signal(false);
  error = signal('');

  async submit(): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      await firstValueFrom(this.auth.forgotPassword(this.email));
      this.sent.set(true);
    } catch (err: any) {
      this.error.set(err.error?.message || 'Error al solicitar recuperación');
    } finally {
      this.loading.set(false);
    }
  }
}
