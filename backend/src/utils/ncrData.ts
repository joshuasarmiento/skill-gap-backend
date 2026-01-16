// src/utils/ncrData.ts

export const NCR_DISTRICT_CONFIG: Record<string, string[]> = {
  'NCR, City of Manila, First District (Not a Province)': [
    'manila-city-metro-manila'
  ],
  'NCR, Second District (Not a Province)': [
    'mandaluyong-city-metro-manila', 
    'pasig-city-metro-manila', 
    'quezon-city-metro-manila', 
    'marikina-city-metro-manila', 
    'san-juan-city-metro-manila'
  ],
  'NCR, Third District (Not a Province)': [
    'caloocan-city-metro-manila', 
    'malabon-city-metro-manila', 
    'navotas-city-metro-manila', 
    'valenzuela-city-metro-manila'
  ],
  'NCR, Fourth District (Not a Province)': [
    'makati-city-metro-manila', 
    'pasay-city-metro-manila', 
    'taguig-city-metro-manila', 
    'paranaque-city-metro-manila', 
    'las-pinas-city-metro-manila', 
    'muntinlupa-city-metro-manila',
    'pateros-Metro-Manila'
  ]
};

/**
 * Checks if a city slug belongs to a larger NCR district.
 * If it does, returns the District Name. If not, returns the original slug.
 */
export const getResolvedSlug = (slug: string): string => {
  const districtName = Object.keys(NCR_DISTRICT_CONFIG).find(name => 
    NCR_DISTRICT_CONFIG[name].includes(slug)
  );
  return districtName || slug;
};