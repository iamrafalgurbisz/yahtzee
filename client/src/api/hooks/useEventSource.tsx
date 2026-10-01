import { useEffect, useEffectEvent } from "react";
import type { EventMap, EventType } from "@shared/types/events";

type Handlers = { [T in EventType]?: (data: EventMap[T]) => void };

export function useEventSource(path: string | null, handlers: Handlers) {
  const onEvent = useEffectEvent((type: EventType, data: unknown) => {
    (handlers[type] as ((data: unknown) => void) | undefined)?.(data);
  });

  const types = Object.keys(handlers).sort().join(",");

  useEffect(() => {
    if (!path || !types) return;

    const es = new EventSource(`${import.meta.env.VITE_API_URL}${path}`, {
      withCredentials: true,
    });

    const listeners = (types.split(",") as EventType[]).map((type) => {
      const listener = (e: MessageEvent<string>) =>
        onEvent(type, JSON.parse(e.data));
      es.addEventListener(type, listener);
      return [type, listener] as const;
    });

    return () => {
      listeners.forEach(([type, listener]) =>
        es.removeEventListener(type, listener),
      );
      es.close();
    };
  }, [path, types]);
}
