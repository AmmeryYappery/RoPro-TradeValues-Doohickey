function createIcon(icontype) {
    const span = document.createElement('span');
    span.classList.add(icontype, 'fucking-icon');

    return span
}

function areSameLists(items, newItems) {
    for(let i = 0; i < items.length; i++) {
        if(items[i].isSameNode(newItems[i])) {
            return false;
        }
    }

    return items.length == newItems.length;
}

function addCommasToNumber(num) {
    let strNum = num.toString();

    if(strNum.length > 3) {
        for(let i = strNum.length-3; i >= 1; i -= 3) {
            strNum = strNum.substring(0, i) + ',' + strNum.substring(i);
        }
    }

    return strNum;
}

var itemsData;
var timestamp;

const TIME_TO_RESET = 60;

const port = chrome.runtime.connect();

port.onMessage.addListener((message) => {
    if(timestamp == null || new Date().getMinutes - timestamp >= TIME_TO_RESET) {
        itemsData = message;
        timestamp = new Date().getMinutes();
    }
});

var items;

function getProjHypeOrRareDiv(itemArray) {

}

function valueDiv() {
    const div = document.createElement('div');
    div.classList.add('item-card-price');
    
    const icon = createIcon('fucking-transmons-icon');
    
    const value = document.createElement('span');
    value.classList.add('text-robux', 'fucking-rolimon-value');

    div.appendChild(icon);
    div.appendChild(value);
    return div
}

async function addValueToItem(observer, newItems) {
    await itemsData;

    if(!items || !areSameLists(items,newItems)) {
        observer.disconnect();
        items = newItems;
      
        let offerValue = 0;
        let requestValue = 0;

        if(itemsData == undefined) {
            setInterval(function() {}, 100);
        }

        for(item of items) {
            if(!item.getElementsByClassName('fucking-rolimon-value').length > 0 && itemsData != undefined) {
                const id = item.getElementsByTagName('a')[0].href.match("[0-9]+")[0]; 
                const div = valueDiv();
                const itemValue = itemsData['items'][id][4];
                
                div.getElementsByClassName('fucking-rolimon-value')[0].textContent = addCommasToNumber(itemValue);
                item.appendChild(div);

                if(item.parentElement.parentElement.parentElement.tagName == "LI"){
                    console.log(itemValue);
                }
            }
        }

        observer.observe(document.body, config);
    }
}
const callback = (mutationList, observer) => {
    const newItems = document.getElementsByClassName('item-card-caption');

    addValueToItem(observer, newItems);
}


const target = document.getElementsByClassName('trades-list-detail')[0];
const config = {childList : true, subtree: true};

const observer = new MutationObserver(callback);
observer.observe(document.body, config);

port.postMessage('Recieved');
setInterval(() => {
    if(timestamp == null || new Date().getMinutes - timestamp >= TIME_TO_RESET) {
        port.postMessage('Recieved');
    } else {
        port.postMessage('Already recieved');
    }
}, 10000);
