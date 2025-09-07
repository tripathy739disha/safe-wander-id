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
    <div className="min-h-screen travel-gradient-bg relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-16 left-8 w-20 h-20 bg-primary/10 rounded-full animate-float" />
        <div className="absolute bottom-24 right-12 w-16 h-16 bg-accent/10 rounded-full animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <div className="travel-gradient-ocean p-6 relative">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold text-white">Live Safety Map</h1>
          <div className="flex gap-3">
            <button
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                showSafeZones ? 'bg-success shadow-ocean' : 'bg-white/20 backdrop-blur-sm'
              }`}
              onClick={() => setShowSafeZones(!showSafeZones)}
            >
              <Eye className="w-5 h-5 text-white" />
            </button>
            <button
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                showRestrictedZones ? 'bg-destructive shadow-large' : 'bg-white/20 backdrop-blur-sm'
              }`}
              onClick={() => setShowRestrictedZones(!showRestrictedZones)}
            >
              <AlertTriangle className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[50vh] mx-6 -mt-4 travel-card-elevated overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl">
          {/* Current Location */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-6 h-6 bg-primary rounded-full border-4 border-white shadow-ocean animate-glow"></div>
          </div>
          
          {/* Safe Zones */}
          {showSafeZones && safeZones.map((zone, index) => (
            <div 
              key={zone.id}
              className="absolute w-8 h-8 bg-success rounded-full flex items-center justify-center shadow-medium hover-lift cursor-pointer"
              style={{
                top: `${30 + index * 15}%`,
                left: `${40 + index * 10}%`
              }}
            >
              <Shield className="w-4 h-4 text-white" />
            </div>
          ))}
          
          {/* Restricted Zones */}
          {showRestrictedZones && restrictedZones.map((zone, index) => (
            <div 
              key={zone.id}
              className="absolute w-8 h-8 bg-destructive rounded-full flex items-center justify-center shadow-medium animate-glow cursor-pointer"
              style={{
                top: `${60 + index * 10}%`,
                left: `${60 + index * 15}%`
              }}
            >
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
          ))}
        </div>
        
        {/* Live Tracking Badge */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-success/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-medium">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold">Live Tracking</span>
          </div>
        </div>
      </div>

        {/* Current Location Info */}
        <div className="travel-card-elevated">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-travel rounded-lg flex items-center justify-center">
                <Navigation className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">Current Location</h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground text-lg">Connaught Place, New Delhi</p>
                <p className="text-muted-foreground">
                  Lat: {currentLocation.lat}, Lng: {currentLocation.lng}
                </p>
              </div>
              <div className="bg-success/10 border border-success/30 text-success px-4 py-2 rounded-xl font-semibold">
                Safe Zone
              </div>
            </div>
          </div>
        </div>

        {/* Zone Alerts */}
        {alerts.length > 0 && (
          <div className="travel-card border-2 border-warning/30 bg-warning/5">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-warning rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display text-xl font-semibold text-warning-foreground">Zone Alerts</h3>
              </div>
              
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 bg-warning/10 rounded-xl">
                  <div>
                    <p className="font-semibold text-foreground">{alert.message}</p>
                    <p className="text-muted-foreground">{alert.distance}</p>
                  </div>
                  <div className="bg-destructive text-white px-3 py-1 rounded-lg text-sm font-semibold">
                    Warning
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend & Nearby Places */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="travel-card">
            <div className="p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Map Legend</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-primary rounded-full shadow-soft"></div>
                  <span className="text-sm font-medium">Your Location</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-success rounded-full flex items-center justify-center">
                    <Shield className="w-2 h-2 text-white" />
                  </div>
                  <span className="text-sm font-medium">Safe Zones</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-2 h-2 text-white" />
                  </div>
                  <span className="text-sm font-medium">Restricted Areas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-warning rounded-full"></div>
                  <span className="text-sm font-medium">Caution Zones</span>
                </div>
              </div>
            </div>
          </div>

          <div className="travel-card">
            <div className="p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Nearby Safe Places</h3>
              <div className="space-y-3">
                {safeZones.map((zone) => (
                  <div key={zone.id} className="flex items-center justify-between p-3 bg-success/5 rounded-lg border border-success/20">
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-success" />
                      <div>
                        <p className="font-medium text-foreground">{zone.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.floor(Math.random() * 500 + 100)}m away
                        </p>
                      </div>
                    </div>
                    <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                      Navigate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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