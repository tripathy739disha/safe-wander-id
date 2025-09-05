import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Shield, 
  AlertTriangle, 
  Navigation, 
  Zap,
  Eye,
  EyeOff
} from "lucide-react";

const MapScreen = () => {
  const [currentLocation] = useState({ lat: 28.6139, lng: 77.2090 }); // Delhi
  const [showSafeZones, setShowSafeZones] = useState(true);
  const [showRestrictedZones, setShowRestrictedZones] = useState(true);
  const [alerts] = useState([
    {
      id: 1,
      type: "warning",
      message: "You are approaching a restricted area",
      distance: "500m ahead"
    }
  ]);

  const safeZones = [
    { id: 1, name: "Tourist Police Station", lat: 28.6129, lng: 77.2095, type: "police" },
    { id: 2, name: "Hotel Safe Zone", lat: 28.6149, lng: 77.2085, type: "accommodation" },
    { id: 3, name: "Hospital", lat: 28.6159, lng: 77.2105, type: "medical" },
  ];

  const restrictedZones = [
    { id: 1, name: "Construction Area", lat: 28.6119, lng: 77.2115, type: "construction" },
    { id: 2, name: "Protest Zone", lat: 28.6169, lng: 77.2065, type: "civil_unrest" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Map Container */}
      <div className="relative h-[60vh] bg-muted rounded-lg mx-4 mt-4 overflow-hidden">
        {/* Simulated Map */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20">
          {/* Current Location */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
          </div>
          
          {/* Safe Zones */}
          {showSafeZones && safeZones.map((zone, index) => (
            <div 
              key={zone.id}
              className="absolute w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
              style={{
                top: `${30 + index * 15}%`,
                left: `${40 + index * 10}%`
              }}
            >
              <Shield className="w-3 h-3 text-white" />
            </div>
          ))}
          
          {/* Restricted Zones */}
          {showRestrictedZones && restrictedZones.map((zone, index) => (
            <div 
              key={zone.id}
              className="absolute w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
              style={{
                top: `${60 + index * 10}%`,
                left: `${60 + index * 15}%`
              }}
            >
              <AlertTriangle className="w-3 h-3 text-white" />
            </div>
          ))}
        </div>
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          <Button
            size="sm"
            variant={showSafeZones ? "default" : "outline"}
            onClick={() => setShowSafeZones(!showSafeZones)}
            className="w-10 h-10 p-0"
          >
            {showSafeZones ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant={showRestrictedZones ? "destructive" : "outline"}
            onClick={() => setShowRestrictedZones(!showRestrictedZones)}
            className="w-10 h-10 p-0"
          >
            {showRestrictedZones ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
        </div>
        
        {/* Live Location Indicator */}
        <div className="absolute bottom-4 left-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Live Tracking ON
          </Badge>
        </div>
      </div>

      {/* Current Location Info */}
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Navigation className="w-5 h-5" />
              Current Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Connaught Place, New Delhi</p>
                <p className="text-sm text-muted-foreground">
                  Lat: {currentLocation.lat}, Lng: {currentLocation.lng}
                </p>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Safe Zone
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Zone Alerts */}
        {alerts.length > 0 && (
          <Card className="border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-yellow-700">
                <AlertTriangle className="w-5 h-5" />
                Zone Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-muted-foreground">{alert.distance}</p>
                  </div>
                  <Badge variant="destructive">Warning</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Map Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                <span className="text-sm">Your Location</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <Shield className="w-2 h-2 text-white" />
                </div>
                <span className="text-sm">Safe Zones</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-2 h-2 text-white" />
                </div>
                <span className="text-sm">Restricted Areas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Caution Zones</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nearby Safe Places */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nearby Safe Places</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {safeZones.map((zone) => (
                <div key={zone.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="font-medium">{zone.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.floor(Math.random() * 500 + 100)}m away
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Navigate
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MapScreen;