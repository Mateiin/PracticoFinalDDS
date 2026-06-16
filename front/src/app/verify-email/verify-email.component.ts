import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css',
})
export class VerifyEmail implements OnInit {
  mensaje: string = 'Aguardá un momento... Verificando tu cuenta...';
  exito: boolean = false;
  error: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      
      if (!token) {
        this.error = true;
        this.mensaje = "No se encontró el token de verificación.";
        return;
      }

      // Enviamos el token de forma explícita
      this.http.post('http://localhost:3000/auth/verify-email', { token: token }).subscribe({
        next: (res) => {
          this.exito = true;
          this.mensaje = '¡Email verificado correctamente!';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (err) => {
          console.error("Error completo:", err);
          this.error = true;
          this.mensaje = 'Error al verificar. El token puede ser inválido o haber expirado.';
        }
      });
    });
  }

  irAlLogin(): void {
    this.router.navigate(['/login']);
  }
}