'use client';

import { useEffect } from 'react';

export default function ServiceWorkerScript() {
  useEffect(() => {
    // Disable service worker in development to prevent caching issues
    if (process.env.NODE_ENV === 'development') {
      // Unregister any existing service workers
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.unregister();
            console.log('Unregistered service worker:', registration.scope);
          });
        });
      }
      return;
    }
    
    // Register service worker for production only
    if ('serviceWorker' in navigator) {
      const timer = setTimeout(() => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
          });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return null;
} 