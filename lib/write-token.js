'use strict';
var writeToken = module.exports = new Array(256);

// Fills the writeToken array with functions that each
(function () {
	
	var write0 = function (type) {
		return function (encoder, type) {
			encoder.reserve(1);
			encoder.buffer[encoder.offset++] = type;
		};
	};

	var write1 = function (type) {
		return function (encoder, value) {
			encoder.reserve(2);
			var buffer = encoder.buffer;
			var offset = encoder.offset;
			buffer[offset++] = type;
			buffer[offset++] = value;
			encoder.offset = offset;
		};
	};

	var write2 = function (type) {
		return function (encoder, value) {
			encoder.reserve(3);
			var buffer = encoder.buffer;
			var offset = encoder.offset;
			buffer[offset++] = type;
			buffer[offset++] = value >>> 8;
			buffer[offset++] = value;
			encoder.offset = offset;
		};
	};

	var write4 = function (type) {
		return function (encoder, value) {
			encoder.reserve(5);
			var buffer = encoder.buffer;
			var offset = encoder.offset;
			buffer[offset++] = type;
			buffer[offset++] = value >>> 24;
			buffer[offset++] = value >>> 16;
			buffer[offset++] = value >>> 8;
			buffer[offset++] = value;
			encoder.offset = offset;
		};
	};

	var writeN = function (type, len, method) {
		return function (encoder, value) {
			encoder.reserve(len + 1);
			encoder.buffer[encoder.offset++] = type;
			method.call(encoder.buffer, value, encoder.offset, true);
			encoder.offset += len;
		};
	};
	
	// positive fixint -- 0x00 - 0x7f
	// nil -- 0xc0
	// false -- 0xc2
	// true -- 0xc3
	// negative fixint -- 0xe0 - 0xff
	for (var i=0x00; i<=0xFF; ++i) {
		writeToken[i] = write0(i);
	}

	// bin 8 -- 0xc4
	// bin 16 -- 0xc5
	// bin 32 -- 0xc6
	writeToken[0xc4] = write1(0xc4);
	writeToken[0xc5] = write2(0xc5);
	writeToken[0xc6] = write4(0xc6);

	// ext 8 -- 0xc7
	// ext 16 -- 0xc8
	// ext 32 -- 0xc9
	writeToken[0xc7] = write1(0xc7);
	writeToken[0xc8] = write2(0xc8);
	writeToken[0xc9] = write4(0xc9);

	// float 32 -- 0xca
	// float 64 -- 0xcb
	writeToken[0xca] = writeN(0xca, 4, Buffer.prototype.writeFloatBE);
	writeToken[0xcb] = writeN(0xcb, 8, Buffer.prototype.writeDoubleBE);

	// uint 8 -- 0xcc
	// uint 16 -- 0xcd
	// uint 32 -- 0xce
	// uint 64 -- 0xcf
	writeToken[0xcc] = write1(0xcc);
	writeToken[0xcd] = write2(0xcd);
	writeToken[0xce] = write4(0xce);
	writeToken[0xcf] = writeN(0xcf, 8, BufferLite.writeUint64BE);

	// int 8 -- 0xd0
	// int 16 -- 0xd1
	// int 32 -- 0xd2
	// int 64 -- 0xd3
	writeToken[0xd0] = write1(0xd0);
	writeToken[0xd1] = write2(0xd1);
	writeToken[0xd2] = write4(0xd2);
	writeToken[0xd3] = writeN(0xd3, 8, BufferLite.writeUint64BE);

	// str 8 -- 0xd9
	// str 16 -- 0xda
	// str 32 -- 0xdb
	writeToken[0xd9] = write1(0xd9);
	writeToken[0xda] = write2(0xda);
	writeToken[0xdb] = write4(0xdb);

	// array 16 -- 0xdc
	// array 32 -- 0xdd
	writeToken[0xdc] = write2(0xdc);
	writeToken[0xdd] = write4(0xdd);

	// map 16 -- 0xde
	// map 32 -- 0xdf
	writeToken[0xde] = write2(0xde);
	writeToken[0xdf] = write4(0xdf);
}());
