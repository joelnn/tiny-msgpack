'use strict';

var toString = Buffer.prototype.toString;
require('./lib/buffer-util').toString = function (buffer, start, end) {
	return toString.call(buffer, 'utf8', start, end);
};
require('./lib/buffer-util').fromString = function (string) {
	var buffer = Buffer.from(string);
	return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length);
};

module.exports = require('./lib/msgpack');
