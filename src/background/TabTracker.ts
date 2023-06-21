import {RREventMat, TabEvent} from "../type/event";
import Tab = chrome.tabs.Tab;

export default class TabTracker {
  tabRRDataStore = new Map<number, any>()
  events: TabEvent[] = []

  onWindowFocusChanged = async (windowId: number) => {
    console.log('onWindowFocusChanged', new Date(), windowId)
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
      const lastEvent = this.events[this.events.length - 1]
      if (lastEvent?.type !== 'blur') {
        this.events.push({
          co: true,
          t: Date.now(),
          type: 'blur',
          tabId: chrome.tabs.TAB_ID_NONE,
          windowId,
        })
      }
    } else {
      const tab = await chrome.tabs.getCurrent()
      if (tab?.id) {
        this.events.push({
          co: true,
          t: Date.now(),
          type: 'active',
          tabId: tab.id,
          windowId,
          tabTitle: tab.title,
          tabFavIconUrl: tab.favIconUrl,
        })
      }
    }
  }

  onTabRemoved = async (tabId: number, removeInfo: { windowId: number, isWindowClosing: boolean }) => {
    this.events.push({
      co: false,
      t: Date.now(),
      type: 'remove',
      tabId,
      windowId: removeInfo.windowId,
    })

    console.log('onTabRemoved', tabId, removeInfo);
    if (this.tabRRDataStore.has(tabId)) {
      this.tabRRDataStore.delete(tabId)
    }
  }

  appendRRDataStoreForTab(tabId: number, data: RREventMat) {
    let list: any[]
    if (this.tabRRDataStore.has(tabId)) {
      list = this.tabRRDataStore.get(tabId)
    } else {
      list = []
      this.tabRRDataStore.set(tabId, list)
    }

    for (const events of data) {
      list.push(events)
    }
  }

  getRRDataStoreByTabId(tabId: number) {
    return this.tabRRDataStore.get(tabId)
  }

  onTabUpdated = () => (tabId: number, changeInfo: object, tab: Tab) => {
    console.log('onUpdated', tabId, changeInfo, tab)
  }

  onTabActivated = async (activeInfo: { tabId: number, windowId: number }) => {
    const tab = await chrome.tabs.get(activeInfo.tabId)

    if (tab) {
      this.events.push({
        co: true,
        t: Date.now(),
        type: 'active',
        tabId: activeInfo.tabId,
        windowId: activeInfo.windowId,
        tabTitle: tab.title,
        tabFavIconUrl: tab.favIconUrl
      })
    }

    console.log('onTabActivated', activeInfo)
  }

  onTabCreated = (tab: Tab) => {
    console.log('onTabCreated', tab)
    if (tab.id) {
      this.events.push({
        co: true,
        t: Date.now(),
        type: 'create',
        tabId: tab.id,
        windowId: tab.windowId,
        tabTitle: tab.title,
        tabFavIconUrl: tab.favIconUrl,
      })
    }
  }


  install() {
    chrome.tabs.onUpdated.addListener(this.onTabUpdated)
    chrome.tabs.onRemoved.addListener(this.onTabRemoved)
    chrome.tabs.onActivated.addListener(this.onTabActivated)
    chrome.tabs.onCreated.addListener(this.onTabCreated)
    chrome.windows.onFocusChanged.addListener(this.onWindowFocusChanged)
  }

  uninstall() {
    chrome.tabs.onUpdated.removeListener(this.onTabUpdated)
    chrome.tabs.onRemoved.removeListener(this.onTabRemoved)
    chrome.tabs.onActivated.removeListener(this.onTabActivated)
    chrome.tabs.onCreated.addListener(this.onTabCreated)
    chrome.windows.onFocusChanged.removeListener(this.onWindowFocusChanged)
  }
}
