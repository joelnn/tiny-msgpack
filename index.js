'use strict';
var Codec = require('./lib/codec');
var EncodeBuffer = require('./lib/encode-buffer');
var DecodeBuffer = require('./lib/decode-buffer');
var encode = require('./lib/encode');
var decode = require('./lib/decode');

exports.encode = function (input, codec) {
	if (!(codec instanceof Codec)) {
		throw new TypeError('Expected second argument to be a Codec.');
	}
	var encoder = new EncodeBuffer(codec);
	encode(encoder, input);
	return encoder.read();
};
exports.decode = function (input, codec) {
	if (!(codec instanceof Codec)) {
		throw new TypeError('Expected second argument to be a Codec.');
	}
	var decoder = new DecodeBuffer(codec);
	decoder.append(input);
	return decode(decoder);
};
exports.Codec = Codec;
