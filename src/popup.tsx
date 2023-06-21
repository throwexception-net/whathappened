import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {RREventMat} from "./type/event";

function getCurrentTabs() {
  return new Promise<chrome.tabs.Tab[]>((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, resolve);
  })
}

function sendMessageToTab(id: number, message: any) {
  return new Promise<{ success: boolean, data: any }>((resolve) => {
    chrome.tabs.sendMessage(id, message, (response) => {
      console.log(response)
      resolve(response)
    })
  })
}

const bgPort = chrome.runtime.connect();


const Popup = () => {
  const [count, setCount] = useState(0);
  const [currentURL, setCurrentURL] = useState<string>();

  useEffect(() => {
    chrome.action.setBadgeText({ text: count.toString() });
  }, [count]);


  useEffect(() => {
    getCurrentTabs().then((tabs) => {
      setCurrentURL(tabs[0].url);
    })
  }, []);

  const changeBackground = () => {
    getCurrentTabs().then((tabs) => {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(
          tab.id,
          {
            color: "#555555",
          },
          (msg) => {
            console.log("result message:", msg);
          },
        );
      }
    })
  };

  async function replay() {
    const [currentTab] = await getCurrentTabs()
    const { data } = await sendMessageToTab(currentTab.id!, {
      type: 'get_events',
    })

    const previewUrl = chrome.runtime.getURL('preview.html');
    const { data: prevEm } = await new Promise<{ data: RREventMat }>((resolve) => {
      chrome.runtime.sendMessage({
        type: 'get_events_matrix_by_id',
        data: currentTab.id
      }, resolve)
    })

    window.open(previewUrl, JSON.stringify([...prevEm, ...data]))
    // await sendMessageToTab(previewTab.id!, {
    //   type: 'send_events',
    //   data,
    // })
  }

  return (
    <>
      <ul style={{ minWidth: "700px" }}>
        <li>Current URL: {currentURL}</li>
        <li>Current Time: {new Date().toLocaleTimeString()}</li>
      </ul>
      <button
        onClick={() => setCount(count + 1)}
        style={{ marginRight: "5px" }}
      >
        count up
      </button>
      <button onClick={changeBackground}>change background</button>
      <button onClick={replay}>replay</button>

      <ol>

        <li></li>
      </ol>
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById("root"),
);
