import { useState, useEffect } from 'react';
import { 
  fetchInvoices, 
  fetchInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
} from './api';

export const useInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        const data = await fetchInvoices();
        setInvoices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, []);

  return { invoices, loading, error };
};

export const useInvoiceById = (id) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true);
        const data = await fetchInvoiceById(id);
        setInvoice(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadInvoice();
    }
  }, [id]);

  return { invoice, loading, error };
};

export const useCreateInvoice = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = async (invoiceData) => {
    try {
      setLoading(true);
      const data = await createInvoice(invoiceData);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
};

export const useUpdateInvoice = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = async (id, updates) => {
    try {
      setLoading(true);
      const data = await updateInvoice(id, updates);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
};

export const useDeleteInvoice = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const remove = async (id) => {
    try {
      setLoading(true);
      await deleteInvoice(id);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { remove, loading, error };
};
