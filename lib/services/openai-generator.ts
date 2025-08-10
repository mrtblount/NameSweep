import OpenAI from 'openai';

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

export interface GeneratedName {
  name: string;
  style: 'descriptive' | 'suggestive' | 'coined' | 'blend' | 'metaphor';
  rationale?: string;
}

export interface GenerationOptions {
  businessDescription: string;
  industry?: string;
  targetAudience?: string;
  tone?: string;
  constraints?: string[];
  preferredTlds?: string[];
}

const GENERATION_PROMPT = `You are a brand naming expert. Generate creative, memorable brand names based on the business description.

Create 40-60 diverse name candidates across these styles:
- Descriptive: Clear indication of what the business does
- Suggestive: Hints at benefits without being literal  
- Coined: Invented words that sound natural
- Blends: Combinations of meaningful parts
- Metaphorical: Names that evoke feelings/concepts

Requirements:
- Names should be 3-15 characters
- Easy to pronounce and spell
- Avoid trademarked terms
- No offensive or inappropriate content
- Consider domain availability (prefer shorter, unique names)

Return as a JSON object with a "names" array:
{"names": [{"name": "BrandName", "style": "coined", "rationale": "One sentence why this works"}]}`;

export async function generateNames(options: GenerationOptions): Promise<GeneratedName[]> {
  try {
    const openai = getOpenAIClient();
    if (!openai) {
      console.warn('OpenAI API key not configured');
      return [];
    }

    const userPrompt = `
Business: ${options.businessDescription}
${options.industry ? `Industry: ${options.industry}` : ''}
${options.targetAudience ? `Target Audience: ${options.targetAudience}` : ''}
${options.tone ? `Brand Tone: ${options.tone}` : ''}
${options.constraints?.length ? `Constraints: ${options.constraints.join(', ')}` : ''}
${options.preferredTlds?.length ? `Preferred TLDs: ${options.preferredTlds.join(', ')}` : ''}

Generate 40-60 name candidates.`;

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: GENERATION_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
      max_tokens: 4000,
    });

    const response = completion.choices[0].message.content;
    if (!response) throw new Error('No response from OpenAI');

    const parsed = JSON.parse(response);
    const names = Array.isArray(parsed) ? parsed : parsed.names || [];
    
    return names
      .filter((n: any) => n.name && n.name.length >= 3 && n.name.length <= 15)
      .map((n: any) => ({
        name: n.name,
        style: n.style || 'coined',
        rationale: n.rationale
      }));
  } catch (error) {
    console.error('Name generation error:', error);
    // Return empty array instead of throwing to allow graceful handling
    return [];
  }
}

export async function scoreNameFit(
  name: string,
  businessDescription: string,
  checkResults: any
): Promise<{ score: number; rationale: string }> {
  try {
    const openai = getOpenAIClient();
    if (!openai) {
      return { score: 50, rationale: 'OpenAI not configured' };
    }

    const prompt = `
Analyze this brand name for the business and provide a fit score (0-100).

Name: ${name}
Business: ${businessDescription}
Availability: ${JSON.stringify(checkResults, null, 2)}

Consider:
- Memorability and pronounceability
- Relevance to business
- Domain/social availability
- SEO potential
- Trademark risks

Return JSON: {"score": 85, "rationale": "One sentence explanation"}`;

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
      max_tokens: 200,
    });

    const response = completion.choices[0].message.content;
    if (!response) throw new Error('No response from OpenAI');

    return JSON.parse(response);
  } catch (error) {
    console.error('Scoring error:', error);
    return { score: 50, rationale: 'Unable to analyze fit' };
  }
}