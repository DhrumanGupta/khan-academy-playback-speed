// let video;

async function urlChangeEvent() {
  let video = document.getElementsByTagName("video")[0];
  if (video) {
    video.playbackRate = +(await chrome.storage.sync.get(["playbackSpeed"]))
      .playbackSpeed;
  }
}

// let lastURL = async () => (await chrome.storage.sync.get(["lastURL"])).lastURL;
// async function checkURL() {
//   if (location.href !== (await lastURL())) {
//     await urlChangeEvent();
//     await chrome.storage.sync.set({ lastURL: location.href });
//   }
// }
setInterval(urlChangeEvent, 2000);
// checkURL();

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  let video = document.getElementsByTagName("video")[0];
  if (message.message == "set playback speed") {
    chrome.storage.sync.set({ playbackSpeed: message.speed }, console.log);
    let speed = message.speed;
    if (speed > 16 || speed < 0) {
      return;
    }
    if (video === undefined) {
      return;
    }
    video.playbackRate = speed;
  } else if (message.message == "get playback speed") {
    let intervalHandler = setInterval(() => {
      if (video === undefined) return;
      chrome.runtime.sendMessage({
        message: "current speed",
        speed: video.playbackRate,
      });
      clearInterval(intervalHandler);
    }, 100);
  }
});
