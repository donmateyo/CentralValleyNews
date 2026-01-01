import type { CountyTab } from '../types';

interface TabNavProps {
  currentTab: CountyTab;
  onTabChange: (tab: CountyTab) => void;
  lastUpdated: string;
}

export function TabNav({ currentTab, onTabChange, lastUpdated }: TabNavProps) {
  return (
    <div className="flex flex-col gap-3 mb-3">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xs font-masthead font-bold text-[--text-primary] uppercase tracking-wider">
          Headlines
        </h2>
        <span className="text-[9px] text-[--text-muted]">{lastUpdated}</span>
      </div>

      {/* Tab Switcher */}
      <div className="relative bg-[--bg-header] p-1 rounded-lg flex">
        {/* Sliding Indicator */}
        <div
          className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-[--accent] rounded-md shadow-sm transition-transform duration-300 ease-out z-0"
          style={{
            transform: currentTab === 'fresno' ? 'translateX(0)' : 'translateX(calc(100% + 8px))'
          }}
        />

        <button
          onClick={() => onTabChange('fresno')}
          className={`flex-1 relative z-10 py-1.5 text-xs font-semibold text-center transition-colors ${
            currentTab === 'fresno' ? 'text-white' : 'text-gray-400'
          }`}
        >
          Fresno County
        </button>
        <button
          onClick={() => onTabChange('tulare')}
          className={`flex-1 relative z-10 py-1.5 text-xs font-semibold text-center transition-colors ${
            currentTab === 'tulare' ? 'text-white' : 'text-gray-400'
          }`}
        >
          Tulare County
        </button>
      </div>
    </div>
  );
}