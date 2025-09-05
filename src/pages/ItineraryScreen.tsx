import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Plus, 
  Edit, 
  Shield,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface ItineraryItem {
  id: number;
  date: string;
  time: string;
  location: string;
  activity: string;
  notes: string;
  safetyStatus: "safe" | "caution" | "restricted";
}

const ItineraryScreen = () => {
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([
    {
      id: 1,
      date: "2024-01-15",
      time: "09:00",
      location: "Red Fort, Delhi",
      activity: "Historical Site Visit",
      notes: "Entry ticket booked, carry ID",
      safetyStatus: "safe"
    },
    {
      id: 2,
      date: "2024-01-15",
      time: "14:00",
      location: "Chandni Chowk Market",
      activity: "Shopping & Street Food",
      notes: "Try local street food, bargain for prices",
      safetyStatus: "caution"
    },
    {
      id: 3,
      date: "2024-01-16",
      time: "10:00",
      location: "Taj Mahal, Agra",
      activity: "Monument Visit",
      notes: "Early morning visit for best photos",
      safetyStatus: "safe"
    }
  ]);

  const [newItem, setNewItem] = useState({
    date: "",
    time: "",
    location: "",
    activity: "",
    notes: ""
  });

  const [isAddingItem, setIsAddingItem] = useState(false);

  const getSafetyIcon = (status: string) => {
    switch (status) {
      case "safe":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "caution":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "restricted":
        return <Shield className="w-4 h-4 text-red-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
  };

  const getSafetyBadge = (status: string) => {
    const variants = {
      safe: "bg-green-100 text-green-800",
      caution: "bg-yellow-100 text-yellow-800", 
      restricted: "bg-red-100 text-red-800"
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleAddItem = () => {
    if (newItem.date && newItem.time && newItem.location && newItem.activity) {
      const item: ItineraryItem = {
        id: Date.now(),
        ...newItem,
        safetyStatus: "safe" // Default to safe, would be determined by location analysis
      };
      setItinerary([...itinerary, item]);
      setNewItem({ date: "", time: "", location: "", activity: "", notes: "" });
      setIsAddingItem(false);
    }
  };

  const groupedItinerary = itinerary.reduce((groups, item) => {
    const date = item.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, ItineraryItem[]>);

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trip Itinerary</h1>
          <p className="text-muted-foreground">Plan your journey safely</p>
        </div>
        <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Itinerary Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newItem.date}
                    onChange={(e) => setNewItem({...newItem, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newItem.time}
                    onChange={(e) => setNewItem({...newItem, time: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Enter location"
                  value={newItem.location}
                  onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity">Activity</Label>
                <Input
                  id="activity"
                  placeholder="What will you do?"
                  value={newItem.activity}
                  onChange={(e) => setNewItem({...newItem, activity: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes..."
                  value={newItem.notes}
                  onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                />
              </div>
              <Button onClick={handleAddItem} className="w-full">
                Add to Itinerary
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Itinerary Items */}
      <div className="space-y-6">
        {Object.entries(groupedItinerary).map(([date, items]) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>
            </div>
            
            <div className="space-y-3">
              {items.map((item) => (
                <Card key={item.id} className="relative overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    item.safetyStatus === 'safe' ? 'bg-green-500' :
                    item.safetyStatus === 'caution' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {item.time}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {item.location}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSafetyIcon(item.safetyStatus)}
                        {getSafetyBadge(item.safetyStatus)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="font-medium">{item.activity}</p>
                        {item.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>
                        )}
                      </div>
                      
                      {item.safetyStatus === 'caution' && (
                        <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm text-yellow-700 dark:text-yellow-600">
                            Exercise caution in this area
                          </span>
                        </div>
                      )}
                      
                      {item.safetyStatus === 'restricted' && (
                        <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                          <Shield className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-700 dark:text-red-600">
                            High-risk area - consider alternatives
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <MapPin className="w-3 h-3 mr-1" />
                        View on Map
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
        
        {itinerary.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No itinerary items yet</h3>
              <p className="text-muted-foreground mb-4">
                Start planning your trip by adding your first destination
              </p>
              <Button onClick={() => setIsAddingItem(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Item
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Safety Summary */}
      {itinerary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Safety Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {itinerary.filter(i => i.safetyStatus === 'safe').length}
                </div>
                <p className="text-sm text-muted-foreground">Safe Locations</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {itinerary.filter(i => i.safetyStatus === 'caution').length}
                </div>
                <p className="text-sm text-muted-foreground">Caution Areas</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {itinerary.filter(i => i.safetyStatus === 'restricted').length}
                </div>
                <p className="text-sm text-muted-foreground">High-Risk Areas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ItineraryScreen;