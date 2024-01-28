import {EMPTY, Observable, Subscription, Subject, BehaviorSubject} from "rxjs";

/**
 * @param context {(next: (data: any) => void, error: (error: Error) => void, done: (data: any) => void}
 * @return {Observable<any>}
 */
export function createObservableStream(context) {
  return new Observable((subscriber) => {
    const [next, error, done] = [
      (data) => {
        subscriber.next(data);
      },
      (error) => {
        subscriber.error(error);
        done();
      },
      () => {
        subscriber.complete()
      },
    ];
    context(next, error, done);
  });
}

/**
 * @param observable {Subscription|Observable|Subject|BehaviorSubject}
 * @return Promise
 */
export function toPromise(observable) {
  return new Promise((resolve, reject) => {
    let [ data, error ] = [null, null];
    (!observable.closed ? observable : EMPTY).subscribe({
      next: _ => data = _,
      error: _ => {
        error = _;
        reject(_);
      },
      complete: () => !error && resolve(data)
    });
  });
}