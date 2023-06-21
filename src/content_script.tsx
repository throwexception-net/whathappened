import {RREventMat} from "./type/event";

const eventsMatrix: RREventMat = [[]]

console.log('content_script.tsx')

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  // if (msg.color) {
  //   console.log("Receive color = " + msg.color);
  //   document.body.style.backgroundColor = msg.color;
  //   sendResponse("Change color to " + msg.color);
  // } else {
  //   sendResponse("Color message is none.");
  // }
  if (msg.type === 'get_events') {
    sendResponse({
      success: true,
      data: eventsMatrix
    })
  }

  if (msg.type === 'send_events') {
    console.log('send_events', msg)
    window.postMessage({
      type: '_TICK:record_events',
      data: msg.data,
    })
  }
});


function handleMessage(type: string, data: any) {
  if (type === '_TICK:record_event') {
    const { event, isCheckout } = data
    if (isCheckout) {
      eventsMatrix.push([])
    }

    const lastEvents = eventsMatrix[eventsMatrix.length - 1];

    lastEvents.push(event)
    // console.log("Content script received: ", data);
  }
}

window.addEventListener("message", (event) => {
  // We only accept messages from ourselves
  if (event.source != window) {
    return;
  }

  if (typeof event.data !== 'object' || !event.data.type) {
    return;
  }

  const { type, data } = event.data

  handleMessage(type, data)
}, false);

function injectCustomJs(jsPath: string) {
  var temp = document.createElement('script');
  temp.setAttribute('type', 'text/javascript');
  // 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
  temp.src = chrome.runtime.getURL(jsPath);
  temp.onload = function () {
    // 放在页面不好看，执行完后移除掉
    // @ts-ignore
    this.parentNode.removeChild(this);
  };
  document.documentElement.append(temp);
}

injectCustomJs('js/interceptors.js')
injectCustomJs('js/injected_script.js')

window.addEventListener('beforeunload', () => {
  chrome.runtime.sendMessage({
    type: 'unload',
    data: {
      eventsMatrix,
    }
  })
})
