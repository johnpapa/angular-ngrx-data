import { Observable } from 'rxjs/Observable';

/** Return an operator function that adds specified delay (in ms) to both next and error channels */
export function makeResponseDelay(delayMs: number) {
  return <T> (source: Observable<T>): Observable<T> =>
    new Observable<T>(observer => {
      let completePending = false;
      let nextPending = false;
      const subscription = source.subscribe(
        value => {
            nextPending = true;
            setTimeout(() => {
            observer.next(value);
            if (completePending) {
              observer.complete();
            }
          }, delayMs);
        },
        error => setTimeout(() => observer.error(error), delayMs),
        () => {
          completePending = true;
          if (!nextPending) {
            observer.complete();
          }
        }
      );
      return () => {
        return subscription.unsubscribe();
      };
    });
}
