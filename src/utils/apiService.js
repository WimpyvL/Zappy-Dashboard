
import { supabase } from './supabaseClient'; // Import the Supabase client
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Helper to handle Supabase errors
const handleSupabaseError = (error, context = 'Supabase operation') => {
  console.error(`${context} error:`, error);
  toast.error(error.message || `An error occurred during ${context}.`);
  throw error; // Re-throw the error for React Query to handle
};

// API service object using Supabase
const apiService = {
  // Authentication endpoints using Supabase Auth
  auth: {
    login: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) handleSupabaseError(error, 'Login');
      // Supabase client handles session/token storage automatically
      return data; // Contains user and session info
    },
    register: async (userData) => {
      // Assuming userData contains email, password, and potentially other metadata
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            // Add other user metadata here if needed during signup
            // e.g., first_name: userData.firstName, last_name: userData.lastName
          },
        },
      });
      if (error) handleSupabaseError(error, 'Registration');
      return data; // Contains user info (might require email confirmation)
    },
    forgotPassword: async (email) => {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        // Optional: specify redirect URL if needed
        // redirectTo: 'http://localhost:3001/update-password',
      });
      if (error) handleSupabaseError(error, 'Forgot Password');
      return data;
    },
    resetPassword: async (accessToken, newPassword) => {
      // This typically happens after the user clicks the email link.
      // Supabase handles the token verification via onAuthStateChange with 'PASSWORD_RECOVERY' event.
      // The update happens within the component handling that event.
      // This function might not be directly called from here in a typical Supabase flow.
      // If you need direct update via access token (less common):
      // const { data, error } = await supabase.auth.updateUser({ password: newPassword }, { accessToken });
      // if (error) handleSupabaseError(error, 'Reset Password');
      // return data;
      console.warn('resetPassword function in apiService might need adjustment for Supabase flow.');
      return { success: true }; // Placeholder
    },
    logout: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) handleSupabaseError(error, 'Logout');
      // Supabase client handles clearing the session
      return { success: !error };
    },
    // Helper to get current session (useful for initial load check)
    getSession: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) handleSupabaseError(error, 'Get Session');
      return data.session;
    },
    // Helper to get current user
    getUser: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) handleSupabaseError(error, 'Get User');
      return data.user;
    }
  },

  // Consultation related endpoints - Using Supabase
  consultations: {
    getAll: async (params) => {
      // Basic Supabase query, add filtering/pagination based on params later
      const { data, error, count } = await supabase
        .from('consultations')
        .select('*', { count: 'exact' }); // Adjust columns as needed
      if (error) handleSupabaseError(error, 'Get All Consultations');
      return { data, meta: { total_count: count } }; // Adapt response structure
    },
    getById: async (id) => {
      const { data, error } = await supabase
        .from('consultations')
        .select('*') // Adjust columns as needed
        .eq('id', id)
        .single();
      if (error) handleSupabaseError(error, `Get Consultation ${id}`);
      return data;
    },
    updateStatus: async (id, status) => {
      const { data, error } = await supabase
        .from('consultations')
        .update({ status: status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select() // Return updated record
        .single();
      if (error) handleSupabaseError(error, `Update Consultation Status ${id}`);
      return data;
    },
    // Add create, update, delete if needed using supabase.from('consultations').insert/update/delete
  },

  // User related endpoints - Profile data might be in a separate 'profiles' table linked to auth.users
  users: {
    // Assumes a 'profiles' table linked via user_id (matching auth.users.id)
    getProfile: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('profiles') // Assuming 'profiles' table name
        .select('*')
        .eq('id', user.id) // Match profile id with auth user id
        .single();
      if (error && error.code !== 'PGRST116') { // Ignore 'No rows found' error if profile doesn't exist yet
        handleSupabaseError(error, 'Get Profile');
      }
      return data; // Might be null if profile doesn't exist
    },
    updateProfile: async (userData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...userData, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();
      if (error) handleSupabaseError(error, 'Update Profile');
      return data;
    },
    changePassword: async (newPassword) => {
      // Supabase requires only the new password when user is logged in
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) handleSupabaseError(error, 'Change Password');
      return data;
    },
    // Referral info might be part of the profile or a separate table
    getReferralInfo: async () => {
      // Example: Assuming referral code is on the profile
      const profile = await apiService.users.getProfile();
      return { referral_code: profile?.referral_code || null }; // Adapt based on actual schema
    },
  },

  patients: {
    getAll: async (params) => {
      // Basic query, add filtering/pagination/sorting based on params
      let query = supabase.from('patients').select('*', { count: 'exact' });
      // Example pagination (adapt based on params structure)
      // if (params?.page && params?.limit) {
      //   const offset = (params.page - 1) * params.limit;
      //   query = query.range(offset, offset + params.limit - 1);
      // }
      const { data, error, count } = await query;
      if (error) handleSupabaseError(error, 'Get All Patients');
      return { data, meta: { total_count: count } }; // Adapt response structure
    },
    getById: async (id) => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();
      if (error) handleSupabaseError(error, `Get Patient ${id}`);
      return data;
    },
    create: async (patientData) => {
      const { data, error } = await supabase
        .from('patients')
        .insert([patientData]) // Supabase expects an array for insert
        .select()
        .single();
      if (error) handleSupabaseError(error, 'Create Patient');
      return data;
    },
    update: async (id, patientData) => {
      const { data, error } = await supabase
        .from('patients')
        .update({ ...patientData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) handleSupabaseError(error, `Update Patient ${id}`);
      return data;
    },
    delete: async (id) => {
      const { error } = await supabase.from('patients').delete().eq('id', id);
      if (error) handleSupabaseError(error, `Delete Patient ${id}`);
      return { success: !error };
    },
  },

  // Note related endpoints - Using Supabase
  notes: {
    getPatientNotes: async (patientId, params) => {
      if (!patientId) throw new Error('Patient ID is required to fetch notes.');
      // Basic query, add filtering/pagination based on params
      const { data, error } = await supabase
        .from('notes')
        .select('*') // Adjust columns as needed
        .eq('patient_id', patientId);
      if (error) handleSupabaseError(error, `Get Notes for Patient ${patientId}`);
      return { data }; // Adapt response structure
    },
    getNoteById: async (noteId) => {
      if (!noteId) throw new Error('Note ID is required.');
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();
      if (error) handleSupabaseError(error, `Get Note ${noteId}`);
      return data;
    },
    createPatientNote: async (patientId, noteData) => {
      if (!patientId) throw new Error('Patient ID is required to create a note.');
      const { data: { user } } = await supabase.auth.getUser(); // Get current user for user_id
      const { data, error } = await supabase
        .from('notes')
        .insert([{ ...noteData, patient_id: patientId, user_id: user?.id }])
        .select()
        .single();
      if (error) handleSupabaseError(error, 'Create Note');
      return data;
    },
    updatePatientNote: async (noteId, noteData) => {
      if (!noteId) throw new Error('Note ID is required for update.');
      const { data, error } = await supabase
        .from('notes')
        .update({ ...noteData, updated_at: new Date().toISOString() })
        .eq('id', noteId)
        .select()
        .single();
      if (error) handleSupabaseError(error, `Update Note ${noteId}`);
      return data;
    },
    deletePatientNote: async (noteId) => {
      if (!noteId) throw new Error('Note ID is required for deletion.');
      const { error } = await supabase.from('notes').delete().eq('id', noteId);
      if (error) handleSupabaseError(error, `Delete Note ${noteId}`);
      return { success: !error };
    },
  },

  // Task related endpoints - Using Supabase (table: pb_tasks)
  tasks: {
    getAll: async (params) => {
      // Basic query, add filtering/pagination/sorting based on params
      const { data, error, count } = await supabase
        .from('pb_tasks')
        .select('*', { count: 'exact' });
      if (error) handleSupabaseError(error, 'Get All Tasks');
      return { data, meta: { total_count: count } }; // Adapt response structure
    },
    getById: async (id) => {
      const { data, error } = await supabase
        .from('pb_tasks')
        .select('*')
        .eq('id', id)
        .single();
      if (error) handleSupabaseError(error, `Get Task ${id}`);
      return data;
    },
    create: async (taskData) => {
      const { data: { user } } = await supabase.auth.getUser(); // Get current user for user_id
      const { data, error } = await supabase
        .from('pb_tasks')
        .insert([{ ...taskData, user_id: user?.id }])
        .select()
        .single();
      if (error) handleSupabaseError(error, 'Create Task');
      return data;
    },
    update: async (id, taskData) => {
      const { data, error } = await supabase
        .from('pb_tasks')
        .update({ ...taskData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) handleSupabaseError(error, `Update Task ${id}`);
      return data;
    },
    delete: async (id) => {
      const { error } = await supabase.from('pb_tasks').delete().eq('id', id);
      if (error) handleSupabaseError(error, `Delete Task ${id}`);
      return { success: !error };
    },
    markCompleted: async (id) => {
      const { data, error } = await supabase
        .from('pb_tasks')
        .update({ completed: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) handleSupabaseError(error, `Mark Task ${id} Completed`);
      return data;
    },
    // Get assignable users (assuming profiles table)
    getAssignees: async () => {
      const { data, error } = await supabase
        .from('profiles') // Assuming profiles table holds user names/roles
        .select('id, first_name, last_name'); // Select relevant fields
      if (error) handleSupabaseError(error, 'Get Assignees');
      return data;
    },
    // Get patients (already covered by patients.getAll)
    getTaskablePatients: async () => {
      // Use the existing patients.getAll method
      return await apiService.patients.getAll();
    },
  },

  // Tags related endpoints - Using Supabase (table: tag)
  tags: {
    getAll: async (params) => {
      const { data, error } = await supabase.from('tag').select('*'); // Basic query
      if (error) handleSupabaseError(error, 'Get All Tags');
      return { data }; // Adapt response structure
    },
    getById: async (id) => {
      const { data, error } = await supabase
        .from('tag')
        .select('*')
        .eq('id', id)
        .single();
      if (error) handleSupabaseError(error, `Get Tag ${id}`);
      return data;
    },
    create: async (tagData) => {
      const { data, error } = await supabase
        .from('tag')
        .insert([tagData])
        .select()
        .single();
      if (error) handleSupabaseError(error, 'Create Tag');
      return data;
    },
    update: async (id, tagData) => {
      const { data, error } = await supabase
        .from('tag')
        .update(tagData)
        .eq('id', id)
        .select()
        .single();
      if (error) handleSupabaseError(error, `Update Tag ${id}`);
      return data;
    },
    delete: async (id) => {
      const { error } = await supabase.from('tag').delete().eq('id', id);
      if (error) handleSupabaseError(error, `Delete Tag ${id}`);
      return { success: !error };
    },
    getUsage: async (id) => {
      // This requires more complex queries involving joins or multiple queries
      // Placeholder implementation
      console.warn('getUsage for tags needs specific Supabase implementation');
      return { usage: { patients: 0, orders: 0, sessions: 0 } };
    },
  },

  // Service related endpoints - Using Supabase
  services: {
    getAll: async (params) => {
      const { data, error } = await supabase.from('services').select('*'); // Basic query
      if (error) handleSupabaseError(error, 'Get All Services');
      return { data }; // Adapt response structure
    },
    getById: async (id) => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();
      if (error) handleSupabaseError(error, `Get Service ${id}`);
      return data;
    },
    create: async (serviceData) => {
      const { data, error } = await supabase
        .from('services')
        .insert([serviceData])
        .select()
        .single();
      if (error) handleSupabaseError(error, 'Create Service');
      return data;
    },
    update: async (id, serviceData) => {
      const { data, error } = await supabase
        .from('services')
        .update({ ...serviceData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) handleSupabaseError(error, `Update Service ${id}`);
      return data;
    },
    delete: async (id) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) handleSupabaseError(error, `Delete Service ${id}`);
      return { success: !error };
    },
    toggleActive: async (id, active) => {
      // Assuming 'is_active' column name based on other tables
      const { data, error } = await supabase
        .from('services')
        .update({ is_active: active, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) handleSupabaseError(error, `Toggle Service Active ${id}`);
      return data;
    },
  },

  // Order related endpoints - Using Supabase
  orders: {
    getAll: async (params) => {
      // Basic query, add filtering/pagination/sorting based on params
      const { data, error, count } = await supabase
        .from('orders')
        .select('*', { count: 'exact' });
      if (error) handleSupabaseError(error, 'Get All Orders');
      return { data, meta: { total_count: count } }; // Adapt response structure
    },
    getById: async (id) => {
      const { data, error } = await supabase
        .from('orders')
        .select('*') // Consider joining order_items
        .eq('id', id)
        .single();
      if (error) handleSupabaseError(error, `Get Order ${id}`);
      // Fetch order items separately if needed
      return data;
    },
    create: async (orderData) => {
      // This might involve creating order items as well, potentially in a transaction
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();
      if (error) handleSupabaseError(error, 'Create Order');
      // Handle order_items creation here or in a separate function/trigger
      return data;
    },
    update: async (id, orderData) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ ...orderData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) handleSupabaseError(error, `Update Order ${id}`);
      return data;
    },
    updateStatus: async (id, status) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status: status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) handleSupabaseError(error, `Update Order Status ${id}`);
      return data;
    },
    delete: async (id) => {
      // Consider cascade delete for order_items or handle separately
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) handleSupabaseError(error, `Delete Order ${id}`);
      return { success: !error };
    },
  },

  // Product related endpoints - Using Supabase
  products: {
    getAll: async (params) => {
      // Basic query, add filtering/pagination/sorting based on params
      const { data, error } = await supabase
        .from('products')
        .select('*'); // Consider joining product_doses
      if (error) handleSupabaseError(error, 'Get All Products');
      // Fetch doses separately or adjust query if needed
      return { data }; // Adapt response structure
    },
    getById: async (id) => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_doses(*)') // Example join
        .eq('id', id)
        .single();
      if (error) handleSupabaseError(error, `Get Product ${id}`);
      return data;
    },
    create: async (productData) => {
      // Handle product_doses creation separately or via nested insert if supported
      const { doses, ...restProductData } = productData;
      const { data, error } = await supabase
        .from('products')
        .insert([restProductData])
        .select()
        .single();
      if (error) handleSupabaseError(error, 'Create Product');
      // If successful and doses exist, create them
      // if (data && doses && doses.length > 0) {
      //   const doseInserts = doses.map(d => ({ ...d, product_id: data.id }));
      //   const { error: doseError } = await supabase.from('product_doses').insert(doseInserts);
      //   if (doseError) console.error("Error creating product doses:", doseError); // Handle dose creation error
      // }
      return data;
    },
    update: async (id, productData) => {
      // Handle product_doses update separately
      const { doses, ...restProductData } = productData;
      const { data, error } = await supabase
        .from('products')
        .update({ ...restProductData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) handleSupabaseError(error, `Update Product ${id}`);
      // Handle dose updates/creations/deletions here
      return data;
    },
    delete: async (id) => {
      // Supabase cascade delete should handle product_doses if set up correctly
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) handleSupabaseError(error, `Delete Product ${id}`);
      return { success: !error };
    },
  },

  // Session related endpoints - Using Supabase
  sessions: {
    getAll: async (params) => {
      // Basic query, add filtering/pagination/sorting based on params
      const { data, error } = await supabase.from('sessions').select('*');
      if (error) handleSupabaseError(error, 'Get All Sessions');
      return { data }; // Adapt response structure
    },
    getById: async (id) => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', id)
        .single();
      if (error) handleSupabaseError(error, `Get Session ${id}`);
      return data;
    },
    create: async (sessionData) => {
      const { data, error } = await supabase
        .from('sessions')
        .insert([sessionData])
        .select()
        .single();
      if (error) handleSupabaseError(error, 'Create Session');
      return data;
    },
    update: async (id, sessionData) => {
      const { data, error } = await supabase
        .from('sessions')
        .update({ ...sessionData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) handleSupabaseError(error, `Update Session ${id}`);
      return data;
    },
    updateStatus: async (id, status) => {
      const { data, error } = await supabase
        .from('sessions')
        .update({ status: status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) handleSupabaseError(error, `Update Session Status ${id}`);
      return data;
    },
    delete: async (id) => {
      const { error } = await supabase.from('sessions').delete().eq('id', id);
      if (error) handleSupabaseError(error, `Delete Session ${id}`);
      return { success: !error };
    },
    // Add tag/untag functions using join table (e.g., session_tags) if needed
    // addTag: async (sessionId, tagId) => { ... }
    // removeTag: async (sessionId, tagId) => { ... }
  },

  // Product-Service Links endpoints - Requires join table logic
  productServiceLinks: {
    // This requires specific implementation based on how links are stored (e.g., a join table)
    getAll: async (params) => {
      console.warn('productServiceLinks.getAll needs Supabase implementation');
      return { data: [] };
    },
    getByProductId: async (productId) => {
      console.warn('productServiceLinks.getByProductId needs Supabase implementation');
      return { data: [] };
    },
    create: async (linkData) => {
      console.warn('productServiceLinks.create needs Supabase implementation');
      return { data: linkData };
    },
    delete: async (id) => {
      console.warn('productServiceLinks.delete needs Supabase implementation');
      return { success: true };
    },
    // Create or update multiple links for a product - needs careful implementation
    createBulk: async (productId, serviceIds) => {
      console.warn('productServiceLinks.createBulk needs Supabase implementation');
      // This would involve deleting existing links for the product and inserting new ones.
      // Consider using Supabase Edge Functions for transactional safety.
      return { success: true };
    },
  },

  // Subscription Plan related endpoints - Using Supabase
  subscriptionPlans: {
    getAll: async (params) => {
      const { data, error } = await supabase.from('subscription_plans').select('*'); // Basic query
      if (error) handleSupabaseError(error, 'Get All Subscription Plans');
      return { data }; // Adapt response structure
    },
    getById: async (id) => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*') // Consider joining plan_doses/plan_features
        .eq('id', id)
        .single();
      if (error) handleSupabaseError(error, `Get Subscription Plan ${id}`);
      return data;
    },
    create: async (planData) => {
      // Handle join tables (plan_doses, plan_features) separately after creation
      const { allowedProductDoses, features, ...restPlanData } = planData;
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert([restPlanData])
        .select()
        .single();
      if (error) handleSupabaseError(error, 'Create Subscription Plan');
      // Handle inserting into join tables if creation was successful
      return data;
    },
    update: async (id, planData) => {
      // Handle join tables separately
      const { allowedProductDoses, features, ...restPlanData } = planData;
      const { data, error } = await supabase
        .from('subscription_plans')
        .update({ ...restPlanData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) handleSupabaseError(error, `Update Subscription Plan ${id}`);
      // Handle updates to join tables (delete existing, insert new)
      return data;
    },
    delete: async (id) => {
      // Cascade delete should handle join tables if set up
      const { error } = await supabase.from('subscription_plans').delete().eq('id', id);
      if (error) handleSupabaseError(error, `Delete Subscription Plan ${id}`);
      return { success: !error };
    },
  },

  // Pharmacy related endpoints - Using Supabase
  pharmacies: {
    getAll: async (params) => {
      const { data, error } = await supabase.from('pharmacies').select('*'); // Basic query
      if (error) handleSupabaseError(error, 'Get All Pharmacies');
      return { data }; // Adapt response structure
    },
    getById: async (id) => {
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('id', id)
        .single();
      if (error) handleSupabaseError(error, `Get Pharmacy ${id}`);
      return data;
    },
    create: async (pharmacyData) => {
      const { data, error } = await supabase
        .from('pharmacies')
        .insert([pharmacyData])
        .select()
        .single();
      if (error) handleSupabaseError(error, 'Create Pharmacy');
      return data;
    },
    update: async (id, pharmacyData) => {
      const { data, error } = await supabase
        .from('pharmacies')
        .update({ ...pharmacyData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) handleSupabaseError(error, `Update Pharmacy ${id}`);
      return data;
    },
    delete: async (id) => {
      const { error } = await supabase.from('pharmacies').delete().eq('id', id);
      if (error) handleSupabaseError(error, `Delete Pharmacy ${id}`);
      return { success: !error };
    },
    toggleActive: async (id, active) => {
      const { data, error } = await supabase
        .from('pharmacies')
        .update({ is_active: active, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) handleSupabaseError(error, `Toggle Pharmacy Active ${id}`);
      return data;
    },
  },

  // Insurance related endpoints - Using Supabase (tables: insurance_policy, insurance_document)
  insurances: {
    // Renamed to match table name
    getAllPolicies: async (params) => {
      const { data, error } = await supabase.from('insurance_policy').select('*');
      if (error) handleSupabaseError(error, 'Get All Insurance Policies');
      return { data };
    },
    getPolicyById: async (id) => {
      const { data, error } = await supabase
        .from('insurance_policy')
        .select('*, insurance_document(*)') // Example join
        .eq('id', id)
        .single();
      if (error) handleSupabaseError(error, `Get Insurance Policy ${id}`);
      return data;
    },
    createPolicy: async (policyData) => {
      const { data, error } = await supabase
        .from('insurance_policy')
        .insert([policyData])
        .select()
        .single();
      if (error) handleSupabaseError(error, 'Create Insurance Policy');
      return data;
    },
    updatePolicy: async (id, policyData) => {
      const { data, error } = await supabase
        .from('insurance_policy')
        .update({ ...policyData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) handleSupabaseError(error, `Update Insurance Policy ${id}`);
      return data;
    },
    // Document handling needs Supabase Storage integration
    uploadDocument: async (policyId, file) => {
      if (!policyId || !file) throw new Error('Policy ID and file are required.');
      const filePath = `insurance_docs/${policyId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('insurance-documents') // Assuming a bucket named 'insurance-documents'
        .upload(filePath, file);

      if (uploadError) handleSupabaseError(uploadError, 'Upload Insurance Document');

      // Get public URL after successful upload
      const { data: urlData } = supabase.storage
        .from('insurance-documents')
        .getPublicUrl(filePath);

      // Add record to insurance_document table
      const docRecord = {
        insurance_policy_id: policyId,
        file_name: file.name,
        storage_path: filePath,
        url: urlData?.publicUrl || null,
        document_type: file.type, // Or extract from file name/metadata
        // uploaded_by: (await supabase.auth.getUser()).data.user?.id // Get current user ID
      };
      const { data: dbData, error: dbError } = await supabase
        .from('insurance_document')
        .insert([docRecord])
        .select()
        .single();

      if (dbError) handleSupabaseError(dbError, 'Save Insurance Document Record');
      return dbData;
    },
    deleteDocument: async (documentId) => {
      // 1. Get storage path from DB
      const { data: docData, error: fetchError } = await supabase
        .from('insurance_document')
        .select('storage_path')
        .eq('id', documentId)
        .single();

      if (fetchError || !docData) {
         handleSupabaseError(fetchError || new Error('Document not found'), `Fetch Insurance Document ${documentId}`);
         return { success: false };
      }

      // 2. Delete from Storage
      const { error: storageError } = await supabase.storage
        .from('insurance-documents')
        .remove([docData.storage_path]);
      if (storageError) handleSupabaseError(storageError, `Delete Document from Storage ${documentId}`);

      // 3. Delete from DB
      const { error: dbError } = await supabase
        .from('insurance_document')
        .delete()
        .eq('id', documentId);
      if (dbError) handleSupabaseError(dbError, `Delete Document Record ${documentId}`);

      return { success: !storageError && !dbError };
    },
  },

  // Discount related endpoints - Using Supabase
  discounts: {
    getAll: async (params) => {
      const { data, error } = await supabase.from('discounts').select('*'); // Basic query
      if (error) handleSupabaseError(error, 'Get All Discounts');
      return { data }; // Adapt response structure
    },
    getById: async (id) => {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('id', id)
        .single();
      if (error) handleSupabaseError(error, `Get Discount ${id}`);
      return data;
    },
    create: async (discountData) => {
      const { data, error } = await supabase
        .from('discounts')
        .insert([discountData])
        .select()
        .single();
      if (error) handleSupabaseError(error, 'Create Discount');
      return data;
    },
    update: async (id, discountData) => {
      const { data, error } = await supabase
        .from('discounts')
        .update({ ...discountData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) handleSupabaseError(error, `Update Discount ${id}`);
      return data;
    },
    delete: async (id) => {
      const { error } = await supabase.from('discounts').delete().eq('id', id);
      if (error) handleSupabaseError(error, `Delete Discount ${id}`);
      return { success: !error };
    },
    toggleActive: async (id, active) => {
      // Assuming 'status' column ('Active'/'Inactive')
      const newStatus = active ? 'Active' : 'Inactive';
      const { data, error } = await supabase
        .from('discounts')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) handleSupabaseError(error, `Toggle Discount Active ${id}`);
      return data;
    },
  },

  // Referrals section - Needs specific table implementation
  referrals: {
    // These require specific tables (e.g., 'referral_settings', 'referrals')
    getSettings: async () => {
      console.warn('referrals.getSettings needs Supabase implementation');
      return { reward_amount: 0, recipient_info: '' }; // Placeholder
    },
    updateSettings: async (settingsData) => {
      console.warn('referrals.updateSettings needs Supabase implementation');
      return { success: true }; // Placeholder
    },
    getAllAdmin: async (params) => {
      console.warn('referrals.getAllAdmin needs Supabase implementation');
      return { data: [], meta: {} }; // Placeholder
    },
  },

  // Forms endpoints - Using Supabase (table: questionnaire)
  forms: {
    getAll: async (params) => {
      const { data, error } = await supabase.from('questionnaire').select('*');
      if (error) handleSupabaseError(error, 'Get All Forms');
      return { data };
    },
    getById: async (id) => {
      const { data, error } = await supabase
        .from('questionnaire')
        .select('*')
        .eq('id', id)
        .single();
      if (error) handleSupabaseError(error, `Get Form ${id}`);
      return data;
    },
    create: async (formData) => {
      const { data, error } = await supabase
        .from('questionnaire')
        .insert([formData])
        .select()
        .single();
      if (error) handleSupabaseError(error, 'Create Form');
      return data;
    },
    update: async (id, formData) => {
      const { data, error } = await supabase
        .from('questionnaire')
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) handleSupabaseError(error, `Update Form ${id}`);
      return data;
    },
    delete: async (id) => {
      const { error } = await supabase.from('questionnaire').delete().eq('id', id);
      if (error) handleSupabaseError(error, `Delete Form ${id}`);
      return { success: !error };
    },
  },

   // Audit Log endpoints - Using Supabase (table: api_logs)
   auditlog: {
     getAll: async (params) => {
       // Basic query, add filtering/pagination/sorting based on params
       const { data, error, count } = await supabase
         .from('api_logs') // Use actual table name
         .select('*', { count: 'exact' })
         .order('created_at', { ascending: false }); // Example sort
       if (error) handleSupabaseError(error, 'Get All Audit Logs');
       return { data, meta: { total_count: count } }; // Adapt response structure
     },
     create: async (logData) => {
       // Note: user_id might be automatically handled by RLS policies if set up
       const { data, error } = await supabase
         .from('api_logs') // Use actual table name
         .insert([logData])
         .select()
         .single();
       if (error) handleSupabaseError(error, 'Create Audit Log');
       return data;
     },
   },

  // Generic request methods are less relevant with Supabase client,
  // but can be kept for potential non-Supabase API calls if needed.
  // get: async (endpoint, params) => { ... },
  // post: async (endpoint, data) => { ... },
  // put: async (endpoint, data) => { ... },
  // delete: async (endpoint) => { ... },
};

export default apiService;
