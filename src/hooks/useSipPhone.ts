import { useState, useCallback, useRef, useEffect } from 'react';
import { SipConfig } from '@/components/SipSettings';

interface CallRecord {
  id: string;
  number: string;
  type: 'incoming' | 'outgoing' | 'missed';
  timestamp: Date;
  duration?: string;
}

interface CurrentCall {
  number: string;
  status: 'idle' | 'calling' | 'connected' | 'ringing';
  duration?: string;
  startTime?: Date;
}

export const useSipPhone = () => {
  const [sipStatus, setSipStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [currentCall, setCurrentCall] = useState<CurrentCall>({ number: '', status: 'idle' });
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const [isCallActive, setIsCallActive] = useState(false);
  
  const sipSessionRef = useRef<any>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mock SIP connection for demonstration
  const connect = useCallback(async (config: SipConfig) => {
    setSipStatus('connecting');
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      // In a real implementation, you would use SIP.js here
      // const userAgent = new SIP.UserAgent({
      //   uri: `sip:${config.username}@${config.server}`,
      //   transportOptions: {
      //     server: `${config.protocol.toLowerCase()}://${config.server}:${config.port}`
      //   },
      //   authorizationUsername: config.username,
      //   authorizationPassword: config.password
      // });
      
      console.log('Connecting to SIP server:', config);
      setSipStatus('connected');
    } catch (error) {
      console.error('SIP connection error:', error);
      setSipStatus('error');
    }
  }, []);

  const disconnect = useCallback(() => {
    setSipStatus('disconnected');
    setCurrentCall({ number: '', status: 'idle' });
    setIsCallActive(false);
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  }, []);

  const makeCall = useCallback((number: string) => {
    if (sipStatus !== 'connected') return;
    
    setCurrentCall({ 
      number, 
      status: 'calling',
      startTime: new Date()
    });
    setIsCallActive(true);

    // Simulate call connection after 3 seconds
    setTimeout(() => {
      setCurrentCall(prev => ({ 
        ...prev, 
        status: 'connected',
        startTime: new Date()
      }));
      
      // Start call timer
      callTimerRef.current = setInterval(() => {
        setCurrentCall(prev => {
          if (prev.startTime) {
            const elapsed = Math.floor((Date.now() - prev.startTime.getTime()) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            return {
              ...prev,
              duration: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            };
          }
          return prev;
        });
      }, 1000);
    }, 3000);

    // Add to call history
    const callRecord: CallRecord = {
      id: Date.now().toString(),
      number,
      type: 'outgoing',
      timestamp: new Date()
    };
    setCallHistory(prev => [callRecord, ...prev]);
  }, [sipStatus]);

  const hangupCall = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    
    // Update call history with duration if call was connected
    if (currentCall.status === 'connected' && currentCall.duration) {
      setCallHistory(prev => 
        prev.map(call => 
          call.number === currentCall.number ? 
            { ...call, duration: currentCall.duration } : 
            call
        )
      );
    }
    
    setCurrentCall({ number: '', status: 'idle' });
    setIsCallActive(false);
  }, [currentCall]);

  const testConnection = useCallback(() => {
    if (sipStatus === 'connected') {
      console.log('SIP connection test: OK');
      // Here you would implement actual SIP testing
    }
  }, [sipStatus]);

  useEffect(() => {
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, []);

  return {
    sipStatus,
    currentCall,
    callHistory,
    isCallActive,
    connect,
    disconnect,
    makeCall,
    hangupCall,
    testConnection,
    isConnected: sipStatus === 'connected'
  };
};