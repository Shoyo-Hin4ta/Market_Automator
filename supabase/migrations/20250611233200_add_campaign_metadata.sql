-- Add metadata column to campaigns table for storing campaign details
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add comment to explain the column
COMMENT ON COLUMN campaigns.metadata IS 'Stores campaign details like target audience, goals, key message, and call to action';

-- Example of metadata structure:
-- {
--   "targetAudience": "Young professionals aged 25-35 interested in fitness",
--   "campaignGoals": "Increase sales by 30%, drive traffic to new product line",
--   "keyMessage": "Get fit this summer with 50% off all gear",
--   "callToAction": "Shop Now"
-- }