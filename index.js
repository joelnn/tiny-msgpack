'use strict';
var Codec = require('./lib/codec');
var EncodeBuffer = require('./lib/encode-buffer');
var DecodeBuffer = require('./lib/decode-buffer');
var encode = require('./lib/encode');
var decode = require('./lib/decode');

exports.encode = function (input, codec) {
	if (codec != null && !(codec instanceof Codec)) {
		throw new TypeError('Expected second argument to be a Codec, if provided.');
	}
	var encoder = new EncodeBuffer(codec);
	encode(encoder, input);
	return encoder.read();
};
exports.decode = function (input, codec) {
	if (!(input instanceof Uint8Array)) {
		throw new TypeError('Expected first argument to be a Uint8Array.');
	}
	if (codec != null && !(codec instanceof Codec)) {
		throw new TypeError('Expected second argument to be a Codec, if provided.');
	}
	var decoder = new DecodeBuffer(codec);
	decoder.append(input);
	return decode(decoder);
};
exports.Codec = Codec;
