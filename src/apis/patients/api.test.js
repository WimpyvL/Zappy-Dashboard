import patientsApi from './api';
import { supabaseHelper } from '../../lib/supabase';

// Mock the supabaseHelper module
jest.mock('../../lib/supabase', () => ({
  supabaseHelper: {
    fetch: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('patientsApi', () => {
  afterEach(() => {
    // Clear mock calls after each test
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    test('should fetch patients successfully', async () => {
      const mockData = [{ id: '1', name: 'John Doe' }];
      const mockCount = 1;
      supabaseHelper.fetch.mockResolvedValueOnce({ data: mockData, error: null, count: mockCount });

      const result = await patientsApi.getAll();

      expect(supabaseHelper.fetch).toHaveBeenCalledWith('client_record', {
        select: '*',
        order: { column: 'created_at', ascending: false },
        filters: [],
      });
      expect(result).toEqual({
        data: mockData,
        error: null,
        count: mockCount,
        status: 200,
        statusText: 'OK',
      });
    });

    test('should handle error when fetching patients', async () => {
      const mockError = new Error('Failed to fetch');
      mockError.status = 500;
      supabaseHelper.fetch.mockResolvedValueOnce({ data: null, error: mockError, count: null });

      const result = await patientsApi.getAll();

      expect(supabaseHelper.fetch).toHaveBeenCalledWith('client_record', {
        select: '*',
        order: { column: 'created_at', ascending: false },
        filters: [],
      });
      expect(result).toEqual({
        data: null,
        error: 'Failed to fetch',
        count: null,
        status: 500,
        statusText: 'Failed to fetch',
      });
    });

    test('should handle pagination parameters', async () => {
      const mockData = [{ id: '1', name: 'John Doe' }];
      const mockCount = 1;
      supabaseHelper.fetch.mockResolvedValueOnce({ data: mockData, error: null, count: mockCount });

      const params = { page: 2, pageSize: 10 };
      await patientsApi.getAll(params);

      expect(supabaseHelper.fetch).toHaveBeenCalledWith('client_record', {
        select: '*',
        order: { column: 'created_at', ascending: false },
        filters: [],
        range: { from: 10, to: 19 },
      });
    });

    test('should handle filter parameters', async () => {
      const mockData = [{ id: '1', name: 'John Doe' }];
      const mockCount = 1;
      supabaseHelper.fetch.mockResolvedValueOnce({ data: mockData, error: null, count: mockCount });

      const params = { filters: [{ column: 'name', operator: 'eq', value: 'John Doe' }] };
      await patientsApi.getAll(params);

      expect(supabaseHelper.fetch).toHaveBeenCalledWith('client_record', {
        select: '*',
        order: { column: 'created_at', ascending: false },
        filters: params.filters,
      });
    });
  });

  describe('getById', () => {
    test('should fetch a patient by ID successfully', async () => {
      const mockData = { id: '1', name: 'John Doe' };
      supabaseHelper.fetch.mockResolvedValueOnce({ data: mockData, error: null });

      const result = patientsApi.getById('1');

      expect(supabaseHelper.fetch).toHaveBeenCalledWith('patients', {
        select: '*',
        filters: [{ column: 'id', operator: 'eq', value: '1' }],
        single: true,
      });
      expect(result).toEqual({
        data: mockData,
        error: null,
        count: 1,
        status: 200,
        statusText: 'OK',
      });
    });

    test('should handle error when fetching a patient by ID', async () => {
      const mockError = new Error('Failed to fetch');
      mockError.status = 500;
      supabaseHelper.fetch.mockResolvedValueOnce({ data: null, error: mockError });

      const result = patientsApi.getById('1');

      expect(supabaseHelper.fetch).toHaveBeenCalledWith('patients', {
        select: '*',
        filters: [{ column: 'id', operator: 'eq', value: '1' }],
        single: true,
      });
      expect(result).toEqual({
        data: null,
        error: 'Failed to fetch',
        count: null,
        status: 500,
        statusText: 'Failed to fetch',
      });
    });

    test('should return 404 if patient not found', async () => {
      supabaseHelper.fetch.mockResolvedValueOnce({ data: null, error: null });

      const result = patientsApi.getById('non-existent-id');

      expect(supabaseHelper.fetch).toHaveBeenCalledWith('patients', {
        select: '*',
        filters: [{ column: 'id', operator: 'eq', value: 'non-existent-id' }],
        single: true,
      });
      expect(result).toEqual({
        data: null,
        error: null,
        count: 0,
        status: 404,
        statusText: 'Not Found',
      });
    });
  });

  describe('create', () => {
    test('should create a patient successfully', async () => {
      const mockPatientData = { name: 'Jane Doe' };
      const mockResponseData = [{ id: '2', ...mockPatientData }];
      supabaseHelper.insert.mockResolvedValueOnce({ data: mockResponseData, error: null });

      const result = await patientsApi.create(mockPatientData);

      expect(supabaseHelper.insert).toHaveBeenCalledWith('patients', mockPatientData, { returning: 'representation' });
      expect(result).toEqual({
        data: mockResponseData[0],
        error: null,
        count: 1,
        status: 201,
        statusText: 'Created',
      });
    });

    test('should handle error when creating a patient', async () => {
      const mockPatientData = { name: 'Jane Doe' };
      const mockError = new Error('Failed to create');
      mockError.status = 500;
      supabaseHelper.insert.mockResolvedValueOnce({ data: null, error: mockError });

      const result = await patientsApi.create(mockPatientData);

      expect(supabaseHelper.insert).toHaveBeenCalledWith('patients', mockPatientData, { returning: 'representation' });
      expect(result).toEqual({
        data: null,
        error: 'Failed to create',
        count: null,
        status: 500,
        statusText: 'Failed to create',
      });
    });
  });

  describe('update', () => {
    test('should update a patient successfully', async () => {
      const patientId = '1';
      const mockPatientData = { name: 'John Doe Updated' };
      const mockResponseData = [{ id: patientId, ...mockPatientData }];
      supabaseHelper.update.mockResolvedValueOnce({ data: mockResponseData, error: null });

      const result = await patientsApi.update(patientId, mockPatientData);

      expect(supabaseHelper.update).toHaveBeenCalledWith('patients', patientId, mockPatientData);
      expect(result).toEqual({
        data: mockResponseData[0],
        error: null,
        count: 1,
        status: 200,
        statusText: 'OK',
      });
    });

    test('should handle error when updating a patient', async () => {
      const patientId = '1';
      const mockPatientData = { name: 'John Doe Updated' };
      const mockError = new Error('Failed to update');
      mockError.status = 500;
      supabaseHelper.update.mockResolvedValueOnce({ data: null, error: mockError });

      const result = await patientsApi.update(patientId, mockPatientData);

      expect(supabaseHelper.update).toHaveBeenCalledWith('patients', patientId, mockPatientData);
      expect(result).toEqual({
        data: null,
        error: 'Failed to update',
        count: null,
        status: 500,
        statusText: 'Failed to update',
      });
    });
  });

  describe('delete', () => {
    test('should delete a patient successfully', async () => {
      const patientId = '1';
      supabaseHelper.delete.mockResolvedValueOnce({ data: [], error: null });

      const result = await patientsApi.delete(patientId);

      expect(supabaseHelper.delete).toHaveBeenCalledWith('patients', patientId);
      expect(result).toEqual({
        data: { id: patientId },
        error: null,
        count: 1,
        status: 204,
        statusText: 'No Content',
      });
    });

    test('should handle error when deleting a patient', async () => {
      const patientId = '1';
      const mockError = new Error('Failed to delete');
      mockError.status = 500;
      supabaseHelper.delete.mockResolvedValueOnce({ data: null, error: mockError });

      const result = await patientsApi.delete(patientId);

      expect(supabaseHelper.delete).toHaveBeenCalledWith('patients', patientId);
      expect(result).toEqual({
        data: null,
        error: 'Failed to delete',
        count: null,
        status: 500,
        statusText: 'Failed to delete',
      });
    });
  });
});
