import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  token = '';
  password = '';
  confirmPassword = '';
  loading = signal(false);
  success = signal(false);
  error = signal('');
  invalidToken = signal(false);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (!this.token) {
        this.invalidToken.set(true);
        this.error.set('Token de recuperación no encontrado');
        this.toast.error('Token de recuperación no encontrado');
      }
    });
  }

  async submit(): Promise<void> {
    if (this.password !== this.confirmPassword) {
      const msg = 'Las contraseñas no coinciden';
      this.error.set(msg);
      this.toast.error(msg);
      return;
    }

    if (this.password.length < 8) {
      const msg = 'La contraseña debe tener al menos 8 caracteres';
      this.error.set(msg);
      this.toast.error(msg);
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      await firstValueFrom(this.auth.resetPassword(this.token, this.password));
      this.success.set(true);
      this.toast.success('Contraseña actualizada correctamente');
      setTimeout(() => this.router.navigate(['/login']), 3000);
    } catch (err: any) {
      const msg = err.error?.message || 'Error al restablecer la contraseña';
      this.error.set(msg);
      this.toast.error(msg);
    } finally {
      this.loading.set(false);
    }
  }
}
