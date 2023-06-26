import { customAlphabet } from 'nanoid'

export enum NidType {
  BACKGROUND = 10,
  CONTENT = 11,
  CHECKOUT = 12,
}

const n14 = customAlphabet('123456789', 14)
export const genNid = (type: NidType) => +`${type}${n14()}`
