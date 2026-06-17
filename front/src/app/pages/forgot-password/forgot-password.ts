import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  mensajeEnviado: boolean = false;

  constructor(private authService: AuthService) {}

  enviarLink() {
    if (!this.email) return;
    
    this.authService.forgotPassword({ email: this.email }).subscribe({
      next: () => {
        this.mensajeEnviado = true;
      },
      error: () => {
        this.mensajeEnviado = false;
      }
    });
  }
}