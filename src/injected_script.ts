import {startRecorder} from "./recorder";

const src = document.currentScript?.getAttribute('src') || ''

if (src) {
  try {
    const u = new URL(src)
    const contendId = u.searchParams.get('contendId')
    if (contendId) {
      startRecorder(+contendId)
    }
  } catch (e) {
    //
  }
}

