'use strict';
var fromString = require('./buffer-util').fromString;
var writeType = {};

var encode = module.exports = function (encoder, value) {
	writeType[typeof value](encoder, value);
};

// Fills the writeType hash with functions that each encode values of their
// respective types at the given Paper's offset.
(function (write) {
	
	var float32Buffer = new Float32Array(1);
	var isFloat32 = function (num) {
		float32Buffer[0] = num;
		return float32Buffer[0] === num;
	};
	
	writeType.number = function (encoder, value) {
		var ivalue = value | 0;
		var uivalue = value >>> 0;
		if (value !== ivalue && value !== uivalue) {
			isFloat32(value)
				? write.float32(encoder, value)  // float 32 -- 0xca
				: write.float64(encoder, value); // float 64 -- 0xcb
		} else if (ivalue <= 0x7f && ivalue >= -0x20) {
			// positive fixint -- 0x00 - 0x7f
			// negative fixint -- 0xe0 - 0xff
			write.type(encoder, ivalue & 0xff);
		} else if (value === uivalue) {
			// uint 8 -- 0xcc
			// uint 16 -- 0xcd
			// uint 32 -- 0xce
			uivalue <= 0xff ? write.int8(encoder, 0xcc, uivalue) :
			uivalue <= 0xffff ? write.int16(encoder, 0xcd, uivalue) :
			write.int32(encoder, 0xce, uivalue);
		} else {
			// int 8 -- 0xd0
			// int 16 -- 0xd1
			// int 32 -- 0xd2
			ivalue >= -0x80 ? write.int8(encoder, 0xd0, ivalue) :
			ivalue >= -0x8000 ? write.int16(encoder, 0xd1, ivalue) :
			write.int32(encoder, 0xd2, ivalue);
		}
	};
	
	writeType.string = function (encoder, value) {
		var utf8 = fromString(value);
		var byteLength = utf8.byteLength;
		
		// fixstr -- 0xa0 - 0xbf
		// str 8 -- 0xd9
		// str 16 -- 0xda
		// str 32 -- 0xdb
		byteLength < 32 ? write.type(encoder, 0xa0 + byteLength) :
		byteLength <= 0xff ? write.int8(encoder, 0xd9, byteLength) :
		byteLength <= 0xffff ? write.int16(encoder, 0xda, byteLength) :
		write.int32(encoder, 0xdb, byteLength);
		
		encoder.send(utf8);
	};
	
	writeType.boolean = function (encoder, value) {
		// false -- 0xc2
		// true -- 0xc3
		write.type(encoder, value ? 0xc3 : 0xc2);
	};
	
	writeType.object = function (encoder, value) {
		var packer;
		if (value === null) return nil(encoder, value);
		if (Array.isArray(value)) return array(encoder, value);
		if (value instanceof Uint8Array) return bin(encoder, value);
		if (encoder.codec && (packer = encoder.codec.getPacker(value))) {
			return ext(encoder, packer(value));
		}
		map(encoder, value);
	};
	
	writeType.undefined = nil;
	writeType.function = nil;
	writeType.symbol = nil;
	
	var nil = function (encoder) {
		// nil -- 0xc0
		write.type(encoder, 0xc0);
	};
	
	var array = function (encoder, value) {
		// fixarray -- 0x90 - 0x9f
		// array 16 -- 0xdc
		// array 32 -- 0xdd
		var length = value.length;
		var type = (length < 16) ? (0x90 + length) : (length <= 0xffff) ? 0xdc : 0xdd;
		token[type](encoder, length);
		for (var i=0; i<length; ++i) {
			encode(encoder, value[i]);
		}
	};
	
	var bin = function (encoder, value) {
		// bin 8 -- 0xc4
		// bin 16 -- 0xc5
		// bin 32 -- 0xc6
		var length = value.length;
		var type = (length < 0xff) ? 0xc4 : (length <= 0xffff) ? 0xc5 : 0xc6;
		token[type](encoder, length);
		encoder.send(value);
	};
	
	var extmap = [];
	extmap[1] = 0xd4;
	extmap[2] = 0xd5;
	extmap[4] = 0xd6;
	extmap[8] = 0xd7;
	extmap[16] = 0xd8;
	var ext = function (encoder, value) {
		// fixext 1 -- 0xd4
		// fixext 2 -- 0xd5
		// fixext 4 -- 0xd6
		// fixext 8 -- 0xd7
		// fixext 16 -- 0xd8
		// ext 8 -- 0xc7
		// ext 16 -- 0xc8
		// ext 32 -- 0xc9
		var buffer = value.buffer;
		var length = buffer.length;
		var type = extmap[length] || ((length < 0xff) ? 0xc7 : (length <= 0xffff) ? 0xc8 : 0xc9);
		token[type](encoder, length);
		encoder.reserve(1);
		encoder.buffer[encoder.offset++] = value.etype;
		encoder.send(buffer);
	};
	
	var map = function (encoder, value) {
		// fixmap -- 0x80 - 0x8f
		// map 16 -- 0xde
		// map 32 -- 0xdf
		var keys = Object.keys(value);
		var length = keys.length;
		var type = (length < 16) ? (0x80 + length) : (length <= 0xffff) ? 0xde : 0xdf;
		token[type](encoder, length);
		keys.forEach(function (key) {
			encode(encoder, key);
			encode(encoder, value[key]);
		});
	};
}(require('./write-number')));
