import { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TechnicianTrackerProps {
  technicianName: string;
  estimatedArrival?: string;
  customerAddress: string;
  wazeLink?: string;
}

// Custom scooter SVG component
const TechnicianScooter = () => (
  <svg viewBox="0 0 80 50" className="w-20 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Delivery box */}
    <rect x="20" y="5" width="30" height="22" rx="3" fill="hsl(var(--primary))" />
    <rect x="22" y="7" width="26" height="10" rx="1" fill="hsl(var(--primary-foreground))" fillOpacity="0.9" />
    <text x="35" y="14" textAnchor="middle" fontSize="4" fontWeight="bold" fill="hsl(var(--primary))">DIRECT</text>
    <text x="35" y="18" textAnchor="middle" fontSize="3" fontWeight="bold" fill="hsl(var(--primary))">FIX</text>
    
    {/* Scooter body */}
    <ellipse cx="45" cy="35" rx="18" ry="8" fill="hsl(var(--primary))" />
    <rect x="30" y="28" width="25" height="10" rx="5" fill="hsl(var(--primary))" />
    
    {/* Handle */}
    <rect x="55" y="20" width="3" height="15" rx="1" fill="hsl(var(--foreground))" fillOpacity="0.7" />
    <rect x="52" y="18" width="9" height="4" rx="2" fill="hsl(var(--foreground))" fillOpacity="0.5" />
    
    {/* Seat */}
    <ellipse cx="38" cy="26" rx="8" ry="3" fill="hsl(var(--foreground))" fillOpacity="0.8" />
    
    {/* Front wheel */}
    <circle cx="60" cy="40" r="8" fill="hsl(var(--foreground))" fillOpacity="0.8" />
    <circle cx="60" cy="40" r="5" fill="hsl(var(--background))" />
    <circle cx="60" cy="40" r="2" fill="hsl(var(--foreground))" fillOpacity="0.5" />
    
    {/* Back wheel */}
    <circle cx="25" cy="40" r="8" fill="hsl(var(--foreground))" fillOpacity="0.8" />
    <circle cx="25" cy="40" r="5" fill="hsl(var(--background))" />
    <circle cx="25" cy="40" r="2" fill="hsl(var(--foreground))" fillOpacity="0.5" />
    
    {/* Headlight */}
    <ellipse cx="63" cy="32" rx="2" ry="3" fill="#FBBF24" />
  </svg>
);

const TechnicianTracker = ({ technicianName, estimatedArrival, customerAddress, wazeLink }: TechnicianTrackerProps) => {
  const [showEmbed, setShowEmbed] = useState(true);
  const [embedError, setEmbedError] = useState(false);

  // Extract Waze URL from shared text
  const extractWazeUrl = (text: string): string | null => {
    const urlMatch = text.match(/https:\/\/waze\.com\/ul[^\s]*/);
    return urlMatch ? urlMatch[0] : null;
  };

  const handleWazeClick = () => {
    if (wazeLink) {
      const url = extractWazeUrl(wazeLink) || wazeLink;
      if (url.startsWith('http')) {
        window.open(url, '_blank');
      }
    }
  };

  const wazeUrl = wazeLink ? extractWazeUrl(wazeLink) : null;

  // City illustration component (fallback when no Waze link)
  const CityIllustration = () => (
    <div className="relative h-52 bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-50 dark:from-sky-900/30 dark:via-sky-800/20 dark:to-emerald-900/20 overflow-hidden">
      {/* Sky with clouds */}
      <div className="absolute top-4 left-8 w-16 h-6 bg-white/60 dark:bg-white/20 rounded-full blur-sm" />
      <div className="absolute top-8 left-20 w-12 h-4 bg-white/40 dark:bg-white/10 rounded-full blur-sm" />
      <div className="absolute top-6 right-12 w-20 h-5 bg-white/50 dark:bg-white/15 rounded-full blur-sm" />
      
      {/* Sun */}
      <div className="absolute top-4 right-8 w-10 h-10 bg-yellow-300/60 dark:bg-yellow-400/30 rounded-full blur-md" />

      {/* Buildings - back row */}
      <div className="absolute bottom-16 inset-x-0 flex justify-around items-end px-4">
        <div className="w-10 h-20 bg-slate-300/80 dark:bg-slate-600/60 rounded-t-lg" />
        <div className="w-8 h-28 bg-slate-400/70 dark:bg-slate-500/60 rounded-t-sm" />
        <div className="w-12 h-24 bg-blue-200/80 dark:bg-blue-800/50 rounded-t-lg" />
        <div className="w-6 h-16 bg-slate-300/70 dark:bg-slate-600/50 rounded-t-md" />
        <div className="w-10 h-32 bg-slate-400/60 dark:bg-slate-500/50 rounded-t-sm" />
        <div className="w-8 h-20 bg-blue-300/70 dark:bg-blue-700/50 rounded-t-lg" />
        <div className="w-14 h-26 bg-slate-300/80 dark:bg-slate-600/60 rounded-t-md" />
      </div>

      {/* Trees */}
      <div className="absolute bottom-14 left-6">
        <div className="w-8 h-10 bg-emerald-500/70 dark:bg-emerald-600/50 rounded-full" />
        <div className="w-2 h-4 bg-amber-700/60 dark:bg-amber-800/50 mx-auto -mt-1" />
      </div>
      <div className="absolute bottom-14 right-10">
        <div className="w-10 h-12 bg-emerald-600/60 dark:bg-emerald-700/40 rounded-full" />
        <div className="w-2 h-4 bg-amber-700/60 dark:bg-amber-800/50 mx-auto -mt-1" />
      </div>
      <div className="absolute bottom-14 left-1/3">
        <div className="w-6 h-8 bg-emerald-400/70 dark:bg-emerald-500/50 rounded-full" />
        <div className="w-1.5 h-3 bg-amber-700/60 dark:bg-amber-800/50 mx-auto -mt-1" />
      </div>

      {/* Road */}
      <div className="absolute bottom-0 inset-x-0 h-14 bg-slate-600/90 dark:bg-slate-700/90">
        {/* Road markings */}
        <div className="absolute top-1/2 -translate-y-1/2 inset-x-4 flex items-center overflow-hidden">
          <div className="flex items-center gap-4 animate-road">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-8 h-1 bg-yellow-400/80 rounded-full flex-shrink-0" />
            ))}
          </div>
        </div>
        
        {/* Sidewalk */}
        <div className="absolute top-0 inset-x-0 h-2 bg-slate-400/50 dark:bg-slate-500/40" />
      </div>

      {/* Destination marker */}
      <div className="absolute left-10 bottom-12 z-10">
        <div className="relative">
          <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center shadow-lg animate-bounce-slow">
            <MapPin className="w-5 h-5 text-success-foreground" />
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-success rotate-45 -z-10" />
        </div>
      </div>

      {/* Scooter with technician */}
      <div className="absolute right-1/4 bottom-2 z-20 animate-drive">
        <div className="relative">
          {/* Name bubble */}
          <div className="absolute -top-6 right-1/2 translate-x-1/2 bg-card px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap border border-border/50">
            <span className="text-xs font-semibold text-foreground">{technicianName}</span>
          </div>
          {/* Custom scooter */}
          <TechnicianScooter />
        </div>
      </div>
    </div>
  );

  return (
    <div className="wolt-card-elevated overflow-hidden animate-slide-up">
      {/* Map section */}
      {wazeUrl && showEmbed && !embedError ? (
        <div className="relative">
          {/* Waze embed iframe */}
          <div className="relative h-64 bg-muted">
            <iframe
              src={wazeUrl}
              className="w-full h-full border-0"
              allow="geolocation"
              onError={() => setEmbedError(true)}
              title="מעקב וויז"
            />
            {/* Overlay header */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-background/90 to-transparent p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-[#33ccff]" />
                  <span className="font-bold text-foreground">{technicianName} בדרך אליך</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmbed(false)}
                  className="text-xs"
                >
                  <Map className="w-4 h-4 mr-1" />
                  הסתר מפה
                </Button>
              </div>
            </div>
          </div>
          
          {/* Open in Waze button */}
          <div className="p-3 bg-muted/50 border-t border-border">
            <Button
              onClick={handleWazeClick}
              variant="outline"
              className="w-full gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              פתח באפליקציית וויז
            </Button>
          </div>
        </div>
      ) : (
        <>
          <CityIllustration />
          
          {/* Show embed button if embed is hidden */}
          {wazeUrl && !showEmbed && (
            <div className="p-3 bg-[#33ccff]/10 border-b border-border">
              <Button
                onClick={() => setShowEmbed(true)}
                variant="ghost"
                className="w-full gap-2 text-[#33ccff]"
              >
                <Map className="w-4 h-4" />
                הצג מפת וויז
              </Button>
            </div>
          )}
        </>
      )}

      {/* Info section */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-primary">בדרך אליך</span>
          </div>
          {estimatedArrival && (
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-full">
              <span className="font-bold text-lg">{estimatedArrival}</span>
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
          <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground mb-1">כתובת הלקוח</p>
            <p className="font-medium text-foreground text-sm">{customerAddress}</p>
          </div>
        </div>

        {/* Waze tracking button - only show if no embed or embed hidden */}
        {wazeUrl && (!showEmbed || embedError) && (
          <Button
            onClick={handleWazeClick}
            className="w-full mt-4 gap-3 bg-[#33ccff] hover:bg-[#2bb8e6] text-white font-bold py-4 text-lg"
          >
            <Navigation className="w-6 h-6" />
            עקוב בוויז
          </Button>
        )}
      </div>
    </div>
  );
};

export default TechnicianTracker;
