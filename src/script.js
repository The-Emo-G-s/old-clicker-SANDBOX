/* eslint-disable no-alert */

function updateCoffeeView(coffeeQty) {
  document.querySelector('#coffee_counter').innerText = coffeeQty.toLocaleString('en-us'); //Thanks for teaching me the fancy number format, https://sabe.io/blog/javascript-format-numbers-commas#:~:text=The%20best%20way%20to%20format,format%20the%20number%20with%20commas. You're a real pal!
}

function clickCoffee(data) {
  data.coffee++;
  updateCoffeeView(data.coffee)
  if (data.coffee%5 === 0) {
    unlockProducers(data.producers, data.coffee);
    renderProducers(data);
  }
}

function unlockProducers(producers, coffeeCount) {
  producers.forEach((obj) => {
    if (coffeeCount >= obj.price/2) {
      obj.unlocked = true;
    }
  })
  return;
}

function getUnlockedProducers(data) {
  const unlockedProducers = data.producers.filter(obj => obj.unlocked);
  return unlockedProducers;
}

function makeDisplayNameFromId(id) {
  return id.toLowerCase().split('_').map(function (word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');//Thanks for this hack, w3docs!! https://www.w3docs.com/snippets/javascript/how-to-convert-string-to-title-case-with-javascript.html
}

function makeProducerDiv(producer) {//↙️from the authorities
  const containerDiv = document.createElement('div');
  containerDiv.className = 'producer';
  const displayName = makeDisplayNameFromId(producer.id);
  const currentCost = producer.price.toLocaleString('en-us');
  //I messed with y'all's code! 😝 I wanted the `Buy` button to change to `Buy Another` after the first purchase.
  if(producer.qty < 1) {
  const html = `
  <div class="producer-column">
    <div class="producer-title">${displayName}</div>
    <button type="button" class="initial" id="buy_${producer.id}">Buy</button>
  </div>
  <div class="producer-column">
    <div>Quantity: ${producer.qty.toLocaleString('en-us')}</div>
    <div>Coffee/second: ${producer.cps.toLocaleString('en-us')}</div>
    <div>Cost: ${currentCost.toLocaleString('en-us')} coffee</div>
  </div>
  `;
  containerDiv.innerHTML = html;
  return containerDiv;
  }else {
      const html = `
      <div class="producer-column">
        <div class="producer-title">${displayName}</div>
        <button type="button" class="repeat" id="buy_${producer.id}">Buy Another</button>
      </div>
      <div class="producer-column">
        <div>Quantity: ${producer.qty.toLocaleString('en-us')}</div>
        <div>Coffee/second: ${producer.cps.toLocaleString('en-us')}</div>
        <div>Cost: ${currentCost.toLocaleString('en-us')} coffee</div>
      </div>
      `;
      containerDiv.innerHTML = html;
      return containerDiv;
  }
} //from the authorities↖️

function deleteAllChildNodes(parent) {
  parent.replaceChildren();
}

function renderProducers(data) {
  const containerEle = document.querySelector('#producer_container');
  deleteAllChildNodes(containerEle);
  unlockProducers(data.producers, data.coffee);
  const allUnlocked = getUnlockedProducers(data);
  if (allUnlocked.length > 1) whatCanIGetForYa(data); //You'll learn all about this magic function later...
  allUnlocked.forEach((obj) => {
    let newEle = makeProducerDiv(obj);
    if (obj.qty > 0) {
      newEle.setAttribute('class', 'active-producer');
    }
    containerEle.append(newEle);
  })
}

function getProducerById(data, producerId) {
  for (let i = 0; i < data.producers.length; i++) {
    if (data.producers[i].id === producerId) {
      return data.producers[i];
    }
  }
}

function canAffordProducer(data, producerId) {
  return data.coffee >= getProducerById(data, producerId).price;
}

function updateCPSView(cps) {
  document.querySelector('#cps').innerText = cps.toLocaleString('en-us');
}

function updatePrice(oldPrice) {
 return Math.floor(1.25 * oldPrice);
}

function attemptToBuyProducer(data, producerId) {//I could not figure out how to use this function effectively within an `if` statement, as I think I needed to inside `buyButtonClick`...so I canned it🤷🏼‍♂️

  // if (data.coffee < getProducerById(data, producerId).price) {
  //   console.log(`Sorry, you can't afford a ${makeDisplayNameFromId(getProducerById(data, producerId).id)} right now.`);
  //   return false;
  // }
  // data.totalCPS += getProducerById(data, producerId).cps;
  // data.coffee -= getProducerById(data, producerId).price
  // for (let i = 0; i < data.producers.length; i++) {
  //   if (data.producers[i].id === producerId) {
  //     data.producers[i].price = updatePrice(data.producers[i].price);
  //     data.producers[i].qty++;
  //   }
  // }
  // updateCPSView(data.totalCPS);
  // return true; //WILL NEED THIS FOR HIGHWAY VERSION🎢
}

function buyButtonClick(event, data) {
  if (data.coffee >= getProducerById(data, event.target.id.slice(4)).price) {   
    data.totalCPS += getProducerById(data, event.target.id.slice(4)).cps;
    data.coffee -= getProducerById(data, event.target.id.slice(4)).price;
    for (let i = 0; i < data.producers.length; i++) {
      if (data.producers[i].id === event.target.id.slice(4)) {
          data.producers[i].price = updatePrice(data.producers[i].price);
          data.producers[i].qty++;
        }
    }
    updateCPSView(data.totalCPS);
    updateCoffeeView(data.coffee);
    renderProducers(data);
    }
  else {
    //I want to display a different alert based on whether this producer has already been purchased before.
    if(getProducerById(data, event.target.id.slice(4)).qty === 0) {
      alert(`Sorry, you can't afford a ${makeDisplayNameFromId(getProducerById(data, event.target.id.slice(4)).id)} right now. 😞`);
    }else {
      alert(`Sorry, you can't afford another ${makeDisplayNameFromId(getProducerById(data, event.target.id.slice(4)).id)} right now -- the price goes up with each one purchased!`);
    }
  }
}

function tick(data) {
    data.coffee += data.totalCPS
    updateCoffeeView(data.coffee)
    unlockProducers(data.producers, data.coffee);
    renderProducers(data);
}

/*
LIFE GOAL:
  # Have a `barrista` html element that calculates which of the producers available for purchase is the best deal in terms of cps/coffee(cost), and constantly updates the user with recommendations.
*/
const whatCanIGetForYa = (data) => { //inspirational variable names courtesy of https://genius.com/Tobymac-triple-skinny-interlude-lyrics
  const tripleSkinny = getUnlockedProducers(data);
  const twoThirdsDecaf = tripleSkinny.map((obj) => {
    return obj.cps/obj.price
  })
  halfChocolate = Math.max(...twoThirdsDecaf);
  const noWhip = document.querySelector('.left');
  if (document.querySelector('.barrista')) {
    const oldBarrista = document.querySelector('.barrista');
    noWhip.removeChild(oldBarrista);
  }
  const barristaEle = document.createElement('div');
  barristaEle.setAttribute('class', 'barrista')
  barristaEle.innerHTML = '';
  // if (data.producers[tripleSkinny.length].cps/data.producers[tripleSkinny.length].price >= halfChocolate) {
  //   barristaEle.innerText = `Looking at your available options, your barrista recommends waiting to purchase the next available type of coffee producer because it will provide you with the maximum number of coffees per coffee.`
  // }else {
    barristaEle.innerText = `If you're determined to buy a coffee producer, your barrista recommends purchasing a ${makeDisplayNameFromId(tripleSkinny[twoThirdsDecaf.indexOf(halfChocolate)].id)} because out of all the options available, it will provide you with the maximum amount of coffee per coffee.`;
  // }
  noWhip.append(barristaEle);
}
/*
LIFE GOAL: accomplished✅
*/

if (typeof process === 'undefined') {
  const data = window.data;
  const bigCoffee = document.getElementById('big_coffee');
  bigCoffee.addEventListener('click', () => clickCoffee(data));
  const producerContainer = document.getElementById('producer_container');
  producerContainer.addEventListener('click', event => {
    buyButtonClick(event, data);
  });
  setInterval(() => tick(data), 1000);
}

// Meanwhile, if we aren't in a browser and are instead in node
// we'll need to exports the code written here so we can import and
// Don't worry if it's not clear exactly what's going on here;
// We just need this to run the tests in Mocha.
else if (process) {
  module.exports = {
    updateCoffeeView,
    clickCoffee,
    unlockProducers,
    getUnlockedProducers,
    makeDisplayNameFromId,
    makeProducerDiv,
    deleteAllChildNodes,
    renderProducers,
    updateCPSView,
    getProducerById,
    canAffordProducer,
    updatePrice,
    attemptToBuyProducer,
    buyButtonClick,
    tick
  };
}