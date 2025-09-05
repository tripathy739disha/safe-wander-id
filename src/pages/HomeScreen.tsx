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
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome Back!</h1>
          <p className="text-muted-foreground">Stay safe during your journey</p>
        </div>
        <div className="relative">
          <Bell className="w-6 h-6 text-muted-foreground" />
          {alerts.length > 0 && (
            <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs">
              {alerts.length}
            </Badge>
          )}
        </div>
      </div>

      {/* Safety Score Card */}
      <Card className="bg-gradient-to-r from-card to-muted/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {getSafetyScoreIcon(safetyScore)}
            Tourist Safety Score
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className={`text-6xl font-bold ${getSafetyScoreColor(safetyScore)} mb-2`}>
            {safetyScore}
          </div>
          <p className="text-muted-foreground">
            {safetyScore >= 80 ? "Excellent Safety Level" : 
             safetyScore >= 60 ? "Good Safety Level" : "Exercise Caution"}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Location tracking: Active
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <Button
          variant="destructive"
          className="h-20 flex-col gap-2"
          onClick={() => onNavigate('emergency')}
        >
          <Phone className="w-6 h-6" />
          <span className="text-xs">Panic SOS</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-20 flex-col gap-2"
          onClick={() => onNavigate('itinerary')}
        >
          <Calendar className="w-6 h-6" />
          <span className="text-xs">Trip Itinerary</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-20 flex-col gap-2"
          onClick={() => onNavigate('profile')}
        >
          <IdCard className="w-6 h-6" />
          <span className="text-xs">My Digital ID</span>
        </Button>
      </div>

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Recent Alerts
          </CardTitle>
          <CardDescription>Important safety notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No alerts at the moment. Stay safe!
            </p>
          ) : (
            alerts.map((alert) => (
              <Alert key={alert.id} className={alert.type === 'warning' ? 'border-yellow-200' : ''}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm">{alert.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{alert.time}</span>
                  </div>
                </AlertDescription>
              </Alert>
            ))
          )}
        </CardContent>
      </Card>

      {/* Safety Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Safety Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>• Keep your phone charged at all times</p>
            <p>• Stay in well-lit, populated areas</p>
            <p>• Share your location with family</p>
            <p>• Follow local guidelines and advisories</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeScreen;