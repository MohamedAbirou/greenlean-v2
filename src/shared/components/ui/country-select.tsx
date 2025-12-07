/**
 * Country Select Component
 * Searchable dropdown for selecting country with flags
 * Automatically determines unit system based on country
 */

import { useState } from 'react';
import { Check, ChevronsUpDown, Globe } from 'lucide-react';
import { cn } from '@/shared/design-system';
import { Button } from '@/shared/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { COUNTRIES, type Country } from '@/shared/data/countries';

interface CountrySelectProps {
  value?: string; // Country code (e.g., 'US')
  onValueChange: (countryCode: string, unitSystem: 'metric' | 'imperial') => void;
  disabled?: boolean;
  className?: string;
}

export function CountrySelect({ value, onValueChange, disabled, className }: CountrySelectProps) {
  const [open, setOpen] = useState(false);

  const selectedCountry = COUNTRIES.find(country => country.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between', className)}
        >
          {selectedCountry ? (
            <span className="flex items-center gap-2">
              <span className="text-xl">{selectedCountry.flag}</span>
              <span>{selectedCountry.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                ({selectedCountry.unitSystem})
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Select country...</span>
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandEmpty>No country found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {COUNTRIES.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.name}
                  onSelect={() => {
                    onValueChange(country.code, country.unitSystem);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === country.code ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="text-lg mr-2">{country.flag}</span>
                  <span className="flex-1">{country.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {country.unitSystem}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
