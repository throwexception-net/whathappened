// @ts-ignore
import record from 'rrweb/es/rrweb/packages/rrweb/src/record'
import type { record as RecordFn } from 'rrweb'
// import {getFetchXHRPlugin} from "./plugins/FetchXHRPlugin";
const startRecord: typeof RecordFn = record

export function startRecorder(contendId: number) {
  console.log('start record')

  startRecord({
    emit(event, isCheckout) {
      const ev = new CustomEvent(`__what_happened_ev_${contendId}`, {
        detail: {
          type: 'record_event',
          payload: {
            event,
            isCheckout: !!isCheckout
          }
        }
      })
      window.dispatchEvent(ev)
    },
    checkoutEveryNth: 800,
    plugins: [
      // getFetchXHRPlugin()
    ],
  })
}

