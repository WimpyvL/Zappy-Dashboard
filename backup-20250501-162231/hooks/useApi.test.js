import { renderHook, act } from '@testing-library/react';
import { useApi, useCrud } from './useApi';
import errorHandling from '../utils/errorHandling';

// Mock the errorHandling utility
jest.mock('../utils/errorHandling', () => ({
  logError: jest.fn(),
  handleSpecialErrors: jest.fn().mockReturnValue(false),
  getErrorMessage: jest.fn(error => error.message || 'Unknown error'),
  getFormErrors: jest.fn().mockReturnValue({}),
}));

describe('useApi Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize with default values', () => {
    const { result } = renderHook(() => useApi());
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });

  test('should handle successful API call', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockApiFunction = jest.fn().mockResolvedValue(mockData);
    
    const { result } = renderHook(() => useApi());
    
    let apiResult;
    await act(async () => {
      apiResult = await result.current.execute(mockApiFunction);
    });
    
    expect(mockApiFunction).toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual(mockData);
    expect(apiResult).toEqual({ success: true, data: mockData });
  });

  test('should handle API error', async () => {
    const mockError = new Error('Test error');
    const mockApiFunction = jest.fn().mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useApi());
    
    let apiResult;
    await act(async () => {
      apiResult = await result.current.execute(mockApiFunction);
    });
    
    expect(mockApiFunction).toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Test error');
    expect(result.current.data).toBeNull();
    expect(errorHandling.logError).toHaveBeenCalledWith(mockError, 'API call');
    expect(apiResult).toEqual({
      success: false,
      error: 'Test error',
      formErrors: {}
    });
  });

  test('should use custom error message when provided', async () => {
    const mockError = new Error();
    errorHandling.getErrorMessage.mockReturnValueOnce(null); // Simulate no error message from the error
    const mockApiFunction = jest.fn().mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useApi());
    
    let apiResult;
    await act(async () => {
      apiResult = await result.current.execute(mockApiFunction, [], { 
        errorMessage: 'Custom error message' 
      });
    });
    
    expect(result.current.error).toBe('Custom error message');
    expect(apiResult.error).toBe('Custom error message');
  });

  test('should reset data when resetData option is true', async () => {
    const mockData1 = { id: 1, name: 'First' };
    const mockData2 = { id: 2, name: 'Second' };
    const mockApiFunction1 = jest.fn().mockResolvedValue(mockData1);
    const mockApiFunction2 = jest.fn().mockResolvedValue(mockData2);
    
    const { result } = renderHook(() => useApi());
    
    // First call to set initial data
    await act(async () => {
      await result.current.execute(mockApiFunction1);
    });
    
    expect(result.current.data).toEqual(mockData1);
    
    // Second call with resetData option
    await act(async () => {
      await result.current.execute(mockApiFunction2, [], { resetData: true });
    });
    
    expect(result.current.data).toEqual(mockData2);
  });

  test('should clear error when clearError is called', async () => {
    const mockError = new Error('Test error');
    const mockApiFunction = jest.fn().mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useApi());
    
    await act(async () => {
      await result.current.execute(mockApiFunction);
    });
    
    expect(result.current.error).not.toBeNull();
    
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBeNull();
  });

  test('should clear data when clearData is called', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockApiFunction = jest.fn().mockResolvedValue(mockData);
    
    const { result } = renderHook(() => useApi());
    
    await act(async () => {
      await result.current.execute(mockApiFunction);
    });
    
    expect(result.current.data).not.toBeNull();
    
    act(() => {
      result.current.clearData();
    });
    
    expect(result.current.data).toBeNull();
  });

  test('should reset all state when reset is called', async () => {
    const mockError = new Error('Test error');
    const mockApiFunction = jest.fn().mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useApi());
    
    // Set loading manually since it's usually reset in the finally block
    await act(async () => {
      result.current.execute(mockApiFunction);
    });
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });
});

describe('useCrud Hook', () => {
  const mockResource = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  
  const mockItems = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize with default values', () => {
    const { result } = renderHook(() => useCrud(mockResource, 'test'));
    
    expect(result.current.list).toEqual([]);
    expect(result.current.item).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('should fetch all items successfully', async () => {
    mockResource.getAll.mockResolvedValue(mockItems);
    
    const { result } = renderHook(() => useCrud(mockResource, 'test'));
    
    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.fetchAll();
    });
    
    expect(mockResource.getAll).toHaveBeenCalled();
    expect(result.current.list).toEqual(mockItems);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(fetchResult).toEqual({ success: true, data: mockItems });
  });

  test('should handle error when fetching all items', async () => {
    const mockError = new Error('Fetch error');
    mockResource.getAll.mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useCrud(mockResource, 'test'));
    
    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.fetchAll();
    });
    
    expect(mockResource.getAll).toHaveBeenCalled();
    expect(result.current.list).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Fetch error');
    expect(errorHandling.logError).toHaveBeenCalledWith(mockError, 'test.fetchAll');
    expect(fetchResult).toEqual({
      success: false,
      error: 'Fetch error',
      formErrors: {}
    });
  });

  test('should fetch an item by ID successfully', async () => {
    const mockItem = mockItems[0];
    mockResource.getById.mockResolvedValue(mockItem);
    
    const { result } = renderHook(() => useCrud(mockResource, 'test'));
    
    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.fetchById(1);
    });
    
    expect(mockResource.getById).toHaveBeenCalledWith(1);
    expect(result.current.item).toEqual(mockItem);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(fetchResult).toEqual({ success: true, data: mockItem });
  });

  test('should create an item successfully', async () => {
    const newItem = { id: 3, name: 'New Item' };
    mockResource.create.mockResolvedValue(newItem);
    
    const { result } = renderHook(() => useCrud(mockResource, 'test'));
    
    // Pre-populate the list
    act(() => {
      result.current.list = [...mockItems];
    });
    
    let createResult;
    await act(async () => {
      createResult = await result.current.create({ name: 'New Item' });
    });
    
    expect(mockResource.create).toHaveBeenCalledWith({ name: 'New Item' });
    expect(result.current.list).toEqual([...mockItems, newItem]);
    expect(result.current.item).toEqual(newItem);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(createResult).toEqual({ success: true, data: newItem });
  });

  test('should update an item successfully', async () => {
    const updatedItem = { id: 1, name: 'Updated Item' };
    mockResource.update.mockResolvedValue(updatedItem);
    
    const { result } = renderHook(() => useCrud(mockResource, 'test'));
    
    // Pre-populate the list and current item
    act(() => {
      result.current.list = [...mockItems];
      result.current.item = mockItems[0];
    });
    
    let updateResult;
    await act(async () => {
      updateResult = await result.current.update(1, { name: 'Updated Item' });
    });
    
    expect(mockResource.update).toHaveBeenCalledWith(1, { name: 'Updated Item' });
    expect(result.current.list[0]).toEqual(updatedItem);
    expect(result.current.item).toEqual(updatedItem);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(updateResult).toEqual({ success: true, data: updatedItem });
  });

  test('should delete an item successfully', async () => {
    mockResource.delete.mockResolvedValue();
    
    const { result } = renderHook(() => useCrud(mockResource, 'test'));
    
    // Pre-populate the list and current item
    act(() => {
      result.current.list = [...mockItems];
      result.current.item = mockItems[0];
    });
    
    let deleteResult;
    await act(async () => {
      deleteResult = await result.current.remove(1);
    });
    
    expect(mockResource.delete).toHaveBeenCalledWith(1);
    expect(result.current.list).toEqual([mockItems[1]]);
    expect(result.current.item).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(deleteResult).toEqual({ success: true });
  });

  test('should clear error when clearError is called', async () => {
    const mockError = new Error('Test error');
    mockResource.getAll.mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useCrud(mockResource, 'test'));
    
    await act(async () => {
      await result.current.fetchAll();
    });
    
    expect(result.current.error).not.toBeNull();
    
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBeNull();
  });
});