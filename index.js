"use strict";

try {
  module.exports = require('./lib').TypeRegistry;
}
catch (e) {
  module.exports = require('./lib-legacy').TypeRegistry;
}
