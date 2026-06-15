import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para usar ngIf en el HTML
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-verify-email',
  imports: [CommonModule], // <-- Agregamos CommonModule acá
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css',
})
export class VerifyEmail implements OnInit {
  // Variables para controlar lo que mostramos en pantalla
  mensaje: string = 'Verificando tu cuenta...';
  exito: boolean = false;
  error: boolean = false;

  constructor(
    private route: ActivatedRoute, // Para leer la URL
    private http: HttpClient,      // Para hacer la petición al back
    private router: Router         // Para redirigir al login
  ) {}

  ngOnInit(): void {
  // Nos suscribimos a los parámetros de la URL para esperar a que estén listos
  this.route.queryParams.subscribe(params => {
    const token = params['token'];
    
    if (token) {
      this.http.post('http://localhost:3000/auth/verify-email', { token }).subscribe({
        next: (res) => {
          console.log("Éxito:", res);
          // Acá ponés tu lógica de éxito
        },
        error: (err) => {
          console.error("Error al verificar:", err);
          // Acá ponés tu lógica de error
        }
      });
    } else {
      console.error("No se encontró el token en la URL");
    }
  });
}

  // Función para el botón del HTML
  irAlLogin(): void {
    this.router.navigate(['/login']);
  }
}