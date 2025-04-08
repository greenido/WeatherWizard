import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Location } from "@/types/weather";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Cache duration constants
const SEARCH_CACHE_DURATION = 1000 * 60 * 30; // 30 minutes
const SEARCH_STALE_TIME = 1000 * 60 * 15; // 15 minutes
const SEARCH_GC_TIME = 1000 * 60 * 60; // 1 hour

interface SearchLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: Location) => void;
}

export default function SearchLocationModal({
  isOpen,
  onClose,
  onSelect,
}: SearchLocationModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const { toast } = useToast();

  // Debounce search term updates with a longer delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 800); // Increased from 500ms to 800ms

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['/api/weather/search', debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 3) return [];
      const res = await apiRequest('GET', `/api/weather/search?query=${encodeURIComponent(debouncedSearchTerm)}`, undefined);
      return await res.json();
    },
    enabled: debouncedSearchTerm.length >= 3,
    staleTime: SEARCH_STALE_TIME,
    gcTime: SEARCH_GC_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSelectLocation = useCallback((location: any) => {
    onSelect({
      name: location.name,
      lat: location.lat,
      lon: location.lon,
      isDefault: false,
    });
  }, [onSelect]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-800 border-0 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Add Location</DialogTitle>
        </DialogHeader>
        <div className="relative mb-4">
          <Input
            type="text"
            placeholder="Search for a city..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pr-10 bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {searchTerm.length > 0 && searchTerm.length < 3 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Please enter at least 3 characters to search
          </p>
        )}

        {isLoading && searchTerm.length >= 3 && (
          <div className="py-2 text-center text-sm text-gray-500 dark:text-gray-400">
            Searching...
          </div>
        )}

        {!isLoading && searchResults.length === 0 && searchTerm.length >= 3 && (
          <div className="py-2 text-center text-sm text-gray-500 dark:text-gray-400">
            No locations found. Try another search term.
          </div>
        )}

        <div className="max-h-64 overflow-y-auto">
          {searchResults.map((result: any) => (
            <div
              key={`${result.lat}-${result.lon}`}
              className="py-2 px-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded cursor-pointer transition-colors"
              onClick={() => handleSelectLocation(result)}
            >
              <div className="font-medium">{result.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {result.region && `${result.region}, `}{result.country}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
