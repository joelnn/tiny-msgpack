'use strict';

var decoder = new TextDecoder('utf-8');
require('./lib/buffer-util').toString = function (buffer, start, end) {
	return decoder.decode(buffer.subarray(start, end));
};

module.exports = require('./lib/msgpack');
