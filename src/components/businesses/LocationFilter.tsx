import React, { useState } from "react";
import { ChevronDown, Filter, MapPin } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LocationFilters } from "@/types/business";

// Mock location data - in a real app, this would come from an API
const provinces = [
  "Kigali",
  "Northern Province",
  "Southern Province",
  "Eastern Province",
  "Western Province",
];

const districtsMap: Record<string, string[]> = {
  Kigali: ["Nyarugenge", "Gasabo", "Kicukiro"],
  "Northern Province": ["Musanze", "Burera", "Gakenke", "Gicumbi", "Rulindo"],
  "Southern Province": [
    "Huye",
    "Gisagara",
    "Kamonyi",
    "Muhanga",
    "Nyamagabe",
    "Nyanza",
    "Nyaruguru",
    "Ruhango",
  ],
  "Eastern Province": [
    "Bugesera",
    "Gatsibo",
    "Kayonza",
    "Kirehe",
    "Ngoma",
    "Nyagatare",
    "Rwamagana",
  ],
  "Western Province": [
    "Karongi",
    "Ngororero",
    "Nyabihu",
    "Nyamasheke",
    "Rubavu",
    "Rusizi",
    "Rutsiro",
  ],
};

// Sample sectors for Kigali districts
const sectorsMap: Record<string, string[]> = {
  Nyarugenge: [
    "Gitega",
    "Kanyinya",
    "Kigali",
    "Kimisagara",
    "Mageragere",
    "Muhima",
    "Nyakabanda",
    "Nyamirambo",
    "Nyarugenge",
    "Rwezamenyo",
  ],
  Gasabo: [
    "Bumbogo",
    "Gatsata",
    "Gikomero",
    "Gisozi",
    "Jabana",
    "Jali",
    "Kacyiru",
    "Kimihurura",
    "Kimironko",
    "Kinyinya",
    "Ndera",
    "Nduba",
    "Remera",
    "Rusororo",
    "Rutunga",
  ],
  Kicukiro: [
    "Gahanga",
    "Gatenga",
    "Gikondo",
    "Kagarama",
    "Kanombe",
    "Kicukiro",
    "Kigarama",
    "Masaka",
    "Niboye",
    "Nyarugunga",
  ],
};

interface LocationFilterProps {
  onFilterChange: (filters: LocationFilters) => void;
  initialRadius?: number;
}

const LocationFilter: React.FC<LocationFilterProps> = ({
  onFilterChange,
  initialRadius = 10,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [radius, setRadius] = useState(initialRadius);
  const [province, setProvince] = useState<string | undefined>(undefined);
  const [district, setDistrict] = useState<string | undefined>(undefined);
  const [sector, setSector] = useState<string | undefined>(undefined);
  const [cell, setCell] = useState<string | undefined>(undefined);
  const [village, setVillage] = useState<string | undefined>(undefined);

  // Available options based on selections
  const availableDistricts = province ? districtsMap[province] || [] : [];
  const availableSectors = district ? sectorsMap[district] || [] : [];

  // Apply filters and close sheet
  const handleApplyFilters = () => {
    onFilterChange({
      radius,
      province,
      district,
      sector,
      cell,
      village,
    });
    setIsOpen(false);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setRadius(initialRadius);
    setProvince(undefined);
    setDistrict(undefined);
    setSector(undefined);
    setCell(undefined);
    setVillage(undefined);

    onFilterChange({
      radius: initialRadius,
    });
  };

  // Format radius for display
  const formatRadius = (value: number) => {
    return `${value} km`;
  };

  // Count active filters (excluding radius since it always has a value)
  const activeFilterCount = [province, district, sector, cell, village].filter(
    Boolean
  ).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          title="Filter by location"
        >
          <Filter className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <Badge
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
              variant="destructive"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[360px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Location Filters</SheetTitle>
          <SheetDescription>
            Adjust the search radius and location filters to find businesses in
            specific areas.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Search Radius */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="radius">Search Radius</Label>
              <span className="text-muted-foreground text-sm">
                {formatRadius(radius)}
              </span>
            </div>
            <Slider
              id="radius"
              min={1}
              max={50}
              step={1}
              value={[radius]}
              onValueChange={(value) => setRadius(value[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 km</span>
              <span>25 km</span>
              <span>50 km</span>
            </div>
          </div>

          {/* Administrative Regions */}
          <div className="space-y-3">
            <Label>Administrative Regions</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select value={province} onValueChange={setProvince}>
                <SelectTrigger>
                  <SelectValue placeholder="Province" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Northern">Northern Province</SelectItem>
                  <SelectItem value="Southern">Southern Province</SelectItem>
                  <SelectItem value="Eastern">Eastern Province</SelectItem>
                  <SelectItem value="Western">Western Province</SelectItem>
                  <SelectItem value="Kigali">Kigali Province</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={district}
                onValueChange={setDistrict}
                disabled={!province}
              >
                <SelectTrigger>
                  <SelectValue placeholder="District" />
                </SelectTrigger>
                <SelectContent>
                  {/* Example for Kigali Province */}
                  {province === "Kigali" && (
                    <>
                      <SelectItem value="Nyarugenge">Nyarugenge</SelectItem>
                      <SelectItem value="Gasabo">Gasabo</SelectItem>
                      <SelectItem value="Kicukiro">Kicukiro</SelectItem>
                    </>
                  )}
                  {/* Add similar conditional options for other provinces */}
                </SelectContent>
              </Select>

              <Select
                value={sector}
                onValueChange={setSector}
                disabled={!district}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sector" />
                </SelectTrigger>
                <SelectContent>
                  {/* Example sectors for Nyarugenge */}
                  {district === "Nyarugenge" && (
                    <>
                      <SelectItem value="Nyarugenge">Nyarugenge</SelectItem>
                      <SelectItem value="Muhima">Muhima</SelectItem>
                      <SelectItem value="Gitega">Gitega</SelectItem>
                      <SelectItem value="Kimisagara">Kimisagara</SelectItem>
                    </>
                  )}
                  {/* Add similar conditional options for other districts */}
                </SelectContent>
              </Select>

              <Select value={cell} onValueChange={setCell} disabled={!sector}>
                <SelectTrigger>
                  <SelectValue placeholder="Cell" />
                </SelectTrigger>
                <SelectContent>
                  {/* This would be populated based on the selected sector */}
                  <SelectItem value="example-cell-1">Example Cell 1</SelectItem>
                  <SelectItem value="example-cell-2">Example Cell 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={handleResetFilters}>
            Reset Filters
          </Button>
          <Button onClick={handleApplyFilters}>Apply Filters</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LocationFilter;
