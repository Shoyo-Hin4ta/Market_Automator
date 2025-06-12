-- Add enhanced analytics columns to campaign_analytics table
ALTER TABLE campaign_analytics
ADD COLUMN IF NOT EXISTS total_opens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS deliveries INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS forwards_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS abuse_reports INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_open TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_click TIMESTAMP WITH TIME ZONE;

-- Add comment to describe the new columns
COMMENT ON COLUMN campaign_analytics.total_opens IS 'Total number of email opens (including multiple opens by same recipient)';
COMMENT ON COLUMN campaign_analytics.total_clicks IS 'Total number of link clicks (including multiple clicks by same recipient)';
COMMENT ON COLUMN campaign_analytics.deliveries IS 'Number of successfully delivered emails (sent minus bounces)';
COMMENT ON COLUMN campaign_analytics.forwards_count IS 'Number of times the email was forwarded';
COMMENT ON COLUMN campaign_analytics.abuse_reports IS 'Number of spam/abuse reports';
COMMENT ON COLUMN campaign_analytics.last_open IS 'Timestamp of the most recent email open';
COMMENT ON COLUMN campaign_analytics.last_click IS 'Timestamp of the most recent link click';