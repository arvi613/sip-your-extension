import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Phone, PhoneCall, PhoneOff, Delete } from "lucide-react";
import { useState } from "react";

interface DialPadProps {
  onCall: (number: string) => void;
  onHangup: () => void;
  isCallActive: boolean;
  callStatus: 'idle' | 'calling' | 'connected' | 'ringing';
}

const DialPad = ({ onCall, onHangup, isCallActive, callStatus }: DialPadProps) => {
  const [number, setNumber] = useState("");

  const dialPadButtons = [
    { number: "1", letters: "" },
    { number: "2", letters: "ABC" },
    { number: "3", letters: "DEF" },
    { number: "4", letters: "GHI" },
    { number: "5", letters: "JKL" },
    { number: "6", letters: "MNO" },
    { number: "7", letters: "PQRS" },
    { number: "8", letters: "TUV" },
    { number: "9", letters: "WXYZ" },
    { number: "*", letters: "" },
    { number: "0", letters: "+" },
    { number: "#", letters: "" },
  ];

  const handleNumberPress = (num: string) => {
    setNumber(prev => prev + num);
  };

  const handleBackspace = () => {
    setNumber(prev => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (number.trim()) {
      onCall(number);
    }
  };

  const getCallButtonVariant = () => {
    if (isCallActive) {
      return callStatus === 'connected' ? 'destructive' : 'secondary';
    }
    return 'default';
  };

  const getCallButtonIcon = () => {
    if (isCallActive) {
      return <PhoneOff className="h-6 w-6" />;
    }
    return callStatus === 'calling' ? <PhoneCall className="h-6 w-6" /> : <Phone className="h-6 w-6" />;
  };

  return (
    <Card className="p-6 bg-phone-surface shadow-phone">
      {/* Display Screen */}
      <div className="mb-6">
        <Input
          value={number}
          readOnly
          placeholder="הזן מספר טלפון"
          className="text-center text-2xl font-mono h-16 bg-phone-button border-border text-foreground"
        />
        <div className="flex justify-end mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackspace}
            className="text-muted-foreground hover:text-foreground"
          >
            <Delete className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dial Pad */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {dialPadButtons.map((button) => (
          <Button
            key={button.number}
            variant="outline"
            className="h-16 w-16 flex flex-col items-center justify-center text-lg font-semibold bg-phone-button hover:bg-phone-button-hover border-border transition-all duration-200 hover:shadow-button"
            onClick={() => handleNumberPress(button.number)}
          >
            <span className="text-xl">{button.number}</span>
            {button.letters && (
              <span className="text-xs text-muted-foreground mt-1">
                {button.letters}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Call/Hangup Button */}
      <div className="flex justify-center">
        <Button
          variant={getCallButtonVariant()}
          size="lg"
          className={`h-16 w-16 rounded-full shadow-button transition-all duration-300 ${
            callStatus === 'connected'
              ? 'bg-destructive hover:bg-destructive/90 shadow-active animate-pulse-call'
              : callStatus === 'calling'
              ? 'bg-phone-calling hover:bg-phone-calling/90 animate-bounce-ring'
              : callStatus === 'ringing'
              ? 'bg-phone-ringing hover:bg-phone-ringing/90 animate-bounce-ring'
              : 'bg-success hover:bg-success/90'
          }`}
          onClick={isCallActive ? onHangup : handleCall}
          disabled={!number.trim() && !isCallActive}
        >
          {getCallButtonIcon()}
        </Button>
      </div>
    </Card>
  );
};

export default DialPad;