let key = "baidu_search_result_filter";

window.onload = function () {
  init();
  document.querySelectorAll('input').forEach(x => x.addEventListener('change', configChange));
};

async function init() {
  let storage = await getStorage();
  document.getElementById("ad").checked = storage.ad;
  document.getElementById("csdn").checked = storage.csdn;
}

async function getStorage() {
  let result = await chrome.storage.local.get(key);
  let data = result[key];
  return { ad: data?.ad ?? true, csdn: data?.csdn ?? true };
}

async function setStorage(storage) {
  await new Promise((resolve) => {
    chrome.storage.local.set(storage, function () {
      resolve();
    });
  });
}

async function configChange() {
  let storage = {};
  let data = { ad: document.getElementById("ad").checked, csdn: document.getElementById("csdn").checked };
  storage[key] = data;
  await setStorage(storage);
  let message = { message: key, data: data };
  await sendMessage(message);
}

async function sendMessage(message) {
  let tabId = await getTabId();
  await new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, function (response) {
      resolve(response);
    });
  });
}

async function getTabId() {
  let tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0].id;
}