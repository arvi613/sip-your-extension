import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PhoneCall, PhoneIncoming, PhoneMissed, Clock, Phone } from "lucide-react";

interface CallRecord {
  id: string;
  number: string;
  type: 'incoming' | 'outgoing' | 'missed';
  timestamp: Date;
  duration?: string;
}

interface CallHistoryProps {
  calls: CallRecord[];
  onCallBack: (number: string) => void;
  isMobile?: boolean;
}

const CallHistory = ({ calls, onCallBack, isMobile = false }: CallHistoryProps) => {
  const getCallIcon = (type: CallRecord['type']) => {
    switch (type) {
      case 'incoming':
        return <PhoneIncoming className="h-4 w-4 text-success" />;
      case 'outgoing':
        return <PhoneCall className="h-4 w-4 text-primary" />;
      case 'missed':
        return <PhoneMissed className="h-4 w-4 text-destructive" />;
    }
  };

  const getCallTypeText = (type: CallRecord['type']) => {
    switch (type) {
      case 'incoming':
        return 'שיחה נכנסת';
      case 'outgoing':
        return 'שיחה יוצאת';
      case 'missed':
        return 'שיחה שלא נענתה';
    }
  };

  const getCallTypeBadge = (type: CallRecord['type']) => {
    switch (type) {
      case 'incoming':
        return <Badge variant="secondary" className="bg-success/10 text-success">נכנסת</Badge>;
      case 'outgoing':
        return <Badge variant="secondary" className="bg-primary/10 text-primary">יוצאת</Badge>;
      case 'missed':
        return <Badge variant="destructive" className="bg-destructive/10 text-destructive">החמצה</Badge>;
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  return (
    <Card className="p-4 bg-phone-surface shadow-phone">
      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">היסטוריית שיחות</h2>
      </div>

      {calls.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>אין היסטוריית שיחות</p>
        </div>
      ) : (
        <div className="space-y-3">
          {calls.map((call) => (
            <div
              key={call.id}
              className="flex items-center justify-between p-3 rounded-lg bg-phone-button hover:bg-phone-button-hover transition-colors duration-200"
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse flex-1">
                {getCallIcon(call.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{call.number}</span>
                    {getCallTypeBadge(call.type)}
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-muted-foreground">
                    <span>{formatTime(call.timestamp)}</span>
                    {call.duration && (
                      <>
                        <span>•</span>
                        <span>{call.duration}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCallBack(call.number)}
                  className="text-primary hover:text-primary-foreground hover:bg-primary"
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default CallHistory;