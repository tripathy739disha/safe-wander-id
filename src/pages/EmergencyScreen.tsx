import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  MapPin, 
  Users, 
  Shield, 
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EmergencyScreen = () => {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [emergencyContacts] = useState([
    { id: 1, name: "Tourist Police", number: "1363", type: "police" },
    { id: 2, name: "Emergency Services", number: "112", type: "emergency" },
    { id: 3, name: "Medical Emergency", number: "102", type: "medical" },
    { id: 4, name: "Fire Department", number: "101", type: "fire" }
  ]);
  
  const [personalContacts] = useState([
    { id: 1, name: "Emergency Contact 1", number: "+91-9876543210", relation: "Family" },
    { id: 2, name: "Emergency Contact 2", number: "+91-9876543211", relation: "Friend" },
  ]);

  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && isEmergencyActive) {
      // Auto-send emergency alert
      handleEmergencyAlert();
    }
    return () => clearTimeout(timer);
  }, [countdown, isEmergencyActive]);

  const handleSOSPress = () => {
    setCountdown(5); // 5 second countdown
    setIsEmergencyActive(true);
    toast({
      title: "SOS Activated",
      description: "Emergency alert will be sent in 5 seconds. Tap Cancel to stop.",
      variant: "destructive",
    });
  };

  const handleCancelSOS = () => {
    setCountdown(0);
    setIsEmergencyActive(false);
    toast({
      title: "SOS Cancelled",
      description: "Emergency alert has been cancelled.",
    });
  };

  const handleEmergencyAlert = () => {
    // Simulate sending emergency alert
    toast({
      title: "Emergency Alert Sent!",
      description: "Your location has been shared with police and emergency contacts.",
    });
    
    // Reset state after sending
    setTimeout(() => {
      setIsEmergencyActive(false);
      setCountdown(0);
    }, 2000);
  };

  const handleDirectCall = (number: string, name: string) => {
    toast({
      title: "Calling...",
      description: `Initiating call to ${name} (${number})`,
    });
    // In a real app, this would initiate the phone call
    // window.location.href = `tel:${number}`;
  };

  if (isEmergencyActive) {
    return (
      <div className="min-h-screen bg-red-50 dark:bg-red-950/20 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600 text-2xl">
              {countdown > 0 ? "SOS COUNTDOWN" : "EMERGENCY ACTIVE"}
            </CardTitle>
            <CardDescription>
              {countdown > 0 
                ? "Alert will be sent automatically unless cancelled"
                : "Emergency services have been notified"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {countdown > 0 ? (
              <>
                <div className="text-6xl font-bold text-red-600 animate-pulse">
                  {countdown}
                </div>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleCancelSOS}
                  className="w-full"
                >
                  Cancel SOS
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                <div>
                  <h3 className="text-xl font-bold text-green-600">Alert Sent Successfully</h3>
                  <p className="text-muted-foreground">
                    Emergency services and your contacts have been notified
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Location Shared:</span>
                  </div>
                  <p className="text-sm">Connaught Place, New Delhi</p>
                  <p className="text-xs text-muted-foreground">
                    Lat: 28.6139, Lng: 77.2090
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Emergency & SOS</h1>
        <p className="text-muted-foreground">Quick access to emergency services</p>
      </div>

      {/* Main SOS Button */}
      <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200">
        <CardContent className="p-8 text-center">
          <Button
            size="lg"
            variant="destructive"
            onClick={handleSOSPress}
            className="w-32 h-32 rounded-full text-2xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex flex-col items-center">
              <Phone className="w-12 h-12 mb-2" />
              SOS
            </div>
          </Button>
          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-bold text-red-600">Emergency SOS</h3>
            <p className="text-sm text-muted-foreground">
              Press and hold for 3 seconds to send emergency alert
            </p>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your location will be automatically shared with police and emergency contacts
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Emergency Services
          </CardTitle>
          <CardDescription>Direct dial emergency numbers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {emergencyContacts.map((contact) => (
              <Button
                key={contact.id}
                variant="outline"
                className="h-16 flex-col gap-1"
                onClick={() => handleDirectCall(contact.number, contact.name)}
              >
                <Phone className="w-4 h-4" />
                <span className="text-xs">{contact.name}</span>
                <span className="text-xs font-mono">{contact.number}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personal Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Personal Emergency Contacts
          </CardTitle>
          <CardDescription>Your registered emergency contacts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {personalContacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.relation}</p>
                  <p className="text-sm font-mono">{contact.number}</p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleDirectCall(contact.number, contact.name)}
                >
                  <Phone className="w-3 h-3 mr-1" />
                  Call
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Current Location
          </CardTitle>
          <CardDescription>This location will be shared during emergency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Connaught Place, New Delhi</span>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Live
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Coordinates: 28.6139°N, 77.2090°E
            </p>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Safety Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>• <strong>SOS Button:</strong> Sends your location to police and emergency contacts</p>
            <p>• <strong>Direct Dial:</strong> Use emergency service numbers for immediate help</p>
            <p>• <strong>Stay Calm:</strong> Provide clear information about your emergency</p>
            <p>• <strong>Location Sharing:</strong> Always enabled during emergency situations</p>
            <p>• <strong>False Alarms:</strong> Cancel SOS within 5 seconds if pressed accidentally</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyScreen;