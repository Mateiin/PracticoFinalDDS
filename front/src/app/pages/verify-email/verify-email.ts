import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-verify-email',
  imports: [RouterLink],
  templateUrl: './verify-email.html'
})
export class VerifyEmailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
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