import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    { code: "zh", name: "中文 (Chinese)" },
    { code: "hi", name: "हिंदी (Hindi)" },
    { code: "es", name: "Español (Spanish)" },
    { code: "fr", name: "Français (French)" },
    { code: "ar", name: "العربية (Arabic)" },
    { code: "bn", name: "বাংলা (Bengali)" },
    { code: "pt", name: "Português (Portuguese)" },
    { code: "ru", name: "Русский (Russian)" },
    { code: "ja", name: "日本語 (Japanese)" },
    { code: "de", name: "Deutsch (German)" },
    { code: "ko", name: "한국어 (Korean)" },
    { code: "te", name: "తెలుగు (Telugu)" },
    { code: "tr", name: "Türkçe (Turkish)" },
    { code: "it", name: "Italiano (Italian)" },
    { code: "th", name: "ไทย (Thai)" },
    { code: "nl", name: "Nederlands (Dutch)" },
    { code: "pl", name: "Polski (Polish)" },
    { code: "mr", name: "मराठी (Marathi)" },
    { code: "sv", name: "Svenska (Swedish)" }
  ];

  useEffect(() => {
    if (currentStep === 0) {
      const timer = setTimeout(() => setCurrentStep(1), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  if (currentStep === 0) {
    return (
      <div className="min-h-screen travel-gradient-bg flex items-center justify-center overflow-hidden relative">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-accent/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-32 left-20 w-12 h-12 bg-primary/5 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="text-center space-y-8 animate-scale-in z-10">
          <div className="relative">
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <Globe className="w-32 h-32 text-primary mx-auto animate-glow" />
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-travel rounded-full flex items-center justify-center shadow-ocean">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="font-display text-6xl font-bold text-gradient-ocean mb-4">SafeWander</h1>
            <p className="text-2xl text-muted-foreground font-medium">Tourist Safety & Digital ID</p>
            <div className="flex items-center justify-center gap-2 text-primary/70">
              <MapPin className="w-5 h-5" />
              <span className="text-lg">Your trusted travel companion</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 1) {
    return (
      <div className="min-h-screen travel-gradient-bg p-4 sm:p-6 flex items-center justify-center">
        <div className="travel-card-elevated w-full max-w-lg animate-slide-up">
          <div className="text-center p-8">
            <div className="flex items-center gap-3 justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-travel rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-display text-2xl font-semibold text-foreground">Select Language</h2>
            </div>
            <p className="text-muted-foreground mb-8">Choose your preferred language for the journey ahead</p>
          </div>
          
          <div className="px-4 sm:px-8 pb-8 space-y-6">
            {/* About Section */}
            <div className="travel-card p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-travel rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground">About SafeWander</h3>
              </div>
              <div className="space-y-3 text-sm sm:text-base text-muted-foreground">
                <p>SafeWander is your trusted digital companion for safe and secure travel experiences.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Real-time safety monitoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Location-based alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Multi-language support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Secure digital identity</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground mb-3">
                Choose your preferred language
              </label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-full h-12 sm:h-14 text-base sm:text-lg travel-input">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="max-h-64 bg-background border border-border shadow-lg">
                  {languages.map((lang) => (
                    <SelectItem 
                      key={lang.code} 
                      value={lang.code}
                      className="text-sm sm:text-base py-3 hover:bg-primary/5 focus:bg-primary/5"
                    >
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <button 
              className="w-full mt-6 sm:mt-8 travel-button-gradient h-12 sm:h-14 text-base sm:text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setCurrentStep(2)}
              disabled={!selectedLanguage}
            >
              Continue Your Journey
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen travel-gradient-bg p-4 sm:p-6 flex items-center justify-center">
      <div className="travel-card-elevated w-full max-w-lg animate-scale-in">
        <div className="text-center p-8">
          <div className="flex items-center gap-3 justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-travel rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-foreground">Terms & Conditions</h2>
          </div>
          <p className="text-muted-foreground mb-8">Please review and accept to continue your safe journey</p>
        </div>
        
        <div className="px-4 sm:px-8 pb-8 space-y-6">
          <div className="travel-card p-4 sm:p-6 max-h-64 overflow-y-auto text-xs sm:text-sm space-y-4">
            <div className="space-y-3">
              <h3 className="font-display text-lg font-semibold text-primary">SafeWander Tourist Safety App</h3>
              <p className="font-medium text-foreground">By using this app, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-2">
                <li>Allow continuous location tracking during your trip</li>
                <li>Share your digital ID with authorized tourism authorities</li>
                <li>Receive safety alerts and emergency notifications</li>
                <li>Emergency services access to your location during SOS</li>
                <li>Data processing for safety analytics and improvements</li>
              </ul>
              
              <h4 className="font-display text-base font-semibold text-primary mt-6">Privacy & Data Protection:</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-2">
                <li>Your data is encrypted and stored securely on blockchain</li>
                <li>Location data is only used for safety purposes</li>
                <li>You can request data deletion after your trip</li>
              </ul>
            </div>
          </div>
          
          <label className="flex items-start space-x-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${
                termsAccepted 
                  ? 'bg-primary border-primary shadow-ocean' 
                  : 'border-border group-hover:border-primary/50'
              }`}>
                {termsAccepted && (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-foreground leading-relaxed">
              I accept the Terms & Conditions and understand the safety features <span className="text-destructive">*</span>
            </span>
          </label>
          
          <button 
            className="w-full travel-button-gradient h-12 sm:h-14 text-base sm:text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onComplete}
            disabled={!termsAccepted}
          >
            Accept & Start Journey
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;