import TabTracker from "./TabTracker";
import {BackgroundDb} from "./db";
import {genNid, NidType} from "../utils/id";

const sid = genNid(NidType.BACKGROUND)
const db = new BackgroundDb(sid)
db.cleanUpLeaked()

const tracker = new TabTracker()
tracker.install()

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const { type, data } = request
  console.log('收到消息：', type, data);

  if (type === 'event_list_checkout' && sender.tab?.id) {
    const tabId: number = sender.tab.id

    db.addCheckout(data.checkoutId, tabId, data.list)

    // tracker.appendRRDataStoreForTab(tabId, data.eventsMatrix)
    // console.log('events', tracker.events)
  }

  if (type === 'get_events_matrix_by_id') {
    sendResponse({
      success: true,
      data: tracker.getRRDataStoreByTabId(data) || []
    })
  }
});

// @ts-ignore
global.getEventsMatrixByTabId = (tabId: number) => {
  return tracker.getRRDataStoreByTabId(tabId)
}

// @ts-ignore
global.getTabEvents = () => {
  return tracker.events
}

// @ts-ignore
global.backgroundDb = db
