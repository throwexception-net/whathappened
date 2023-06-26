import {injectAllJs, listenContentEvent} from "./content";
import {genNid, NidType} from "./utils/id";

const contentId = genNid(NidType.CONTENT)

listenContentEvent(contentId)
injectAllJs(contentId)
