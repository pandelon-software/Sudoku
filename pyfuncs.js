/*
	JavaScript implementation of a number of Python functions
*/

// internal function to turn an arguments object into an array
var argtoarray = function(arg) {
	var result = [];
	for (el in arg) result.push(arg[el]);
	return result;
}

// This implementation of the Range function is based on a combination of reading the documentation
// and testing the function in Idle using various inputs. Read Python documentation for usage.
exports.range = function() {
	if (arguments.length === 0) return [];

	var end = arguments.length > 1 ? arguments[1] : arguments[0];
	var start = arguments.length > 1 ? arguments[0] : 0;
	var step = arguments.length > 2 ? arguments[2] : end > start ? 1 : -1;

	// If step has the wrong sign, return empty array
	if (((start < end) && (step < 0)) || ((start > end) && (step > 0))) return [];

	// Adjust the end point so we don't overshoot
	end = (Math.ceil((end - start) / step) * step) + start;

	var index = start, theRange = [];
	while (index !== end) { theRange.push(index); index += step; }
	return theRange;
}

// This function returns a list of tuples, where the i-th tuple contains
// the i-th element from each of the argument sequences. The returned list
// is truncated in length to the length of the shortest argument sequence.
//A tuple is an immutable list, which is basically an array, so this returns
// an array of arrays.
exports.zip = function() {
	var index, length = Number.MAX_VALUE;

	// If there are no arguments, or one or more arguments are not an array
	// then return undefined.
	if (arguments.length === 0) return undefined;
	for (index = 0; index < arguments.length; index++) {
		if (!(arguments[index] instanceof Array)) return undefined;
		length = Math.min(arguments[index].length, length);	// get the length of the shortest array
	}

	// If we have reached here then all arguments are arrays and "length" contains
	// the length of the shortest one. We can now create the array of arrays.
	result = [];
	for (index = 0; index < length; index++) {
		result.push([]);
		Array.prototype.forEach.call(arguments, function(a) { result[index].push(a[index]); });
	}
	return result;
}

// A python dictionary is basically identical to a javascript object.
// This function allows a dictionary to be created either from an object
// or from an array. If an array is specified then it must contain one
// or more child arrays. Each child array must contain a name value pair.
exports.dict = function(arg) {
	// 
	if (!(arg instanceof Array)) {
		if (typeof(arg) !== 'object') throw new Error("dict(): argument must be object or array");
		return exports.object_copy(arg);	// must be an object so just return it
	}

	if (arg.length < 1) throw new Error("dict(): array argument must contain key, value sub-arrays");

	var result = {}, index;
	for (index = 0; index < arg.length; index++) {
		if (arg[index].length < 2) throw new Error("dict(): argument must contain name value pairs");
		result[arg[index][0]] = arg[index][1];
	}
	return result;
}

// returns an immutable copy of the specified object
exports.tuple = function(obj) {
	return Object.freeze(exports.dict(obj));
}

// emulates the string.center method
exports.string_center = function (s, width) {
	var padding = width - s.length;
	if (padding < 1) return s;	// If the string is wider than width, do nothing
	
	var right_padding = Math.ceil(padding / 2);
	var left_padding = padding - right_padding;
	return new Array(left_padding + 1).join(' ') + s + new Array(right_padding + 1).join(' ');
}

// emulate the object.copy() method
exports.object_copy = function(o) {
	var result = {};
	for (var name in o) if (o.hasOwnProperty(name)) result[name] = o[name];
	return result;
}
