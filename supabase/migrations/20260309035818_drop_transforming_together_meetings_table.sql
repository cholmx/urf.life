/*
  # Drop Transforming Together Meetings Table

  Removes the transforming_together_meetings table and all associated RLS policies,
  as the Transforming Together Information Meeting feature has been removed from the application.

  1. Changes
    - Drop all RLS policies on transforming_together_meetings
    - Drop the transforming_together_meetings table
*/

DROP POLICY IF EXISTS "Anyone can sign up for meetings" ON transforming_together_meetings;
DROP POLICY IF EXISTS "Anyone can view meeting signups count" ON transforming_together_meetings;
DROP POLICY IF EXISTS "Authenticated users can delete meeting signups" ON transforming_together_meetings;

DROP TABLE IF EXISTS transforming_together_meetings;
