import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-verify-pending',
  templateUrl: './verify-pending.html',
  styleUrl: './verify-pending.css',
})
export class VerifyPendingPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  email = signal('');
  resending = signal(false);
  resent = signal(false);
  error = signal('');

  constructor() {
    this.route.queryParams.subscribe(params => {
      this.email.set(params['email'] || '');
    });
  }

  async resend(): Promise<void> {
    this.resending.set(true);
    this.error.set('');
    this.resent.set(false);

    try {
      await firstValueFrom(this.auth.resendVerification());
      this.resent.set(true);
      this.toast.success('Email de verificación reenviado');
    } catch (err: any) {
      const msg = err.error?.message || 'Error al reenviar el email de verificación';
      this.error.set(msg);
      this.toast.error(msg);
    } finally {
      this.resending.set(false);
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
