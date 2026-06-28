import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Globe, X } from "lucide-react";

export const SUPPORTED_COUNTRIES = [
  // North America
  { code: "usa", name: "United States", region: "North America" },
  { code: "canada", name: "Canada", region: "North America" },
  
  // Europe
  { code: "uk", name: "United Kingdom", region: "Europe" },
  { code: "germany", name: "Germany", region: "Europe" },
  { code: "france", name: "France", region: "Europe" },
  { code: "netherlands", name: "Netherlands", region: "Europe" },
  { code: "switzerland", name: "Switzerland", region: "Europe" },
  { code: "sweden", name: "Sweden", region: "Europe" },
  { code: "denmark", name: "Denmark", region: "Europe" },
  { code: "ireland", name: "Ireland", region: "Europe" },
  { code: "spain", name: "Spain", region: "Europe" },
  { code: "italy", name: "Italy", region: "Europe" },
  { code: "belgium", name: "Belgium", region: "Europe" },
  { code: "austria", name: "Austria", region: "Europe" },
  { code: "norway", name: "Norway", region: "Europe" },
  { code: "finland", name: "Finland", region: "Europe" },
  { code: "portugal", name: "Portugal", region: "Europe" },
  { code: "czechia", name: "Czech Republic", region: "Europe" },
  { code: "poland", name: "Poland", region: "Europe" },
  
  // Asia Pacific
  { code: "australia", name: "Australia", region: "Asia Pacific" },
  { code: "newzealand", name: "New Zealand", region: "Asia Pacific" },
  { code: "singapore", name: "Singapore", region: "Asia Pacific" },
  { code: "hongkong", name: "Hong Kong", region: "Asia Pacific" },
  { code: "japan", name: "Japan", region: "Asia Pacific" },
  { code: "southkorea", name: "South Korea", region: "Asia Pacific" },
  { code: "china", name: "China", region: "Asia Pacific" },
  { code: "taiwan", name: "Taiwan", region: "Asia Pacific" },
  { code: "malaysia", name: "Malaysia", region: "Asia Pacific" },
  { code: "thailand", name: "Thailand", region: "Asia Pacific" },
  { code: "india", name: "India", region: "Asia Pacific" },
  { code: "pakistan", name: "Pakistan", region: "Asia Pacific" },
  
  // Middle East
  { code: "uae", name: "United Arab Emirates", region: "Middle East" },
  { code: "qatar", name: "Qatar", region: "Middle East" },
  { code: "saudiarabia", name: "Saudi Arabia", region: "Middle East" },
  { code: "israel", name: "Israel", region: "Middle East" },
  
  // Latin America
  { code: "mexico", name: "Mexico", region: "Latin America" },
  { code: "brazil", name: "Brazil", region: "Latin America" },
  { code: "argentina", name: "Argentina", region: "Latin America" },
  { code: "chile", name: "Chile", region: "Latin America" },
  { code: "colombia", name: "Colombia", region: "Latin America" },
  
  // Africa
  { code: "southafrica", name: "South Africa", region: "Africa" },
  { code: "egypt", name: "Egypt", region: "Africa" },
  { code: "nigeria", name: "Nigeria", region: "Africa" },
];

const REGIONS = ["North America", "Europe", "Asia Pacific", "Middle East", "Latin America", "Africa"];

interface CountrySelectorProps {
  value: string[];
  onChange: (countries: string[]) => void;
}

export const CountrySelector = ({ value, onChange }: CountrySelectorProps) => {
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

  const toggleCountry = (countryName: string) => {
    if (value.includes(countryName)) {
      onChange(value.filter(c => c !== countryName));
    } else {
      onChange([...value, countryName]);
    }
  };

  const removeCountry = (countryName: string) => {
    onChange(value.filter(c => c !== countryName));
  };

  const countriesByRegion = REGIONS.reduce((acc, region) => {
    acc[region] = SUPPORTED_COUNTRIES.filter(c => c.region === region);
    return acc;
  }, {} as Record<string, typeof SUPPORTED_COUNTRIES>);

  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2 text-foreground font-medium">
        <Globe className="w-4 h-4 text-primary" />
        Preferred Countries (Select all that apply)
      </Label>
      
      {/* Selected Countries */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
          {value.map(country => (
            <Badge 
              key={country} 
              variant="secondary" 
              className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer pr-1"
            >
              {country}
              <button
                type="button"
                onClick={() => removeCountry(country)}
                className="ml-1 p-0.5 hover:bg-primary/20 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      
      {/* Region Accordions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {REGIONS.map(region => (
          <div key={region} className="space-y-1">
            <button
              type="button"
              onClick={() => setExpandedRegion(expandedRegion === region ? null : region)}
              className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                expandedRegion === region 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {region}
              <span className="text-xs ml-1 opacity-70">
                ({countriesByRegion[region].filter(c => value.includes(c.name)).length}/{countriesByRegion[region].length})
              </span>
            </button>
            
            {expandedRegion === region && (
              <div className="grid gap-1 p-2 bg-muted/30 rounded-lg animate-fade-in">
                {countriesByRegion[region].map(country => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => toggleCountry(country.name)}
                    className={`text-left px-2 py-1.5 text-sm rounded transition-all ${
                      value.includes(country.name)
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {country.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Select countries where you want to study. Leave empty to consider all options.
      </p>
    </div>
  );
};
