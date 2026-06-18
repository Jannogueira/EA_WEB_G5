import { useEffect } from 'react';
import { getToken } from 'firebase/messaging';
import { messaging } from '../services/firebase';
import { updateFcmToken } from '../services/usuario';

export default function useFcm() {
  useEffect(() => {
    const setupFCM = async () => {
      // Check if notifications and service workers are supported by the browser
      if (
        typeof window === 'undefined' ||
        !('serviceWorker' in navigator) ||
        !('Notification' in window) ||
        !messaging
      ) {
        console.warn('[FCM Hook] Push notifications are not supported in this browser.');
        return;
      }

      try {
        // Request notifications permission if not already granted
        let permission = Notification.permission;
        if (permission === 'default') {
          permission = await Notification.requestPermission();
        }

        if (permission !== 'granted') {
          console.warn('[FCM Hook] Notification permission not granted by user.');
          return;
        }

        // Prepare the Service Worker URL with Firebase config passed as query parameters.
        // This ensures the service worker has access to Vite environment variables.
        const swParams = new URLSearchParams({
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
          appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
        });
        const swUrl = `/firebase-messaging-sw.js?${swParams.toString()}`;

        // Register the Service Worker
        const registration = await navigator.serviceWorker.register(swUrl, {
          scope: '/'
        });
        console.log('[FCM Hook] Service Worker registered successfully scope:', registration.scope);

        // Retrieve the FCM registration token for this client device
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration
        });

        if (token) {
          console.log('[FCM Hook] FCM Device Token obtained successfully.');
          
          // Save the device token in localStorage to avoid redundant API requests
          const cachedToken = localStorage.getItem('fcmToken');
          if (cachedToken !== token) {
            await updateFcmToken(token);
            localStorage.setItem('fcmToken', token);
            console.log('[FCM Hook] FCM Device Token saved to backend.');
          }
        } else {
          console.warn('[FCM Hook] No registration token received. Generate VAPID key or check credentials.');
        }

      } catch (error) {
        console.error('[FCM Hook] Error setting up FCM Web Push:', error);
      }
    };

    // Run setup after authentication state checks (the hook is loaded inside authenticated views)
    setupFCM();
  }, []);
}
