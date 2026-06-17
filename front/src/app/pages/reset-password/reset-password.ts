import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  standalone: true, 
  
  imports: [FormsModule, CommonModule, RouterLink], 
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent implements OnInit {
  token: string | null = '';
  nuevaClave: string = '';
  confirmarClave: string = '';
  errorMismatch: boolean = false;
  exito: boolean = false;
  loading = signal(false); 

  
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  ngOnInit() {
    
    this.token = this.route.snapshot.queryParamMap.get('token');
    
    if (!this.token) {
      this.toastService.error('El enlace de recuperación no es válido.');
    }
  }

  async cambiarContrasena() {
    this.errorMismatch = false;

    if (this.nuevaClave !== this.confirmarClave) {
      this.errorMismatch = true;
      return;
    }

    if (this.nuevaClave.length < 8) {
      this.toastService.error('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (!this.token) {
      this.toastService.error('No hay un token de seguridad válido.');
      return;
    }

    
    this.loading.set(true);
    try {
      await firstValueFrom(
        this.authService.resetPassword({ token: this.token, nuevaClave: this.nuevaClave })
      );
      
      this.exito = true;
      this.toastService.success('¡Contraseña actualizada en la base de datos!');
      
    } catch (error: any) {
      this.toastService.error(error.error?.message || 'Error al actualizar la contraseña');
    } finally {
      this.loading.set(false);
    }
  }
}