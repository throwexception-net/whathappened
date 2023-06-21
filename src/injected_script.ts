// @ts-ignore
import record from 'rrweb/es/rrweb/packages/rrweb/src/record'
import type { record as RecordFn } from 'rrweb'
const startRecord: typeof RecordFn = record

console.log('start record')

startRecord({
  // @ts-ignore
  emit(event, isCheckout) {
    window.postMessage({ type: "_TICK:record_event", data: { event, isCheckout } }, "*");
  },
  checkoutEveryNms: 5 * 60 * 1000,
})
