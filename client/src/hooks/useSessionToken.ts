import { useState, useEffect, useCallback } from 'react';

const TOKEN_KEY = 'obsidian-access-token';
const COOKIE_KEY = 'obsidian-chat-cookies';
const BASE_URL_KEY = 'obsidian-chat-backend-url';
const DEFAULT_BASE_URL = 'http://localhost:8000';

export function useSessionToken() {
  const [token, setToken] = useState<string | null>(() => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(TOKEN_KEY + '='))
      ?.split('=')[1];

    if (cookieValue) {
      const decoded = decodeURIComponent(cookieValue);
      localStorage.setItem(TOKEN_KEY, decoded);
      document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      return decoded;
    }

    return localStorage.getItem(TOKEN_KEY);
  });

  const [cookieString, setCookieString] = useState<string | null>(() => {
    return localStorage.getItem(COOKIE_KEY);
  });

  const [baseUrl, setBaseUrl] = useState<string>(() => {
    return localStorage.getItem(BASE_URL_KEY) || DEFAULT_BASE_URL;
  });

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!token) {
      setShowModal(true);
    }
  }, [token]);

  const saveToken = useCallback((newToken: string, newCookie?: string, newBaseUrl?: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);

    if (newCookie !== undefined) {
      if (newCookie) {
        localStorage.setItem(COOKIE_KEY, newCookie);
        setCookieString(newCookie);
      } else {
        localStorage.removeItem(COOKIE_KEY);
        setCookieString(null);
      }
    }

    if (newBaseUrl !== undefined) {
      const sanitizedUrl = newBaseUrl.endsWith('/') ? newBaseUrl.slice(0, -1) : newBaseUrl;
      localStorage.setItem(BASE_URL_KEY, sanitizedUrl);
      setBaseUrl(sanitizedUrl);
    }

    setShowModal(false);
    window.location.reload();
  }, []);

  const clearToken = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(COOKIE_KEY);
    localStorage.removeItem(BASE_URL_KEY);
    setToken(null);
    setCookieString(null);
    setBaseUrl(DEFAULT_BASE_URL);
    setShowModal(true);
  }, []);

  return { token, cookieString, baseUrl, showModal, setShowModal, saveToken, clearToken };
}
