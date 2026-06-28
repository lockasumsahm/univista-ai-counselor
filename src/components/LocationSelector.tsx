import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois",
  "Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts",
  "Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota",
  "Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

const CA_PROVINCES = [
  "Alberta","British Columbia","Manitoba","New Brunswick","Newfoundland and Labrador",
  "Nova Scotia","Ontario","Prince Edward Island","Quebec","Saskatchewan",
  "Northwest Territories","Nunavut","Yukon",
];

const COUNTRIES = [
  "United Kingdom","Ireland","Germany","France","Netherlands","Switzerland","Sweden","Denmark",
  "Norway","Finland","Spain","Italy","Belgium","Austria","Portugal","Poland","Czech Republic",
  "Australia","New Zealand","Singapore","Hong Kong","Japan","South Korea","China","Taiwan",
  "Malaysia","Thailand","India","Pakistan","Bangladesh","Vietnam","Indonesia","Philippines",
  "United Arab Emirates","Qatar","Saudi Arabia","Israel","Turkey","Egypt","Nigeria","Kenya",
  "South Africa","Mexico","Brazil","Argentina","Chile","Colombia","Peru","Other",
];

interface LocationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

type Mode = "us" | "canada" | "international";

const detectMode = (v: string): Mode => {
  if (!v) return "us";
  if (US_STATES.includes(v)) return "us";
  if (CA_PROVINCES.some(p => v.endsWith(`, ${p}`) || v === p)) return "canada";
  return "international";
};

export const LocationSelector = ({ value, onChange, id }: LocationSelectorProps) => {
  const [mode, setMode] = useState<Mode>(detectMode(value));
  const initial = useMemo(() => value ?? "", [value]);
  const [intlCity, setIntlCity] = useState(() => {
    if (detectMode(initial) !== "international") return "";
    const parts = initial.split(",").map(s => s.trim());
    return parts.length > 1 ? parts.slice(0, -1).join(", ") : "";
  });
  const [intlCountry, setIntlCountry] = useState(() => {
    if (detectMode(initial) !== "international") return "";
    const parts = initial.split(",").map(s => s.trim());
    return parts.length ? parts[parts.length - 1] : "";
  });
  const [caCity, setCaCity] = useState(() => {
    if (detectMode(initial) !== "canada") return "";
    const parts = initial.split(",").map(s => s.trim());
    return parts.length > 1 ? parts.slice(0, -1).join(", ") : "";
  });

  const setCanada = (province: string, city = caCity) => {
    setCaCity(city);
    onChange(city ? `${city}, ${province}` : province);
  };

  const setInternational = (country: string, city = intlCity) => {
    setIntlCountry(country);
    setIntlCity(city);
    onChange(city ? `${city}, ${country}` : country);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" /> Region:
        </span>
        {(["us", "canada", "international"] as Mode[]).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              onChange("");
            }}
            className={`px-2.5 py-1 rounded-full transition-all ${
              mode === m
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            {m === "us" ? "U.S." : m === "canada" ? "Canada" : "International"}
          </button>
        ))}
      </div>

      {mode === "us" && (
        <Select value={US_STATES.includes(value) ? value : ""} onValueChange={onChange}>
          <SelectTrigger id={id}>
            <SelectValue placeholder="Select your U.S. state" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {US_STATES.map(s => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {mode === "canada" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Input
            placeholder="City (optional)"
            value={caCity}
            onChange={e => {
              const province = CA_PROVINCES.find(p => value.endsWith(p)) ?? "";
              setCanada(province, e.target.value);
            }}
          />
          <Select
            value={CA_PROVINCES.find(p => value.endsWith(p)) ?? ""}
            onValueChange={p => setCanada(p)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select province / territory" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {CA_PROVINCES.map(p => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {mode === "international" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Input
            placeholder="City (optional)"
            value={intlCity}
            onChange={e => setInternational(intlCountry, e.target.value)}
          />
          <Select value={intlCountry} onValueChange={c => setInternational(c)}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {COUNTRIES.map(c => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
