# Street View Cache — Quick Examples

## Basic Usage

### Fetch a single image
```typescript
import { getOrFetchStreetViewImage } from '@/lib/street-view-cache';

const imageUrl = await getOrFetchStreetViewImage(
  '123 Main Street, New York, NY',
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
);

if (imageUrl) {
  console.log('Image loaded:', imageUrl.substring(0, 50) + '...');
} else {
  console.log('Image not available');
}
```

### Cache an image manually
```typescript
import { cacheStreetViewImage } from '@/lib/street-view-cache';

const base64DataUrl = 'data:image/png;base64,iVBORw0KGgo...';
cacheStreetViewImage('123 Main Street, New York, NY', base64DataUrl);
```

### Clear entire cache
```typescript
import { clearStreetViewCache } from '@/lib/street-view-cache';

// Clear all cached images (useful on logout or manual refresh)
clearStreetViewCache();
```

### Get cache statistics
```typescript
import { getStreetViewCacheStats } from '@/lib/street-view-cache';

const stats = getStreetViewCacheStats();
console.log(`Server cache: ${stats.serverCacheSize}`);
console.log(`Client cache: ${stats.clientCacheCount} images`);
console.log(`Storage: ${(stats.clientCacheSizeBytes / 1024).toFixed(2)}KB`);
```

## React Component Examples

### Example 1: Property Card with Loading State
```typescript
import { getOrFetchStreetViewImage } from '@/lib/street-view-cache';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PropertyCardProps {
  address: string;
  apiKey?: string;
}

export function PropertyCard({ address, apiKey }: PropertyCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      if (!apiKey) {
        setError('API key not configured');
        setIsLoading(false);
        return;
      }

      try {
        const url = await getOrFetchStreetViewImage(address, apiKey);
        if (isMounted) {
          setImageUrl(url);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load image');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [address, apiKey]);

  return (
    <div className="property-card rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48 w-full bg-gray-100">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <p className="text-gray-500 text-center">{error}</p>
          </div>
        )}

        {imageUrl && !isLoading && (
          <img
            src={imageUrl}
            alt={address}
            className="w-full h-full object-cover"
          />
        )}

        {!imageUrl && !isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <p className="text-gray-500">Image not available</p>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg">{address}</h3>
      </div>
    </div>
  );
}
```

### Example 2: Property Grid with Parallel Preload
```typescript
import { preloadStreetViewImages } from '@/lib/street-view-cache';
import { useState, useEffect } from 'react';

interface Property {
  id: string;
  address: string;
  incentiveAmount: number;
}

interface PropertyGridProps {
  properties: Property[];
  apiKey?: string;
}

export function PropertyGrid({ properties, apiKey }: PropertyGridProps) {
  const [images, setImages] = useState<Map<string, string | null>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!apiKey || properties.length === 0) {
      setIsLoading(false);
      return;
    }

    (async () => {
      const addresses = properties.map((p) => p.address);
      const imageMap = await preloadStreetViewImages(addresses, apiKey);
      setImages(imageMap);
      setIsLoading(false);
    })();
  }, [properties, apiKey]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {properties.map((property) => {
        const imageUrl = images.get(property.address);

        return (
          <div key={property.id} className="property-card rounded-lg shadow-md overflow-hidden">
            <div className="relative h-40 w-full bg-gray-100">
              {isLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}

              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={property.address}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500 text-sm">Image unavailable</p>
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-base line-clamp-2">
                {property.address}
              </h3>
              <p className="text-green-600 font-bold text-sm mt-2">
                ${property.incentiveAmount.toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### Example 3: Admin Cache Monitor
```typescript
import {
  getStreetViewCacheStats,
  clearStreetViewCache
} from '@/lib/street-view-cache';
import { useState, useEffect } from 'react';

export function CacheMonitorPanel() {
  const [stats, setStats] = useState(getStreetViewCacheStats());
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getStreetViewCacheStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleClearCache = async () => {
    setIsClearing(true);
    clearStreetViewCache();

    // Brief delay to allow cache cleanup
    await new Promise((resolve) => setTimeout(resolve, 100));

    setStats(getStreetViewCacheStats());
    setIsClearing(false);
  };

  const totalStorageMB = stats.clientCacheSizeBytes / (1024 * 1024);
  const storagePercent = (totalStorageMB / 5) * 100;

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="font-bold text-lg mb-4">Street View Cache Monitor</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-600 text-sm">Server Cache</p>
          <p className="text-2xl font-bold">{stats.serverCacheSize}</p>
          <p className="text-gray-500 text-xs">entries</p>
        </div>

        <div>
          <p className="text-gray-600 text-sm">Client Cache</p>
          <p className="text-2xl font-bold">{stats.clientCacheCount}</p>
          <p className="text-gray-500 text-xs">images</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-gray-600 text-sm">Storage Usage</p>
          <p className="text-gray-600 text-sm font-semibold">
            {totalStorageMB.toFixed(2)}MB / 5MB
          </p>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              storagePercent > 80 ? 'bg-red-500' :
              storagePercent > 50 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(storagePercent, 100)}%` }}
          />
        </div>
      </div>

      <button
        onClick={handleClearCache}
        disabled={isClearing}
        className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isClearing ? 'Clearing...' : 'Clear Cache'}
      </button>
    </div>
  );
}
```

### Example 4: Property Search Results with Infinite Scroll
```typescript
import { getOrFetchStreetViewImage } from '@/lib/street-view-cache';
import { useEffect, useRef } from 'react';

interface SearchResult {
  id: string;
  address: string;
}

export function PropertySearchResults({ results, apiKey }: {
  results: SearchResult[];
  apiKey?: string;
}) {
  const observerTarget = useRef(null);

  // Preload images as user scrolls near the bottom
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && results.length > 0 && apiKey) {
        // Get the last few results
        const lastResults = results.slice(-5);
        lastResults.forEach((result) => {
          // Start loading without waiting
          getOrFetchStreetViewImage(result.address, apiKey).catch(
            () => {
              /* ignore errors */
            }
          );
        });
      }
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [results, apiKey]);

  return (
    <>
      <div className="space-y-4">
        {results.map((result) => (
          <div key={result.id} className="flex gap-4 border border-gray-200 rounded-lg p-4">
            <StreetViewImage address={result.address} apiKey={apiKey} />
            <div className="flex-1">
              <h4 className="font-semibold">{result.address}</h4>
            </div>
          </div>
        ))}
      </div>

      <div ref={observerTarget} className="h-4" />
    </>
  );
}

function StreetViewImage({ address, apiKey }: {
  address: string;
  apiKey?: string;
}) {
  const [imageUrl, setImageUrl] = useAsyncEffect(async () => {
    if (!apiKey) return null;
    return getOrFetchStreetViewImage(address, apiKey);
  }, [address, apiKey]);

  return (
    <div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0">
      {imageUrl ? (
        <img src={imageUrl} alt="" className="w-full h-full object-cover rounded" />
      ) : (
        <div className="w-full h-full bg-gray-300 animate-pulse rounded" />
      )}
    </div>
  );
}

// Helper hook for async effects
function useAsyncEffect<T>(
  effect: () => Promise<T | null>,
  deps: React.DependencyList
) {
  const [value, setValue] = useState<T | null>(null);

  useEffect(() => {
    let isMounted = true;
    effect().then((result) => {
      if (isMounted) {
        setValue(result);
      }
    });
    return () => {
      isMounted = false;
    };
  }, deps);

  return [value];
}
```

## Error Handling Examples

### Safe Fallback Pattern
```typescript
async function loadPropertyImage(address: string) {
  const imageUrl = await getOrFetchStreetViewImage(
    address,
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  );

  // Always have a fallback
  const finalImageUrl = imageUrl || '/images/placeholder-property.svg';

  return (
    <img
      src={finalImageUrl}
      alt={address}
      onError={(e) => {
        // Double fallback for data URL corruption
        (e.target as HTMLImageElement).src = '/images/placeholder-property.svg';
      }}
    />
  );
}
```

### Batch Error Handling
```typescript
import { preloadStreetViewImages } from '@/lib/street-view-cache';

async function loadMultipleWithFallback(addresses: string[], apiKey: string) {
  const results = await preloadStreetViewImages(addresses, apiKey);

  return Array.from(results.entries()).map(([address, imageUrl]) => ({
    address,
    imageUrl: imageUrl || '/images/placeholder-property.svg',
    isFallback: !imageUrl,
  }));
}
```

## Performance Tips

### Tip 1: Preload Images Before Rendering
```typescript
// DO: Preload in effect before render
useEffect(() => {
  preloadStreetViewImages(addresses, apiKey);
}, [addresses, apiKey]);

// AVOID: Loading images on demand in render loop
results.map(async (result) => await getOrFetchStreetViewImage(...));
```

### Tip 2: Monitor Cache Health
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    const stats = getStreetViewCacheStats();

    if (stats.clientCacheSizeBytes > 4 * 1024 * 1024) {
      console.warn('Cache approaching limit, consider clearing');
    }
  }, 60000); // Check every minute

  return () => clearInterval(interval);
}, []);
```

### Tip 3: Use Image Intersection Observer
```typescript
// Only load images that are visible on screen
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const address = entry.target.getAttribute('data-address');
      getOrFetchStreetViewImage(address, apiKey);
    }
  });
});

document.querySelectorAll('[data-address]').forEach((el) => {
  observer.observe(el);
});
```

## Testing Examples

### Unit Test: Mock API Response
```typescript
import { getOrFetchStreetViewImage } from '@/lib/street-view-cache';

describe('Street View Cache', () => {
  it('should fetch and cache image', async () => {
    const mockImageData = 'data:image/png;base64,iVBORw0KGgo=';

    global.fetch = jest.fn(async () => ({
      ok: true,
      blob: async () => new Blob([mockImageData]),
    }));

    const result = await getOrFetchStreetViewImage('123 Main', 'test-key');
    expect(result).not.toBeNull();
  });
});
```

---

## Common Issues & Solutions

### Issue: Image not loading in production
```typescript
// Solution: Check API key and verify address format
console.log('API Key:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
console.log('Address:', address);

const result = await getOrFetchStreetViewImage(address, apiKey || '');
if (!result) {
  console.warn('No image available - using fallback');
}
```

### Issue: Cache not persisting
```typescript
// Solution: Check localStorage is enabled
if (typeof window !== 'undefined') {
  try {
    localStorage.setItem('test', '1');
    localStorage.removeItem('test');
    console.log('localStorage available');
  } catch {
    console.warn('localStorage not available (private mode?)');
  }
}
```

### Issue: Too many API calls
```typescript
// Solution: Use preloadStreetViewImages for batch operations
// Instead of:
properties.forEach(async (p) => {
  await getOrFetchStreetViewImage(p.address, apiKey); // Individual calls
});

// Do:
await preloadStreetViewImages(
  properties.map((p) => p.address),
  apiKey
); // Parallel calls with caching
```
