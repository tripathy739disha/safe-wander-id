import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, IdCard, FileText, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [activeTab, setActiveTab] = useState("aadhaar");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAadhaarLogin = async () => {
    if (aadhaarNumber.length !== 12) {
      toast({
        title: "Invalid Aadhaar",
        description: "Please enter a valid 12-digit Aadhaar number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Simulate blockchain ID generation
    setTimeout(() => {
      toast({
        title: "Digital ID Generated",
        description: "Your Tourist Digital ID has been created on blockchain",
      });
      setIsLoading(false);
      onLogin();
    }, 2000);
  };

  const handlePassportLogin = async () => {
    if (passportNumber.length < 6) {
      toast({
        title: "Invalid Passport",
        description: "Please enter a valid passport number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Simulate blockchain ID generation
    setTimeout(() => {
      toast({
        title: "Digital ID Generated",
        description: "Your Tourist Digital ID has been created on blockchain",
      });
      setIsLoading(false);
      onLogin();
    }, 2000);
  };

  const handleQRScan = () => {
    toast({
      title: "QR Scanner",
      description: "QR scanning functionality would be implemented here",
    });
    // Simulate successful scan
    setTimeout(onLogin, 1000);
  };

  return (
    <div className="min-h-screen travel-gradient-bg p-6 flex items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full animate-float" />
        <div className="absolute bottom-32 right-20 w-24 h-24 bg-accent/5 rounded-full animate-float" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="travel-card-elevated w-full max-w-md animate-scale-in z-10">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-gradient-travel rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-ocean">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-3">Digital ID Verification</h1>
          <p className="text-muted-foreground text-lg">
            Enter your ID to generate your secure Tourist Digital ID on blockchain
          </p>
        </div>
        
        <div className="px-8 pb-8">
          {/* Custom Tab Navigation */}
          <div className="flex bg-muted/50 p-1 rounded-xl mb-8">
            <button
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'aadhaar'
                  ? 'bg-white shadow-medium text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('aadhaar')}
            >
              <IdCard className="w-4 h-4" />
              Aadhaar
            </button>
            <button
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'passport'
                  ? 'bg-white shadow-medium text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('passport')}
            >
              <FileText className="w-4 h-4" />
              Passport
            </button>
            <button
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'qr'
                  ? 'bg-white shadow-medium text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('qr')}
            >
              <QrCode className="w-4 h-4" />
              QR Code
            </button>
          </div>
          
          {/* Tab Content */}
          {activeTab === 'aadhaar' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">Aadhaar Number</label>
                <input
                  className="travel-input"
                  placeholder="Enter 12-digit Aadhaar number"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  maxLength={12}
                />
              </div>
              <button 
                className="w-full travel-button-gradient h-14 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAadhaarLogin}
                disabled={isLoading || aadhaarNumber.length !== 12}
              >
                {isLoading ? "Generating Digital ID..." : "Verify & Generate ID"}
              </button>
            </div>
          )}
          
          {activeTab === 'passport' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">Passport Number</label>
                <input
                  className="travel-input"
                  placeholder="Enter passport number"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                />
              </div>
              <button 
                className="w-full travel-button-gradient h-14 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handlePassportLogin}
                disabled={isLoading || passportNumber.length < 6}
              >
                {isLoading ? "Generating Digital ID..." : "Verify & Generate ID"}
              </button>
            </div>
          )}
          
          {activeTab === 'qr' && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="w-40 h-40 border-2 border-dashed border-primary/30 rounded-2xl mx-auto flex items-center justify-center bg-primary/5">
                <QrCode className="w-20 h-20 text-primary/40" />
              </div>
              <p className="text-muted-foreground">
                Scan QR code from entry point or tourism counter
              </p>
              <button 
                className="w-full travel-button-gradient h-14 text-lg font-semibold"
                onClick={handleQRScan}
              >
                Open QR Scanner
              </button>
            </div>
          )}
          
          <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/20">
            <p className="text-sm text-primary flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Your data is encrypted and stored securely on blockchain. Location tracking will be enabled after verification for your safety.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;