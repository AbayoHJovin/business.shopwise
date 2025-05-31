import React from "react";
import { MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllow: () => void;
  onDeny: () => void;
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onClose,
  onAllow,
  onDeny,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-primary" />
            Location Access
          </DialogTitle>
          <DialogDescription>
            ShopWise needs your location to find businesses near you. This helps
            us show you the most relevant results.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg border p-4 bg-muted/50">
            <h4 className="font-medium mb-2">Why we need your location:</h4>
            <ul className="text-sm space-y-2 list-disc pl-5">
              <li>Show businesses closest to you</li>
              <li>Calculate accurate distances</li>
              <li>Provide directions to businesses</li>
              <li>Improve your discovery experience</li>
            </ul>
            <p className="text-sm mt-3 text-muted-foreground">
              Your location is only used within the app and is not stored on our
              servers.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onDeny}
            className="sm:order-1 order-2"
          >
            Use Default Location
          </Button>
          <Button
            type="button"
            onClick={onAllow}
            className="sm:order-2 order-1"
          >
            Allow Location Access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPermissionModal;
