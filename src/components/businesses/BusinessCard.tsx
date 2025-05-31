import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Store, ExternalLink } from "lucide-react";
import { BusinessDto } from "@/types/business";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Default business image
const DEFAULT_BUSINESS_IMAGE =
  "https://images.unsplash.com/photo-1606836576983-8b458e75221d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80";

interface BusinessCardProps {
  business: BusinessDto;
  featured?: boolean;
  onViewDetails?: (businessId: string) => void;
}

const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  featured = false,
  onViewDetails,
}) => {
  const navigate = useNavigate();

  // Use the formatted distance from the backend or format it if not available
  const getFormattedDistance = () => {
    if (business.formattedDistance) {
      return business.formattedDistance;
    }

    if (business.distanceKm === undefined) return "Distance unknown";
    if (business.distanceKm < 1) {
      return `${Math.round(business.distanceKm * 1000)}m away`;
    }
    return `${business.distanceKm.toFixed(1)}km away`;
  };

  // Handle navigation to business detail page
  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onViewDetails) {
      // Use the custom handler if provided (for scroll restoration)
      onViewDetails(business.id);
    } else {
      // Mark that we're intentionally navigating to prevent issues
      sessionStorage.setItem("intentional_navigation", "true");
      // Navigate to the business detail page
      navigate(`/businesses/${business.id}`);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img
          src={DEFAULT_BUSINESS_IMAGE}
          alt={business.name}
          className="w-full h-full object-cover"
        />
        {featured && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-primary text-white">
              Featured
            </Badge>
          </div>
        )}
        {(business.formattedDistance || business.distanceKm !== undefined) && (
          <div className="absolute bottom-2 left-2">
            <Badge
              variant="outline"
              className="bg-black/60 text-white border-0 backdrop-blur-sm flex items-center gap-1"
            >
              <MapPin size={12} />
              {getFormattedDistance()}
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-2 flex-grow">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-1">
            {business.name}
          </CardTitle>
        </div>
        <div className="flex items-center text-sm text-muted-foreground gap-1">
          <Store className="h-3.5 w-3.5" />
          <span className="line-clamp-1">
            {[
              business.location.village,
              business.location.cell,
              business.location.sector,
              business.location.district,
              business.location.province,
            ]
              .filter(Boolean)
              .join(", ")}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <p className="text-sm text-gray-600 line-clamp-2">
          {business.about || "No description available"}
        </p>

        <div className="mt-2 flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs">
            {business.productCount}{" "}
            {business.productCount === 1 ? "Product" : "Products"}
          </Badge>
          {business.websiteLink && (
            <a
              href={business.websiteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:no-underline"
            >
              <Badge
                variant="outline"
                className="text-xs flex items-center gap-1 cursor-pointer hover:bg-secondary"
              >
                <ExternalLink size={10} />
                Website
              </Badge>
            </a>
          )}
        </div>
      </CardContent>

      <CardFooter className="mt-auto">
        <Button
          variant="default"
          className="w-full"
          onClick={handleViewDetails}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BusinessCard;
