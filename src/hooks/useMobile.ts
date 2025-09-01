import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

interface DeviceInfo {
  platform: string;
  isNative: boolean;
  operatingSystem: string;
}

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    platform: 'web',
    isNative: false,
    operatingSystem: 'unknown'
  });

  useEffect(() => {
    // Check if running in Capacitor (native mobile app)
    const isNative = Capacitor.isNativePlatform();
    const platform = Capacitor.getPlatform();
    
    // Check screen size for mobile detection
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || isNative);
    };

    // Get device info
    setDeviceInfo({
      platform,
      isNative,
      operatingSystem: navigator.platform
    });

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Haptic feedback for mobile devices
  const vibrate = (pattern: number | number[] = 100) => {
    if (navigator.vibrate && (isMobile || deviceInfo.isNative)) {
      navigator.vibrate(pattern);
    }
  };

  // Play system sounds
  const playSound = (type: 'call' | 'ring' | 'hangup' | 'keypress' = 'keypress') => {
    if (isMobile || deviceInfo.isNative) {
      // Create audio context for mobile-optimized sounds
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const frequencies = {
        call: [800, 900],
        ring: [400, 450],
        hangup: [300, 200],
        keypress: [800, 600]
      };

      const [freq1, freq2] = frequencies[type];
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(freq1, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(freq2, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  };

  return {
    isMobile,
    deviceInfo,
    vibrate,
    playSound
  };
};