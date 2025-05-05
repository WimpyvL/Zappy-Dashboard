import { supabase } from '../../lib/supabase';

// Fetch all AI prompts
export const fetchPrompts = async () => {
  const { data, error } = await supabase
    .from('ai_prompts')
    .select('*')
    .order('category')
    .order('name');
  
  if (error) throw error;
  return data;
};

// Fetch a single prompt by ID
export const fetchPromptById = async (promptId) => {
  const { data, error } = await supabase
    .from('ai_prompts')
    .select('*')
    .eq('id', promptId)
    .single();
  
  if (error) throw error;
  return data;
};

// Create a new prompt
export const createPrompt = async (promptData) => {
  const { data, error } = await supabase
    .from('ai_prompts')
    .insert([{
      ...promptData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select();
  
  if (error) throw error;
  return data[0];
};

// Update an existing prompt
export const updatePrompt = async ({ id, ...promptData }) => {
  const { data, error } = await supabase
    .from('ai_prompts')
    .update({
      ...promptData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data[0];
};

// Delete a prompt
export const deletePrompt = async (promptId) => {
  const { error } = await supabase
    .from('ai_prompts')
    .delete()
    .eq('id', promptId);
  
  if (error) throw error;
  return { success: true };
};

// Test a prompt
export const testPrompt = async (promptId) => {
  // Fetch the prompt
  const { data: prompt, error: promptError } = await supabase
    .from('ai_prompts')
    .select('*')
    .eq('id', promptId)
    .single();
  
  if (promptError) throw promptError;
  
  // Fetch AI settings
  const { data: settings, error: settingsError } = await supabase
    .from('ai_settings')
    .select('*')
    .single();
  
  if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;
  
  // Generate sample parameters
  const sampleParams = {};
  if (prompt.parameters && prompt.parameters.length > 0) {
    prompt.parameters.forEach(param => {
      sampleParams[param.name] = `[Sample ${param.name}]`;
    });
  }
  
  // Call the AI service
  const response = await fetch('/api/ai/test-prompt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: prompt.prompt_text,
      parameters: sampleParams,
      settings: settings || {
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 1000
      }
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to test prompt');
  }
  
  const result = await response.json();
  
  // Log the test
  await supabase
    .from('ai_logs')
    .insert([{
      prompt_id: promptId,
      input: { parameters: sampleParams },
      output: result.text,
      tokens_used: result.usage?.total_tokens || 0,
      duration_ms: result.duration_ms || 0,
      status: 'success',
      created_at: new Date().toISOString()
    }]);
  
  return result;
};

// Fetch AI settings
export const fetchAISettings = async () => {
  const { data, error } = await supabase
    .from('ai_settings')
    .select('*')
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  
  return data || {
    api_provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 1000,
    enable_consultation_summaries: true,
    enable_product_recommendations: true,
    enable_program_recommendations: true
  };
};

// Update AI settings
export const updateAISettings = async (settingsData) => {
  // Check if settings exist
  const { data: existingSettings, error: checkError } = await supabase
    .from('ai_settings')
    .select('id')
    .single();
  
  if (checkError && checkError.code !== 'PGRST116') throw checkError;
  
  if (existingSettings) {
    // Update existing settings
    const { data, error } = await supabase
      .from('ai_settings')
      .update({
        ...settingsData,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingSettings.id)
      .select();
    
    if (error) throw error;
    return data[0];
  } else {
    // Create new settings
    const { data, error } = await supabase
      .from('ai_settings')
      .insert([{
        ...settingsData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();
    
    if (error) throw error;
    return data[0];
  }
};

// Fetch AI logs
export const fetchAILogs = async (options = {}) => {
  const { limit = 100, offset = 0, promptId } = options;
  
  let query = supabase
    .from('ai_logs')
    .select(`
      *,
      prompt:prompt_id (name, category)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (promptId) {
    query = query.eq('prompt_id', promptId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};

// Fetch AI metrics
export const fetchAIMetrics = async () => {
  // Get total prompts count
  const { count: promptsCount, error: promptsError } = await supabase
    .from('ai_prompts')
    .select('id', { count: 'exact', head: true });
  
  if (promptsError) throw promptsError;
  
  // Get total logs count
  const { count: logsCount, error: logsError } = await supabase
    .from('ai_logs')
    .select('id', { count: 'exact', head: true });
  
  if (logsError) throw logsError;
  
  // Get logs by category
  const { data: logsByCategory, error: categoryError } = await supabase
    .from('ai_logs')
    .select(`
      prompt:prompt_id (category)
    `);
  
  if (categoryError) throw categoryError;
  
  // Process category data
  const categories = {};
  logsByCategory.forEach(log => {
    if (log.prompt && log.prompt.category) {
      const category = log.prompt.category;
      categories[category] = (categories[category] || 0) + 1;
    }
  });
  
  // Get logs by day (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: recentLogs, error: recentLogsError } = await supabase
    .from('ai_logs')
    .select('created_at, tokens_used')
    .gte('created_at', thirtyDaysAgo.toISOString());
  
  if (recentLogsError) throw recentLogsError;
  
  // Process daily data
  const dailyData = {};
  let totalTokens = 0;
  
  recentLogs.forEach(log => {
    const date = new Date(log.created_at).toISOString().split('T')[0];
    if (!dailyData[date]) {
      dailyData[date] = { count: 0, tokens: 0 };
    }
    dailyData[date].count += 1;
    dailyData[date].tokens += log.tokens_used || 0;
    totalTokens += log.tokens_used || 0;
  });
  
  return {
    totalPrompts: promptsCount,
    totalLogs: logsCount,
    totalTokens,
    categoryCounts: categories,
    dailyData
  };
};
