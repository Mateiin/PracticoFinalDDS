import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPasswordComponent {
  private auth = inject(AuthService);
  private toast = inject(ToastService);

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
      this.toast.success('Si el email existe, recibirás un link de recuperación');
    } catch (err: any) {
      const msg = err.error?.message || 'Error al solicitar recuperación';
      this.error.set(msg);
      this.toast.error(msg);
    } finally {
      this.loading.set(false);
    }
  }
}
