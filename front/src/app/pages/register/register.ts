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
<<<<<<< HEAD
  registered = signal(false);
=======
  
>>>>>>> cambiosParaSMPT

  async submit(): Promise<void> {
    this.loading.set(true);

    if (this.password !== this.confirmPassword) {
      
      this.toastService.error('Las contraseñas no coinciden');
      this.loading.set(false);
      return;
    }

    try {
      await firstValueFrom(this.auth.register({ email: this.email, password: this.password }));
<<<<<<< HEAD
      this.registered.set(true);
      // Después de 3 segundos, redirigir al home
      setTimeout(() => this.router.navigate(['/']), 3000);
    } catch (err: any) {
      this.error = err.error?.message || 'Error al registrarse';
=======
      
     
      this.toastService.success('¡Registro exitoso! Por favor revisá tu mail.');
      
      this.router.navigate(['/login']); 
    } catch (err: any) {
      
      this.toastService.error(err.error?.message || 'Error al registrarse');
    } finally {
>>>>>>> cambiosParaSMPT
      this.loading.set(false);
    }
  }
}