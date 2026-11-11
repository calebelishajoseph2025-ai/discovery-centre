import { ReactNode } from 'react';

interface DisclosureProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function Disclosure({ title, children, defaultOpen }: DisclosureProps) {
  return (
    <details
      className="group border-b border-hairline py-3"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-2 text-left text-base font-semibold text-text marker:content-none [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <span aria-hidden="true" className="text-lantern transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="pb-3 pt-1 text-sm leading-relaxed text-text-muted">{children}</div>
    </details>
  );
}
