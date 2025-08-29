import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, TestTube } from "lucide-react";
import { useState } from "react";

interface SipSettingsProps {
  onConnect: (config: SipConfig) => void;
  onDisconnect: () => void;
  isConnected: boolean;
  onTest: () => void;
}

export interface SipConfig {
  accountType: 'SIP' | 'AIX';
  server: string;
  username: string;
  password: string;
  port: string;
  protocol: 'UDP' | 'TCP' | 'TLS' | 'WS' | 'WSS';
  echoCancellation: boolean;
  automaticGainControl: boolean;
}

const SipSettings = ({ onConnect, onDisconnect, isConnected, onTest }: SipSettingsProps) => {
  const [config, setConfig] = useState<SipConfig>({
    accountType: 'SIP',
    server: '',
    username: '',
    password: '',
    port: '5060',
    protocol: 'UDP',
    echoCancellation: true,
    automaticGainControl: true
  });

  const handleInputChange = (field: keyof SipConfig, value: string | boolean) => {
    if (field === 'accountType') {
      const nextPort = value === 'AIX' ? '4569' : '5060';
      setConfig(prev => ({
        ...prev,
        accountType: value as SipConfig['accountType'],
        port: nextPort,
      }));
      return;
    }
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isConnected) {
      onDisconnect();
    } else {
      onConnect(config);
    }
  };

  const protocols: SipConfig['protocol'][] = ['UDP', 'TCP', 'TLS', 'WS', 'WSS'];

  return (
    <Card className="p-6 bg-phone-surface shadow-phone">
      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
        <Settings className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">הגדרות SIP</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="accountType" className="text-foreground">סוג שלוחה</Label>
          <select
            id="accountType"
            value={config.accountType}
            onChange={(e) => handleInputChange('accountType', e.target.value)}
            className="w-full p-2 rounded-md bg-phone-button border border-border text-foreground"
            disabled={isConnected}
          >
            <option value="SIP">SIP</option>
            <option value="AIX">AIX</option>
          </select>
          <p className="text-xs text-muted-foreground">ברירת מחדל: SIP → 5060, AIX → 4569 (ניתן לשינוי)</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="server" className="text-foreground">שרת SIP</Label>
            <Input
              id="server"
              placeholder="sip.example.com"
              value={config.server}
              onChange={(e) => handleInputChange('server', e.target.value)}
              className="bg-phone-button border-border text-foreground"
              disabled={isConnected}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="port" className="text-foreground">פורט</Label>
            <Input
              id="port"
              placeholder="5060"
              value={config.port}
              onChange={(e) => handleInputChange('port', e.target.value)}
              className="bg-phone-button border-border text-foreground"
              disabled={isConnected}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-foreground">שם משתמש</Label>
            <Input
              id="username"
              placeholder="extension@domain.com"
              value={config.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="bg-phone-button border-border text-foreground"
              disabled={isConnected}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">סיסמה</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={config.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="bg-phone-button border-border text-foreground"
              disabled={isConnected}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="protocol" className="text-foreground">פרוטוקול</Label>
          <select
            id="protocol"
            value={config.protocol}
            onChange={(e) => handleInputChange('protocol', e.target.value as SipConfig['protocol'])}
            className="w-full p-2 rounded-md bg-phone-button border border-border text-foreground"
            disabled={isConnected}
          >
            {protocols.map(protocol => (
              <option key={protocol} value={protocol}>{protocol}</option>
            ))}
          </select>
        </div>

        <Separator className="my-4" />
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">הגדרות אודיו</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="echoCancellation" className="text-foreground">ביטול הד (Echo Cancellation)</Label>
              <p className="text-xs text-muted-foreground">מבטל הדים במהלך השיחה</p>
            </div>
            <Switch
              id="echoCancellation"
              checked={config.echoCancellation}
              onCheckedChange={(checked) => handleInputChange('echoCancellation', checked)}
              disabled={isConnected}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="automaticGainControl" className="text-foreground">בקרת עוצמה אוטומטית (AGC)</Label>
              <p className="text-xs text-muted-foreground">מתאים אוטומטית את עוצמת המיקרופון</p>
            </div>
            <Switch
              id="automaticGainControl"
              checked={config.automaticGainControl}
              onCheckedChange={(checked) => handleInputChange('automaticGainControl', checked)}
              disabled={isConnected}
            />
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex space-x-3 rtl:space-x-reverse">
          <Button
            type="submit"
            variant={isConnected ? "destructive" : "default"}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
            {isConnected ? 'התנתק' : 'התחבר'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              console.log('Test button clicked!');
              onTest();
            }}
            className="bg-phone-button hover:bg-phone-button-hover"
          >
            <TestTube className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
            בדיקה
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default SipSettings;