import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Settings, 
  Globe, 
  Bell, 
  Shield, 
  Trash2, 
  Download,
  Users,
  MapPin,
  AlertTriangle,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SettingsScreen = () => {
  const [language, setLanguage] = useState("en");
  const [notifications, setNotifications] = useState({
    safetyAlerts: true,
    zoneAlerts: true,
    emergencyNotifications: true,
    tripReminders: true,
    systemUpdates: false
  });
  const [privacy, setPrivacy] = useState({
    shareWithFamily: true,
    shareWithContacts: false,
    anonymousAnalytics: true
  });

  const { toast } = useToast();

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी (Hindi)" },
    { code: "bn", name: "বাংলা (Bengali)" },
    { code: "te", name: "తెలుగు (Telugu)" },
    { code: "mr", name: "मराठी (Marathi)" },
    { code: "ta", name: "தமிழ் (Tamil)" },
    { code: "gu", name: "ગુજરાતી (Gujarati)" },
    { code: "kn", name: "ಕನ್ನಡ (Kannada)" }
  ];

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    toast({
      title: "Language Updated",
      description: `App language changed to ${languages.find(l => l.code === newLanguage)?.name}`,
    });
  };

  const handleNotificationToggle = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Notification Settings Updated",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}`,
    });
  };

  const handlePrivacyToggle = (key: string, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Privacy Settings Updated",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}`,
    });
  };

  const handleExportData = () => {
    toast({
      title: "Data Export Started",
      description: "Your data is being prepared for download. This may take a few minutes.",
    });
  };

  const handleDeleteData = () => {
    toast({
      title: "Data Deletion Request",
      description: "Your request has been submitted. Data will be deleted after trip completion.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Customize your app experience</p>
      </div>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Language & Localization
          </CardTitle>
          <CardDescription>Choose your preferred language</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">App Language</Label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Manage your notification settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="safety-alerts">Safety Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Critical safety notifications and warnings
                </p>
              </div>
              <Switch
                id="safety-alerts"
                checked={notifications.safetyAlerts}
                onCheckedChange={(checked) => handleNotificationToggle('safetyAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="zone-alerts">Zone Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications when entering/leaving zones
                </p>
              </div>
              <Switch
                id="zone-alerts"
                checked={notifications.zoneAlerts}
                onCheckedChange={(checked) => handleNotificationToggle('zoneAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emergency-notifications">Emergency Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Emergency broadcasts and alerts
                </p>
              </div>
              <Switch
                id="emergency-notifications"
                checked={notifications.emergencyNotifications}
                onCheckedChange={(checked) => handleNotificationToggle('emergencyNotifications', checked)}
                disabled
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="trip-reminders">Trip Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Itinerary and activity reminders
                </p>
              </div>
              <Switch
                id="trip-reminders"
                checked={notifications.tripReminders}
                onCheckedChange={(checked) => handleNotificationToggle('tripReminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="system-updates">System Updates</Label>
                <p className="text-sm text-muted-foreground">
                  App updates and feature announcements
                </p>
              </div>
              <Switch
                id="system-updates"
                checked={notifications.systemUpdates}
                onCheckedChange={(checked) => handleNotificationToggle('systemUpdates', checked)}
              />
            </div>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Emergency notifications cannot be disabled for your safety.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Privacy & Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Tracking
          </CardTitle>
          <CardDescription>Manage your privacy preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              Location tracking is always enabled and cannot be disabled for tourist safety.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="share-family">Share with Family</Label>
                <p className="text-sm text-muted-foreground">
                  Allow family members to track your location
                </p>
              </div>
              <Switch
                id="share-family"
                checked={privacy.shareWithFamily}
                onCheckedChange={(checked) => handlePrivacyToggle('shareWithFamily', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="share-contacts">Share with Emergency Contacts</Label>
                <p className="text-sm text-muted-foreground">
                  Share location with designated emergency contacts
                </p>
              </div>
              <Switch
                id="share-contacts"
                checked={privacy.shareWithContacts}
                onCheckedChange={(checked) => handlePrivacyToggle('shareWithContacts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="anonymous-analytics">Anonymous Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Help improve the app with anonymous usage data
                </p>
              </div>
              <Switch
                id="anonymous-analytics"
                checked={privacy.anonymousAnalytics}
                onCheckedChange={(checked) => handlePrivacyToggle('anonymousAnalytics', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Emergency Contacts
          </CardTitle>
          <CardDescription>Manage your emergency contact list</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button variant="outline" className="w-full">
              <Users className="w-4 h-4 mr-2" />
              Manage Emergency Contacts
            </Button>
            <p className="text-sm text-muted-foreground">
              Emergency contacts will be notified automatically during SOS situations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Data Management
          </CardTitle>
          <CardDescription>Export or delete your personal data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button variant="outline" onClick={handleExportData} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export My Data
            </Button>
            <p className="text-sm text-muted-foreground">
              Download a copy of all your data including location history, trip details, and settings.
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Data deletion will be processed after your trip ends for safety compliance.
              </AlertDescription>
            </Alert>
            
            <Button variant="destructive" onClick={handleDeleteData} className="w-full">
              <Trash2 className="w-4 h-4 mr-2" />
              Request Data Deletion
            </Button>
            <p className="text-sm text-muted-foreground">
              Request complete deletion of your data. This action cannot be undone.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* App Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            App Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Build</span>
              <span>2024.01.15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated</span>
              <span>January 15, 2024</span>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full">
              Privacy Policy
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              Terms of Service
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsScreen;