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

//item-card-link -- limited-icon-container
function getProjHypeOrRareDiv(itemArray) {

}

function valueDiv(tagsToAdd, itemValue, textClass) {
    const div = document.createElement('div');
    div.classList.add('item-card-price');
    
    const icon = createIcon('fucking-transmons-icon');
    
    const value = document.createElement('span');
    value.innerText = itemValue;
    value.classList.add(textClass, 'fucking-rolimon-value');
    // const div2 = document.createElement('div');

    // const icon2 = createIcon('fucking-projected-icon');
    // const rare = createIcon('fucking-rare-icon');
    // const hype = createIcon('fucking-hype-icon');

    // div2.appendChild(icon2);
    // div2.appendChild(rare);
    // div2.appendChild(hype);
    
    div.appendChild(icon);
    div.appendChild(value);
    // div.appendChild(div2);

    

    return div
}

var offers;
// trade-list-detail-offer
// item-card-caption'
async function addValueToItem(observer, newOffers) {
    if(!offers || !areSameLists(offers, newOffers)) {
        observer.disconnect();
        offers = newOffers;

        let offerValue = 0;
        let requestValue = 0;

        if(itemsData == undefined) {
            let intId = setInterval(function() {
                if(itemsData != undefined) {
                    clearInterval(intId);
                }
            }, 100);
        }

        for(offer of offers) {
            const items = offer.getElementsByClassName('item-card-caption');
            const isGivingSide = offer.getElementsByClassName('trade-list-detail-offer-header')[0].innerText.includes("give"); 

            for(item of items) {
                if(!item.getElementsByClassName('fucking-rolimon-value').length > 0 && itemsData != undefined) {
                    const id = item.getElementsByTagName('a')[0].href.match("[0-9]+")[0]; // Only one link so it will be the first index.
                    const itemValue = itemsData['items'][id][4];
                    const div = valueDiv([], addCommasToNumber(itemValue), 'text-robux');
                    
                    item.appendChild(div);
    
                    if(isGivingSide){
                        offerValue += itemValue;
                    } else {
                        requestValue += itemValue;
                    }
                }
            }

            const robuxLine = offer.getElementsByClassName('robux-line-amount')[1];

            if(robuxLine.getElementsByClassName('fucking-rolimon-value').length < 1) {
                console.log(robuxLine);
                var value = offerValue;
    
                if(!isGivingSide) { value = requestValue; }
    
                const totalValue = valueDiv([], addCommasToNumber(value), 'text-robux-lg');
                robuxLine.appendChild(totalValue);
            }
        }
        

        observer.observe(document.body, config);
    }
}
const callback = (mutationList, observer) => {
    const newItems = document.getElementsByClassName('trade-list-detail-offer');

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
