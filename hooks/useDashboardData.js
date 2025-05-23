import { usePatients } from '../../apis/patients/hooks';
import { useSessions } from '../../apis/sessions/hooks';
import { useOrders } from '../../apis/orders/hooks';
import { useConsultations } from '../../apis/consultations/hooks';
import { useTasks } from '../../apis/tasks/hooks';
import { useForms } from '../../apis/forms/hooks';

export const useDashboardData = () => {
  // Use individual hooks
  const patientsQuery = usePatients();
  const sessionsQuery = useSessions();
  const ordersQuery = useOrders();
  const consultationsQuery = useConsultations({}, 10);
  const tasksQuery = useTasks(1, { status: 'Pending' }, {}, 10);
  const formsQuery = useForms();
  
  // Extract data from query results
  const patients = patientsQuery.data?.data || patientsQuery.data || [];
  const sessions = sessionsQuery.data?.data || sessionsQuery.data || [];
  const orders = ordersQuery.data?.data || ordersQuery.data || [];
  const consultations = consultationsQuery.data?.data || [];
  const pendingTasks = tasksQuery.data?.data || [];
  const forms = formsQuery.data?.data || formsQuery.data || [];
  
  // Check if any query is still loading
  const isLoading = [
    patientsQuery.isLoading,
    sessionsQuery.isLoading,
    ordersQuery.isLoading,
    consultationsQuery.isLoading,
    tasksQuery.isLoading,
    formsQuery.isLoading,
  ].some(Boolean);
  
  // Collect all errors
  const errors = [
    patientsQuery.error,
    sessionsQuery.error,
    ordersQuery.error,
    consultationsQuery.error,
    tasksQuery.error,
    formsQuery.error,
  ].filter(Boolean);
  
  const hasError = errors.length > 0;
  
  // Refetch functions
  const refetch = {
    patients: patientsQuery.refetch,
    sessions: sessionsQuery.refetch,
    orders: ordersQuery.refetch,
    consultations: consultationsQuery.refetch,
    tasks: tasksQuery.refetch,
    forms: formsQuery.refetch,
    all: async () => {
      await Promise.all([
        patientsQuery.refetch(),
        sessionsQuery.refetch(),
        ordersQuery.refetch(),
        consultationsQuery.refetch(),
        tasksQuery.refetch(),
        formsQuery.refetch()
      ]);
    }
  };
  
  return {
    patients,
    sessions,
    orders,
    consultations,
    pendingTasks,
    forms,
    isLoading,
    hasError,
    errors,
    refetch
  };
};
