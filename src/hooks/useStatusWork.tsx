import { useEffect, useState } from "react";
import {
  fetchStatusWork,
  subscribeToStatusWork,
  StatusWorkData,
} from "@/services/firebase/statusWork";

/**
 * Хук для отримання та відстеження статусу роботи з Firebase
 * @param realtime - чи використовувати real-time підписку (за замовчуванням true)
 * @returns об'єкт з даними статусу та станом завантаження
 */
export const useStatusWork = (realtime: boolean = true) => {
  const [statusWork, setStatusWork] = useState<StatusWorkData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (realtime) {
      // Real-time підписка на зміни
      const unsubscribe = subscribeToStatusWork((data) => {
        setStatusWork(data);
        setIsLoading(false);
        setError(null);
      });

      return () => {
        unsubscribe();
      };
    } else {
      // Одноразове отримання даних
      setIsLoading(true);
      fetchStatusWork()
        .then((data) => {
          setStatusWork(data);
          setError(null);
        })
        .catch((err) => {
          setError(err instanceof Error ? err : new Error(String(err)));
          setStatusWork(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [realtime]);

  return {
    statusWork,
    isLoading,
    error,
    isWorking: statusWork?.status_work ?? false,
  };
};

