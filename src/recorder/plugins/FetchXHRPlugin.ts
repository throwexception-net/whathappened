import type {RecordPlugin} from "@rrweb/types";
import fetchxhrInterceptor from "../../interceptors/fetchxhrInterceptor";

interface Options {
}

export function getFetchXHRPlugin(): RecordPlugin<any> {
  return {
    name: '@whathappened/fetchxhr',
    observer(cb, win, options) {
      const interceptor = fetchxhrInterceptor({
        emit(name: string, payload) {
          cb({
            name,
            ...payload,
          });
          console.log('fetchxhrInterceptor', name, payload)
        }
      })

      return () => interceptor.release();
    },
    options: {

    }
  }
}
