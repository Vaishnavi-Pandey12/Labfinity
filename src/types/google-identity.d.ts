/**
 * Type definitions for Google Identity Services.
 * Reference: https://developers.google.com/identity/gsi/web
 * 
 * Add this to your types or global.d.ts if you want better IDE support.
 */

interface GoogleCredentialResponse {
  credential: string; // JWT ID token from Google
  select_by?: string;
  clientId?: string;
}

interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    context?: string;
  }): void;
  
  prompt(
    onSuccess?: (response: GoogleCredentialResponse) => void,
    onError?: () => void
  ): void;
  
  renderButton(
    parent: HTMLElement,
    options?: {
      type?: 'standard' | 'icon';
      theme?: 'outline' | 'filled_blue' | 'filled_black';
      size?: 'large' | 'medium' | 'small';
      text?: 'signin_with' | 'signup_with' | 'signin' | 'signup';
      shape?: 'rectangular' | 'pill' | 'circle' | 'square';
      logo_alignment?: 'left' | 'center';
      width?: string;
      locale?: string;
    }
  ): void;
  
  disableAutoSelect(): void;
  getLength(): number;
  revoke(access_token: string, onRevoke?: () => void): void;
  cancel(): void;
}

interface GoogleAccounts {
  id: GoogleAccountsId;
}

interface Window {
  google?: {
    accounts?: GoogleAccounts;
  };
}
