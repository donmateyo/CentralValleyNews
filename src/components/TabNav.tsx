import type { CountyTab } from '../types';

interface TabNavProps {
  currentTab: CountyTab;
  onTabChange: (tab: CountyTab) => void;
  lastUpdated: string;
}

export function TabNav({ currentTab, onTabChange, lastUpdated }: TabNavProps) {
  return (
    <div className="vp-tabs">
      <div className="vp-tabs__head">
        <h2 className="vp-section__title" id="headlines-heading">Headlines</h2>
        <span className="vp-meta">{lastUpdated}</span>
      </div>

      <div className="vp-segment" role="tablist" aria-label="County filter">
        <button
          role="tab"
          aria-selected={currentTab === 'fresno'}
          className="vp-segment__button"
          data-active={currentTab === 'fresno'}
          onClick={() => onTabChange('fresno')}
        >
          Fresno County
        </button>
        <button
          role="tab"
          aria-selected={currentTab === 'tulare'}
          className="vp-segment__button"
          data-active={currentTab === 'tulare'}
          onClick={() => onTabChange('tulare')}
        >
          Tulare County
        </button>
      </div>
    </div>
  );
}