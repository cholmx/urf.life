/*
  # Create Resource Categories Table

  1. New Tables
    - `resource_categories_portal123`
      - `id` (uuid, primary key) - Unique identifier for each category
      - `name` (text, not null) - Category name (e.g., "Biblical Studies", "Useful Links")
      - `description` (text) - Optional description of the category
      - `is_link_group` (boolean) - Flag to distinguish between book categories and link groups
      - `created_at` (timestamptz) - Timestamp when the category was created
      - `updated_at` (timestamptz) - Timestamp when the category was last updated

  2. Data Cleanup
    - Clear invalid category_id references from existing resources
    - This is necessary because categories were never migrated from the old database

  3. Relationships
    - Add foreign key constraint from resources_portal123.category_id to resource_categories_portal123.id
    - Use SET NULL on delete to preserve resources when categories are deleted

  4. Security
    - Enable RLS on resource_categories_portal123 table
    - Add policy for public read access (church portal is public)
    - Add policies for authenticated admin access for inserts, updates, and deletes

  5. Indexes
    - Add index on name column for faster category lookups
    - Add index on resources_portal123.category_id for efficient joins

  6. Important Notes
    - This table supports two types of resources:
      * Book Categories (is_link_group = false): For individual books with multiple purchase links
      * Link Groups (is_link_group = true): For collections of website links and online resources
    - Resources can be uncategorized (category_id = NULL)
    - Existing resources will become uncategorized and need to be re-categorized by admin
*/

-- Create resource_categories table
CREATE TABLE IF NOT EXISTS resource_categories_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  is_link_group boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE resource_categories_portal123 ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Anyone can view resource categories"
  ON resource_categories_portal123 FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create RLS policies for authenticated admin access
CREATE POLICY "Authenticated users can insert resource categories"
  ON resource_categories_portal123 FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update resource categories"
  ON resource_categories_portal123 FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete resource categories"
  ON resource_categories_portal123 FOR DELETE
  TO authenticated
  USING (true);

-- Clean up invalid category references from existing resources
-- This sets all category_id values to NULL since the old categories don't exist
UPDATE resources_portal123 SET category_id = NULL WHERE category_id IS NOT NULL;

-- Add foreign key constraint from resources to categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'resources_portal123_category_id_fkey'
    AND table_name = 'resources_portal123'
  ) THEN
    ALTER TABLE resources_portal123
    ADD CONSTRAINT resources_portal123_category_id_fkey
    FOREIGN KEY (category_id)
    REFERENCES resource_categories_portal123(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_resource_categories_name ON resource_categories_portal123(name);
CREATE INDEX IF NOT EXISTS idx_resources_category_id ON resources_portal123(category_id);