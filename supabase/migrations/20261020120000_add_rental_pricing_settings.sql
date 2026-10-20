/*
  # Add editable pricing to facility rental settings

  ## Problem
  Room/service rates, base fees, the member discount, and the deposit
  amount were all hardcoded in src/lib/rentalPricing.js. Staff had no way
  to change a price without a code change.

  ## What this does
  Adds a `pricing` jsonb column to the existing single-row
  facility_rental_settings_portal123 table, holding every editable
  dollar amount the /rental form and its price calculation use:

  {
    "baseFeeMember": 25,
    "baseFeeNonMember": 50,
    "memberRoomDiscount": 0.7,
    "depositAmount": 50,
    "rooms": { "<room id>": { "half": n, "full": n }, ... },
    "services": { "<service id>": { "half": n, "full": n }, ... }
  }

  Room/service ids and labels stay in code (src/lib/rentalPricing.js) -
  only their prices move into this column. The default matches exactly
  what was previously hardcoded, so existing behavior doesn't change
  until staff actually edit a price.

  Also adds an anon SELECT policy: the public /rental form (unauthenticated)
  needs to read current pricing to show a live estimate as visitors fill
  it out. The settings row only otherwise holds notification_email, which
  is already shown in plain text elsewhere on the public rental page, so
  this isn't exposing anything new.
*/

ALTER TABLE facility_rental_settings_portal123
  ADD COLUMN IF NOT EXISTS pricing jsonb NOT NULL DEFAULT '{
    "baseFeeMember": 25,
    "baseFeeNonMember": 50,
    "memberRoomDiscount": 0.7,
    "depositAmount": 50,
    "rooms": {
      "sanctuary": {"half": 180, "full": 350},
      "fellowship_hall": {"half": 85, "full": 150},
      "kitchen": {"half": 75, "full": 150},
      "pavilion": {"half": 40, "full": 55},
      "classroom": {"half": 40, "full": 55}
    },
    "services": {
      "clear_stage": {"half": 120, "full": 120},
      "sound_tech": {"half": 75, "full": 150},
      "av": {"half": 75, "full": 150}
    }
  }'::jsonb;

DROP POLICY IF EXISTS "Anyone can view rental settings" ON facility_rental_settings_portal123;
CREATE POLICY "Anyone can view rental settings"
  ON facility_rental_settings_portal123 FOR SELECT
  TO anon USING (true);
