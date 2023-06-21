import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import 'rrweb-player/dist/style.css';
import rrwebPlayer from 'rrweb-player'

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {

  if (msg.type === 'send_events') {
    console.log('send_events', msg)
  }
});

function Preview() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const data = JSON.parse(window.name)

    const events = []

    for (const item of data) {
      events.push(...item)
    }
    if (ref.current) {
      const player = new rrwebPlayer({
        target: ref.current,
        props: {
          events,
        }
      })
      player.play()
    }
    // function onMessage(event: MessageEvent) {
    //   if (event.source != window) {
    //     return;
    //   }
    //
    //   if (typeof event.data !== 'object' || !event.data.type) {
    //     return;
    //   }
    //
    //   const { type, data } = event.data
    //
    //   if (type === '_TICK:record_events') {
    //     console.log('_TICK:record_events', data)
    //
    //
    //   }
    // }
    //
    // console.log('event', window.name)
    // window.addEventListener('message', onMessage)
    // return () => {
    //   window.removeEventListener('message', onMessage)
    // }
  }, [])

  return (
    <div ref={ref}>
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <Preview />
  </React.StrictMode>,
  document.getElementById("root")
);
