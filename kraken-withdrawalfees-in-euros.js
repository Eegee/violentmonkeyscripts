// ==UserScript==
// @name         Kraken - Withdrawal fees in EUR and sorted
// @description  Enhances the Kraken withdrawal fees support page in your browser with fees in euros (fetched from CoinGecko) and sorts the table on those euro fees
// @namespace    https://github.com/Eegee/violentmonkeyscripts
// @match        https://support.kraken.com/hc/en-us/articles/360000767986-Cryptocurrency-withdrawal-fees-and-minimums
// @version      1.3.2
// @author       Erik Jan Meijer
// @homepageURL  https://github.com/Eegee/violentmonkeyscripts
// @downloadURL  https://raw.githubusercontent.com/Eegee/violentmonkeyscripts/main/kraken-withdrawalfees-in-euros.js
// @license      BSD 3-Clause License
// @copyright    2022-2024 Erik Jan Meijer
// @run-at       document-idle
// @grant        GM.xmlHttpRequest
// ==/UserScript==

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

const currency = "EUR";

var firstTable = document.getElementsByTagName("table")[0];

if (firstTable) {
  var columns = firstTable.rows[0].getElementsByTagName('th').length;

  var coinIds = [];

  // identify an element to observe
  const elementToObserve = document.getElementById("__next");

  var firstTimeInTable = false;
  var backOutsideTable = false;
  var processing = false;
  var extraheaderHTML = "";

  // Callback function to execute when mutations are observed
  const callback = function(mutationsList, observer) {
    for(const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          var node = mutation.addedNodes[0];
          if (node && !node.length) {
            var table = node.closest('table');
            var inTable = table && table == firstTable

            if (inTable)  {
              const headerClasses = ["py-5", "pr-10", "overflow-hidden", "text-ellipsis", "min-w-[148px]", "sticky", "top-0"];
              if (!firstTimeInTable){
                firstTimeInTable = true;

                // add extra header
                var headerRow = firstTable.rows[0];
                var columns = firstTable.rows[0].getElementsByTagName('th').length;
                var extraheader = document.createElement('th');
                var firstHeader = headerRow.cells[0];
                extraheaderHTML = firstHeader.outerHTML.replace(firstHeader.innerText, "Withdrawal fee in " + currency + "<br><span style='font-size:10pt;'>Powered by CoinGecko</span>");
                extraheader.innerHTML = extraheaderHTML
                extraheader.classList.add(...headerClasses);
                extraheader.style="width: 228px; background-position: right; background-repeat: no-repeat; background-image: url(data:image/gif;base64,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);"
                extraheader.setAttribute("id", "userscript_feespinner");
                headerRow.appendChild(extraheader);

                //resize existing headers
                for (var j = 0, col; col = headerRow.cells[j]; j++) {
                  if (col.style.width == '229px') { col.style.width = '150px'; }
                  if (col.style.width == '226px') { col.style.width = '156px'; }
                  if (col.style.width == '453px') { col.style.width = '317px'; }
                }
              }

              var row = node.closest('tr');
              if (node.nodeName == "TR") {
                row = node
                if (mutation.target && mutation.target.nodeName == "THEAD") {
                  // add extra header
                  var headerRow = firstTable.rows[0];
                  var extraheader = document.createElement('th');
                  var cells = headerRow.cells
                  extraheader.innerHTML = extraheaderHTML;
                  extraheader.classList.add(...headerClasses);
                  extraheader.style="width: 228px;";
                  headerRow.appendChild(extraheader);

                  //resize existing headers
                  for (var j = 0, col; col = headerRow.cells[j]; j++) {
                    if (col.style.width == '166px') { col.style.width = '171px'; }
                    if (col.style.width == '163px') { col.style.width = '167px'; }
                    if (col.style.width == '328px') { col.style.width = '335px'; }
                  }
                }
              }
              if (row) {
                var coinName = (row.cells[0].innerText || "").trim();
                var coinId = getGuessedId(coinName);
                coinIds.push(coinId);
              }
            }
            else {
              if (!backOutsideTable && firstTimeInTable) {
                backOutsideTable = true;

                coinIds = coinIds.filter(onlyUnique);

                if (!processing) {
                  processing = true;
                  doProcess();
                }
              }
            }
          }
        }
      }
    }
  };

  // create a new instance of `MutationObserver` named `observer`,
  // passing it a callback function
  const observer = new MutationObserver(callback);

  // call `observe()` on that MutationObserver instance,
  // passing it the element to observe, and the options object
  observer.observe(elementToObserve, {subtree: true, childList: true});
}

function doProcess(){
  var re = /([\d,]+(?:\.\d+)?) ([\S]+)/gi;

  var currencyLower = currency.toLowerCase();

  let control = GM.xmlHttpRequest({
    method: "GET",
    url: "https://api.coingecko.com/api/v3/simple/price?ids=" + encodeURIComponent(coinIds.join(",")) + "&vs_currencies=" + currencyLower,
    responseType: "json",
    onload: function(data) {
      for (var r = 1; r < firstTable.rows.length; r++) {
        var row = firstTable.rows[r];
        var coinName = (row.cells[0].innerText || "").trim();
        var coinId = getGuessedId(coinName);
        var originalFee = (row.cells[1].innerText || "").trim().replace(String.fromCharCode(160), ' ');
        var extraText = "";
        var spaceIndex = originalFee.indexOf(' ');
        if (spaceIndex > -1) {
          var secondSpaceIndex = originalFee.indexOf(' ', spaceIndex + 1);
          if (secondSpaceIndex > -1) {
            extraText = originalFee.substr(secondSpaceIndex);
            originalFee = originalFee.substr(0, secondSpaceIndex);
          }
        }
        var matches = originalFee.matchAll(re);
        var amount = 0;
        var symbol = '';
        if (matches) {
          var groups = Array.from(matches)[0];
          if (groups) {
            amount = groups[1].replaceAll(',', '');
            symbol = groups[2];
          }
        }
        var cellText = "";
        if (data.response.hasOwnProperty(coinId)) {
          var fiatFee = amount * data.response[coinId][currencyLower];
          if (fiatFee == 0) {
            cellText = 'FREE!';
          } else {
            cellText = fiatFee.toPrecision(4) + " " + currency + extraText;
          }
        }

        var cell = row.insertCell(columns);
        cell.innerHTML = cellText;
      }

      sortTable(firstTable, 3);
      return null;
    },
    onreadystatechange: function(data) {
      if (data.readyState == 4) {
        processing = false;

        var spinner = document.getElementById('userscript_feespinner');
        if (spinner) {
          spinner.style.background = 'none';
        }
      }
    }
  });
}

function sortTable(table, col) {
  var rows = Array.prototype.slice.call(table.getElementsByTagName('tr'), 0);
  rows.sort(function (a, b) {
    return getRowValue(a, col) - getRowValue(b, col);
  });

  for (var i = 0, row; row = rows[i]; i++) {
    table.appendChild(row);
  }

  function getRowValue(row, col) {
    return parseFloat(row.cells[col].innerText, 10) || 0;
  }
}

function getGuessedId(coinName) {
  var result = (coinName || "").toLowerCase().replaceAll(/\s\([\w-,. ]+\)/gi, '').replaceAll(' ', '-').replaceAll('.', '-').replaceAll('*', '').replaceAll('"', '');
       if (result == 'akash')                           { result = 'akash-network'; }
  else if (result == 'ambire-adex')                     { result = 'adex'; }
  else if (result == 'arpa-chain')                      { result = 'arpa'; }
  else if (result == 'avalanche')                       { result = 'avalanche-2'; }
  else if (result == 'axie-infinity-shards')            { result = 'axie-infinity-shard-wormhole'; }
  else if (result == 'bricks')                          { result = 'brick'; }
  else if (result == 'chain')                           { result = 'chain-2'; }
  else if (result == 'chromia')                         { result = 'chromaway'; }
  else if (result == 'compound')                        { result = 'compound-governance-token'; }
  else if (result == 'convex')                          { result = 'convex-finance'; }
  else if (result == 'crust-shadow')                    { result = 'crust-storage-market'; }
  else if (result == 'curve')                           { result = 'curve-dao-token'; }
  else if (result == 'dogwifhat')                       { result = 'dogwifcoin'; }
  else if (result == 'elrond')                          { result = 'elrond-erd-2'; }
  else if (result == 'enjin')                           { result = 'enjincoin'; }
  else if (result == 'enzyme-finance')                  { result = 'melon'; }
  else if (result == 'ethereum-naming-service')         { result = 'ethereum-name-service'; }
  else if (result == 'ethereumpow')                     { result = 'ethereum-pow-iou'; }
  else if (result == 'flare')                           { result = 'flare-token'; }
  else if (result == 'gala-games')                      { result = 'gala'; }
  else if (result == 'galxe')                           { result = 'project-galaxy'; }
  else if (result == 'gensokishi-metaverse')            { result = 'gensokishis-metaverse'; }
  else if (result == 'harvest')                         { result = 'harvest-finance'; }
  else if (result == 'idex')                            { result = 'aurora-dao'; }
  else if (result == 'iexec')                           { result = 'iexec-rlc'; }
  else if (result == 'injective')                       { result = 'injective-protocol'; }
  else if (result == 'internet-computer-protocol')      { result = 'internet-computer'; }
  else if (result == 'jasmy')                           { result = 'jasmycoin'; }
  else if (result == 'jito')                            { result = 'jito-governance-token'; }
  else if (result == 'juno')                            { result = 'juno-network'; }
  else if (result == 'keep3r')                          { result = 'keep3rv1'; }
  else if (result == 'keeperdao')                       { result = 'rook'; }
  else if (result == 'kilt')                            { result = 'kilt-protocol'; }
  else if (result == 'lumen')                           { result = 'stellar'; }
  else if (result == 'makerdao')                        { result = 'maker'; }
  else if (result == 'mango')                           { result = 'mango-markets'; }
  else if (result == 'marinade-sol')                    { result = 'msol'; }
  else if (result == 'mina')                            { result = 'mina-protocol'; }
  else if (result == 'moons')                           { result = 'moon'; }
  else if (result == 'multiversx')                      { result = 'elrond-erd-2'; }
  else if (result == 'near-protocol')                   { result = 'near'; }
  else if (result == 'nodle')                           { result = 'nodle-network'; }
  else if (result == 'ocean-token')                     { result = 'ocean-protocol'; }
  else if (result == 'omg-network')                     { result = 'omisego'; }
  else if (result == 'onyxcoin')                        { result = 'chain-2'; }
  else if (result == 'orchid')                          { result = 'orchid-protocol'; }
  else if (result == 'phala')                           { result = 'pha'; }
  else if (result == 'powerledger')                     { result = 'power-ledger'; }
  else if (result == 'pstake')                          { result = 'pstake-finance'; }
  else if (result == 'quant')                           { result = 'quant-network'; }
  else if (result == 'ren')                             { result = 'republic-protocol'; }
  else if (result == 'render')                          { result = 'render-token'; }
  else if (result == 'request')                         { result = 'request-network'; }
  else if (result == 'robonomics')                      { result = 'robonomics-network'; }
  else if (result == 'samoyed-coin')                    { result = 'samoyedcoin'; }
  else if (result == 'sand')                            { result = 'the-sandbox'; }
  else if (result == 'secret-network')                  { result = 'secret'; }
  else if (result == 'sei')                             { result = 'sei-network'; }
  else if (result == 'stacks')                          { result = 'blockstack'; }
  else if (result == 'stafi-protocol')                  { result = 'stafi'; }
  else if (result == 'starknet-token')                  { result = 'starknet'; }
  else if (result == 'stella')                          { result = 'alpha-finance'; }
  else if (result == 'synapse')                         { result = 'synapse-2'; }
  else if (result == 'synthetix')                       { result = 'havven'; }
  else if (result == 'terra-2-0')                       { result = 'terra-luna-2'; }
  else if (result == 'terra-classic')                   { result = 'terra-luna'; }
  else if (result == 'terra-virtua-kolect')             { result = 'the-virtua-kolect'; }
  else if (result == 'terrausd-classic')                { result = 'terrausd'; }
  else if (result == 'threshold')                       { result = 'threshold-network-token'; }
  else if (result == 'trueusd')                         { result = 'true-usd'; }
  else if (result == 'universal-market-access')         { result = 'uma'; }
  else if (result == 'usdc')                            { result = 'usd-coin'; }
  else if (result == 'wrapped-axelar')                  { result = 'axelar'; }
  else if (result == 'wrapped-ether')                   { result = 'ethereum'; }
  else if (result.startsWith('augur')) {
    result = 'augur';
  }
  else if (result.startsWith('dai-')) {
    result = 'dai';
  }
  else if (result.startsWith('dash')) {
    result = 'dash';
  }
  else if (result.startsWith('injective-protocol')) {
    result = 'injective-protocol';
  }
  else if (result.startsWith('liechtenstein')) {
    result = 'lcx';
  }
  else if (result.startsWith('polygon')) {
    result = 'matic-network';
  }
  else if (result.startsWith('stellar')) {
    result = 'stellar';
  }
  else if (result.startsWith('tether')) {
    result = 'tether';
  }
  else if (result.startsWith('usd-coin')) {
    result = 'usd-coin';
  }

  return result;
}
