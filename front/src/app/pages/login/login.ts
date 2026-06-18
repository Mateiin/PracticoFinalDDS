import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service'; 

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService); 

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  async submit(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      await firstValueFrom(this.auth.login({ email: this.email, password: this.password }));
      this.router.navigate(['/']);
    } catch (err: any) {
      const msg = err.error?.message || err.message || 'Error al iniciar sesión';
      this.error.set(msg);
      this.toastService.error(msg);
    } finally {
      this.loading.set(false);
    }
  }
}