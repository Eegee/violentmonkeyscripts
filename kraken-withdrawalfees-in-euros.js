// ==UserScript==
// @name         Kraken - Withdrawal fees in EUR and sorted
// @description  Enhances the Kraken withdrawal fees support page in your browser with fees in euros (fetched from CoinGecko) and sorts the table on those euro fees
// @namespace    https://github.com/Eegee/violentmonkeyscripts
// @match        https://support.kraken.com/hc/en-us/articles/360000767986-Cryptocurrency-withdrawal-fees-and-minimums
// @version      1.1
// @author       Erik Jan Meijer
// @homepageURL  https://github.com/Eegee/violentmonkeyscripts
// @downloadURL  https://raw.githubusercontent.com/Eegee/violentmonkeyscripts/main/kraken-withdrawalfees-in-euros.js
// @license      BSD 3-Clause License
// @copyright    2022 Erik Jan Meijer
// ==/UserScript==

const currency = "EUR";

var firstTable = document.getElementsByTagName("table")[0]
var secondTable = document.getElementsByTagName("table")[1]
if (firstTable && secondTable) {
  var columns = firstTable.rows[0].getElementsByTagName('th').length;
  var extraheader = document.createElement('th');
  var firstHeader = firstTable.rows[0].cells[0];
  extraheader.innerHTML = firstHeader.outerHTML.replace(firstHeader.innerText, "Withdrawal fee in " + currency);
  firstTable.rows[0].appendChild(extraheader);
  var re = /([\d,]+(?:\.\d+)?) ([\S]+)/gi;

  var coinIds = [];
  for (var r = 0; r < secondTable.rows.length; r++) {
    var row = secondTable.rows[r];
    var coinName = (row.cells[0].innerText || "").trim();
    var coinId = getGuessedId(coinName);
    coinIds.push(coinId);
  }

  var currencyLower = currency.toLowerCase();

  fetch("https://api.coingecko.com/api/v3/simple/price?ids=" + encodeURIComponent(coinIds.join(",")) + "&vs_currencies=" + currencyLower)
    .then((resp) => resp.json())
    .then((data) => {
      for (var r = 0; r < secondTable.rows.length; r++) {
        var row = secondTable.rows[r];
        var coinName = (row.cells[0].innerText || "").trim();
        var coinId = getGuessedId(coinName);
        var originalFee = (row.cells[1].innerText || "").trim();
        var matches = originalFee.matchAll(re);
        var cellText = "";
        if (matches) {
          var groups = Array.from(matches)[0];
          var amount = groups[1].replaceAll(',', '');
          var symbol = groups[2];
          if (data.hasOwnProperty(coinId)) {
            var fiatFee = amount * data[coinId][currencyLower];
            if (fiatFee == 0) {
              cellText = 'FREE!';
            } else {
              cellText = fiatFee.toPrecision(4) + " " + currency;
            }
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
    return parseFloat(row.cells[col].innerText, 10);
  }
}

function getGuessedId(coinName) {
  var result = (coinName || "").toLowerCase().replaceAll(' ', '-');
  if (result.startsWith('tether')) {
    result = 'tether';
  }
  else if (result.startsWith('augur')) {
    result = 'augur';
  }
  else if (result.startsWith('dash')) {
    result = 'dash';
  }
  else if (result.startsWith('stellar')) {
    result = 'stellar';
  }
  else if (result == 'mina') {
    result = 'mina-protocol';
  }
  else if (result == 'compound') {
    result = 'compound-governance-token';
  }
  else if (result == 'curve') {
    result = 'curve-dao-token';
  }
  else if (result == 'enjin-coin') {
    result = 'enjincoin';
  }
  else if (result == 'enzyme-finance') {
    result = 'melon';
  }
  else if (result == 'mina') {
    result = 'mina-protocol';
  }
  else if (result == 'orchid') {
    result = 'orchid-protocol';
  }
  else if (result == 'phala') {
    result = 'pha';
  }
  else if (result == 'polygon') {
    result = 'matic-network';
  }
  else if (result == 'ren-protocol') {
    result = 'republic-protocol';
  }
  else if (result == 'synthetix') {
    result = 'havven';
  }
  else if (result == 'terra') {
    result = 'terra-luna';
  }
  else if (result == 'avax') {
    result = 'avalanche-2';
  }
  else if (result == 'kilt') {
    result = 'kilt-protocol';
  }
  return result;
}
