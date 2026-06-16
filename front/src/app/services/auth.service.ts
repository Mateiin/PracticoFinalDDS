import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginDto, RegisterDto } from '../models/auth';
import { SafeUser } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'access_token';

  user = signal<SafeUser | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    const token = this.getToken();
    if (token) {
      this.me().subscribe();
    }
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/register`, dto).pipe(
      tap((res) => this.handleAuth(res)),
    );
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/login`, dto).pipe(
      tap((res) => this.handleAuth(res)),
    );
  }

  me(): Observable<SafeUser> {
    return this.http.get<SafeUser>(`${this.api}/me`).pipe(
      tap((user) => this.user.set(user)),
    );
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.post(`${this.api}/verify-email`, { token });
  }

  resendVerification(): Observable<any> {
    return this.http.post(`${this.api}/resend-verification`, {});
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.api}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.api}/reset-password`, { token, password });
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.user()?.role === 'admin';
  }

  private handleAuth(res: AuthResponse): void {
    localStorage.setItem(this.tokenKey, res.access_token);
    this.user.set(res.user);
  }
}
