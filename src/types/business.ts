export interface LocationDto {
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  latitude: number;
  longitude: number;
}

export interface BusinessDiscoveryDto {
  id: string;
  name: string;
  location: LocationDto;
  about: string;
  websiteLink: string;
  productCount: number;
  employeeCount?: number;
  distanceKm?: number;
  formattedDistance?: string;
  open?: boolean;
}

export type BusinessDto = BusinessDiscoveryDto;

export interface BusinessWithDistance extends BusinessDiscoveryDto {
  distanceKm: number;
  formattedDistance: string;
}

export interface ProductDto {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrls: string[];
  businessId: string;
  category: string;
}

/**
 * DTO for public product information matching backend PublicProductDto
 */
export interface PublicProductDto {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrls: string[];
  businessId: string;
  businessName: string;
  category?: string;

  // Additional calculated fields for packet information
  fullPacketsAvailable?: number;
  additionalUnits?: number;
  itemsPerPacket?: number;

  // Additional pricing details
  unitPrice?: number;
  fulfillmentCost?: number;
  packetPrice?: number; // Price per full packet
}

/**
 * DTO for product pagination and sorting requests
 */
export interface ProductPageRequestDto {
  skip?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  searchTerm?: string;
}

/**
 * DTO for paginated product responses
 */
export interface ProductPageResponseDto {
  products: PublicProductDto[];
  totalCount: number;
  skip: number;
  limit: number;
  hasMore: boolean;
  sortBy: string;
  sortDirection: string;
  businessName: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  skip: number;
  limit: number;
  hasMore: boolean;
}

export interface LocationRequestDto {
  latitude: number;
  longitude: number;
  radius?: number;
  skip?: number;
  limit?: number;
}

export interface BusinessSearchParams extends LocationRequestDto {
  searchTerm?: string;
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  productName?: string;
  skipLocationFilter?: boolean;
}

export type RadiusSearchParams = LocationRequestDto;

export interface LocationFilters {
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  radius: number;
}

export interface AdvancedSearchParams extends LocationRequestDto {
  businessName?: string;
  productName?: string;
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
}
