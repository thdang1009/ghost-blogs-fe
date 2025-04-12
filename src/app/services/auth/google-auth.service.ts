import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '@environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { handleError } from '@shared/common';
import { GoogleLoginRequest, GoogleLoginResponse } from './google-auth.model';
import { CONSTANT } from '@shared/constant';
import { Router } from '@angular/router';

declare const google: any;

const apiUrl = environment.apiUrl + '/v1/auth';
const apiUrlGoogle = environment.apiUrl + '/v1/auth/google';

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private googleClientId = '67382640406-n2t19su323cdfrkhvi72dmcg4abd2pg5.apps.googleusercontent.com';

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) { }

  /**
   * Initialize Google Sign-In
   * @param buttonId Element ID for the Google Sign-In button
   */
  initGoogleSignIn(buttonId: string): void {
    // Ensure the Google API is loaded
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        client_id: this.googleClientId,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // Render the button
      google.accounts.id.renderButton(
        document.getElementById(buttonId),
        { theme: 'outline', size: 'large', width: '100%' }
      );
    } else {
      console.error('Google API not loaded yet');
    }
  }

  /**
   * Handle the credential response from Google
   * @param response The credential response from Google
   */
  private handleCredentialResponse(response: any): void {
    if (response.credential) {
      // Send the ID token to your server for verification
      this.verifyGoogleToken(response.credential).subscribe(
        (result) => {
          console.log('Google authentication successful!', result);
          // Handle successful login
          if (result.token) {
            localStorage.setItem(CONSTANT.TOKEN, result.token);
            this.router.navigate(['/admin/dashboard']);
          }
        },
        (error) => {
          console.error('Google authentication failed', error);
        }
      );
    }
  }

  /**
   * Verify Google token with backend
   * @param idToken The ID token from Google
   */
  verifyGoogleToken(idToken: string): Observable<GoogleLoginResponse> {
    const request: GoogleLoginRequest = { token: idToken };

    return this.http.post<GoogleLoginResponse>(`${apiUrlGoogle}`, request)
      .pipe(
        tap((resp) => {
          this.authService.handleLoginResponse(resp);
        }),
        catchError(handleError<GoogleLoginResponse>('googleAuth'))
      );
  }

  /**
   * Sign out from Google
   */
  signOut(): void {
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.disableAutoSelect();
    }
    // Use the regular logout from AuthService
    this.authService.logout().subscribe();
  }
}
