<<<<<<< HEAD
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-verify-email',
  imports: [CommonModule],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
=======
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-verify-email',
  imports: [RouterLink],
  templateUrl: './verify-email.html'
>>>>>>> cambiosParaSMPT
})
export class VerifyEmailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
<<<<<<< HEAD
  private http = inject(HttpClient);

  isLoading = false;
  message = '';
  success = false;

  ngOnInit() {
    this.verifyEmail();
  }

  verifyEmail() {
    this.isLoading = true;
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      if (token) {
        const api = `${environment.apiUrl}/auth/verify-email`;
        this.http.post(api, { token }).subscribe({
          next: () => {
            this.success = true;
            this.message = '¡Email verificado correctamente!';
            setTimeout(() => this.router.navigate(['/']), 2000);
          },
          error: (err: HttpErrorResponse) => {
            this.success = false;
            this.message = (err.error?.message as string) || 'Error al verificar el email';
            this.isLoading = false;
          },
        });
      } else {
        this.message = 'Token de verificación no encontrado';
        this.isLoading = false;
      }
    });
  }
}
=======
  private toastService = inject(ToastService);

  loading = signal(true);

  ngOnInit() {
    // 1. Agarramos el token que viene en el link del correo (?token=xxxxx)
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.toastService.error('El enlace de verificación no es válido.');
      this.router.navigate(['/login']);
      return;
    }

    // 2. Simulamos el tiempo de espera del servidor y tiramos el Toast de éxito
    setTimeout(() => {
      this.loading.set(false);
      this.toastService.success('¡Email verificado correctamente!');
    }, 1500);
  }
}
>>>>>>> cambiosParaSMPT
