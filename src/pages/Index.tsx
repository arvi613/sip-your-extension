import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import DialPad from "@/components/DialPad";
import CallStatus from "@/components/CallStatus";
import SipSettings from "@/components/SipSettings";
import CallHistory from "@/components/CallHistory";
import { useSipPhone } from "@/hooks/useSipPhone";
import { Phone, Settings, Clock, Smartphone } from "lucide-react";

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

  console.log('Index.tsx: useSipPhone hook completed, sipStatus:', sipStatus);

  return (
    <div className="min-h-screen bg-phone-bg p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-phone">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Smartphone className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">שלוחת IP נייד</h1>
              <p className="text-primary-foreground/80">מערכת שיחות SIP מתקדמת</p>
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
          <TabsList className="grid w-full grid-cols-3 bg-phone-surface shadow-button">
            <TabsTrigger value="dialer" className="flex items-center space-x-2 rtl:space-x-reverse">
              <Phone className="h-4 w-4" />
              <span>חיוג</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2 rtl:space-x-reverse">
              <Clock className="h-4 w-4" />
              <span>היסטוריה</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2 rtl:space-x-reverse">
              <Settings className="h-4 w-4" />
              <span>הגדרות</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dialer" className="mt-6">
            <DialPad
              onCall={makeCall}
              onHangup={hangupCall}
              isCallActive={isCallActive}
              callStatus={currentCall.status}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <CallHistory
              calls={callHistory}
              onCallBack={makeCall}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <SipSettings
              onConnect={connect}
              onDisconnect={disconnect}
              isConnected={isConnected}
              onTest={testConnection}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
