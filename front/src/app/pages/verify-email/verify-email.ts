import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-verify-email',
  imports: [RouterLink],
  templateUrl: './verify-email.html',
})
export class VerifyEmailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  loading = signal(true);

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.toastService.error('El enlace de verificación no es válido.');
      this.router.navigate(['/login']);
      return;
    }

    this.http.post(`${environment.apiUrl}/auth/verify-email`, { token }).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastService.success('¡Email verificado correctamente!');
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Error al verificar el email');
        this.router.navigate(['/login']);
      },
    });
  }
}
