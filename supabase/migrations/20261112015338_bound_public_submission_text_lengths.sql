/*
# Bound the length of anonymous public form submissions

1. Changes
- Add one CHECK constraint per public submission table bounding the length of
  every free-text column to a generous limit matching what the forms allow.

2. Security
- Anonymous callers can POST directly to these tables through the Data API,
  bypassing the browser's maxLength attributes. Without a bound, a scripted
  caller could insert arbitrarily large payloads and exhaust storage.

3. Notes
- Constraints are added NOT VALID so existing rows are never rejected or
  altered; only new inserts are bounded.
- Limits are far above any legitimate submission, so genuine visitors are
  unaffected.
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contact_messages_portal123_text_len') THEN
    ALTER TABLE public.contact_messages_portal123
      ADD CONSTRAINT contact_messages_portal123_text_len CHECK (
        coalesce(length(name), 0) <= 200
        AND coalesce(length(email), 0) <= 320
        AND coalesce(length(phone), 0) <= 50
        AND coalesce(length(subject), 0) <= 300
        AND coalesce(length(message), 0) <= 5000
      ) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'facility_rental_requests_portal123_text_len') THEN
    ALTER TABLE public.facility_rental_requests_portal123
      ADD CONSTRAINT facility_rental_requests_portal123_text_len CHECK (
        coalesce(length(event_type), 0) <= 200
        AND coalesce(length(organization_name), 0) <= 300
        AND coalesce(length(event_name), 0) <= 300
        AND coalesce(length(purpose), 0) <= 5000
        AND coalesce(length(event_start_time), 0) <= 100
        AND coalesce(length(event_end_time), 0) <= 100
        AND coalesce(length(setup_schedule), 0) <= 1000
        AND coalesce(length(setup_arrival_time), 0) <= 100
        AND coalesce(length(setup_departure_time), 0) <= 100
        AND coalesce(length(responsible_first_name), 0) <= 200
        AND coalesce(length(responsible_last_name), 0) <= 200
        AND coalesce(length(responsible_email), 0) <= 320
        AND coalesce(length(responsible_phone), 0) <= 50
        AND coalesce(length(return_address), 0) <= 500
        AND coalesce(length(signature_name), 0) <= 200
        AND coalesce(length(notes), 0) <= 5000
      ) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'realm_signups_portal123_text_len') THEN
    ALTER TABLE public.realm_signups_portal123
      ADD CONSTRAINT realm_signups_portal123_text_len CHECK (
        coalesce(length(first_name), 0) <= 200
        AND coalesce(length(last_name), 0) <= 200
        AND coalesce(length(email), 0) <= 320
        AND coalesce(length(phone), 0) <= 50
        AND coalesce(length(address_line1), 0) <= 300
        AND coalesce(length(address_line2), 0) <= 300
        AND coalesce(length(city), 0) <= 200
        AND coalesce(length(state), 0) <= 100
        AND coalesce(length(zip_code), 0) <= 20
        AND coalesce(length(country), 0) <= 100
        AND coalesce(length(marital_status), 0) <= 100
      ) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'table_group_signups_portal123_text_len') THEN
    ALTER TABLE public.table_group_signups_portal123
      ADD CONSTRAINT table_group_signups_portal123_text_len CHECK (
        coalesce(length(first_name), 0) <= 200
        AND coalesce(length(last_name), 0) <= 200
        AND coalesce(length(email), 0) <= 320
      ) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'living_stones_photos_text_len') THEN
    ALTER TABLE public.living_stones_photos
      ADD CONSTRAINT living_stones_photos_text_len CHECK (
        coalesce(length(photo_url), 0) <= 1000
        AND coalesce(length(submitter_name), 0) <= 100
        AND coalesce(length(caption), 0) <= 300
      ) NOT VALID;
  END IF;
END $$;
