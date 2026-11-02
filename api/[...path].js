const proxyHandler = require('./_proxy');

module.exports = (req, res) => {
  return proxyHandler(req, res);
};

