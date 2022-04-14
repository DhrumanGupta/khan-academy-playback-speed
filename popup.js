let rangeText = document.getElementById("rangeText");
let slider = document.getElementById("playbackSlider");
let resetButton = document.getElementById("resetButton");

const lowerPlaybackLimit = 0;
const upperPlaybackLimit = 16;

//speed is float
async function setSpeed(speed) {
  options.speed = speed;
  slider.value = speed;
  let valueString = speed.toString();
  if (valueString.indexOf(".") == -1) valueString += ".0";
  rangeText.value = valueString;
  updatePlaybackSpeed(speed);
  await chrome.storage.sync.set({ options });
}

function getPlaybackSpeed() {
  console.log("getting playback speed");
  chrome.tabs.query({ active: true, status: "complete" }, (tabs) => {
    if (tabs.length == 0) {
      setTimeout(getPlaybackSpeed, 100);
      return;
    }
    chrome.tabs.sendMessage(tabs[0].id, { message: "get playback speed" });
  });
}
getPlaybackSpeed();

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.message == "current speed") {
    await setSpeed(request.speed);
  }
});

resetButton.addEventListener("click", async () => {
  await setSpeed(1.0);
});

rangeText.addEventListener("keydown", async (e) => {
  if (e.key != "Enter") return;
  let value = parseFloat(rangeText.value);
  value = Math.round(value * 10) / 10;
  if (value < lowerPlaybackLimit) value = lowerPlaybackLimit;
  if (value > upperPlaybackLimit) value = upperPlaybackLimit;
  await setSpeed(value);
});

slider.addEventListener("input", (e) => {
  setSpeed(slider.value);
});

let options = { speed: 1.0 };
slider.value = options.speed;
rangeText.value = slider.value;
document.addEventListener("DOMContentLoaded", async () => {
  const result = await chrome.storage.sync.get("options");
  Object.assign(options, result ? result.options : { speed: 1.0 });
  slider.value = options.speed;
  rangeText.value = slider.value;
  await setSpeed(options.speed);
});
async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function updatePlaybackSpeed(speed) {
  const tab = await getCurrentTab();
  //   console.log(tab);
  chrome.tabs.sendMessage(tab.id, {
    message: "set playback speed",
    speed: speed,
  });
}
