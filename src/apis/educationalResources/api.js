import { supabase } from '../../lib/supabase';

// Fetch educational resources by service type
export const getResourcesByServiceType = async (serviceType, limit = 2) => {
  // Map service types to relevant categories and content types
  const serviceTypeMapping = {
      'weight-management': {
        categories: ['weight'],
        contentTypes: ['medication_guide', 'usage_guide', 'condition_info']
      },
      'hair-loss': {
        categories: ['hair'],
        contentTypes: ['medication_guide', 'usage_guide', 'condition_info']
      },
      'ed-treatment': {
        categories: ['ed'],
        contentTypes: ['medication_guide', 'usage_guide', 'condition_info']
      }
    };

    // Get mapping for the requested service type
    const mapping = serviceTypeMapping[serviceType] || {
      categories: [],
      contentTypes: []
    };

    // Build query to fetch resources by category and content type
    let query = supabase
      .from('educational_resources')
      .select('*')
      .eq('status', 'active')
      .limit(limit);

    // Filter by categories if available
    if (mapping.categories && mapping.categories.length > 0) {
      query = query.in('category', mapping.categories);
    }

    // Execute query
    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching resources by service type: ${error.message}`);
    }

    return data;
  }
};

// Fetch all educational resources with optional filtering
export const getEducationalResources = async ({
  category,
  contentType,
  status = 'active',
  featured,
  searchTerm,
  limit = 100,
  offset = 0,
  sortBy = 'title',
  sortOrder = 'asc'
} = {}) => {
  let query = supabase
    .from('educational_resources')
    .select('*')
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + limit - 1);

  // Apply filters if provided
  if (category) {
    query = query.eq('category', category);
  }

  if (contentType) {
    query = query.eq('content_type', contentType);
  }

  if (status) {
    query = query.eq('status', status);
  }

  if (featured !== undefined) {
    query = query.eq('featured', featured);
  }

  if (searchTerm) {
    query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Error fetching educational resources: ${error.message}`);
  }

  return data;
};

// Get quick guides
export const getQuickGuides = async (limit = 3) => {
  const { data, error } = await supabase
    .from('educational_resources')
    .select('*')
    .eq('content_type', 'usage_guide')
    .eq('category', 'general')
    .eq('status', 'active')
    .limit(limit);

  if (error) {
    throw new Error(`Error fetching quick guides: ${error.message}`);
  }

  return data;
};

// Fetch a single educational resource by ID
export const getEducationalResourceById = async (id) => {
  const { data, error } = await supabase
    .from('educational_resources')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Error fetching educational resource: ${error.message}`);
  }

  return data;
};

// Fetch a single educational resource by content_id
export const getEducationalResourceByContentId = async (contentId) => {
  const { data, error } = await supabase
    .from('educational_resources')
    .select('*')
    .eq('content_id', contentId)
    .single();

  if (error) {
    throw new Error(`Error fetching educational resource: ${error.message}`);
  }

  return data;
};

// Fetch educational resources for a specific product
export const getResourcesByProductId = async (productId) => {
  const { data, error } = await supabase
    .from('product_resources')
    .select(`
      product_id,
      is_primary,
      display_order,
      educational_resources:resource_id (*)
    `)
    .eq('product_id', productId)
    .order('display_order');

  if (error) {
    throw new Error(`Error fetching product resources: ${error.message}`);
  }

  return data.map(item => ({
    ...item.educational_resources,
    is_primary: item.is_primary,
    display_order: item.display_order
  }));
};

// Fetch educational resources for a specific condition
export const getResourcesByConditionId = async (conditionId) => {
  const { data, error } = await supabase
    .from('condition_resources')
    .select(`
      condition_id,
      is_primary,
      display_order,
      educational_resources:resource_id (*)
    `)
    .eq('condition_id', conditionId)
    .order('display_order');

  if (error) {
    throw new Error(`Error fetching condition resources: ${error.message}`);
  }

  return data.map(item => ({
    ...item.educational_resources,
    is_primary: item.is_primary,
    display_order: item.display_order
  }));
};

// Fetch related resources for a specific resource
export const getRelatedResources = async (resourceId) => {
  const { data, error } = await supabase
    .from('related_resources')
    .select(`
      relationship_type,
      display_order,
      educational_resources:related_resource_id (*)
    `)
    .eq('resource_id', resourceId)
    .order('display_order');

  if (error) {
    throw new Error(`Error fetching related resources: ${error.message}`);
  }

  return data.map(item => ({
    ...item.educational_resources,
    relationship_type: item.relationship_type,
    display_order: item.display_order
  }));
};

// Create a new educational resource
export const createEducationalResource = async (resourceData) => {
  const { data, error } = await supabase
    .from('educational_resources')
    .insert([resourceData])
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating educational resource: ${error.message}`);
  }

  return data;
};

// Update an existing educational resource
export const updateEducationalResource = async (id, resourceData) => {
  // Increment version number
  const updatedData = {
    ...resourceData,
    version: resourceData.version + 0.1,
    updated_at: new Date()
  };

  const { data, error } = await supabase
    .from('educational_resources')
    .update(updatedData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating educational resource: ${error.message}`);
  }

  return data;
};

// Delete an educational resource
export const deleteEducationalResource = async (id) => {
  const { error } = await supabase
    .from('educational_resources')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error deleting educational resource: ${error.message}`);
  }

  return true;
};

// Associate a resource with a product
export const associateResourceWithProduct = async (productId, resourceId, isPrimary = false, displayOrder = 0) => {
  const { data, error } = await supabase
    .from('product_resources')
    .insert([{
      product_id: productId,
      resource_id: resourceId,
      is_primary: isPrimary,
      display_order: displayOrder
    }])
    .select();

  if (error) {
    throw new Error(`Error associating resource with product: ${error.message}`);
  }

  return data;
};

// Associate a resource with a condition
export const associateResourceWithCondition = async (conditionId, resourceId, isPrimary = false, displayOrder = 0) => {
  const { data, error } = await supabase
    .from('condition_resources')
    .insert([{
      condition_id: conditionId,
      resource_id: resourceId,
      is_primary: isPrimary,
      display_order: displayOrder
    }])
    .select();

  if (error) {
    throw new Error(`Error associating resource with condition: ${error.message}`);
  }

  return data;
};

// Add a related resource
export const addRelatedResource = async (resourceId, relatedResourceId, relationshipType = 'related', displayOrder = 0) => {
  const { data, error } = await supabase
    .from('related_resources')
    .insert([{
      resource_id: resourceId,
      related_resource_id: relatedResourceId,
      relationship_type: relationshipType,
      display_order: displayOrder
    }])
    .select();

  if (error) {
    throw new Error(`Error adding related resource: ${error.message}`);
  }

  return data;
};

// Get featured resources
export const getFeaturedResources = async (limit = 6) => {
  const { data, error } = await supabase
    .from('educational_resources')
    .select('*')
    .eq('featured', true)
    .eq('status', 'active')
    .limit(limit);

  if (error) {
    throw new Error(`Error fetching featured resources: ${error.message}`);
  }

  return data;
};

// Get recent resources
export const getRecentResources = async (limit = 10) => {
  const { data, error } = await supabase
    .from('educational_resources')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Error fetching recent resources: ${error.message}`);
  }

  return data;
};

// Get resources by category
export const getResourcesByCategory = async (category, limit = 20) => {
  const { data, error } = await supabase
    .from('educational_resources')
    .select('*')
    .eq('category', category)
    .eq('status', 'active')
    .limit(limit);

  if (error) {
    throw new Error(`Error fetching resources by category: ${error.message}`);
  }

  return data;
};
