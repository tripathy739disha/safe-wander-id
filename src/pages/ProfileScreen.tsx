import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  IdCard, 
  Shield, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail,
  Copy,
  Download,
  QrCode,
  Globe,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ProfileScreen = () => {
  const [digitalId] = useState({
    id: "TID-2024-IN-001234567",
    blockchainHash: "0xa1b2c3d4e5f6789012345678901234567890abcdef",
    issuedDate: "2024-01-15",
    expiryDate: "2024-01-30",
    status: "active"
  });

  const [userInfo] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+91-9876543210",
    nationality: "American",
    passportNumber: "AB1234567",
    currentLocation: "New Delhi, India",
    tripDates: {
      arrival: "2024-01-15",
      departure: "2024-01-30"
    }
  });

  const [emergencyContacts] = useState([
    {
      id: 1,
      name: "Jane Doe",
      relation: "Spouse",
      phone: "+1-555-0123",
      email: "jane.doe@example.com"
    },
    {
      id: 2,
      name: "Robert Smith",
      relation: "Friend",
      phone: "+91-9876543211",
      email: "robert.smith@example.com"
    }
  ]);

  const { toast } = useToast();

  const handleCopyId = () => {
    navigator.clipboard.writeText(digitalId.id);
    toast({
      title: "Copied!",
      description: "Digital ID copied to clipboard",
    });
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(digitalId.blockchainHash);
    toast({
      title: "Copied!",
      description: "Blockchain hash copied to clipboard",
    });
  };

  const handleDownloadId = () => {
    toast({
      title: "Download Started",
      description: "Digital ID document is being prepared for download",
    });
    // In a real app, this would generate and download a PDF
  };

  const handleShowQR = () => {
    toast({
      title: "QR Code",
      description: "QR code functionality would be implemented here",
    });
    // In a real app, this would show a QR code modal
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Digital Tourist ID</h1>
        <p className="text-muted-foreground">Your blockchain-verified identity</p>
      </div>

      {/* Digital ID Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <Badge variant="default" className="px-3 py-1">
              {digitalId.status.toUpperCase()}
            </Badge>
          </div>
          <Avatar className="w-24 h-24 mx-auto mb-4">
            <AvatarImage src="/placeholder-user.jpg" alt={userInfo.name} />
            <AvatarFallback className="text-2xl font-bold">
              {userInfo.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl">{userInfo.name}</CardTitle>
          <CardDescription>Tourist Digital Identity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-lg font-mono font-bold text-primary">{digitalId.id}</p>
            <Button variant="ghost" size="sm" onClick={handleCopyId}>
              <Copy className="w-3 h-3 mr-1" />
              Copy ID
            </Button>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Issued</p>
              <p className="font-medium">{new Date(digitalId.issuedDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Expires</p>
              <p className="font-medium">{new Date(digitalId.expiryDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Nationality</p>
              <p className="font-medium">{userInfo.nationality}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Location</p>
              <p className="font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Delhi, IN
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button variant="outline" size="sm" onClick={handleShowQR} className="flex-1">
              <QrCode className="w-3 h-3 mr-1" />
              Show QR
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadId} className="flex-1">
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Blockchain Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Blockchain Verification
          </CardTitle>
          <CardDescription>Immutable identity record</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Blockchain Hash</p>
              <div className="flex items-center justify-between">
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                  {digitalId.blockchainHash.slice(0, 20)}...
                </code>
                <Button variant="ghost" size="sm" onClick={handleCopyHash}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Verified on Blockchain</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IdCard className="w-5 h-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{userInfo.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{userInfo.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <IdCard className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Passport</p>
                <p className="font-medium">{userInfo.passportNumber}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trip Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Trip Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Arrival Date</p>
              <p className="font-medium">
                {new Date(userInfo.tripDates.arrival).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Departure Date</p>
              <p className="font-medium">
                {new Date(userInfo.tripDates.departure).toLocaleDateString()}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Current Location</p>
              <p className="font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {userInfo.currentLocation}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Trip Duration</p>
              <p className="font-medium">
                {Math.ceil((new Date(userInfo.tripDates.departure).getTime() - new Date(userInfo.tripDates.arrival).getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Emergency Contacts
          </CardTitle>
          <CardDescription>Contacts notified during emergencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {contact.relation}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {contact.phone}
                  </p>
                  <p className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {contact.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tracking Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Tracking Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-green-700 dark:text-green-400">
                Location Tracking Active
              </span>
            </div>
            <Badge variant="outline" className="border-green-500 text-green-700">
              ALWAYS ON
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Location tracking cannot be disabled for tourist safety. Data is encrypted and used only for emergency services.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileScreen;