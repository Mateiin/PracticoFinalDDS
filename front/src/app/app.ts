import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet
  ],
  templateUrl: 'app.html',
  styleUrls: ['app.css'],
})
export class AppComponent {}
