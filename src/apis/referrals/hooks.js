import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase'; // Use the correct Supabase client
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/auth/AuthContext'; // To get current user ID if needed

// Define query keys
const queryKeys = {
  settings: ['referralSettings'],
  history: (filters = {}) => ['referralHistory', { filters }],
  userInfo: (userId) => ['userReferralInfo', userId],
};

// --- Admin Hooks ---

// Hook to fetch referral settings (assuming a single row table or specific ID)
export const useReferralSettings = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: async () => {
      // Settings are stored in referral_settings with primary key id=1
      const { data, error } = await supabase
        .from('referral_settings') 
        .select('*')
        .eq('id', 1) // Fetch the single settings row
        .maybeSingle(); 

      if (error) {
        console.error('Error fetching referral settings:', error);
        toast.error(`Error fetching settings: ${error.message}`);
        // Return default values on error?
        return { rewardAmount: 0, rewardRecipient: 'referrer' };
      }
      // Return defaults if no settings row exists yet
      return data || { rewardAmount: 0, rewardRecipient: 'referrer' };
    },
    staleTime: 5 * 60 * 1000, // Cache settings for 5 minutes
    ...options,
  });
};

// Hook to update referral settings (admin)
export const useUpdateReferralSettings = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settingsData) => {
      // Settings table has primary key id=1
      const dataToUpdate = {
        id: 1, 
        reward_amount: settingsData.rewardAmount, 
        reward_recipient: settingsData.rewardRecipient,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('referral_settings') 
        .upsert(dataToUpdate) // Upsert ensures the row is created if it doesn't exist
        .select()
        .single();

      if (error) {
        console.error('Error updating referral settings:', error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      toast.success('Referral settings updated successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating settings: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Hook to fetch all referral history (admin)
export const useReferralHistory = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.history(filters),
    queryFn: async () => {
      // Join referrals with profiles table to get names
      let query = supabase
        .from('referrals') 
        .select(`
          *,
          referrer:profiles!referrals_referrer_user_id_fkey ( id, first_name, last_name, email ), 
          referee:profiles!referrals_referred_user_id_fkey ( id, first_name, last_name, email ) 
        `) // Use explicit foreign key names for joins
        .order('created_at', { ascending: false });

      // Add filters if needed (e.g., by status)
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching referral history:', error);
        toast.error(`Error fetching history: ${error.message}`);
        throw new Error(error.message);
      }

      // Map data to include names from the joined profiles
      const mappedData = data?.map(ref => ({
        ...ref,
        referrerName: `${ref.referrer?.first_name || ''} ${ref.referrer?.last_name || ''}`.trim() || 'Unknown',
        referrerEmail: ref.referrer?.email || 'N/A',
        referredName: `${ref.referee?.first_name || ''} ${ref.referee?.last_name || ''}`.trim() || 'Unknown',
        referredEmail: ref.referee?.email || 'N/A',
      })) || [];

      return mappedData; // Return the mapped history
    },
    staleTime: 1 * 60 * 1000, // Cache history for 1 minute
    ...options,
  });
};


// --- User Hooks ---

// Hook to fetch current user's referral info (code, stats)
export const useUserReferralInfo = (options = {}) => {
    const { currentUser } = useAuth();
    const userId = currentUser?.id;

    return useQuery({
      queryKey: queryKeys.userInfo(userId),
      queryFn: async () => {
        if (!userId) return null;

        // This likely requires querying multiple tables or a dedicated function/view
        // 1. Get referral code (assuming it's stored in a 'profiles' table)
        // 2. Get referral count/rewards 

        // Fetch profile which now contains the referral_code
        const { data: profileData, error: profileError } = await supabase
            .from('profiles') 
            .select('referral_code')
            .eq('id', userId)
            .single();

        if (profileError) {
            console.error("Error fetching user profile for referral code:", profileError);
            // Don't throw, maybe user has no profile yet
        }

        // Fetch referral stats (count successful referrals for this user)
        const { count, error: statsError } = await supabase
            .from('referrals') 
            .select('*', { count: 'exact', head: true }) 
            .eq('referrer_user_id', userId)
            .eq('status', 'rewarded'); // Count only rewarded referrals

         if (statsError) {
            console.error("Error fetching referral stats:", statsError);
            // Don't throw, proceed with potentially partial data
         }

         // 3. Get reward amount from settings
         const { data: settingsData, error: settingsError } = await supabase
            .from('referral_settings')
            .select('reward_amount')
            .eq('id', 1)
            .single();

         if (settingsError) {
             console.error("Error fetching referral settings for reward calculation:", settingsError);
             // Don't throw, proceed with 0 reward calculation
         }

         const rewardAmountPerReferral = settingsData?.reward_amount || 0;
         const totalRewards = (count ?? 0) * rewardAmountPerReferral;
         // TODO: This calculation assumes every 'rewarded' referral gets the current reward amount.
         // A more accurate approach might involve storing the reward amount in the 'referrals' table
         // when the status becomes 'rewarded' and summing that column.

        return {
            code: profileData?.referral_code || 'N/A',
            referralCount: count ?? 0,
            totalRewards: totalRewards,
        };
      },
      enabled: !!userId, // Only run if user is logged in
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      ...options,
    });
  };
