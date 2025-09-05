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
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center gap-2 justify-center">
            <Shield className="w-6 h-6" />
            Digital ID Verification
          </CardTitle>
          <CardDescription>
            Enter your ID to generate Tourist Digital ID on blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="aadhaar" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="aadhaar">
                <IdCard className="w-4 h-4 mr-1" />
                Aadhaar
              </TabsTrigger>
              <TabsTrigger value="passport">
                <FileText className="w-4 h-4 mr-1" />
                Passport
              </TabsTrigger>
              <TabsTrigger value="qr">
                <QrCode className="w-4 h-4 mr-1" />
                QR Code
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="aadhaar" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aadhaar">Aadhaar Number</Label>
                <Input
                  id="aadhaar"
                  placeholder="Enter 12-digit Aadhaar number"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  maxLength={12}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleAadhaarLogin}
                disabled={isLoading || aadhaarNumber.length !== 12}
              >
                {isLoading ? "Generating Digital ID..." : "Verify & Generate ID"}
              </Button>
            </TabsContent>
            
            <TabsContent value="passport" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passport">Passport Number</Label>
                <Input
                  id="passport"
                  placeholder="Enter passport number"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handlePassportLogin}
                disabled={isLoading || passportNumber.length < 6}
              >
                {isLoading ? "Generating Digital ID..." : "Verify & Generate ID"}
              </Button>
            </TabsContent>
            
            <TabsContent value="qr" className="space-y-4">
              <div className="text-center space-y-4">
                <div className="w-32 h-32 border-2 border-dashed border-muted-foreground rounded-lg mx-auto flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Scan QR code from entry point or tourism counter
                </p>
                <Button className="w-full" onClick={handleQRScan}>
                  Open QR Scanner
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              🔒 Your data is encrypted and stored securely on blockchain. 
              Location tracking will be enabled after verification for your safety.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;