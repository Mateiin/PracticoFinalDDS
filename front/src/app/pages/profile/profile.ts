import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfilePage {
  auth = inject(AuthService);

  resending = signal(false);
  resent = signal(false);
  resendError = signal('');

  async resendVerification(): Promise<void> {
    this.resending.set(true);
    this.resendError.set('');
    this.resent.set(false);

    try {
      await firstValueFrom(this.auth.resendVerification());
      this.resent.set(true);
    } catch (err: any) {
      this.resendError.set(err.error?.message || 'Error al reenviar el email');
    } finally {
      this.resending.set(false);
    }
  }
}
