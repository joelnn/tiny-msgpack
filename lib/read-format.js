'use strict';
var toString = require('./buffer-util').toString;
var decode = require('./decode');

var map = function (decoder, len) {
	var value = {};
	var i;
	var k = new Array(len);
	var v = new Array(len);
	for (i = 0; i < len; i++) {
		k[i] = decode(decoder);
		v[i] = decode(decoder);
	}
	for (i = 0; i < len; i++) {
		value[k[i]] = v[i];
	}
	return value;
};

var array = function (decoder, len) {
	var value = new Array(len);
	for (var i = 0; i < len; i++) {
		value[i] = decode(decoder);
	}
	return value;
};

var str = function (decoder, len) {
	var start = decoder.offset;
	var end = decoder.offset = start + len;
	if (end > decoder.buffer.byteLength) throw new RangeError('BUFFER_SHORTAGE');
	return toString(decoder.buffer, start, end);
};

var bin = function (decoder, len) {
	var start = decoder.offset;
	var end = decoder.offset = start + len;
	if (end > decoder.buffer.byteLength) throw new RangeError('BUFFER_SHORTAGE');
	return decoder.buffer.subarray(start, end);
};

var ext = function (decoder, len) {
	var unpacker;
	var start = decoder.offset;
	var end = decoder.offset = start + len + 1;
	if (end > decoder.buffer.byteLength) throw new RangeError('BUFFER_SHORTAGE');
	var etype = decoder.buffer[start];
	if (decoder.codec && (unpacker = decoder.codec.getUnpacker(etype))) {
		return unpacker(decoder.buffer.subarray(start + 1, end));
	}
	throw new Error('Unrecognized extension type: ' + (etype ? ('0x' + etype.toString(16)) : etype));
};

var uint8 = function (decoder) {
	var buffer = decoder.buffer;
	if (decoder.offset >= buffer.byteLength) throw new RangeError('BUFFER_SHORTAGE');
	return buffer[decoder.offset++];
};

var uint16 = function (decoder) {
	var buffer = decoder.buffer;
	if (decoder.offset + 2 > buffer.byteLength) throw new RangeError('BUFFER_SHORTAGE');
	return (buffer[decoder.offset++] << 8) | buffer[decoder.offset++];
};

var read = function (len, method) {
	return function(decoder) {
		var buffer = decoder.buffer;
		var start = decoder.offset;
		if ((decoder.offset = start + len) > buffer.byteLength) throw new RangeError('BUFFER_SHORTAGE');
		return method.call(buffer, start, true);
	};
};

var readUInt64BE = function (start, noAssert) {
	var upper = this.readUInt32BE(start, noAssert);
	var lower = this.readUInt32BE(start + 4, noAssert);
	return upper ? (upper * 4294967296 + lower) : lower;
};

var readInt64BE = function (start, noAssert) {
	var upper = this.readInt32BE(start, noAssert);
	var lower = this.readUInt32BE(start + 4, noAssert);
	return upper ? (upper * 4294967296 + lower) : lower;
};

module.exports = {
	map: map,
	array: array,
	str: str,
	bin: bin,
	ext: ext,
	uint8: uint8,
	uint16: uint16,
	uint32: read(4, Buffer.prototype.readUInt32BE),
	uint64: read(8, readUInt64BE),
	int8: read(1, Buffer.prototype.readInt8),
	int16: read(2, Buffer.prototype.readInt16BE),
	int32: read(4, Buffer.prototype.readInt32BE),
	int64: read(8, readInt64BE),
	float32: read(4, Buffer.prototype.readFloatBE),
	float64: read(8, Buffer.prototype.readDoubleBE)
};
