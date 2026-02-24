
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  systemPrompt?: string;
}

// Input validation functions
const validateMessage = (message: any): message is ChatMessage => {
  if (!message || typeof message !== 'object') return false;
  if (!['system', 'user', 'assistant'].includes(message.role)) return false;
  if (typeof message.content !== 'string') return false;
  if (message.content.length > 10000) return false; // Limit message length
  return true;
};

const sanitizeContent = (content: string): string => {
  // Remove potential harmful content
  return content.replace(/[<>]/g, '').trim().substring(0, 10000);
};

const validateRequest = (body: any): { isValid: boolean; error?: string } => {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Invalid request body' };
  }
  
  if (!Array.isArray(body.messages)) {
    return { isValid: false, error: 'Messages must be an array' };
  }
  
  if (body.messages.length === 0) {
    return { isValid: false, error: 'At least one message is required' };
  }
  
  if (body.messages.length > 100) {
    return { isValid: false, error: 'Too many messages' };
  }
  
  for (const message of body.messages) {
    if (!validateMessage(message)) {
      return { isValid: false, error: 'Invalid message format' };
    }
  }
  
  if (body.systemPrompt && (typeof body.systemPrompt !== 'string' || body.systemPrompt.length > 5000)) {
    return { isValid: false, error: 'Invalid system prompt' };
  }
  
  return { isValid: true };
};

serve(async (req) => {
  console.log('=== OpenAI Chat Function Started ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('OpenAI API key check:', openaiApiKey ? 'Found' : 'Missing');
    
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse and validate request body
    const body = await req.json() as RequestBody;
    console.log('Request body received:', { 
      hasSystemPrompt: !!body.systemPrompt, 
      messagesCount: body.messages?.length,
      systemPromptLength: body.systemPrompt?.length 
    });

    // Validate input
    const validation = validateRequest(body);
    if (!validation.isValid) {
      console.error('Request validation failed:', validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Sanitize and prepare messages
    const sanitizedMessages: ChatMessage[] = body.messages.map(msg => ({
      role: msg.role,
      content: sanitizeContent(msg.content)
    }));

    // Add system prompt if provided
    const messages: ChatMessage[] = [];
    if (body.systemPrompt) {
      messages.push({
        role: 'system',
        content: sanitizeContent(body.systemPrompt)
      });
    }
    messages.push(...sanitizedMessages);

    console.log('Complete messages for OpenAI:', {
      totalMessages: messages.length,
      hasSystemMessage: messages[0]?.role === 'system',
      lastUserMessage: messages[messages.length - 1]?.content.substring(0, 50) + '...'
    });

    // Call OpenAI API with security headers
    console.log('Calling OpenAI API with model: gpt-4o-mini');
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Supabase-Function/1.0'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        presence_penalty: 0,
        frequency_penalty: 0
      }),
    });

    console.log('OpenAI response status:', openaiResponse.status);
    console.log('OpenAI response headers:', Object.fromEntries(openaiResponse.headers.entries()));

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'OpenAI API request failed' }),
        { 
          status: openaiResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const openaiData = await openaiResponse.json();
    console.log('OpenAI response received successfully');
    console.log('Response data structure:', {
      hasChoices: !!openaiData.choices,
      choicesLength: openaiData.choices?.length,
      firstChoiceHasMessage: !!openaiData.choices?.[0]?.message,
      firstChoiceRole: openaiData.choices?.[0]?.message?.role,
      contentLength: openaiData.choices?.[0]?.message?.content?.length
    });

    // Validate and sanitize response
    if (!openaiData.choices || !openaiData.choices[0] || !openaiData.choices[0].message) {
      console.error('Invalid OpenAI response structure');
      return new Response(
        JSON.stringify({ error: 'Invalid response from OpenAI' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Sanitize response content
    const responseContent = sanitizeContent(openaiData.choices[0].message.content);
    
    const response = {
      choices: [{
        message: {
          role: 'assistant',
          content: responseContent
        }
      }],
      usage: openaiData.usage
    };

    console.log('Returning successful response to client');
    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in OpenAI chat function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
