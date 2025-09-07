import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  AlertTriangle, 
  Phone, 
  Calendar, 
  IdCard, 
  MapPin,
  Bell,
  CheckCircle,
  XCircle
} from "lucide-react";

interface HomeScreenProps {
  onNavigate: (page: string) => void;
}

const HomeScreen = ({ onNavigate }: HomeScreenProps) => {
  const [safetyScore] = useState(85);
  const [alerts] = useState([
    {
      id: 1,
      type: "warning",
      title: "Heavy Rain Alert",
      message: "Heavy rainfall expected in your area. Avoid outdoor activities.",
      time: "2 hours ago"
    },
    {
      id: 2,
      type: "info",
      title: "New Safe Zone Added",
      message: "Tourist help center opened near City Mall.",
      time: "5 hours ago"
    }
  ]);

  const getSafetyScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getSafetyScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-8 h-8 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="w-8 h-8 text-yellow-600" />;
    return <XCircle className="w-8 h-8 text-red-600" />;
  };

  return (
    <div className="min-h-screen travel-gradient-bg">
      {/* Header with Gradient Background */}
      <div className="relative overflow-hidden">
        <div className="travel-gradient-ocean p-6 pb-12">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="font-display text-3xl font-bold text-white animate-slide-up">Welcome Back!</h1>
              <p className="text-white/80 text-lg">Stay safe during your journey</p>
            </div>
            <div className="relative animate-glow">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Bell className="w-6 h-6 text-white" />
              </div>
              {alerts.length > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center shadow-large">
                  <span className="text-xs font-bold text-white">{alerts.length}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full animate-float" />
          <div className="absolute top-4 left-1/3 w-16 h-16 bg-white/5 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      <div className="px-6 -mt-6 space-y-8 pb-6">
        {/* Safety Score Card */}
        <div className="travel-card-elevated animate-scale-in">
          <div className="p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              {getSafetyScoreIcon(safetyScore)}
              <h2 className="font-display text-xl font-semibold text-foreground">Tourist Safety Score</h2>
            </div>
            
            <div className="mb-6">
              <div className={`text-7xl font-bold ${getSafetyScoreColor(safetyScore)} mb-3`}>
                {safetyScore}
              </div>
              <p className="text-lg text-muted-foreground font-medium">
                {safetyScore >= 80 ? "Excellent Safety Level" : 
                 safetyScore >= 60 ? "Good Safety Level" : "Exercise Caution"}
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <div className="w-3 h-3 bg-success rounded-full animate-glow"></div>
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-primary font-medium">Live Location Tracking Active</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4">
          <button
            className="travel-card-elevated h-24 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-destructive to-destructive/80 text-white hover:shadow-large transition-all duration-300 hover:-translate-y-1"
            onClick={() => onNavigate('emergency')}
          >
            <Phone className="w-7 h-7" />
            <span className="text-sm font-semibold">Panic SOS</span>
          </button>
          
          <button
            className="travel-card-elevated h-24 flex flex-col items-center justify-center gap-3 hover-lift"
            onClick={() => onNavigate('itinerary')}
          >
            <div className="w-10 h-10 bg-gradient-travel rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">Trip Itinerary</span>
          </button>
          
          <button
            className="travel-card-elevated h-24 flex flex-col items-center justify-center gap-3 hover-lift"
            onClick={() => onNavigate('profile')}
          >
            <div className="w-10 h-10 bg-gradient-travel rounded-lg flex items-center justify-center">
              <IdCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">My Digital ID</span>
          </button>
        </div>

        {/* Alerts Section */}
        <div className="travel-card-elevated">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-sunset rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground">Recent Alerts</h3>
                <p className="text-muted-foreground">Important safety notifications</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                  <p className="text-muted-foreground">No alerts at the moment. Stay safe!</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-xl border-2 ${
                    alert.type === 'warning' ? 'border-warning/30 bg-warning/5' : 'border-primary/30 bg-primary/5'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          alert.type === 'warning' ? 'bg-warning/20' : 'bg-primary/20'
                        }`}>
                          <AlertTriangle className={`w-4 h-4 ${
                            alert.type === 'warning' ? 'text-warning' : 'text-primary'
                          }`} />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{alert.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {alert.time}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Safety Tips */}
        <div className="travel-card">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-ocean rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground">Safety Tips</h3>
                <p className="text-muted-foreground">Essential travel safety guidelines</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                "Keep your phone charged at all times",
                "Stay in well-lit, populated areas",
                "Share your location with family",
                "Follow local guidelines and advisories"
              ].map((tip, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-foreground">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;