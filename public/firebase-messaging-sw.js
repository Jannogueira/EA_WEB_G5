// Import and configure Firebase App and Messaging in the Service Worker using compat versions
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Extract Firebase configuration options from the script URL query parameters.
// This allows us to pass Vite's environment variables dynamically when registering the SW.
const urlParams = new URL(self.location).searchParams;
const firebaseConfig = {
  apiKey: urlParams.get('apiKey'),
  authDomain: urlParams.get('authDomain'),
  projectId: urlParams.get('projectId'),
  storageBucket: urlParams.get('storageBucket'),
  messagingSenderId: urlParams.get('messagingSenderId'),
  appId: urlParams.get('appId')
};

// Initialize Firebase only if the configuration was provided
if (firebaseConfig.messagingSenderId && firebaseConfig.apiKey) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Listen to background messages when the tab is closed or unfocused
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification?.title || 'Notificación de Univy';
    const notificationOptions = {
      body: payload.notification?.body || 'Tienes un nuevo mensaje.',
      icon: payload.notification?.image || '/avatar.png',
      data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} else {
  console.warn('[firebase-messaging-sw.js] Firebase credentials not supplied via search parameters.');
}
