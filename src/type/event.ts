import {eventWithTime} from "@rrweb/types";

export type RREvent = eventWithTime

export interface EventListItem {
  id: number
  bgId: number
  tabId: number
  content: string
  startAt: number
  endAt: number
}

export type RREventMat = any[][]


export interface TimeEvent {
  type: string
  t: number
  // 持续事件
  co: boolean
}

export interface TabEvent extends TimeEvent {
  windowId: number
  tabId: number
  tabTitle?: string
  tabFavIconUrl?: string
}


