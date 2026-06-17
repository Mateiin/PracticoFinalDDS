import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service'; // <-- Sumamos los toasts
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  standalone: true, // ¡Excelente usar standalone!
  imports: [FormsModule, CommonModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  // Usamos el mismo estilo de inyección que en tus otras pantallas
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  email: string = '';
  mensajeEnviado: boolean = false;
  loading = signal(false); // Agregamos el circulito de carga por si el mail tarda

  async enviarLink() {
    if (!this.email) {
      this.toastService.error('Por favor, ingresá tu correo electrónico.');
      return;
    }
    
    this.loading.set(true);
    
    try {
      await firstValueFrom(this.authService.forgotPassword({ email: this.email }));
    } catch (error) {
      // Si falla, no hacemos nada. ¡Es intencional para no darle pistas a los hackers!
    } finally {
      this.loading.set(false);
      this.mensajeEnviado = true; // Mostramos el texto en el HTML
      
      // Disparamos el Toast informativo
      this.toastService.info('Si el email existe, recibirás un link de recuperación en unos minutos.');
    }
  }
}