import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should return initial value when localStorage is empty', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    expect(result.current[0]).toBe('initial');
  });

  it('should return stored value from localStorage', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify('stored-value'));
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    expect(result.current[0]).toBe('stored-value');
  });

  it('should update value and save to localStorage', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]('new-value');
    });
    
    expect(result.current[0]).toBe('new-value');
    expect(localStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'));
  });

  it('should support function updates', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(5));
    
    const { result } = renderHook(() => useLocalStorage('test-key', 0));
    
    act(() => {
      result.current[1]((prev) => prev + 1);
    });
    
    expect(result.current[0]).toBe(6);
  });

  it('should handle objects', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
    const initialValue = { name: 'test', count: 0 };
    
    const { result } = renderHook(() => useLocalStorage('test-key', initialValue));
    
    act(() => {
      result.current[1]({ name: 'updated', count: 1 });
    });
    
    expect(result.current[0]).toEqual({ name: 'updated', count: 1 });
  });

  it('should handle arrays', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
    
    const { result } = renderHook(() => useLocalStorage<string[]>('test-key', []));
    
    act(() => {
      result.current[1]((prev) => [...prev, 'item1']);
    });
    
    expect(result.current[0]).toEqual(['item1']);
  });

  it('should handle JSON parse errors gracefully', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue('invalid-json');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    
    expect(result.current[0]).toBe('default');
    consoleSpy.mockRestore();
  });
});

