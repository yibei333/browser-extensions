let key = "baidu_search_result_filter";
let className = "result_filter";
let data = { ad: true, csdn: true };

function isBaidu() {
    let host = location.host;
    return host === "baidu.com" || host === "www.baidu.com";
}

function process() {
    if (!isBaidu()) return;
    // console.log(`${new Date().getTime()} process`, data);
    hidden_ad();
    hidden_csdn();
    setTimeout(function () {
        //等待广告商加载完成，广告无孔不入
        hidden_ad();
        hidden_csdn();
    }, 1000);
}

function hidden_ad() {
    document.querySelectorAll(".result").forEach(x => {
        if (x.innerText.endsWith("广告")) {
            processClass(x, data.ad);
        }
    });

    document.querySelectorAll(".gp2k11k").forEach(x => {
        processClass(x, data.ad);
    });

    document.querySelectorAll(".se_st_footer").forEach(x => {
        if (x.innerText.endsWith("广告")) {
            processClass(x, data.ad);
        }
    })
}

function hidden_csdn() {
    let items = [...document.querySelectorAll("div[mu]")];
    items.filter(x => x.getAttribute('mu').indexOf('https://blog.csdn.net') >= 0 || x.getAttribute('mu').indexOf('https://m.blog.csdn.net') >= 0).forEach(x => {
        processClass(x, data.csdn);
    });
}

function processClass(target, flag) {
    if (flag) {
        target.setAttribute(className, true);
    } else {
        target.removeAttribute(className);
    }
}

window.addEventListener("load", () => {
    if (!isBaidu()) return;
    chrome.runtime.sendMessage({ load: true });


    const targetNode = document.getElementById('wrapper');
    const callback = (mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                //子节点发生变化
                process();
            } else if (mutation.type === 'characterData') {
                //文本内容发生变化
                process();
            }
        }
    };
    const observer = new MutationObserver(callback);
    const config = {
        childList: true,
        characterData: true
    }
    observer.observe(targetNode, config);
});

chrome.runtime.onMessage.addListener(onReceiveMessage);

function onReceiveMessage(request, sender, sendResponse) {
    if (request.message === key) {
        data = request.data;
        process();
    }
    sendResponse({ success: true });
    return true;
}