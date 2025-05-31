import { API_ENDPOINTS, PUBLIC_REQUEST_OPTIONS } from "@/config/api";
import {
  BusinessDiscoveryDto,
  BusinessSearchParams,
  PaginatedResponse,
  ProductDto,
  RadiusSearchParams,
  AdvancedSearchParams,
  LocationRequestDto,
} from "@/types/business";

/**
 * Get businesses nearest to the user's location
 */
export const getNearestBusinesses = async (
  params: BusinessSearchParams | LocationRequestDto
): Promise<PaginatedResponse<BusinessDiscoveryDto>> => {
  try {
    const response = await fetch(API_ENDPOINTS.BUSINESS.DISCOVERY.NEAREST, {
      method: "POST",
      ...PUBLIC_REQUEST_OPTIONS,
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch nearest businesses");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching nearest businesses:", error);
    throw error;
  }
};

/**
 * Get products for a specific business
 */
export const getBusinessProducts = async (
  businessId: string,
  skip: number = 0,
  limit: number = 10
): Promise<PaginatedResponse<ProductDto>> => {
  try {
    const response = await fetch(
      API_ENDPOINTS.BUSINESS.DISCOVERY.PRODUCTS(businessId),
      {
        method: "POST",
        ...PUBLIC_REQUEST_OPTIONS,
        body: JSON.stringify({ skip, limit }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to fetch products for business ${businessId}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching products for business ${businessId}:`, error);
    throw error;
  }
};

/**
 * Filter businesses by province
 */
export const filterBusinessesByProvince = async (
  province: string,
  params: BusinessSearchParams
): Promise<PaginatedResponse<BusinessDiscoveryDto>> => {
  try {
    const response = await fetch(
      API_ENDPOINTS.BUSINESS.DISCOVERY.FILTER_BY_PROVINCE(province),
      {
        method: "POST",
        ...PUBLIC_REQUEST_OPTIONS,
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to filter businesses by province: ${province}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error filtering businesses by province ${province}:`, error);
    throw error;
  }
};

/**
 * Filter businesses by district
 */
export const filterBusinessesByDistrict = async (
  district: string,
  params: BusinessSearchParams
): Promise<PaginatedResponse<BusinessDiscoveryDto>> => {
  try {
    const response = await fetch(
      API_ENDPOINTS.BUSINESS.DISCOVERY.FILTER_BY_DISTRICT(district),
      {
        method: "POST",
        ...PUBLIC_REQUEST_OPTIONS,
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to filter businesses by district: ${district}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error filtering businesses by district ${district}:`, error);
    throw error;
  }
};

/**
 * Filter businesses by sector
 */
export const filterBusinessesBySector = async (
  sector: string,
  params: BusinessSearchParams
): Promise<PaginatedResponse<BusinessDiscoveryDto>> => {
  try {
    const response = await fetch(
      API_ENDPOINTS.BUSINESS.DISCOVERY.FILTER_BY_SECTOR(sector),
      {
        method: "POST",
        ...PUBLIC_REQUEST_OPTIONS,
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to filter businesses by sector: ${sector}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error filtering businesses by sector ${sector}:`, error);
    throw error;
  }
};

/**
 * Filter businesses by cell
 */
export const filterBusinessesByCell = async (
  cell: string,
  params: BusinessSearchParams
): Promise<PaginatedResponse<BusinessDiscoveryDto>> => {
  try {
    const response = await fetch(
      API_ENDPOINTS.BUSINESS.DISCOVERY.FILTER_BY_CELL(cell),
      {
        method: "POST",
        ...PUBLIC_REQUEST_OPTIONS,
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to filter businesses by cell: ${cell}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error filtering businesses by cell ${cell}:`, error);
    throw error;
  }
};

/**
 * Filter businesses by village
 */
export const filterBusinessesByVillage = async (
  village: string,
  params: BusinessSearchParams
): Promise<PaginatedResponse<BusinessDiscoveryDto>> => {
  try {
    const response = await fetch(
      API_ENDPOINTS.BUSINESS.DISCOVERY.FILTER_BY_VILLAGE(village),
      {
        method: "POST",
        ...PUBLIC_REQUEST_OPTIONS,
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to filter businesses by village: ${village}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error filtering businesses by village ${village}:`, error);
    throw error;
  }
};

/**
 * Search businesses by product name
 */
export const searchBusinessesByProduct = async (
  productName: string,
  params: BusinessSearchParams
): Promise<PaginatedResponse<BusinessDiscoveryDto>> => {
  try {
    const response = await fetch(
      API_ENDPOINTS.BUSINESS.DISCOVERY.SEARCH_BY_PRODUCT(productName),
      {
        method: "POST",
        ...PUBLIC_REQUEST_OPTIONS,
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to search businesses by product: ${productName}`);
    }

    return await response.json();
  } catch (error) {
    console.error(
      `Error searching businesses by product ${productName}:`,
      error
    );
    throw error;
  }
};

/**
 * Search businesses by business name
 */
export const searchBusinessesByName = async (
  businessName: string,
  params: BusinessSearchParams
): Promise<PaginatedResponse<BusinessDiscoveryDto>> => {
  try {
    const response = await fetch(
      API_ENDPOINTS.BUSINESS.DISCOVERY.SEARCH_BY_NAME(businessName),
      {
        method: "POST",
        ...PUBLIC_REQUEST_OPTIONS,
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to search businesses by name: ${businessName}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error searching businesses by name ${businessName}:`, error);
    throw error;
  }
};

/**
 * Advanced search for businesses by name and location
 *
 * This endpoint expects a LocationSearchRequestDto with:
 * - latitude, longitude: User's location coordinates
 * - businessName, productName: Optional search terms
 * - province, district, sector, cell, village: Optional location filters
 * - radius: Search radius in kilometers (default: 10)
 * - skip, limit: Pagination parameters
 */
export const advancedSearchBusinesses = async (
  params: AdvancedSearchParams
): Promise<PaginatedResponse<BusinessDiscoveryDto>> => {
  try {
    // Ensure default values are set
    const searchParams = {
      ...params,
      radius: params.radius || 10,
      skip: params.skip || 0,
      limit: params.limit || 10,
    };

    const response = await fetch(
      API_ENDPOINTS.BUSINESS.DISCOVERY.ADVANCED_SEARCH,
      {
        method: "POST",
        ...PUBLIC_REQUEST_OPTIONS,
        body: JSON.stringify(searchParams),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.error || "Failed to perform advanced search";
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error performing advanced search:", error);
    throw error;
  }
};

/**
 * Get businesses within a specific radius
 */
export const getBusinessesWithinRadius = async (
  params: RadiusSearchParams | LocationRequestDto
): Promise<PaginatedResponse<BusinessDiscoveryDto>> => {
  try {
    // Ensure the radius parameter is set
    if (!params.radius) {
      throw new Error("Radius is required for this operation");
    }

    const response = await fetch(
      API_ENDPOINTS.BUSINESS.DISCOVERY.WITHIN_RADIUS,
      {
        method: "POST",
        ...PUBLIC_REQUEST_OPTIONS,
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || "Failed to fetch businesses within radius"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching businesses within radius:", error);
    throw error;
  }
};

/**
 * Get business details by ID from the public endpoint
 */
export const getPublicBusinessDetails = async (
  businessId: string
): Promise<BusinessDiscoveryDto> => {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.BUSINESS.DISCOVERY.GET_BY_ID}/${businessId}`,
      {
        method: "GET",
        ...PUBLIC_REQUEST_OPTIONS,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch business details");
    }

    return await response.json();
  } catch (error) {
    console.error(
      `Error fetching business details for ID ${businessId}:`,
      error
    );
    throw error;
  }
};
