import {RREvent, RREventMat} from "../type/event";
import {genNid, NidType} from "../utils/id";

export function injectAllJs(contentId: number) {
  function injectCustomJs(jsPath: string) {
    const scriptElement = document.createElement('script');
    scriptElement.setAttribute('type', 'text/javascript');
    scriptElement.src = chrome.runtime.getURL(jsPath) + `?contendId=${contentId}`;
    scriptElement.onload = function () {
      // @ts-ignore
      this.parentNode.removeChild(this);
    };
    document.documentElement.append(scriptElement);
  }

  injectCustomJs('js/interceptors.js')
  injectCustomJs('js/injected_script.js')
}

export function listenContentEvent(contentId: number) {
  const eventsMatrix: RREventMat = [[]]

  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.type === 'get_events') {
      sendResponse({
        success: true,
        data: eventsMatrix
      })
    }
  });

  let currentEventList: RREvent[] = []
  let checkoutId = genNid(NidType.CHECKOUT)
  function recordEvent(event: RREvent, isCheckout: boolean) {
    if (isCheckout) {
      try {
        chrome.runtime.sendMessage({
          type: 'event_list_checkout',
          data: {
            contentId,
            checkoutId,
            by: 'checkout',
            list: currentEventList,
          }
        })
      } catch (e) {
        // nothing
      }
      currentEventList = []
      checkoutId = genNid(NidType.CHECKOUT)
    }

    currentEventList.push(event)
  }

  window.addEventListener(`__what_happened_ev_${contentId}`, (event) => {
    const { type, payload } = (event as CustomEvent).detail || {}
    if (type === 'record_event') {
      const { event, isCheckout } = payload
      console.log('record_event', event, isCheckout)
      recordEvent(event, isCheckout)
    }
  })

  window.addEventListener('beforeunload', () => {
    try {
      chrome.runtime.sendMessage({
        type: 'event_list_checkout',
        data: {
          contentId,
          checkoutId,
          by: 'beforeunload',
          list: currentEventList,
        }
      })
    } catch (e) {
      // nothing
    }
  })

  window.addEventListener('unload', () => {
    try {
      chrome.runtime.sendMessage({
        type: 'event_list_checkout',
        data: {
          contentId,
          checkoutId,
          by: 'unload',
          list: currentEventList,
        }
      })
    } catch (e) {
      // nothing
    }
  })
}


