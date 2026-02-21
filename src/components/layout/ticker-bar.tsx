'use client';

import { useEffect, useState } from 'react';

interface TickerItem {
  label: string;
  value: string;
  type?: 'positive' | 'negative' | 'urgent' | 'neutral';
  badge?: 'new' | 'deadline' | 'alert';
}

// V41: Live market-style ticker data
const defaultTickerItems: TickerItem[] = [
  { label: 'Programs', value: '24,847', type: 'neutral' },
  { label: 'IRA Funding', value: '$369B', type: 'positive', badge: 'new' },
  { label: 'Avg Tax Credit', value: '26%', type: 'positive' },
  { label: 'Q1 Deadlines', value: '142', type: 'urgent', badge: 'deadline' },
  { label: 'Active Grants', value: '$8.2M', type: 'positive' },
  { label: 'NYSERDA PON', value: 'Open', type: 'positive', badge: 'new' },
  { label: 'LIHTC Rate', value: '9%', type: 'neutral' },
  { label: 'ITC Solar', value: '30%', type: 'positive' },
  { label: 'NY State', value: '1,247 Programs', type: 'neutral' },
  { label: 'Federal', value: '3,421 Programs', type: 'neutral' },
];

export function TickerBar() {
  const [items, setItems] = useState<TickerItem[]>(defaultTickerItems);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    // Update time
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Double the items for seamless scroll
  const duplicatedItems = [...items, ...items];

  return (
    <div className="ticker-bar">
      <div className="ticker-content">
        {duplicatedItems.map((item, index) => (
          <div key={index} className="ticker-item">
            <span className="ticker-label">{item.label}</span>
            <span className={`ticker-value ${item.type || ''}`}>
              {item.value}
            </span>
            {item.badge && (
              <span className={`ticker-badge ${item.badge}`}>
                {item.badge === 'new' ? 'NEW' : item.badge === 'deadline' ? 'DUE' : 'ALERT'}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Live indicator */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-navy-900 px-3 py-1 rounded-l-lg">
        <div className="pulse-indicator" />
        <span className="text-xs font-mono text-slate-400">{currentTime}</span>
      </div>
    </div>
  );
}
