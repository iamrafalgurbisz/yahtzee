import { Injectable, MessageEvent } from "@nestjs/common";
import type { EventMap, EventType } from "@shared/types/events";
import { filter, interval, map, merge, Observable, Subject } from "rxjs";

type BusEvent = { topic: string; type: EventType; data: EventMap[EventType] };

@Injectable()
export class EventsService {
  private readonly bus$ = new Subject<BusEvent>();

  publish<T extends EventType>(topic: string, type: T, data: EventMap[T]) {
    this.bus$.next({ topic, type, data });
  }

  stream(topic: string): Observable<MessageEvent> {
    return merge(
      this.bus$.pipe(
        filter((e) => e.topic === topic),
        map((e) => ({ type: e.type, data: e.data })),
      ),
      interval(25_000).pipe(map(() => ({ type: "ping", data: "" }))),
    );
  }
}
