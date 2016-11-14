'use strict';
var encode = require('../.').encode;
var util = require('util');
var officialEncode = require('msgpack').pack;
var officialDecode = require('msgpack').unpack;
var expect = require('chai').expect;

function expectToEqualOfficial(value, expectedBytes) {
	var encoded = encode(value);
	expect(encoded).to.be.an.instanceof(Uint8Array);
	expect(encoded).to.not.be.an.instanceof(Buffer);
	if (encoded.byteLength !== expectedBytes) {
		throw new Error('\nExpected ' + value + ' to encode to ' + expectedBytes + ' bytes, not ' + encoded.byteLength + '.');
	}
	var officialEncoded = officialEncode(value);
	if (!Buffer.from(encoded).equals(officialEncoded)) {
		throw new Error(util.format('\nExpected:\n', officialEncoded, '\nInstead got:\n', Buffer.from(encoded)));
	}
}

function expectToBeUnderstoodByOfficial(value, expectedBytes) {
	var encoded = encode(value);
	expect(encoded).to.be.an.instanceof(Uint8Array);
	expect(encoded).to.not.be.an.instanceof(Buffer);
	if (encoded.byteLength !== expectedBytes) {
		throw new Error('\nExpected ' + value + ' to encode to ' + expectedBytes + ' bytes, not ' + encoded.byteLength + '.');
	}
	expect(officialDecode(Buffer.from(encoded))).to.deep.equal(value);
}

function stringOf(length) {
	var str = '';
	while (str.length < length) {str += 'x';}
	return str;
}

describe('msgpack.encode()', function () {
	specify('null', function () {
		expectToEqualOfficial(null, 1);
	});
	specify('undefined', function () {
		expectToEqualOfficial(undefined, 1);
	});
	specify('boolean', function () {
		expectToEqualOfficial(true, 1);
		expectToEqualOfficial(false, 1);
	});
	specify('fixint', function () {
		expectToEqualOfficial(0, 1);
		expectToEqualOfficial(127, 1);
		expectToEqualOfficial(-1, 1);
		expectToEqualOfficial(-32, 1);
	});
	specify('uint', function () {
		expectToEqualOfficial(128, 2);
		expectToEqualOfficial(255, 2);
		expectToEqualOfficial(256, 3);
		expectToEqualOfficial(65535, 3);
		expectToEqualOfficial(65536, 5);
		expectToEqualOfficial(4294967295, 5);
	});
	specify('int', function () {
		expectToEqualOfficial(-33, 2);
		expectToEqualOfficial(-128, 2);
		expectToEqualOfficial(-129, 3);
		expectToEqualOfficial(-32768, 3);
		expectToEqualOfficial(-32769, 5);
		expectToEqualOfficial(-2147483648, 5);
	});
	specify('float', function () {
		expectToBeUnderstoodByOfficial(4294967296, 5);
		expectToBeUnderstoodByOfficial(-2147483904, 5);
		expectToBeUnderstoodByOfficial(0.5, 5);
		expectToBeUnderstoodByOfficial(0.25, 5);
		expectToBeUnderstoodByOfficial(-0.5, 5);
		expectToBeUnderstoodByOfficial(-0.25, 5);
		expectToBeUnderstoodByOfficial(4e39, 9);
		expectToBeUnderstoodByOfficial(-4e39, 9);
		expectToEqualOfficial(0.3, 9);
		expectToEqualOfficial(-0.3, 9);
	});
	specify('string', function () {
		expectToEqualOfficial('', 1);
		expectToEqualOfficial('x', 2);
		expectToEqualOfficial(stringOf(31), 32);
		expectToEqualOfficial(stringOf(32), 34);
		expectToEqualOfficial(stringOf(255), 257);
		expectToEqualOfficial(stringOf(256), 259);
		expectToEqualOfficial(stringOf(65535), 65538);
		expectToEqualOfficial(stringOf(65536), 65541);
	});
	// binary
	// array
	// map
	// symbol, function
});
