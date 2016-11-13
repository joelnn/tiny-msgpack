'use strict';
var BufferUtil = require('./lib/buffer-util');
var toString = Buffer.prototype.toString;

BufferUtil.toString = function (buffer, start, end) {
	return toString.call(buffer, 'utf8', start, end);
};
BufferUtil.fromString = function (string) {
	var buffer = Buffer.from(string);
	return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length);
};

module.exports = require('./lib/msgpack');
