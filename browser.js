'use strict';

var decoder = new TextDecoder;
var encoder = new TextEncoder;
require('./lib/buffer-util').toString = function (buffer, start, end) {
	return decoder.decode(buffer.subarray(start, end));
};
require('./lib/buffer-util').fromString = function (string) {
	return encoder.encode(string);
};

module.exports = require('./lib/msgpack');
