// приклад хука
import { ScatterWithData } from "@/services/firebase/cubic-worlds-game/firestore-scatter-objects";
import {
  getCachedScatters,
  refreshScattersFromNetwork,
} from "@/services/indexedDbDexie/indexedDb-scatter";
import { useCallback, useEffect, useState } from "react";
import { StatusServer, useEditModeStore } from "../../store/useEditModeStore";

export function useScatters({ userUid }: { userUid?: string }) {
  const [data, setData] = useState<ScatterWithData[]>([]);
  const [loading, setLoading] = useState(true);
  const statusServer = useEditModeStore((s) => s.statusServer);
  const fetchData = useCallback(
    (mounted: boolean) => {
      getCachedScatters({ uid: userUid }).then((cached) => {
        if (!mounted) return;
        setData(cached);
        setLoading(false);
      });

      // 2   ) фонове (для UI) оновлення з бекенду + оновлення стейту, якщо є різниця
      refreshScattersFromNetwork({ uid: userUid }).then((fresh) => {
        if (!mounted) return;
        // просте порівняння за довжиною/updatedAt; за потреби зроби глибше порівняння
        console.log("fresh", fresh);
        console.log("data", data);
        const hasChange =
          fresh.length !== data.length ||
          fresh.some(
            (f, i) =>
              f.name !== data[i]?.name || f.updatedAt !== data[i]?.updatedAt
          );
        console.log("hasChange", hasChange);
        if (hasChange) setData(fresh);
      });
    },
    [userUid]
  );

  useEffect(() => {
    let mounted = true;
    // 1) миттєво кеш
    fetchData(mounted);
    return () => {
      mounted = false;
    };
  }, [fetchData]);

  useEffect(() => {
    if (statusServer === StatusServer.loaded) {
      fetchData(true);
    }
  }, [statusServer, fetchData]);

  return {
    data,
    loading,
    refetch: () => refreshScattersFromNetwork({ uid: userUid }).then(setData),
  };
}
