require('colors');
var _ = require('lodash');

var p = {};
var ib = new (require('..'))({
  // clientId: 0,
  // host: '127.0.0.1',
  // port: 7496
}).on('error', function (err) {
  console.error(err.message.red);
}).on('result', function (event, args) {
  if (!_.includes(['position', 'positionEnd'], event)) {
    console.log('%s %s', (event + ':').yellow, JSON.stringify(args));
  }
}).on('position', function (account, contract, pos, avgCost) {
    var expiry = p[contract.expiry] || {},
        symbol = expiry[contract.symbol] || {},
        right = symbol[contract.right] || {netLong: 0, netStrike: 0};

    right.netLong = right.netLong + pos;
    right.netStrike = right.netStrike + pos * contract.strike * (contract.right === "P" ? 1 : -1);

    symbol[contract.right] = right;
    expiry[contract.symbol] = symbol;
    p[contract.expiry] = expiry;

  if (contract.symbol === "QQQ" /*&& contract.right === "P"*/  /* && contract.expiry === "20160520" */) console.log(
    '%s %s%s %s%s %s%s %s%s',
    '[position]'.cyan,
    'account='.bold, account,
    'contract='.bold, JSON.stringify(contract),
    'pos='.bold, pos,
    'avgCost='.bold, avgCost
  );
}).on('positionEnd', function () {
  console.log('[positionEnd]'.cyan);
  Object.getOwnPropertyNames(p).forEach((x) => {
      console.log(x + ":");
      console.log(p[x]);
  });
});

ib.connect();

ib.reqPositions();

ib.on('positionEnd', function () {
  ib.disconnect();
 require("process").exit(0);
 });
