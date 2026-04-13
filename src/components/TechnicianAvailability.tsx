import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

const TechnicianAvailability = () => {
  const [count, setCount] = useState(4);

  useEffect(() => {
    // Simulate realistic technician availability based on time of day
    const hour = new Date().getHours();
    let base = 4;
    if (hour < 9 || hour > 21) base = 2;
    else if (hour >= 12 && hour <= 14) base = 3;
    else if (hour >= 17 && hour <= 20) base = 5;
    
    setCount(base);

    // Slight fluctuation every 30 seconds
    const interval = setInterval(() => {
      setCount(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        return Math.max(2, Math.min(6, prev + delta));
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-4 py-2.5 animate-fade-in">
      <div className="relative">
        <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
      </div>
      <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
        {count} טכנאים פנויים באזורך
      </span>
    </div>
  );
};

export default TechnicianAvailability;
