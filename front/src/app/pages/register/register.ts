import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service'; 

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService); 

  email = '';
  password = '';
  confirmPassword = '';
  loading = signal(false);
  registered = signal(false);
  deliveryWarning = '';
  verificationLink = '';

  async submit(): Promise<void> {
    this.loading.set(true);

    if (this.password !== this.confirmPassword) {
      this.toastService.error('Las contraseñas no coinciden');
      this.loading.set(false);
      return;
    }

    try {
      const res = await firstValueFrom(this.auth.register({ email: this.email, password: this.password }));
      if (res.emailDelivery && !res.emailDelivery.delivered) {
        this.deliveryWarning = res.emailDelivery.warning || 'No se pudo enviar el email';
        this.verificationLink = res.emailDelivery.verificationLink;
      }
      this.registered.set(true);
      setTimeout(() => this.router.navigate(['/']), 3000);
    } catch (err: any) {
      this.toastService.error(err.error?.message || 'Error al registrarse');
    } finally {
      this.loading.set(false);
    }
  }
}