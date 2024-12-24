let key = "baidu_search_result_filter";

chrome.runtime.onMessage.addListener(onReceiveMessage);

async function onReceiveMessage(request, sender, sendResponse) {
  try {
    if (request.load !== true) return;
    sendResponse({ success: true });

    let message = { message: key, data: await getStorage() };
    let tabs = await chrome.tabs.query({ active: true });
    await sendMessage(tabs[0].id, message);
    injectCss();
  } catch (e) {
    console.log(e);
  }
}

async function getStorage() {
  let result = await chrome.storage.local.get(key);
  let data = result[key];
  return { ad: data?.ad ?? true, csdn: data?.csdn ?? true };
}

async function sendMessage(tabId, message) {
  let response = await chrome.tabs.sendMessage(tabId, message);
  console.log('sendMessage', tabId, message, response);
}

async function injectCss() {
  chrome.tabs.query({ active: true }, (tabs) => {
    const tabId = tabs[0].id;
    if (tabId) {
      const css = `
      div[result_filter='true'] {
          height: 0;
          overflow: hidden;
      }
    `;
      chrome.scripting.insertCSS({
        target: { tabId: tabId },
        css: css
      }).then(() => {
        console.log('CSS样式已成功注入');
      }).catch((error) => {
        console.error('注入CSS时出错:', error);
      });
    }
  });
}