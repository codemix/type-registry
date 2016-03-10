"use strict";

try {
  module.exports = require('./lib').default;
}
catch (e) {
  module.exports = require('./lib-legacy').default;
}
