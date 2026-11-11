/**
 * Pricing calculator for Northside Discovery Centre.
 * Fixed facts: Adult INR 100, Child INR 50.
 * Pure calculation and validation.
 */

export interface PricingLine {
  item: string;
  count: number;
  rateINR: number;
  subtotalINR: number;
}

export interface PricingQuote {
  adults: number;
  children: number;
  totalPeople: number;
  lines: PricingLine[];
  total: number;
  currency: 'INR';
}

export const ADULT_TICKET_PRICE_INR = 100;
export const CHILD_TICKET_PRICE_INR = 50;

export function quote(adults: number, children: number = 0): PricingQuote {
  // Input validations
  if (
    !Number.isInteger(adults) ||
    !Number.isInteger(children) ||
    adults < 0 ||
    children < 0
  ) {
    throw new Error('Visitor counts must be non-negative integers');
  }

  if (adults > 20 || children > 20) {
    throw new Error('Group sizes above 20 require custom group bookings');
  }

  const totalPeople = adults + children;
  if (totalPeople === 0) {
    throw new Error('At least one visitor is required for a ticket quote');
  }

  if (adults === 0 && children > 0) {
    throw new Error('Children under 16 must be accompanied by at least one adult');
  }

  const lines: PricingLine[] = [];

  if (adults > 0) {
    lines.push({
      item: 'Adult Admission',
      count: adults,
      rateINR: ADULT_TICKET_PRICE_INR,
      subtotalINR: adults * ADULT_TICKET_PRICE_INR,
    });
  }

  if (children > 0) {
    lines.push({
      item: 'Child Admission',
      count: children,
      rateINR: CHILD_TICKET_PRICE_INR,
      subtotalINR: children * CHILD_TICKET_PRICE_INR,
    });
  }

  const total = adults * ADULT_TICKET_PRICE_INR + children * CHILD_TICKET_PRICE_INR;

  return {
    adults,
    children,
    totalPeople,
    lines,
    total,
    currency: 'INR',
  };
}
