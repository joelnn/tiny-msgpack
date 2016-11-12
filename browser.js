'use strict';
module.exports = require('./lib/msgpack');

var decoder = new TextDecoder('utf-8');
require('./lib/buffer').toString = function (buffer, start, end) {
	return decoder.decode(buffer.subarray(start, end));
};
