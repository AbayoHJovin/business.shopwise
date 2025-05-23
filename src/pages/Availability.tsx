
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, Plus, Trash } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import AddAvailabilityForm from '@/components/availability/AddAvailabilityForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Mock data for availability slots
const mockAvailabilitySlots = [
  {
    id: '1',
    startTime: new Date('2025-05-22T09:00:00'),
    endTime: new Date('2025-05-22T17:00:00'),
    note: 'Regular business hours'
  },
  {
    id: '2',
    startTime: new Date('2025-05-23T10:00:00'),
    endTime: new Date('2025-05-23T18:00:00'),
    note: 'Extended hours on Friday'
  },
  {
    id: '3',
    startTime: new Date('2025-05-24T12:00:00'),
    endTime: new Date('2025-05-24T16:00:00'),
    note: 'Weekend limited hours'
  }
];

const Availability = () => {
  const [isBusinessAvailable, setIsBusinessAvailable] = useState(true);
  const [availabilitySlots, setAvailabilitySlots] = useState(mockAvailabilitySlots);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<(typeof mockAvailabilitySlots)[0] | null>(null);

  const handleToggleAvailability = () => {
    const newStatus = !isBusinessAvailable;
    setIsBusinessAvailable(newStatus);
    toast({
      title: `Business is now ${newStatus ? 'available' : 'unavailable'}`,
      description: `You've updated your business availability status.`,
    });
  };

  const handleEditSlot = (slot: (typeof mockAvailabilitySlots)[0]) => {
    setEditingSlot(slot);
    setIsAddDialogOpen(true);
  };

  const handleDeleteSlot = (slotId: string) => {
    setAvailabilitySlots(availabilitySlots.filter(slot => slot.id !== slotId));
    toast({
      title: "Availability slot deleted",
      description: "The availability slot has been removed from your schedule.",
    });
  };

  const handleAddOrUpdateSlot = (slot: Omit<(typeof mockAvailabilitySlots)[0], 'id'> & { id?: string }) => {
    if (slot.id) {
      // Update existing slot
      setAvailabilitySlots(availabilitySlots.map(s => 
        s.id === slot.id ? { ...slot, id: slot.id } : s
      ));
      toast({
        title: "Availability slot updated",
        description: "Your availability has been updated successfully.",
      });
    } else {
      // Add new slot
      const newSlot = {
        ...slot,
        id: Math.random().toString(36).substring(2, 9)
      };
      setAvailabilitySlots([...availabilitySlots, newSlot]);
      toast({
        title: "New availability added",
        description: "Your new availability slot has been created.",
      });
    }
    setIsAddDialogOpen(false);
    setEditingSlot(null);
  };

  return (
    <MainLayout title="Availability Management">
      <div className="container py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Availability</h2>
            <p className="text-muted-foreground">
              Manage your business availability and operating hours
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${isBusinessAvailable ? 'text-green-500' : 'text-red-500'}`}>
              {isBusinessAvailable ? 'Available' : 'Unavailable'}
            </span>
            <Switch 
              checked={isBusinessAvailable} 
              onCheckedChange={handleToggleAvailability}
            />
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Availability
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingSlot ? 'Edit Availability Slot' : 'Add New Availability Slot'}
                  </DialogTitle>
                </DialogHeader>
                <AddAvailabilityForm 
                  onSubmit={handleAddOrUpdateSlot}
                  initialData={editingSlot || undefined}
                  onCancel={() => {
                    setIsAddDialogOpen(false);
                    setEditingSlot(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Availability Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {availabilitySlots.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No availability slots defined. Add your first slot to get started.
              </p>
            ) : (
              <div className="grid gap-4">
                {availabilitySlots.map((slot) => (
                  <div key={slot.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(slot.startTime, 'EEEE, MMMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(slot.startTime, 'h:mm a')} - {format(slot.endTime, 'h:mm a')}
                        </span>
                      </div>
                      {slot.note && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {slot.note}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditSlot(slot)}
                      >
                        Edit
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive hover:bg-destructive/10"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Availability Slot</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this availability slot? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Availability;
