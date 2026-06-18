import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-profile',
  imports: [DatePipe, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfilePage {
  auth = inject(AuthService);
  private toast = inject(ToastService);

  resending = signal(false);
  resent = signal(false);
  resendError = signal('');

  passwordCurrent = '';
  passwordNew = '';
  passwordConfirm = '';
  passwordLoading = signal(false);

  emailNew = '';
  emailPassword = '';
  emailLoading = signal(false);

  async resendVerification(): Promise<void> {
    this.resending.set(true);
    this.resendError.set('');
    this.resent.set(false);

    try {
      await firstValueFrom(this.auth.resendVerification());
      this.resent.set(true);
      this.toast.success('Email de verificación reenviado');
    } catch (err: any) {
      const msg = err.error?.message || 'Error al reenviar el email';
      this.resendError.set(msg);
      this.toast.error(msg);
    } finally {
      this.resending.set(false);
    }
  }

  async changePassword(): Promise<void> {
    this.passwordLoading.set(true);
    try {
      await firstValueFrom(this.auth.changePassword({
        currentPassword: this.passwordCurrent,
        newPassword: this.passwordNew,
        confirmPassword: this.passwordConfirm,
      }));
      this.toast.success('Contraseña actualizada correctamente');
      this.passwordCurrent = '';
      this.passwordNew = '';
      this.passwordConfirm = '';
    } catch (err: any) {
      this.toast.error(err.error?.message || 'Error al cambiar la contraseña');
    } finally {
      this.passwordLoading.set(false);
    }
  }

  async changeEmail(): Promise<void> {
    this.emailLoading.set(true);
    try {
      await firstValueFrom(this.auth.changeEmail({
        newEmail: this.emailNew,
        currentPassword: this.emailPassword,
      }));
      this.toast.success('Email actualizado correctamente');
      this.emailNew = '';
      this.emailPassword = '';
    } catch (err: any) {
      this.toast.error(err.error?.message || 'Error al cambiar el email');
    } finally {
      this.emailLoading.set(false);
    }
  }
}
