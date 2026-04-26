import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              width?: number;
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
            },
          ) => void;
        };
      };
    };
  }
}

interface Props {
  clientId: string;
  onCredential: (credential: string) => void;
}

export default function GoogleSignInButton({ clientId, onCredential }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !clientId) return;

    const tryRender = () => {
      if (!window.google?.accounts?.id) {
        setTimeout(tryRender, 100);
        return;
      }
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => onCredential(response.credential),
      });
      window.google.accounts.id.renderButton(ref.current!, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with',
        shape: 'rectangular',
      });
    };

    tryRender();
  }, [clientId, onCredential]);

  if (!clientId) return null;

  return <div ref={ref} className="flex justify-center" />;
}
