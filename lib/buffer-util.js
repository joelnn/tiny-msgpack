'use strict';

// The given argument must be an array of at least two Uint8Arrays.
exports.concat = function (buffers) {
	var bufferCount = buffers.length;
	var totalLength = 0;
	for (var i=0; i<bufferCount; ++i) {
		totalLength += buffers[i].byteLength;
	}
	var output = new Uint8Array(totalLength);
	var offset = 0;
	for (var i=0; i<bufferCount; ++i) {
		var buffer = buffers[i];
		output.set(buffer, offset);
		offset += buffer.byteLength;
	}
	return output;
};
