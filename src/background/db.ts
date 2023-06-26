import Dexie from "dexie";
import {EventListItem, RREvent} from "../type/event";
import {compressToUTF16} from "lz-string";

export class BackgroundDb extends Dexie {
  eventListTable!: Dexie.Table<EventListItem, number>

  static makeEventListItem(checkoutId: number, bgId: number, tabId: number, list: RREvent[]): EventListItem | null {
    if (!list[0]) {
      return null
    }
    return {
      id: checkoutId,
      bgId,
      tabId,
      startAt: list[0]?.timestamp || 0,
      endAt: list[list.length - 1]?.timestamp || 0,
      content: compressToUTF16(JSON.stringify(list))
    }
  }

  constructor(private bgId: number) {
    super(`__what_happened_background_idb`);
    this.version(2).stores({
      eventListTable: 'id,bgId,tabId,startAt,endAt',
    });
  }

  async addCheckout(checkoutId: number, tabId: number, list: RREvent[]) {
    const item = BackgroundDb.makeEventListItem(checkoutId, this.bgId, tabId, list)
    if (item) {
      await this.eventListTable.put(item)
    }
  }

  cleanUpLeaked() {
    try {
      return this.eventListTable.where('bgId').notEqual(this.bgId).delete()
    } catch (e) {
      return this.eventListTable.clear()
    }
  }

  recycle(before: number) {
    return this.eventListTable.where('endAt').below(before).delete()
  }
}


