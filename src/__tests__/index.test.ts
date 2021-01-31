import { renderHook, act } from '@testing-library/react-hooks';
import { usePagination } from '../index';

describe('usePagination tests', () => {
  it('should be defined', () => {
    expect(usePagination).toBeDefined();
  });

  it('renders the hook correctly and checks types', () => {
    const { result } = renderHook(() => usePagination());
    expect(result.current.count).toBe(0);
    expect(typeof result.current.count).toBe('number');
    expect(typeof result.current.increment).toBe('function');
  });

  it('should increment counter', () => {
    const { result } = renderHook(() => usePagination());
    act(() => {
      result.current.increment();
    });
    expect(result.current.count).toBe(1);
  });

  it('should increment counter from custom initial value', () => {
    const { result } = renderHook(() => usePagination(10));
    act(() => {
      result.current.increment();
    });
    expect(result.current.count).toBe(11);
  });

  it('should decrement counter from custom initial value', () => {
    const { result } = renderHook(() => usePagination(20));
    act(() => {
      result.current.decrement();
    });
    expect(result.current.count).toBe(19);
  });

  it('should reset counter to updated initial value', () => {
    let initialValue = 0;
    const { result, rerender } = renderHook(() => usePagination(initialValue));
    initialValue = 10;
    rerender();
    act(() => {
      result.current.reset();
    });
    expect(result.current.count).toBe(10);
  });
});
