-- Add default system and base companies required for system operation
-- This migration is idempotent and safe to run multiple times

INSERT IGNORE INTO `companies` (`id`, `name`, `status`, `timezone`, `created_at`, `updated_at`)
VALUES
    -- System company (for admin/testing isolation)
    (UUID(), 'System', 'active', 'UTC', NOW(), NOW()),
    
    -- Base default companies
    (UUID(), 'Veridian Dynamics', 'active', 'America/New_York', NOW(), NOW()),
    (UUID(), 'Northwood Industries', 'active', 'Europe/London', NOW(), NOW());

-- Create company profiles
INSERT IGNORE INTO `company_profiles` (`id`, `company_id`, `legal_name`, `email`, `country`, `city`, `created_at`, `updated_at`)
SELECT 
    UUID(),
    c.id,
    CONCAT(c.name, ' Inc.'),
    CONCAT(LOWER(REPLACE(c.name, ' ', '-')), '@example.local'),
    CASE c.name
        WHEN 'System' THEN 'International'
        WHEN 'Veridian Dynamics' THEN 'United States'
        WHEN 'Northwood Industries' THEN 'United Kingdom'
    END,
    CASE c.name
        WHEN 'System' THEN 'Global'
        WHEN 'Veridian Dynamics' THEN 'New York'
        WHEN 'Northwood Industries' THEN 'London'
    END,
    NOW(),
    NOW()
FROM `companies` c
WHERE c.name IN ('System', 'Veridian Dynamics', 'Northwood Industries');