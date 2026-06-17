import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true, 
  imports: [FormsModule, CommonModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent implements OnInit {
  token: string | null = '';
  nuevaClave: string = '';
  confirmarClave: string = '';
  errorMismatch: boolean = false;
  exito: boolean = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  cambiarContrasena() {
    this.errorMismatch = false;

    if (this.nuevaClave !== this.confirmarClave) {
      this.errorMismatch = true;
      return;
    }

    if (this.nuevaClave.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    this.exito = true;
  }
}