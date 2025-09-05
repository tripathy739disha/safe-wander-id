import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Globe, Shield, MapPin } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी (Hindi)" },
    { code: "bn", name: "বাংলা (Bengali)" },
    { code: "te", name: "తెలుగు (Telugu)" },
    { code: "mr", name: "मराठी (Marathi)" },
  ];

  useEffect(() => {
    if (currentStep === 0) {
      const timer = setTimeout(() => setCurrentStep(1), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="relative">
            <Globe className="w-24 h-24 text-primary mx-auto animate-pulse" />
            <Shield className="w-8 h-8 text-accent absolute -top-2 -right-2" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">SafeWander</h1>
            <p className="text-muted-foreground text-lg">Tourist Safety & Digital ID</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center gap-2 justify-center">
              <Globe className="w-6 h-6" />
              Select Language
            </CardTitle>
            <CardDescription>Choose your preferred language</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant={selectedLanguage === lang.code ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setSelectedLanguage(lang.code)}
              >
                {lang.name}
              </Button>
            ))}
            <Button 
              className="w-full mt-6" 
              onClick={() => setCurrentStep(2)}
              disabled={!selectedLanguage}
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center gap-2 justify-center">
            <Shield className="w-6 h-6" />
            Terms & Conditions
          </CardTitle>
          <CardDescription>Please review and accept to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg text-sm space-y-2 max-h-48 overflow-y-auto">
            <p className="font-medium">SafeWander Tourist Safety App</p>
            <p>By using this app, you agree to:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Allow continuous location tracking during your trip</li>
              <li>Share your digital ID with authorized tourism authorities</li>
              <li>Receive safety alerts and emergency notifications</li>
              <li>Emergency services access to your location during SOS</li>
              <li>Data processing for safety analytics and improvements</li>
            </ul>
            <p className="font-medium mt-3">Privacy & Data Protection:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Your data is encrypted and stored securely on blockchain</li>
              <li>Location data is only used for safety purposes</li>
              <li>You can request data deletion after your trip</li>
            </ul>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            />
            <label htmlFor="terms" className="text-sm text-foreground">
              I accept the Terms & Conditions (mandatory)
            </label>
          </div>
          
          <Button 
            className="w-full" 
            onClick={onComplete}
            disabled={!termsAccepted}
          >
            Accept & Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SplashScreen;