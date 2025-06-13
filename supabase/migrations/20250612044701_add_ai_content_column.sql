-- Add ai_content column to campaigns table to store generated email and landing page HTML
ALTER TABLE campaigns 
ADD COLUMN ai_content JSONB DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN campaigns.ai_content IS 'Stores AI-generated content for the campaign including email HTML and landing page HTML';

-- Example structure:
-- {
--   "email": {
--     "html": "<html>...</html>",
--     "subject": "Email subject line",
--     "previewText": "Preview text"
--   },
--   "landing": {
--     "html": "<html>...</html>",
--     "title": "Landing page title"
--   }
-- }