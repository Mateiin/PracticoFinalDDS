import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';


import { Navbar } from './shared/navbar/navbar'; 
import { Footer } from './shared/footer/footer';
import { BottomNav } from './shared/bottom-nav/bottom-nav';
import { ToastComponent } from './shared/toast/toast';

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    Navbar,
    Footer,
    BottomNav,
    ToastComponent
  ],
  templateUrl: 'app.html',
  styleUrls: ['app.css'],
})
export class AppComponent {}