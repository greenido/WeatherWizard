import { Location } from "@/types/weather";
import { setFavoriteLocation } from "@/lib/localStorage";
import { useToast } from "@/hooks/use-toast";

interface LocationSelectorProps {
  locations: Location[];
  currentLocation: Location | null;
  onChange: (locationId: string) => void;
  onFavoriteSet?: () => void;
  onRemoveLocation?: (location: Location) => void;
}

export default function LocationSelector({
  locations,
  currentLocation,
  onChange,
  onFavoriteSet,
  onRemoveLocation,
}: LocationSelectorProps) {
  const { toast } = useToast();
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };
  
  const handleSetFavorite = () => {
    if (currentLocation) {
      setFavoriteLocation(currentLocation);
      toast({
        title: "Favorite location set",
        description: `${currentLocation.name} has been set as your default location.`,
      });
      
      // Notify parent component to refresh locations
      if (onFavoriteSet) {
        onFavoriteSet();
      }
    }
  };
  
  const handleRemoveLocation = () => {
    if (currentLocation && onRemoveLocation) {
      // Only allow removal if there's more than one location
      if (locations.length > 1) {
        onRemoveLocation(currentLocation);
      } else {
        toast({
          title: "Cannot remove location",
          description: "You need to have at least one location. Add a new location before removing this one.",
          variant: "destructive",
        });
      }
    }
  };

  if (locations.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-1 sm:w-64 md:w-80">
        <select
          className="appearance-none bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg py-2 px-3 sm:px-4 pr-8 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full text-sm sm:text-base dark:text-gray-200"
          value={currentLocation ? `${currentLocation.lat}-${currentLocation.lon}` : ""}
          onChange={handleChange}
        >
          {locations.map((location) => (
            <option
              key={`${location.lat}-${location.lon}`}
              value={`${location.lat}-${location.lon}`}
            >
              {location.name} {location.isDefault ? "★" : ""}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      <button
        onClick={handleSetFavorite}
        disabled={!currentLocation}
        className={`p-2 rounded-lg ${
          currentLocation?.isDefault
            ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300"
            : "bg-gray-100 hover:bg-yellow-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
        } transition-colors`}
        title="Set as default location"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={currentLocation?.isDefault ? "currentColor" : "none"}
          stroke="currentColor"
          className="w-5 h-5"
          strokeWidth={currentLocation?.isDefault ? "0" : "2"}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      </button>
      
      {/* Remove location button */}
      <button
        onClick={handleRemoveLocation}
        disabled={!currentLocation}
        className={`p-2 rounded-lg bg-gray-100 hover:bg-red-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 transition-colors`}
        title="Remove location"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-5 h-5"
        >
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </div>
  );
}
