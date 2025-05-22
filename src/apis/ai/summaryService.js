/**
 * AI Summary Service
 * 
 * This service generates AI summaries of intake form data for consultations.
 * It uses the configured AI provider to generate treatment recommendations
 * and reasoning based on patient data.
 */

import { supabase } from '../../lib/supabase';
import { getPromptByCategoryTypeAndSection } from './api';

/**
 * Get the appropriate AI prompt for a category, type, and section
 * @param {string} categoryId - The category ID (e.g., 'weight_management', 'ed', 'hair_loss')
 * @param {string} promptType - The prompt type ('initial' or 'followup')
 * @param {string} section - The section ('summary', 'assessment', 'plan', etc.)
 * @returns {Promise<Object>} The prompt object
 */
export const getPrompt = async (categoryId, promptType = 'initial', section = 'summary') => {
  try {
    // Try to get a specific prompt for this category, type, and section
    const prompt = await getPromptByCategoryTypeAndSection(categoryId, promptType, section);
    
    if (prompt) {
      return prompt;
    }
    
    // If no specific prompt is found, try to get a general prompt for this type and section
    const { data: generalPrompt, error: generalError } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('category', 'general')
      .eq('prompt_type', promptType)
      .eq('section', section)
      .single();
    
    if (!generalError && generalPrompt) {
      return generalPrompt;
    }
    
    // Return a default prompt if no specific or general prompt is found
    return {
      id: 'default',
      name: `Default ${promptType} ${section}`,
      prompt: `Analyze the patient data and provide ${section} with reasoning.`,
      category: 'general',
      prompt_type: promptType,
      section: section
    };
  } catch (error) {
    console.error('Error in getPrompt:', error);
    throw error;
  }
};

/**
 * Generate a summary of intake form data
 * @param {Object} formData - The intake form data
 * @param {string} categoryId - The category ID
 * @param {string} promptType - The prompt type ('initial' or 'followup')
 * @returns {Promise<Object>} The generated summary
 */
export const generateIntakeSummary = async (formData, categoryId, promptType = 'initial') => {
  try {
    // Get the appropriate prompt for this category and type
    const prompt = await getPrompt(categoryId, promptType, 'summary');
    
    // Get AI settings
    const { data: settings, error: settingsError } = await supabase
      .from('ai_settings')
      .select('*')
      .single();
    
    if (settingsError) {
      console.error('Error fetching AI settings:', settingsError);
      throw new Error('Failed to fetch AI settings');
    }
    
    // In a production environment, this would call an actual AI service
    // For now, we'll generate mock recommendations based on the form data
    
    // Extract relevant data from the form
    const { basicInfo, healthHistory, treatmentPreferences } = formData;
    
    // Generate mock recommendations based on category and form data
    let recommendations = [];
    let reasoning = '';
    
    if (promptType === 'initial') {
      // Initial consultation recommendations
      if (categoryId === 'weight_management') {
        // Weight management recommendations
        recommendations = [
          { text: 'Semaglutide 0.25mg weekly', confidence: 94 },
          { text: 'Metformin 500mg daily', confidence: 91 },
          { text: 'Monthly follow-up recommended', confidence: 88 }
        ];
        
        // Calculate BMI if height and weight are available
        let bmi = '';
        if (basicInfo.height && basicInfo.weight) {
          // Simple BMI calculation (this is a simplification)
          const heightInInches = parseFloat(basicInfo.height.replace("'", '.'));
          const weightInLbs = parseFloat(basicInfo.weight);
          if (!isNaN(heightInInches) && !isNaN(weightInLbs)) {
            bmi = (703 * weightInLbs / (heightInInches * heightInInches)).toFixed(1);
          }
        }
        
        reasoning = `Patient has ${bmi ? `BMI of ${bmi}` : 'elevated BMI'} and reports difficulty with weight management. `;
        reasoning += `Medical history includes: ${healthHistory.medicalConditions?.join(', ') || 'No significant conditions reported'}. `;
        reasoning += `Previous treatments: ${healthHistory.previousTreatments?.join(', ') || 'None reported'}. `;
        reasoning += `Current medications: ${healthHistory.medicationsText || 'None reported'}. `;
        reasoning += `Allergies: ${healthHistory.allergiesText || 'None reported'}. `;
        reasoning += `Semaglutide is recommended as first-line therapy for weight management with strong evidence for efficacy. `;
        reasoning += `Metformin may provide additional benefit for weight loss and metabolic health. `;
        reasoning += `Monthly follow-up is recommended to monitor progress and adjust treatment as needed.`;
      } 
      else if (categoryId === 'ed') {
        // ED recommendations
        recommendations = [
          { text: 'Sildenafil 50mg PRN', confidence: 96 },
          { text: 'Lifestyle modifications', confidence: 90 },
          { text: '3-month follow-up recommended', confidence: 85 }
        ];
        
        reasoning = `Patient reports ED symptoms for ${healthHistory.edDuration || 'an unspecified duration'}. `;
        reasoning += `Medical history includes: ${healthHistory.medicalConditions?.join(', ') || 'No significant conditions reported'}. `;
        reasoning += `Current medications: ${healthHistory.medicationsText || 'None reported'}. `;
        reasoning += `Allergies: ${healthHistory.allergiesText || 'None reported'}. `;
        reasoning += `Sildenafil is recommended as first-line therapy for ED with strong evidence for efficacy. `;
        reasoning += `Lifestyle modifications including regular exercise, healthy diet, and stress reduction are recommended to address potential contributing factors. `;
        reasoning += `3-month follow-up is recommended to assess treatment efficacy and adjust as needed.`;
      }
      else if (categoryId === 'hair_loss') {
        // Hair loss recommendations
        recommendations = [
          { text: 'Finasteride 1mg daily', confidence: 93 },
          { text: 'Minoxidil 5% topical solution', confidence: 92 },
          { text: '3-month follow-up recommended', confidence: 87 }
        ];
        
        reasoning = `Patient reports hair loss pattern: ${basicInfo.hairLossPattern || 'Not specified'}. `;
        reasoning += `Medical history includes: ${healthHistory.medicalConditions?.join(', ') || 'No significant conditions reported'}. `;
        reasoning += `Current medications: ${healthHistory.medicationsText || 'None reported'}. `;
        reasoning += `Allergies: ${healthHistory.allergiesText || 'None reported'}. `;
        reasoning += `Finasteride is recommended as first-line therapy for androgenetic alopecia with strong evidence for efficacy in men. `;
        reasoning += `Minoxidil topical solution is recommended as a complementary treatment to stimulate hair growth. `;
        reasoning += `3-month follow-up is recommended to assess treatment efficacy and monitor for side effects.`;
      }
      else {
        // General recommendations
        recommendations = [
          { text: 'Comprehensive evaluation recommended', confidence: 90 },
          { text: 'Lifestyle modifications', confidence: 85 },
          { text: '1-month follow-up recommended', confidence: 80 }
        ];
        
        reasoning = `Patient has submitted an intake form for ${categoryId || 'general consultation'}. `;
        reasoning += `Medical history includes: ${healthHistory.medicalConditions?.join(', ') || 'No significant conditions reported'}. `;
        reasoning += `Current medications: ${healthHistory.medicationsText || 'None reported'}. `;
        reasoning += `Allergies: ${healthHistory.allergiesText || 'None reported'}. `;
        reasoning += `A comprehensive evaluation is recommended to determine the most appropriate treatment plan. `;
        reasoning += `Lifestyle modifications may be beneficial based on the patient's specific health concerns. `;
        reasoning += `1-month follow-up is recommended to establish a treatment plan and monitor progress.`;
      }
    } else {
      // Follow-up consultation recommendations
      if (categoryId === 'weight_management') {
        // Weight management follow-up recommendations
        recommendations = [
          { text: 'Increase Semaglutide to 0.5mg weekly', confidence: 92 },
          { text: 'Continue Metformin 500mg daily', confidence: 90 },
          { text: 'Monthly follow-up recommended', confidence: 88 }
        ];
        
        reasoning = `Patient has been on initial weight management treatment. `;
        reasoning += `Based on response to treatment, increasing Semaglutide dosage is recommended to optimize weight loss. `;
        reasoning += `Continuing Metformin provides additional metabolic benefits. `;
        reasoning += `Monthly follow-up is recommended to monitor progress and adjust treatment as needed.`;
      } 
      else if (categoryId === 'ed') {
        // ED follow-up recommendations
        recommendations = [
          { text: 'Continue Sildenafil 50mg PRN', confidence: 94 },
          { text: 'Consider Tadalafil 5mg daily as alternative', confidence: 85 },
          { text: '3-month follow-up recommended', confidence: 82 }
        ];
        
        reasoning = `Patient has been on initial ED treatment. `;
        reasoning += `If response to Sildenafil has been satisfactory, continuing the current regimen is recommended. `;
        reasoning += `If response has been suboptimal or patient prefers a daily medication, Tadalafil may be considered as an alternative. `;
        reasoning += `3-month follow-up is recommended to assess ongoing treatment efficacy.`;
      }
      else if (categoryId === 'hair_loss') {
        // Hair loss follow-up recommendations
        recommendations = [
          { text: 'Continue Finasteride 1mg daily', confidence: 95 },
          { text: 'Continue Minoxidil 5% topical solution', confidence: 94 },
          { text: '6-month follow-up with photos recommended', confidence: 90 }
        ];
        
        reasoning = `Patient has been on initial hair loss treatment. `;
        reasoning += `Hair regrowth typically takes 6-12 months to become noticeable. `;
        reasoning += `Continuing both Finasteride and Minoxidil is recommended for optimal results. `;
        reasoning += `6-month follow-up with comparison photos is recommended to assess treatment efficacy.`;
      }
      else {
        // General follow-up recommendations
        recommendations = [
          { text: 'Continue current treatment plan', confidence: 88 },
          { text: 'Adjust based on response', confidence: 85 },
          { text: '3-month follow-up recommended', confidence: 82 }
        ];
        
        reasoning = `Patient has been on initial treatment for ${categoryId || 'general health concerns'}. `;
        reasoning += `Continuing the current treatment plan with adjustments based on response is recommended. `;
        reasoning += `3-month follow-up is recommended to assess progress and make further adjustments as needed.`;
      }
    }
    
    // Log the AI summary generation (in a real implementation, this would be saved to the database)
    console.log(`Generated AI summary for ${categoryId} ${promptType} consultation`);
    
    // Return the generated summary
    return {
      recommendations,
      reasoning,
      categoryId,
      promptId: prompt.id,
      promptType,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating intake summary:', error);
    throw error;
  }
};

/**
 * Generate an assessment based on intake form data
 * @param {Object} formData - The intake form data
 * @param {string} categoryId - The category ID
 * @param {string} promptType - The prompt type ('initial' or 'followup')
 * @returns {Promise<string>} The generated assessment
 */
export const generateAssessment = async (formData, categoryId, promptType = 'initial') => {
  try {
    // Get the appropriate prompt for this category, type, and section
    const prompt = await getPrompt(categoryId, promptType, 'assessment');
    
    // In a production environment, this would call an actual AI service
    // For now, we'll generate mock assessments based on the form data
    
    let assessment = '';
    
    if (promptType === 'initial') {
      // Initial consultation assessment
      if (categoryId === 'weight_management') {
        assessment = `ASSESSMENT: Patient presents with obesity requiring medical management. `;
        assessment += `BMI indicates Class I Obesity. Patient reports previous attempts at diet and exercise with limited success. `;
        assessment += `No contraindications to weight management medications identified. `;
        assessment += `Patient is motivated to lose weight and improve overall health.`;
      } 
      else if (categoryId === 'ed') {
        assessment = `ASSESSMENT: Patient presents with erectile dysfunction. `;
        assessment += `Contributing factors may include stress, anxiety, and underlying vascular issues. `;
        assessment += `No contraindications to PDE5 inhibitors identified. `;
        assessment += `Patient is a good candidate for ED pharmacotherapy.`;
      }
      else if (categoryId === 'hair_loss') {
        assessment = `ASSESSMENT: Patient presents with male pattern hair loss (androgenetic alopecia). `;
        assessment += `Pattern suggests DHT-mediated follicular miniaturization. `;
        assessment += `No contraindications to 5-alpha reductase inhibitors or topical minoxidil identified. `;
        assessment += `Patient is a good candidate for hair loss pharmacotherapy.`;
      }
      else {
        assessment = `ASSESSMENT: Patient presents with general health concerns requiring comprehensive evaluation. `;
        assessment += `Further diagnostic workup may be necessary to determine appropriate treatment approach. `;
        assessment += `Patient appears motivated to address health concerns.`;
      }
    } else {
      // Follow-up consultation assessment
      if (categoryId === 'weight_management') {
        assessment = `FOLLOW-UP ASSESSMENT: Patient has been on weight management treatment. `;
        assessment += `Response to initial therapy has been [positive/suboptimal]. `;
        assessment += `No significant adverse effects reported. `;
        assessment += `Patient remains motivated to continue treatment with appropriate adjustments.`;
      } 
      else if (categoryId === 'ed') {
        assessment = `FOLLOW-UP ASSESSMENT: Patient has been on ED treatment. `;
        assessment += `Response to initial therapy has been [positive/suboptimal]. `;
        assessment += `No significant adverse effects reported. `;
        assessment += `Patient [is/is not] satisfied with current treatment regimen.`;
      }
      else if (categoryId === 'hair_loss') {
        assessment = `FOLLOW-UP ASSESSMENT: Patient has been on hair loss treatment. `;
        assessment += `It is still early in the treatment course to expect visible results. `;
        assessment += `No significant adverse effects reported. `;
        assessment += `Patient is tolerating treatment well and wishes to continue.`;
      }
      else {
        assessment = `FOLLOW-UP ASSESSMENT: Patient has been on treatment for general health concerns. `;
        assessment += `Response to initial therapy has been [positive/suboptimal]. `;
        assessment += `No significant adverse effects reported. `;
        assessment += `Continued monitoring and treatment adjustments are warranted.`;
      }
    }
    
    return assessment;
  } catch (error) {
    console.error('Error generating assessment:', error);
    throw error;
  }
};

/**
 * Generate a treatment plan based on intake form data
 * @param {Object} formData - The intake form data
 * @param {string} categoryId - The category ID
 * @param {string} promptType - The prompt type ('initial' or 'followup')
 * @returns {Promise<string>} The generated plan
 */
export const generatePlan = async (formData, categoryId, promptType = 'initial') => {
  try {
    // Get the appropriate prompt for this category, type, and section
    const prompt = await getPrompt(categoryId, promptType, 'plan');
    
    // In a production environment, this would call an actual AI service
    // For now, we'll generate mock plans based on the form data
    
    let plan = '';
    
    if (promptType === 'initial') {
      // Initial consultation plan
      if (categoryId === 'weight_management') {
        plan = `PLAN:\n`;
        plan += `1. Start Semaglutide 0.25mg subcutaneous injection weekly\n`;
        plan += `2. Start Metformin 500mg oral daily with food\n`;
        plan += `3. Dietary recommendations: Mediterranean diet, caloric deficit of 500 kcal/day\n`;
        plan += `4. Exercise recommendations: 150 minutes of moderate activity per week\n`;
        plan += `5. Monthly follow-up to assess response and adjust treatment as needed`;
      } 
      else if (categoryId === 'ed') {
        plan = `PLAN:\n`;
        plan += `1. Start Sildenafil 50mg oral as needed, 1 hour before sexual activity\n`;
        plan += `2. Lifestyle modifications: reduce alcohol intake, regular exercise, stress management\n`;
        plan += `3. Education on proper use of medication and expectations\n`;
        plan += `4. 3-month follow-up to assess response and adjust treatment as needed`;
      }
      else if (categoryId === 'hair_loss') {
        plan = `PLAN:\n`;
        plan += `1. Start Finasteride 1mg oral daily\n`;
        plan += `2. Start Minoxidil 5% topical solution twice daily\n`;
        plan += `3. Education on proper application and expectations (results typically take 6-12 months)\n`;
        plan += `4. Recommend baseline photos for comparison\n`;
        plan += `5. 3-month follow-up to assess tolerance, 6-month follow-up to assess efficacy`;
      }
      else {
        plan = `PLAN:\n`;
        plan += `1. Comprehensive evaluation of reported symptoms\n`;
        plan += `2. Lifestyle modifications based on specific health concerns\n`;
        plan += `3. Consider diagnostic testing as appropriate\n`;
        plan += `4. 1-month follow-up to establish treatment plan based on evaluation results`;
      }
    } else {
      // Follow-up consultation plan
      if (categoryId === 'weight_management') {
        plan = `FOLLOW-UP PLAN:\n`;
        plan += `1. Increase Semaglutide to 0.5mg subcutaneous injection weekly\n`;
        plan += `2. Continue Metformin 500mg oral daily with food\n`;
        plan += `3. Reinforce dietary and exercise recommendations\n`;
        plan += `4. Monthly follow-up to assess response and adjust treatment as needed`;
      } 
      else if (categoryId === 'ed') {
        plan = `FOLLOW-UP PLAN:\n`;
        plan += `1. Continue Sildenafil 50mg oral as needed\n`;
        plan += `2. Consider Tadalafil 5mg daily as alternative if patient prefers\n`;
        plan += `3. Reinforce lifestyle modifications\n`;
        plan += `4. 3-month follow-up to assess ongoing response`;
      }
      else if (categoryId === 'hair_loss') {
        plan = `FOLLOW-UP PLAN:\n`;
        plan += `1. Continue Finasteride 1mg oral daily\n`;
        plan += `2. Continue Minoxidil 5% topical solution twice daily\n`;
        plan += `3. Reinforce expectations regarding timeline for visible results\n`;
        plan += `4. Recommend comparison photos at 6 months\n`;
        plan += `5. 6-month follow-up to assess efficacy`;
      }
      else {
        plan = `FOLLOW-UP PLAN:\n`;
        plan += `1. Continue current treatment with adjustments based on response\n`;
        plan += `2. Reinforce lifestyle modifications\n`;
        plan += `3. Consider additional diagnostic testing if response is suboptimal\n`;
        plan += `4. 3-month follow-up to assess ongoing response`;
      }
    }
    
    return plan;
  } catch (error) {
    console.error('Error generating plan:', error);
    throw error;
  }
};

/**
 * Save an AI summary to the database
 * @param {string} consultationId - The consultation ID
 * @param {Object} summary - The generated summary
 * @returns {Promise<Object>} The saved summary
 */
export const saveSummary = async (consultationId, summary) => {
  try {
    const { data, error } = await supabase
      .from('ai_summaries')
      .insert({
        consultation_id: consultationId,
        recommendations: summary.recommendations,
        reasoning: summary.reasoning,
        category_id: summary.categoryId,
        prompt_id: summary.promptId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving AI summary:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in saveSummary:', error);
    throw error;
  }
};

/**
 * Get an AI summary for a consultation
 * @param {string} consultationId - The consultation ID
 * @returns {Promise<Object>} The summary
 */
export const getSummary = async (consultationId) => {
  try {
    const { data, error } = await supabase
      .from('ai_summaries')
      .select('*')
      .eq('consultation_id', consultationId)
      .single();
    
    if (error) {
      console.error('Error fetching AI summary:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getSummary:', error);
    throw error;
  }
};