import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';

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
      }
    });
  }

  async submit(): Promise<void> {
    if (this.password !== this.confirmPassword) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    if (this.password.length < 8) {
      this.error.set('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      await firstValueFrom(this.auth.resetPassword(this.token, this.password));
      this.success.set(true);
      setTimeout(() => this.router.navigate(['/login']), 3000);
    } catch (err: any) {
      this.error.set(err.error?.message || 'Error al restablecer la contraseña');
    } finally {
      this.loading.set(false);
    }
  }
}
