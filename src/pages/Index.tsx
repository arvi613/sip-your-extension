import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import DialPad from "@/components/DialPad";
import CallStatus from "@/components/CallStatus";
import SipSettings from "@/components/SipSettings";
import CallHistory from "@/components/CallHistory";
import { useSipPhone } from "@/hooks/useSipPhone";
import { useMobile } from "@/hooks/useMobile";
import { Phone, Settings, Clock, Smartphone, Wifi, Battery, Signal } from "lucide-react";

const Index = () => {
  console.log('Index.tsx: Index component starting...');
  
  const {
    sipStatus,
    currentCall,
    callHistory,
    isCallActive,
    connect,
    disconnect,
    makeCall,
    hangupCall,
    testConnection,
    isConnected
  } = useSipPhone();

  const { isMobile, deviceInfo } = useMobile();

  console.log('Index.tsx: useSipPhone hook completed, sipStatus:', sipStatus);

  return (
    <div className="min-h-screen bg-phone-bg">
      {/* Mobile Status Bar */}
      <div className="bg-gradient-primary text-primary-foreground px-4 py-2 flex justify-between items-center text-sm font-medium">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Signal className="h-4 w-4" />
          <span>IP Extension</span>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Wifi className="h-4 w-4" />
          <Battery className="h-4 w-4" />
          <span>{new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Header */}
        <Card className="p-4 bg-gradient-primary text-primary-foreground shadow-phone rounded-lg">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Smartphone className="h-7 w-7" />
            <div>
              <h1 className="text-xl font-bold">שלוחת IP נייד</h1>
              <p className="text-primary-foreground/80 text-sm">מערכת שיחות SIP מתקדמת</p>
            </div>
          </div>
        </Card>

        {/* Call Status */}
        <CallStatus 
          isConnected={isConnected}
          sipStatus={sipStatus}
          currentCall={currentCall}
        />

        {/* Main Tabs */}
        <Tabs defaultValue="dialer" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-phone-surface shadow-button h-12 rounded-xl">
            <TabsTrigger 
              value="dialer" 
              className="flex flex-col items-center space-y-1 h-full px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
            >
              <Phone className="h-5 w-5" />
              <span className="text-xs font-medium">חיוג</span>
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex flex-col items-center space-y-1 h-full px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
            >
              <Clock className="h-5 w-5" />
              <span className="text-xs font-medium">היסטוריה</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex flex-col items-center space-y-1 h-full px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
            >
              <Settings className="h-5 w-5" />
              <span className="text-xs font-medium">הגדרות</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dialer" className="mt-4">
            <DialPad
              onCall={makeCall}
              onHangup={hangupCall}
              isCallActive={isCallActive}
              callStatus={currentCall.status}
              isMobile={isMobile}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <CallHistory
              calls={callHistory}
              onCallBack={makeCall}
              isMobile={isMobile}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <SipSettings
              onConnect={connect}
              onDisconnect={disconnect}
              isConnected={isConnected}
              onTest={(cfg) => testConnection(cfg)}
              isMobile={isMobile}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
