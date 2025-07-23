import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';

export default function MonitorQuickAccess() {
  const goToMonitor = () => {
    window.location.href = '/monitor';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={goToMonitor}
        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full w-16 h-16 flex items-center justify-center"
      >
        <TrendingUp className="h-6 w-6" />
      </Button>
      <div className="text-xs text-center mt-1 text-blue-600 font-medium">
        Monitor
      </div>
    </div>
  );
}