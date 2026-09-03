# Migration: Link Registrations to Campaigns

This migration adds campaign support to existing registrations.

## What it does:

1. ✅ Adds `campaign_id` column to `registrations` table
2. ✅ Creates a "Legacy" campaign for existing registrations
3. ✅ Links all existing registrations to the legacy campaign
4. ✅ Creates database index for better performance

## To Run the Migration:

```bash
node run-link-registrations-migration.js
```

## What you'll see:

- The script will create a campaign called "IFEHL - Legacy Registrations"
- All existing registrations will be tagged to this campaign
- You can later reassign registrations to proper campaigns if needed

## After Migration:

- All admin pages will show which campaign each registration belongs to
- You can filter and search registrations by campaign
- New registrations must be linked to a campaign

## Manual Campaign Assignment (Optional):

If you want to manually assign registrations to specific campaigns later, use:

```sql
-- Example: Assign registrations by date range to a specific campaign
UPDATE registrations
SET campaign_id = (SELECT id FROM campaigns WHERE slug = 'ifehl-2025-03')
WHERE created_at >= '2025-03-01' AND created_at < '2025-04-01';
```
