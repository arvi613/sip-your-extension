import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneCall, PhoneIncoming, Wifi, WifiOff } from "lucide-react";

interface CallStatusProps {
  isConnected: boolean;
  sipStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  currentCall?: {
    number: string;
    status: 'idle' | 'calling' | 'connected' | 'ringing';
    duration?: string;
  };
}

const CallStatus = ({ isConnected, sipStatus, currentCall }: CallStatusProps) => {
  const getSipStatusBadge = () => {
    switch (sipStatus) {
      case 'connected':
        return <Badge variant="secondary" className="bg-success text-success-foreground">
          <Wifi className="h-3 w-3 mr-1" />
          מחובר לשרת SIP
        </Badge>;
      case 'connecting':
        return <Badge variant="outline" className="bg-info text-info-foreground">
          <PhoneCall className="h-3 w-3 mr-1 animate-pulse" />
          מתחבר...
        </Badge>;
      case 'error':
        return <Badge variant="destructive">
          <WifiOff className="h-3 w-3 mr-1" />
          שגיאת חיבור
        </Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">
          <WifiOff className="h-3 w-3 mr-1" />
          לא מחובר
        </Badge>;
    }
  };

  const getCallStatusIcon = () => {
    if (!currentCall || currentCall.status === 'idle') return null;
    
    switch (currentCall.status) {
      case 'calling':
        return <PhoneCall className="h-5 w-5 text-phone-calling animate-pulse" />;
      case 'connected':
        return <Phone className="h-5 w-5 text-success" />;
      case 'ringing':
        return <PhoneIncoming className="h-5 w-5 text-phone-ringing animate-bounce" />;
      default:
        return null;
    }
  };

  const getCallStatusText = () => {
    if (!currentCall || currentCall.status === 'idle') return null;
    
    switch (currentCall.status) {
      case 'calling':
        return 'מחייג...';
      case 'connected':
        return `שיחה פעילה${currentCall.duration ? ` - ${currentCall.duration}` : ''}`;
      case 'ringing':
        return 'שיחה נכנסת';
      default:
        return null;
    }
  };

  return (
    <Card className="p-4 bg-gradient-surface border-border shadow-phone">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <h2 className="text-lg font-semibold text-foreground">סטטוס שלוחה</h2>
          {getSipStatusBadge()}
        </div>
        
        {currentCall && currentCall.status !== 'idle' && (
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {getCallStatusIcon()}
            <div className="text-left rtl:text-right">
              <div className="font-semibold text-foreground">{currentCall.number}</div>
              <div className="text-sm text-muted-foreground">{getCallStatusText()}</div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CallStatus;