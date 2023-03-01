// ==UserScript==
// @name         Kraken - Withdrawal fees in EUR and sorted
// @description  Enhances the Kraken withdrawal fees support page in your browser with fees in euros (fetched from CoinGecko) and sorts the table on those euro fees
// @namespace    https://github.com/Eegee/violentmonkeyscripts
// @match        https://support.kraken.com/hc/en-us/articles/360000767986-Cryptocurrency-withdrawal-fees-and-minimums
// @version      1.2.3
// @author       Erik Jan Meijer
// @homepageURL  https://github.com/Eegee/violentmonkeyscripts
// @downloadURL  https://raw.githubusercontent.com/Eegee/violentmonkeyscripts/main/kraken-withdrawalfees-in-euros.js
// @license      BSD 3-Clause License
// @copyright    2022 Erik Jan Meijer
// ==/UserScript==

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

const currency = "EUR";

var firstTable = document.getElementsByTagName("table")[0]
var secondTable = document.getElementsByTagName("table")[1]
if (firstTable && secondTable) {
  var columns = firstTable.rows[0].getElementsByTagName('th').length;
  var extraheader = document.createElement('th');
  var firstHeader = firstTable.rows[0].cells[0];
  extraheader.innerHTML = firstHeader.outerHTML.replace(firstHeader.innerText, "Withdrawal fee in " + currency + "<br><span style='font-size:10pt;'>Powered by CoinGecko</span>");
  firstTable.rows[0].appendChild(extraheader);

  for (var i = 0, row; row = firstTable.rows[i]; i++) {
   for (var j = 0, col; col = row.cells[j]; j++) {
     if (col.style.width == '190px') { col.style.width = '142px'; }
   }
  }
  for (var i = 0, row; row = secondTable.rows[i]; i++) {
   for (var j = 0, col; col = row.cells[j]; j++) {
     if (col.style.width == '190px') { col.style.width = '142px'; }
   }
  }

  var re = /([\d,]+(?:\.\d+)?) ([\S]+)/gi;

  var coinIds = [];
  for (var r = 0; r < secondTable.rows.length; r++) {
    var row = secondTable.rows[r];
    var coinName = (row.cells[0].innerText || "").trim();
    var coinId = getGuessedId(coinName);
    coinIds.push(coinId);
  }
  coinIds = coinIds.filter(onlyUnique);

  var currencyLower = currency.toLowerCase();

  fetch("https://api.coingecko.com/api/v3/simple/price?ids=" + encodeURIComponent(coinIds.join(",")) + "&vs_currencies=" + currencyLower)
    .then((resp) => resp.json())
    .then((data) => {
      for (var r = 0; r < secondTable.rows.length; r++) {
        var row = secondTable.rows[r];
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
        if (data.hasOwnProperty(coinId)) {
          var fiatFee = amount * data[coinId][currencyLower];
          if (fiatFee == 0) {
            cellText = 'FREE!';
          } else {
            cellText = fiatFee.toPrecision(4) + " " + currency + extraText;
          }
        }

        var cell = row.insertCell(columns);
        cell.innerHTML = cellText;
      }

      sortTable(secondTable, 3);

      return null;
    })
    .catch((error) => {
      console.error(error)
    })
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
  var result = (coinName || "").toLowerCase().replaceAll(' ', '-').replaceAll('.', '-').replaceAll('*', '').replaceAll('"', '');
       if (result == 'akash')                           { result = 'akash-network'; }
  else if (result == 'alpha-venture-dao')               { result = 'alpha-finance'; }
  else if (result == 'ambire-adex')                     { result = 'adex'; }
  else if (result == 'arpa-chain')                      { result = 'arpa'; }
  else if (result == 'avalanche')                       { result = 'avalanche-2'; }
  else if (result == 'bitcoin-(lightning-network)')     { result = "bitcoin"; }
  else if (result == 'chain')                           { result = 'chain-2'; }
  else if (result == 'chromia')                         { result = 'chromaway'; }
  else if (result == 'compound')                        { result = 'compound-governance-token'; }
  else if (result == 'crust-shadow')                    { result = 'crust-storage-market'; }
  else if (result == 'curve')                           { result = 'curve-dao-token'; }
  else if (result == 'elrond')                          { result = 'elrond-erd-2'; }
  else if (result == 'enjin-coin')                      { result = 'enjincoin'; }
  else if (result == 'enzyme-finance')                  { result = 'melon'; }
  else if (result == 'ethereum-(arbitrum-one-network)') { result = 'ethereum'; }
  else if (result == 'ethereum-(erc-20)')               { result = 'ethereum'; }
  else if (result == 'ethereum-(ether)')                { result = 'ethereum'; }
  else if (result == 'ethereum-naming-service')         { result = 'ethereum-name-service'; }
  else if (result == 'ethereumpow')                     { result = 'ethereum-pow-iou'; }
  else if (result == 'flare')                           { result = 'flare-token'; }
  else if (result == 'gala-games')                      { result = 'gala'; }
  else if (result == 'galxe')                           { result = 'project-galaxy'; }
  else if (result == 'gensokishi-metaverse')            { result = 'gensokishis-metaverse'; }
  else if (result == 'idex')                            { result = 'aurora-dao'; }
  else if (result == 'iexec')                           { result = 'iexec-rlc'; }
  else if (result == 'jasmy')                           { result = 'jasmycoin'; }
  else if (result == 'juno')                            { result = 'juno-network'; }
  else if (result == 'keep3r-network')                  { result = 'keep3rv1'; }
  else if (result == 'keeperdao')                       { result = 'rook'; }
  else if (result == 'kilt')                            { result = 'kilt-protocol'; }
  else if (result == 'mango')                           { result = 'mango-markets'; }
  else if (result == 'marinade-sol')                    { result = 'msol'; }
  else if (result == 'mina')                            { result = 'mina-protocol'; }
  else if (result == 'multiversx')                      { result = 'elrond-erd-2'; }
  else if (result == 'near-protocol')                   { result = 'near'; }
  else if (result == 'nodle')                           { result = 'nodle-network'; }
  else if (result == 'omg-network')                     { result = 'omisego'; }
  else if (result == 'orchid')                          { result = 'orchid-protocol'; }
  else if (result == 'phala')                           { result = 'pha'; }
  else if (result == 'powerledger')                     { result = 'power-ledger'; }
  else if (result == 'pstake')                          { result = 'pstake-finance'; }
  else if (result == 'quant')                           { result = 'quant-network'; }
  else if (result == 'ren-protocol')                    { result = 'republic-protocol'; }
  else if (result == 'render')                          { result = 'render-token'; }
  else if (result == 'request')                         { result = 'request-network'; }
  else if (result == 'robonomics')                      { result = 'robonomics-network'; }
  else if (result == 'samoyed-coin')                    { result = 'samoyedcoin'; }
  else if (result == 'stacks')                          { result = 'blockstack'; }
  else if (result == 'stafi-protocol')                  { result = 'stafi'; }
  else if (result == 'synapse')                         { result = 'synapse-2'; }
  else if (result == 'synthetix')                       { result = 'havven'; }
  else if (result == 'terra-2-0')                       { result = 'terra-luna-2'; }
  else if (result == 'terra-classic')                   { result = 'terra-luna'; }
  else if (result == 'terra-virtual-kolect')            { result = 'the-virtua-kolect'; }
  else if (result == 'terrausd-classic')                { result = 'terrausd'; }
  else if (result == 'threshold')                       { result = 'threshold-network-token'; }
  else if (result == 'universal-market-access')         { result = 'uma'; }
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
