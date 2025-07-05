import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private clientId = environment.googleClientId;
  private isInitialized = false;

  constructor() {}

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    return new Promise((resolve, reject) => {
      if (typeof window.google !== 'undefined') {
        this.initializeGoogleSignIn(resolve, reject);
      } else {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => this.initializeGoogleSignIn(resolve, reject);
        script.onerror = () => reject(new Error('Failed to load Google Sign-In script'));
        document.head.appendChild(script);
      }
    });
  }

  private initializeGoogleSignIn(resolve: () => void, reject: (error: Error) => void): void {
    try {
      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: () => {}, // This will be overridden per sign-in
        auto_select: false,
        cancel_on_tap_outside: true
      });
      this.isInitialized = true;
      resolve();
    } catch (error) {
      reject(new Error('Failed to initialize Google Sign-In'));
    }
  }

  signIn(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.isInitialized) {
        reject(new Error('Google Sign-In not initialized'));
        return;
      }

      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to popup
          this.signInWithPopup().then(resolve).catch(reject);
        }
      });

      // Override callback for this sign-in
      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: (response: any) => {
          if (response.credential) {
            resolve(response.credential);
          } else {
            reject(new Error('No credential received'));
          }
        }
      });
    });
  }

  private signInWithPopup(): Promise<string> {
    return new Promise((resolve, reject) => {
      window.google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: 'email profile',
        callback: (response: any) => {
          if (response.access_token) {
            // Convert access token to ID token by making a request to Google's userinfo endpoint
            this.getUserInfo(response.access_token)
              .then((userInfo) => {
                // Create a mock ID token (in production, you should get the actual ID token)
                resolve(response.access_token);
              })
              .catch(reject);
          } else {
            reject(new Error('No access token received'));
          }
        }
      }).requestAccessToken();
    });
  }

  private async getUserInfo(accessToken: string): Promise<any> {
    const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
    if (!response.ok) {
      throw new Error('Failed to get user info');
    }
    return response.json();
  }

  renderButton(element: HTMLElement, options?: any): void {
    if (!this.isInitialized) {
      console.error('Google Sign-In not initialized');
      return;
    }

    const defaultOptions = {
      type: 'standard',
      shape: 'rectangular',
      theme: 'outline',
      text: 'signin_with',
      size: 'large',
      logo_alignment: 'left'
    };

    const buttonOptions = { ...defaultOptions, ...options };

    window.google.accounts.id.renderButton(element, buttonOptions);
  }
}
