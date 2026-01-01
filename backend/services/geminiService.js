import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
let genAI = null;
let model = null;

const initGemini = () => {
  if (!genAI && process.env.GEMINI_API_KEY) {
    try {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      console.log('Google Gemini API initialized');
    } catch (error) {
      console.error('Failed to initialize Gemini API:', error.message);
    }
  }
  return model;
};

// Identify item from description and vision data
export const identifyItem = async (description, visionData = null) => {
  const geminiModel = initGemini();
  
  if (!geminiModel) {
    throw new Error('Gemini API not configured');
  }

  try {
    let prompt = `You are an expert at identifying items for inventory management. 
Based on the following information, identify the item and provide:
1. A clear, concise name for the item
2. A brief description
3. Suggested category
4. Confidence level (0-100)

`;

    if (description) {
      prompt += `User description: ${description}\n\n`;
    }

    if (visionData) {
      if (visionData.labels && visionData.labels.length > 0) {
        prompt += `Image labels detected: ${visionData.labels.map(l => l.description).join(', ')}\n`;
      }
      if (visionData.objects && visionData.objects.length > 0) {
        prompt += `Objects detected: ${visionData.objects.map(o => o.name).join(', ')}\n`;
      }
      if (visionData.text) {
        prompt += `Text detected: ${visionData.text}\n`;
      }
      if (visionData.logos && visionData.logos.length > 0) {
        prompt += `Logos detected: ${visionData.logos.join(', ')}\n`;
      }
    }

    prompt += `\nProvide your response in JSON format with these fields:
{
  "name": "item name",
  "description": "brief description",
  "category": "suggested category",
  "confidence": 85
}`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        name: parsed.name || 'Unknown Item',
        description: parsed.description || '',
        category: parsed.category || 'Uncategorized',
        confidence: parsed.confidence || 50
      };
    }

    // Fallback if JSON parsing fails
    return {
      name: 'Unknown Item',
      description: text.substring(0, 200),
      category: 'Uncategorized',
      confidence: 30
    };
  } catch (error) {
    console.error('Item identification error:', error);
    throw new Error(`Failed to identify item: ${error.message}`);
  }
};

// Suggest optimal storage location for an item
export const suggestPlacement = async (itemInfo, locations, containers) => {
  const geminiModel = initGemini();
  
  if (!geminiModel) {
    throw new Error('Gemini API not configured');
  }

  try {
    const prompt = `You are an expert at organizing inventory and suggesting optimal storage locations.

Item to store:
- Name: ${itemInfo.name}
- Description: ${itemInfo.description || 'N/A'}
- Category: ${itemInfo.category || 'N/A'}

Available locations:
${locations.map(loc => `- ${loc.name}: ${loc.description || 'No description'}`).join('\n')}

Available containers:
${containers.map(cont => `- ${cont.name} (in ${cont.location_name || 'no location'}): ${cont.description || 'No description'}`).join('\n')}

Based on the item characteristics and available storage options, suggest:
1. The best location or container for this item
2. Reasoning for your suggestion
3. Alternative options if applicable

Provide your response in JSON format:
{
  "suggested_location_id": null or location_id,
  "suggested_container_id": null or container_id,
  "reasoning": "explanation",
  "alternatives": ["alternative 1", "alternative 2"]
}`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      suggested_location_id: null,
      suggested_container_id: null,
      reasoning: text,
      alternatives: []
    };
  } catch (error) {
    console.error('Placement suggestion error:', error);
    throw new Error(`Failed to suggest placement: ${error.message}`);
  }
};

// Process natural language query about inventory
export const processQuery = async (query, userContext = {}) => {
  const geminiModel = initGemini();
  
  if (!geminiModel) {
    throw new Error('Gemini API not configured');
  }

  try {
    let prompt = `You are an AI assistant for a personal inventory management system. 
Answer the user's question about their inventory.

User question: ${query}

`;

    if (userContext.items) {
      prompt += `\nUser has ${userContext.items.length} items in inventory.\n`;
    }
    if (userContext.categories) {
      prompt += `Categories: ${userContext.categories.map(c => c.name).join(', ')}\n`;
    }
    if (userContext.locations) {
      prompt += `Locations: ${userContext.locations.map(l => l.name).join(', ')}\n`;
    }

    prompt += `\nProvide a helpful, concise response. If you need more specific information to answer accurately, ask for clarification.`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      answer: text,
      confidence: 80
    };
  } catch (error) {
    console.error('Query processing error:', error);
    throw new Error(`Failed to process query: ${error.message}`);
  }
};

// Generate item suggestions based on barcode data
export const enhanceWithBarcode = async (barcodeData, visionData = null) => {
  const geminiModel = initGemini();
  
  if (!geminiModel) {
    throw new Error('Gemini API not configured');
  }

  try {
    const prompt = `Based on the following barcode and image data, provide detailed information about this product:

Barcode: ${barcodeData.barcode || 'N/A'}
Barcode Type: ${barcodeData.type || 'N/A'}

${visionData ? `Image analysis:
- Labels: ${visionData.labels?.map(l => l.description).join(', ') || 'N/A'}
- Objects: ${visionData.objects?.map(o => o.name).join(', ') || 'N/A'}
- Text: ${visionData.text || 'N/A'}
` : ''}

Provide product information in JSON format:
{
  "name": "product name",
  "description": "detailed description",
  "category": "product category",
  "brand": "brand name if identifiable",
  "confidence": 85
}`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      name: 'Unknown Product',
      description: text,
      category: 'Uncategorized',
      brand: null,
      confidence: 40
    };
  } catch (error) {
    console.error('Barcode enhancement error:', error);
    throw new Error(`Failed to enhance barcode data: ${error.message}`);
  }
};

export default {
  identifyItem,
  suggestPlacement,
  processQuery,
  enhanceWithBarcode
};

// Made with Bob
