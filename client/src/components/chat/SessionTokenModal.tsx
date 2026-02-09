import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { KeyRound, ShieldCheck, ExternalLink, AlertCircle, ChevronDown, ChevronUp, Cookie } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getConvincingHeaders } from '@/utils/api-headers';

interface SessionTokenModalProps {
  open: boolean;
  onSave: (token: string, cookies?: string, baseUrl?: string) => void;
}

export const SessionTokenModal = ({ open, onSave }: SessionTokenModalProps) => {
  const [tokenValue, setTokenValue] = useState(() => localStorage.getItem('obsidian-access-token') || '');
  const [cookieValue, setCookieValue] = useState(() => localStorage.getItem('obsidian-chat-cookies') || '');
  const [baseUrlValue, setBaseUrlValue] = useState(() => localStorage.getItem('obsidian-chat-backend-url') || 'http://localhost:8000');
  const [isCookiesOpen, setIsCookiesOpen] = useState(!!localStorage.getItem('obsidian-chat-cookies'));
  const [isBaseUrlOpen, setIsBaseUrlOpen] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';

      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = '';
    }
  }, [open]);

  if (!isMounted || !open) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedToken = tokenValue.trim();
    const trimmedCookies = cookieValue.trim();

    if (!trimmedToken) {
      setError('Token cannot be empty');
      return;
    }
    if (trimmedToken.length < 50) {
      setError('That doesn\'t look like a valid session token');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const sanitizedBaseUrl = baseUrlValue.trim().endsWith('/') ? baseUrlValue.trim().slice(0, -1) : baseUrlValue.trim();
      const response = await fetch(`${sanitizedBaseUrl}/proxy/https://chatgpt.com/backend-api/me`, {
        headers: getConvincingHeaders(trimmedToken, trimmedCookies),
      });

      if (response.status === 401 || response.status === 403) {
        setError('Unauthorized: The session token or cookies are invalid');
        setIsValidating(false);
        return;
      }

      if (!response.ok) {
        setError('Failed to validate. Please check your connection or the proxy.');
        setIsValidating(false);
        return;
      }

      onSave(trimmedToken, trimmedCookies, sanitizedBaseUrl);
    } catch (err) {
      setError(`Connection error: Make sure the backend is running at ${baseUrlValue}`);
    } finally {
      setIsValidating(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        aria-hidden="true"
      />

      <div
        className={cn(
          "relative w-full max-w-lg glass-panel overflow-hidden rounded-2xl border border-white/[0.12] shadow-2xl shadow-black/50 transition-all duration-300",
          "animate-in fade-in zoom-in-95 slide-in-from-bottom-4"
        )}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

        <div className="p-6 sm:p-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-inner ring-1 ring-primary/20">
              <KeyRound className="h-7 w-7 text-primary animate-pulse" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Connect to ChatGPT
            </h2>
            <p className="mt-2.5 text-[14px] leading-relaxed text-muted-foreground max-w-[340px]">
              Authenticate your session with your token and optional cookies to enable secure messaging.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[13px] font-medium text-foreground/90">
                    Access Token
                  </label>
                  <a
                    href="https://chatgpt.com/api/auth/session"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[12px] text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    Get token <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="relative">
                  <textarea
                    ref={inputRef}
                    value={tokenValue}
                    onChange={(e) => {
                      setTokenValue(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Paste your ChatGPT access token here..."
                    rows={3}
                    className={cn(
                      "glass-input scrollbar-thin w-full resize-none rounded-xl border border-white/[0.08] px-4 py-3.5 text-[14px] text-foreground placeholder:text-muted-foreground/50 transition-all duration-300",
                      "focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10",
                      error && "border-destructive/40 focus:border-destructive/50 focus:ring-destructive/10"
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setIsCookiesOpen(!isCookiesOpen)}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-[13px] font-medium text-muted-foreground hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Cookie className="h-3.5 w-3.5" />
                    <span>Cookies (Optional)</span>
                  </div>
                  {isCookiesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                <div className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out px-1",
                  isCookiesOpen ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
                )}>
                  <textarea
                    value={cookieValue}
                    onChange={(e) => {
                      setCookieValue(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="oai-did=...; __Host-next-auth.csrf-token=..."
                    rows={3}
                    className={cn(
                      "glass-input scrollbar-thin w-full resize-none rounded-xl border border-white/[0.08] px-4 py-3.5 text-[14px] text-foreground placeholder:text-muted-foreground/50 transition-all duration-300",
                      "focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10"
                    )}
                  />
                  <p className="mt-1.5 text-[11px] text-muted-foreground/60 leading-relaxed px-1">
                    Copy the entire 'cookie' header from network inspector for full functionality.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setIsBaseUrlOpen(!isBaseUrlOpen)}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-[13px] font-medium text-muted-foreground hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Backend URL</span>
                  </div>
                  {isBaseUrlOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                <div className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out px-1",
                  isBaseUrlOpen ? "max-h-24 opacity-100 mt-2" : "max-h-0 opacity-0"
                )}>
                  <input
                    type="text"
                    value={baseUrlValue}
                    onChange={(e) => {
                      setBaseUrlValue(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="http://localhost:8000"
                    className={cn(
                      "glass-input w-full rounded-xl border border-white/[0.08] px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/50 transition-all duration-300",
                      "focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10"
                    )}
                  />
                  <p className="mt-1.5 text-[11px] text-muted-foreground/60 leading-relaxed px-1">
                    The URL of your <a href="https://github.com/debxylen/Obsidian-Client/tree/main/backend" target="_blank" rel="noopener noreferrer" className="text-primary">Obsidian backend</a>
                  </p>
                </div>
              </div>

              {error && (
                <div className="mt-2 flex items-center gap-1.5 text-[12px] text-destructive px-1 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {error}
                </div>
              )}
            </div>

            <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3.5">
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mt-0.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[12px] font-medium text-foreground">
                    Private & Secure
                  </p>
                  <p className="text-[11.5px] leading-normal text-muted-foreground">
                    Your credentials are stored locally in your browser and are never transmitted to our backend servers.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!tokenValue.trim() || isValidating}
              className={cn(
                "group relative w-full h-11 overflow-hidden rounded-xl bg-primary text-[14px] font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300",
                "hover:translate-y-[-1px] hover:shadow-primary/30 active:translate-y-[0px] active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <span className="relative z-10 flex items-center justify-center gap-2">
                {isValidating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Validating...
                  </>
                ) : (
                  'Continue to Chat'
                )}
              </span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
            <p className="text-[12px] text-muted-foreground">
              Don't have a token? <span className="text-foreground/80 font-medium cursor-pointer">Follow the setup guide</span>
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
