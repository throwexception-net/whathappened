import TabTracker from "./TabTracker";

const tracker = new TabTracker()
tracker.install()

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const { type, data } = request
  console.log('收到消息：', type, data);

  if (type === 'unload' && sender.tab?.id) {
    const tabId: number = sender.tab.id

    tracker.appendRRDataStoreForTab(tabId, data.eventsMatrix)
    console.log('events', tracker.events)
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



