import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ed3a2c5cacfe4f5e9323ff0f2fb92f9b',
  appName: 'IP Extension',
  webDir: 'dist',
  // server configuration commented out to load from local files only
  // Uncomment only for development hot-reload from Lovable
  // server: {
  //   url: 'https://ed3a2c5c-acfe-4f5e-9323-ff0f2fb92f9b.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1e40af',
      showSpinner: true,
      spinnerColor: '#ffffff'
    }
  }
};

export default config;