/*
  # Add price_breakdown to facility rental requests

  ## Problem
  Each request only stored calculated_total, a single number - admin
  staff had no way to see what it was actually made up of (base fee,
  which rooms at what rate, which services) without recomputing it by
  hand, and since pricing is now editable (see
  20261020120000_add_rental_pricing_settings.sql), recomputing from
  today's prices wouldn't even match what the renter was actually quoted
  if a price changed since.

  ## What this does
  Adds a nullable price_breakdown jsonb column, populated going forward
  by calculateRentalTotal's own return value at submission time (the
  same object the live price preview on the form already computes) -
  baseFee, roomBreakdown (room/duration/amount per room), the member
  discount applied, serviceBreakdown (service/amount per service),
  depositAmount, and total. Nullable rather than backfilled: existing
  requests only ever had calculated_total, and there's no way to know
  after the fact what their breakdown actually was, so admin falls back
  to showing just the total for those.
*/

ALTER TABLE facility_rental_requests_portal123
  ADD COLUMN IF NOT EXISTS price_breakdown jsonb;
