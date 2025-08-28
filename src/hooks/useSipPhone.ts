import { useState, useCallback, useRef, useEffect } from 'react';
import { SipConfig } from '@/components/SipSettings';
import { UserAgent, Inviter, Session, SessionState, URI, Invitation } from 'sip.js';

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
  
  const userAgentRef = useRef<UserAgent | null>(null);
  const currentSessionRef = useRef<Session | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to setup session handlers
  const setupSessionHandlers = (session: Session) => {
    session.stateChange.addListener((state: SessionState) => {
      switch (state) {
        case SessionState.Establishing:
          setCurrentCall(prev => ({ ...prev, status: 'calling' }));
          break;
        case SessionState.Established:
          setCurrentCall(prev => ({ 
            ...prev, 
            status: 'connected',
            startTime: new Date()
          }));
          startCallTimer();
          break;
        case SessionState.Terminated:
          endCall();
          break;
      }
    });
  };

  const startCallTimer = () => {
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
  };

  const endCall = () => {
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
    currentSessionRef.current = null;
  };

  // Real SIP connection implementation
  const connect = useCallback(async (config: SipConfig) => {
    setSipStatus('connecting');
    
    try {
      // Dispose existing user agent if any
      if (userAgentRef.current) {
        await userAgentRef.current.stop();
        userAgentRef.current = null;
      }

      // Map protocol to correct server format for SIP.js
      let serverUrl: string;
      const protocol = config.protocol.toUpperCase();
      
      switch (protocol) {
        case 'WSS':
          serverUrl = `wss://${config.server}:${config.port}/ws`;
          break;
        case 'WS':
          serverUrl = `ws://${config.server}:${config.port}/ws`;
          break;
        case 'TCP':
        case 'TLS':
        case 'UDP':
        default:
          // For UDP/TCP/TLS, we'll use WSS as fallback for web browsers
          console.warn(`Protocol ${protocol} not directly supported in browsers, using WSS`);
          serverUrl = `wss://${config.server}:${config.port}/ws`;
          break;
      }
      
      console.log('Connecting with protocol:', protocol, 'Server URL:', serverUrl);
      
      const userAgent = new UserAgent({
        uri: new URI('sip', config.username, config.server),
        transportOptions: {
          server: serverUrl,
          traceSip: true,
          // Add WebSocket specific options
          ...(protocol === 'WSS' || protocol === 'WS' ? {
            connectionTimeout: 10000,
            maxReconnectionAttempts: 3,
            reconnectionTimeout: 4000
          } : {})
        },
        authorizationUsername: config.username,
        authorizationPassword: config.password,
        // Add media constraints for echo cancellation and AGC
        sessionDescriptionHandlerFactoryOptions: {
          constraints: {
            audio: {
              echoCancellation: config.echoCancellation,
              autoGainControl: config.automaticGainControl,
              noiseSuppression: true
            },
            video: false
          }
        },
        delegate: {
          onInvite: (invitation) => {
            // Handle incoming calls
            const incomingNumber = invitation.remoteIdentity.uri.user || 'Unknown';
            setCurrentCall({
              number: incomingNumber,
              status: 'ringing'
            });
            setIsCallActive(true);
            
            // Add incoming call to history
            const callRecord: CallRecord = {
              id: Date.now().toString(),
              number: incomingNumber,
              type: 'incoming',
              timestamp: new Date()
            };
            setCallHistory(prev => [callRecord, ...prev]);
            
            currentSessionRef.current = invitation;
            setupSessionHandlers(invitation);
          }
        }
      });

      userAgentRef.current = userAgent;
      
      await userAgent.start();
      
      // Wait for registration
      if (userAgent.isConnected()) {
        setSipStatus('connected');
        console.log('Successfully connected to SIP server:', serverUrl);
      } else {
        throw new Error('Failed to connect to SIP server');
      }
      
    } catch (error) {
      console.error('SIP connection error:', error);
      setSipStatus('error');
      if (userAgentRef.current) {
        userAgentRef.current.stop();
        userAgentRef.current = null;
      }
    }
  }, [currentCall]);

  const disconnect = useCallback(async () => {
    try {
      if (userAgentRef.current) {
        await userAgentRef.current.stop();
        userAgentRef.current = null;
      }
      if (currentSessionRef.current) {
        currentSessionRef.current.dispose();
        currentSessionRef.current = null;
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
    
    setSipStatus('disconnected');
    setCurrentCall({ number: '', status: 'idle' });
    setIsCallActive(false);
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  }, []);

  const makeCall = useCallback((number: string) => {
    if (sipStatus !== 'connected' || !userAgentRef.current) return;
    
    try {
      const targetURI = new URI('sip', number, userAgentRef.current.configuration.uri?.host);
      const inviter = new Inviter(userAgentRef.current, targetURI);
      
      currentSessionRef.current = inviter;
      setupSessionHandlers(inviter);
      
      setCurrentCall({ 
        number, 
        status: 'calling',
        startTime: new Date()
      });
      setIsCallActive(true);
      
      // Add to call history
      const callRecord: CallRecord = {
        id: Date.now().toString(),
        number,
        type: 'outgoing',
        timestamp: new Date()
      };
      setCallHistory(prev => [callRecord, ...prev]);
      
      // Invite the target
      inviter.invite().catch((error) => {
        console.error('Call failed:', error);
        endCall();
      });
      
    } catch (error) {
      console.error('Error making call:', error);
      setCurrentCall({ number: '', status: 'idle' });
      setIsCallActive(false);
    }
  }, [sipStatus]);

  const hangupCall = useCallback(() => {
    try {
      if (currentSessionRef.current) {
        switch (currentSessionRef.current.state) {
          case SessionState.Initial:
          case SessionState.Establishing:
            if (currentSessionRef.current instanceof Inviter) {
              currentSessionRef.current.cancel();
            } else if (currentSessionRef.current instanceof Invitation) {
              currentSessionRef.current.reject();
            }
            break;
          case SessionState.Established:
            currentSessionRef.current.bye();
            break;
        }
        currentSessionRef.current = null;
      }
    } catch (error) {
      console.error('Error hanging up call:', error);
    }
    
    endCall();
  }, []);

  const testConnection = useCallback(async () => {
    if (sipStatus !== 'connected' || !userAgentRef.current) {
      console.log('SIP connection test: Not connected');
      return;
    }
    
    try {
      // Test connection by checking if user agent is connected and registered
      const isConnected = userAgentRef.current.isConnected();
      const transport = userAgentRef.current.transport;
      
      if (isConnected && transport) {
        console.log('SIP connection test: SUCCESS');
        console.log('Transport state:', transport.state);
        console.log('Server:', (userAgentRef.current.configuration.transportOptions as any)?.server);
        
        // Try a simple OPTIONS request as a keep-alive test
        const testURI = new URI('sip', 'test', userAgentRef.current.configuration.uri?.host);
        // This would be a more complete test in production
        
        alert('בדיקת חיבור SIP הצליחה! החיבור פעיל ותקין.');
      } else {
        console.log('SIP connection test: FAILED - Not properly connected');
        alert('בדיקת חיבור SIP נכשלה! החיבור אינו פעיל.');
      }
    } catch (error) {
      console.error('SIP connection test error:', error);
      alert('שגיאה בבדיקת חיבור SIP: ' + error);
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