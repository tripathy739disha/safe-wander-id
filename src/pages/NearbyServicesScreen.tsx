import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const NearbyServicesScreen = () => {
  const serviceCategories = [
    {
      title: "Police Stations",
      icon: "🚔",
      services: [
        {
          name: "Central Police Station",
          address: "123 Main Street, City Center",
          distance: "0.5 km",
          phone: "+1-234-567-8900",
          hours: "24/7",
          rating: 4.2
        },
        {
          name: "Tourist Police Unit",
          address: "456 Tourist Avenue",
          distance: "1.2 km", 
          phone: "+1-234-567-8901",
          hours: "24/7",
          rating: 4.5
        }
      ]
    },
    {
      title: "Hospitals & Medical Care",
      icon: "🏥",
      services: [
        {
          name: "City General Hospital",
          address: "789 Health Boulevard",
          distance: "0.8 km",
          phone: "+1-234-567-8902",
          hours: "24/7",
          rating: 4.3
        },
        {
          name: "Quick Care Clinic",
          address: "321 Medical Plaza",
          distance: "1.5 km",
          phone: "+1-234-567-8903", 
          hours: "8 AM - 10 PM",
          rating: 4.0
        }
      ]
    },
    {
      title: "Hotels & Accommodation",
      icon: "🏨",
      services: [
        {
          name: "Grand Plaza Hotel",
          address: "555 Luxury Lane",
          distance: "0.7 km",
          phone: "+1-234-567-8904",
          hours: "24/7 Reception",
          rating: 4.6
        },
        {
          name: "Traveler's Inn",
          address: "888 Budget Street",
          distance: "1.0 km",
          phone: "+1-234-567-8905",
          hours: "6 AM - 12 AM",
          rating: 4.1
        }
      ]
    },
    {
      title: "Safe Places",
      icon: "🛡️",
      services: [
        {
          name: "24/7 Security Mall",
          address: "999 Shopping Center",
          distance: "0.6 km",
          phone: "+1-234-567-8906",
          hours: "24/7",
          rating: 4.4
        },
        {
          name: "Safe Haven Cafe",
          address: "222 Community Square",
          distance: "0.9 km",
          phone: "+1-234-567-8907",
          hours: "6 AM - 11 PM",
          rating: 4.7
        }
      ]
    },
    {
      title: "Tourist Centers",
      icon: "ℹ️",
      services: [
        {
          name: "Visitor Information Center",
          address: "111 Welcome Plaza",
          distance: "0.4 km",
          phone: "+1-234-567-8908",
          hours: "9 AM - 6 PM",
          rating: 4.5
        },
        {
          name: "Cultural Heritage Center",
          address: "777 History Avenue",
          distance: "1.3 km",
          phone: "+1-234-567-8909",
          hours: "10 AM - 8 PM",
          rating: 4.8
        }
      ]
    }
  ];

  const handleGetDirections = (address: string) => {
    // In a real app, this would open maps with directions
    console.log(`Getting directions to: ${address}`);
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Nearby Services</h1>
          <p className="text-muted-foreground">Find essential services and safe places around you</p>
        </div>

        <div className="space-y-6">
          {serviceCategories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{category.icon}</span>
                <h2 className="text-lg font-semibold text-foreground">{category.title}</h2>
              </div>
              
              <div className="space-y-3">
                {category.services.map((service, serviceIndex) => (
                  <Card key={serviceIndex} className="border border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base font-medium text-foreground">
                            {service.name}
                          </CardTitle>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-muted-foreground">★</span>
                            <span className="text-xs text-muted-foreground">{service.rating}</span>
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {service.distance}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{service.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{service.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{service.hours}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-xs"
                          onClick={() => handleGetDirections(service.address)}
                        >
                          <Navigation className="w-3 h-3 mr-1" />
                          Directions
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-xs"
                          onClick={() => handleCall(service.phone)}
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          Call
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NearbyServicesScreen;