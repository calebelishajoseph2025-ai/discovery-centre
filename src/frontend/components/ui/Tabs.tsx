import { KeyboardEvent, ReactNode, useId, useRef, useState } from 'react';
import { cx } from '../../design/cx.ts';

export interface TabItem {
  id: string;
  label: string;
  panel: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  label: string;
}

export function Tabs({ tabs, label }: TabsProps) {
  const [active, setActive] = useState(tabs[0]?.id ?? '');
  const baseId = useId();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const selectTab = (id: string) => {
    setActive(id);
    tabRefs.current[id]?.focus();
  };

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const ids = tabs.map((t) => t.id);
    const i = ids.indexOf(active);
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      selectTab(ids[(i + 1) % ids.length]);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      selectTab(ids[(i - 1 + ids.length) % ids.length]);
    } else if (event.key === 'Home') {
      event.preventDefault();
      selectTab(ids[0]);
    } else if (event.key === 'End') {
      event.preventDefault();
      selectTab(ids[ids.length - 1]);
    }
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        className="flex flex-wrap gap-1 border-b border-hairline"
        onKeyDown={onKey}
      >
        {tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${baseId}-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              ref={(node) => {
                tabRefs.current[tab.id] = node;
              }}
              className={cx(
                'relative -mb-px touch-target px-4 py-2.5 text-sm font-semibold',
                selected
                  ? 'text-lantern border-b-2 border-lantern'
                  : 'text-text-muted hover:text-text'
              )}
              onClick={() => setActive(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${baseId}-panel-${tab.id}`}
          aria-labelledby={`${baseId}-${tab.id}`}
          hidden={tab.id !== active}
          className="pt-6"
        >
          {tab.id === active ? tab.panel : null}
        </div>
      ))}
    </div>
  );
}
