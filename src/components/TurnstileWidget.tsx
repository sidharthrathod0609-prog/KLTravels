import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string | null) => void;
}

export const TurnstileWidget = ({ onVerify }: TurnstileWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const scriptId = "cloudflare-turnstile-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    
    const initTurnstile = () => {
      if (window.turnstile && containerRef.current && !widgetIdRef.current) {
        try {
          const sitekey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"; // Dummy testing sitekey as default
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: sitekey,
            callback: (token: string) => {
              onVerify(token);
            },
            "expired-callback": () => {
              onVerify(null);
            },
            "error-callback": () => {
              onVerify(null);
            },
            theme: "dark",
          });
        } catch (e) {
          console.error("Turnstile render error:", e);
        }
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      window.onloadTurnstileCallback = () => {
        initTurnstile();
      };
    } else {
      if (window.turnstile) {
        initTurnstile();
      } else {
        // Wait if loading
        window.onloadTurnstileCallback = () => {
          initTurnstile();
        };
      }
    }

    return () => {
      if (window.turnstile && widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch (e) {
          // Ignore teardown errors
        }
      }
    };
  }, [onVerify]);

  return (
    <div className="flex flex-col items-center justify-center my-4 p-2 bg-secondary/10 border border-border/50 rounded-lg">
      <p className="text-xs text-muted-foreground mb-2">Please complete the security check to continue</p>
      <div ref={containerRef} className="min-h-[65px]" />
    </div>
  );
};
