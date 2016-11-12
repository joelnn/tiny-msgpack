'use strict';
var ExtBuffer = require('./ext-buffer');

function Codec() {
	if (!(this instanceof Codec)) {
		throw new TypeError('Codecs must be constructed with the "new" keyword.');
	}
	this._packers = [];
	this._packerClasses = [];
	this._unpackers = {};
}
Codec.prototype.addPacker = function (etype, Class, packer) {
	if (Array.isArray(packer)) {
		packer = join(packer);
	}
	if (!(~~etype === etype) || !(etype >= 0 && etype < 128)) {
		throw new TypeError('Invalid extension type (must be between 0 and 127).');
	}
	if (typeof packer !== 'function') {
		throw new TypeError('Expected third argument to be a function.');
	}
	if (typeof Class !== 'function') {
		throw new TypeError('Expected second argument to be a constructor function.');
	}
	this._packers.push(function (value) {
		var buffer = packer(value);
		if (!(buffer instanceof Uint8Array)) {
			throw new TypeError('Codec must return a Uint8Array (encoding "' + Class.name + '").');
		}
		return new ExtBuffer(buffer, etype);
	});
	this._packerClasses.push(Class);
	return this;
};
Codec.prototype.addUnpacker = function (etype, unpacker) {
	if (!(~~etype === etype) || !(etype >= 0 && etype < 128)) {
		throw new TypeError('Invalid extension type (must be between 0 and 127).');
	}
	if (typeof unpacker !== 'function') {
		throw new TypeError('Expected second argument to be a function.');
	}
	this._unpackers[etype] = Array.isArray(unpacker) ? join(unpacker) : unpacker;
	return this;
};
Codec.prototype.getPacker = function (value) {
	return getPacker(value.constructor, this._packerClasses);
};
Codec.prototype.getUnpacker = function (type) {
	return this._unpackers[type];
};
module.exports = Codec;

// This is isolated for optimization purposes.
var getPacker = function (constructor, classes) {
	for (var i=0, len=classes.length; i<len; ++i) {
		if (constructor === classes[i]) {
			return this._packers[i];
		}
	}
};

var join = function (filters) {
	filters = filters.slice();
	var iterator = function (value, filter) {
		return filter(value);
	};
	return function (value) {
		return filters.reduce(iterator, value);
	};
};
