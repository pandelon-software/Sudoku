/*
	Implement a set in Javascript.
	This code is taken from "JavaScript: The Definitive Guide" by "David Flanagan".
	Contains some small modifications and an extra "map" method.
*/
function Set() {			// This is the constructor
	this.values = {};		// The properties of this object hold the set
	this.n = 0;				// How many values are in the set
	this.add.apply(this, arguments);	// All arguments are values to add
};

// Add each of the arguments to the set
Set.prototype.add = function() {
	for (var i = 0; i < arguments.length; i++) {	// For each argument
		var val = arguments[i];								// The value to add to the set
		var str = Set._v2s(val);							// Transform it to a string
		if (!this.values.hasOwnProperty(str)) {		// If not already in the set
			this.values[str] = val;							// Map string to value
			this.n++;											// Increase set size
		}
	}
	return this;												// Support chained calls
};

// Remove each of the arguments from the set
Set.prototype.remove = function() {
	for (var i = 0; i < arguments.length; i++) {	// For each argument
		var str = Set._v2s(arguments[i]);				// Map to a string
		if (this.values.hasOwnProperty(str)) {		// If it is in the set
			delete this.values[str];						// Delete it
			this.n--;											// Decrease set size
		}
	}
	return this;												// For method chaining
};

// Return true if the set contains value; otherwise return false
Set.prototype.contains = function(value) {
	return this.values.hasOwnProperty(Set._v2s(value));
};

// Return the size of the set
Set.prototype.size = function() { return this.n; }

// Call function f on the specified context for each element of the set
Set.prototype.forEach = function(f, context) {
	for (var s in this.values)					// For each string in the set
		if (this.values.hasOwnProperty(s))		// Ignore inherited properties
			f.call(context, this.values[s]);		// Call f on the value
};

// Call function f on the specified context for each element of the set
// and add the result to an array. Return the array at the end.
Set.prototype.map = function(f, context) {
	var result = [];
	for (var s in this.values)
		if (this.values.hasOwnProperty(s))
			result.push(f.call(context, this.values[s]));
	return result;
};

// This internal function maps any JavaScript value to a unique string
Set._v2s = function(val) {
	switch (val) {
		case undefined:		return 'u';				// Special primitive
		case null:				return 'n';				// values get single-letter
		case true:				return 't';				// codes
		case false:			return 'f';
		default: switch (typeof val) {
			case 'number':		return '#' + val;		// Numbers get # prefix
			case 'string':		return '"' + val;		// Strings get " prefix
			default: return '@' + objectId(val);		// Objs and funcs get @
		}
	}
	
	// For any object return a string. This function will return a different
	// string for different objects, and will always return the same string
	// if called multiple times for the same object. To do this it creates a
	// property on o. In ES5 the property would be nonenumerable and read-only.
	function objectId(o) {
		var prop = "|**objectid**|";		// Private property name for storing ids
		if (!o.hasOwnProperty(prop))		// If the object has no id
			o[prop] = Set._v2s.next++;		// Assign it the next available id
		return o[prop];						// Return the id
	}
};

Set._v2s.next = 100;		// Start assigning object ids at this value

// If this is being used with "include", export Set
if (typeof exports === "object") {
	exports.Set = Set;
} else {
	WScript.Echo("This module should be 'included' in another module");
}

Set.prototype.toString = function() {
	var s = "{", i = 0;
	this.forEach(function(v) { s += ((i++ > 0) ? ", " : "") + v; });
	return s + "}";
}

Set.prototype.toLocaleString = function(v) {
	var s = "{", i = 0;
	this.forEach(function(v) {
		if (i++ > 0) s += ", ";
		if (v == null) s += v; // null and undefined
		else s += v.toLocaleString(); // all other values
	});
}

exports.Set = Set;