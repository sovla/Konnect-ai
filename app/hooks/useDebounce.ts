/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useCallback, useState, useEffect } from 'react';

/**
 * 함수 호출을 지연시키는 디바운스 훅
 * @param callback 실행할 함수
 * @param delay 지연 시간 (밀리초)
 * @returns 디바운싱된 함수
 */
export function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number): any {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );
}

/**
 * 값 변경을 지연시키는 디바운스 훅
 * @param value 디바운싱할 값
 * @param delay 지연 시간 (밀리초)
 * @returns 디바운싱된 값
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
