export const EMAIL_PROMPT_TEMPLATE = `
You are a professional email marketing copywriter. Create an engaging marketing email for the following campaign:

Campaign Title: {title}
Description: {description}
Target Audience: {audience}

Generate:
1. Subject line (max 60 characters)
2. Preview text (max 100 characters)
3. Email body with:
   - Opening greeting
   - Main content (2-3 paragraphs)
   - Call-to-action
   - Closing

Format the response in HTML with inline styles for email compatibility.
`

export const LANDING_PAGE_PROMPT_TEMPLATE = `
You are a conversion-focused landing page copywriter. Create compelling content for:

Product/Service: {title}
Description: {description}

Generate structured JSON with:
{
  "headline": "Attention-grabbing headline",
  "subheadline": "Supporting subheadline",
  "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
  "cta_text": "Action-oriented button text",
  "footer": "Trust-building footer text"
}
`

// Helper function to replace template variables
export function fillTemplate(template: string, variables: Record<string, string>): string {
  let filled = template
  for (const [key, value] of Object.entries(variables)) {
    filled = filled.replace(new RegExp(`{${key}}`, 'g'), value)
  }
  return filled
}