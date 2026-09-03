/*
  # Update existing records to use proper title case formatting

  ## Summary
  This migration updates all existing text records that should be in Title Case
  (speaker names, author names, subtitles, and titles) to use proper formatting
  where the first letter of each major word is capitalized and filler/preposition
  words (a, an, the, of, in, on, at, to, for, and, but, or, etc.) remain lowercase
  unless they are the first word.

  ## Tables Updated
  - `sermons_portal123` - title, speaker
  - `sermon_series_portal123` - name
  - `announcements_portal123` - title, author
  - `daily_devotionals_portal123` - title, author
  - `resources_portal123` - title, author
  - `resource_categories_portal123` - name
  - `staff_contacts_portal123` - name, title
  - `ministries_portal123` - title, leader_name
  - `events_portal123` - title
  - `classes_portal123` - title
  - `featured_buttons_portal123` - title
  - `campaign_updates` - title
  - `campaign_vision` - title

  ## Approach
  Uses a Postgres helper function to convert strings to title case, treating
  a defined set of filler words as lowercase unless they appear at the start.
*/

CREATE OR REPLACE FUNCTION to_title_case(input_text text)
RETURNS text AS $$
DECLARE
  words text[];
  word text;
  result_words text[] := '{}';
  filler_words text[] := ARRAY['a','an','the','and','but','or','nor','of','in','on','at','to','for','with','by','from','into','onto','upon'];
  i int;
BEGIN
  IF input_text IS NULL OR trim(input_text) = '' THEN
    RETURN input_text;
  END IF;

  words := regexp_split_to_array(trim(input_text), '\s+');

  FOR i IN 1..array_length(words, 1) LOOP
    word := lower(words[i]);
    IF i = 1 OR NOT (word = ANY(filler_words)) THEN
      word := upper(substring(word, 1, 1)) || substring(word, 2);
    END IF;
    result_words := array_append(result_words, word);
  END LOOP;

  RETURN array_to_string(result_words, ' ');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

UPDATE sermons_portal123
SET
  title = to_title_case(title),
  speaker = to_title_case(speaker)
WHERE title IS NOT NULL OR speaker IS NOT NULL;

UPDATE sermon_series_portal123
SET name = to_title_case(name)
WHERE name IS NOT NULL;

UPDATE announcements_portal123
SET
  title = to_title_case(title),
  author = CASE WHEN author IS NOT NULL AND author != '' THEN to_title_case(author) ELSE author END
WHERE title IS NOT NULL;

UPDATE daily_devotionals_portal123
SET
  title = to_title_case(title),
  author = CASE WHEN author IS NOT NULL AND author != '' THEN to_title_case(author) ELSE author END
WHERE title IS NOT NULL;

UPDATE resources_portal123
SET
  title = to_title_case(title),
  author = CASE WHEN author IS NOT NULL AND author != '' THEN to_title_case(author) ELSE author END
WHERE title IS NOT NULL;

UPDATE resource_categories_portal123
SET name = to_title_case(name)
WHERE name IS NOT NULL;

UPDATE staff_contacts_portal123
SET
  name = to_title_case(name),
  title = to_title_case(title)
WHERE name IS NOT NULL OR title IS NOT NULL;

UPDATE ministries_portal123
SET
  title = to_title_case(title),
  leader_name = CASE WHEN leader_name IS NOT NULL AND leader_name != '' THEN to_title_case(leader_name) ELSE leader_name END
WHERE title IS NOT NULL;

UPDATE events_portal123
SET title = to_title_case(title)
WHERE title IS NOT NULL;

UPDATE classes_portal123
SET title = to_title_case(title)
WHERE title IS NOT NULL;

UPDATE featured_buttons_portal123
SET title = to_title_case(title)
WHERE title IS NOT NULL;

UPDATE campaign_updates
SET title = to_title_case(title)
WHERE title IS NOT NULL;

UPDATE campaign_vision
SET title = to_title_case(title)
WHERE title IS NOT NULL;
