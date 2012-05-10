/*
	JavaScript implementation of Sudoku solving algorithm from: http://norvig.com/sudoku.html
*/

var Set = require("./Set.js").Set;
var Python = require("./pyfuncs.js");

var cross = function(A, B) {
	var result = [];
	A.split("").forEach(function(a) { B.split("").forEach(function(b) { result.push(a + b); }); });
	return result;
}

var digits = "123456789";
var rows = "ABCDEFGHI";
var cols = digits;
var squares = cross(rows, cols);

var unitlist = [];
var x = ['ABC','DEF','GHI'];
var y = ['123','456','789'];
for (c in cols) unitlist.push(cross(rows, cols[c]));
for (r in rows) unitlist.push(cross(rows[r], cols));
for (rs in x) 
	for (cs in y)
		unitlist.push(cross(x[rs], y[cs]));

var units = {};
squares.forEach(function(s) {
	unitlist.forEach(function(u) {
		if (u.indexOf(s) > -1)
			if (units[s]) units[s].push(u)
			else units[s] = [u];
	});
});

var peers = {};
squares.forEach(function(s) {
	var set = new Set();
	units[s].forEach(function(unit) {
		Set.prototype.add.apply(set, unit);	// each unit is an array of strings in the form "A1"...
	});

	set.remove(s);
	peers[s] = set;
});

// Convert grid to a dict of possible values, {square: digits}, or
// return False if a contradiction is detected.
function parse_grid(grid) {
	// To start, every square can be any digit; then assign values from the grid.
	var values = Python.dict(squares.map(function(s) { return new Array(s, digits); }));
	var grid_dict = grid_values(grid);
	for (var s in grid_dict) {
		var d = grid_dict[s];
		// if d is a valid digit but we can't assign it to square s then return false
		if (digits.indexOf(d) > -1 && !assign(values, s, d)) return false;
	}
	return values;
}

// Convert grid into a dict of {square: char} with '0' or '.' for empties.
function grid_values(grid) {
	chars = grid.split("").filter(function(x) { return (digits + "0.").indexOf(x) > -1; });
	if (chars.length !== 81) throw new Error("invalid characters in grid");
	return Python.dict(Python.zip(squares, chars));
}

// Eliminate all of the other values (except d) from value[s] and propogate.
// Return true, or false if a contradiction is detected.
// parameters:
// 	values: a dictionary in the format {A1: digits, A2: digits, ...}
// 	s: a square, eg "A1"
// 	d: a digit to assign to the square, eg "4"
function assign(values, s, d) {
	var other_values = values[s].replace(d, "");
	return other_values.split("").map(function(d2) { return eliminate(values, s, d2); }).every(function(x) { return x !== false; }) ? values : false;
}

// Eliminate d from value[s]; propogate when values or places <= 2.
// Return values, or false if a contradiction is detected.
// parameters:
//		values: a dictionary in the format {A1: digits, A2: digits, ...}
// 	s: a square, eg "A1"
// 	d: a digit to assign to the square, eg "4"
function eliminate(values, s, d) {
	if (values[s].indexOf(d) === -1) return values;	// Already eliminated

	values[s] = values[s].replace(d, '');	// eliminate d from value[s]
	
	// (1) If a square s is reduced to one value d2, then eliminate d2 from the peers
	if (values[s].length === 0) return false;	// Contradiction: removed last value
	if (values[s].length === 1) {
		var d2 = values[s];
		if (!(peers[s].map(function(s2) { return eliminate(values, s2, d2) }).every(function(x) { return x !== false; }))) {
			return false;
		}
	}

	// (2) If a unit u is reduced to only one place for a value d, then put it there.
	for (var index = 0; index < units[s].length; index++) {
		var dplaces = units[s][index].filter(function(s) { return values[s].indexOf(d) > -1; });
		if (dplaces.length === 0) return false;	// Contradiction: no place for this value
		if (dplaces.length === 1) {
			// d can only be in one place in unit; asign it there
			if (!assign(values, dplaces[0], d)) return false;
		}
	}
	return values;
}

function display(values) {
	var width = 1 + squares.reduce(function(max, s) { return Math.max(max, values[s].length); }, 0);
	var line = new Array(4).join('+' + new Array(width * 3 + 1).join('-')).slice(1);
	var currentRow;

	rows.split('').forEach(function(r) {
		currentRow = '';
		cols.split('').forEach(function(c) {
			currentRow += Python.string_center(values[r + c], width) + ((c === '3') || (c === '6') ? '|' : '');
		});
		console.log(currentRow);
		if (r === 'C' || r === 'F') console.log(line);
	});
}

function solve(grid) { return search(parse_grid(grid)); }

// using depth-first search and propogation, try all possible values.
function search(values) {
	if (values === false) return values;	// Failed earlier
	if (squares.some(function(s) { return values[s].length === 0; })) return false;		// should already have failed
	if (squares.every(function(s) { return values[s].length === 1; })) return values;	// Solved
	
	// Choose the unfilled square s with the fewest possibilities. Algorithm:
	//		(1) filter squares to those where value[square].length > 1
	//		(2) create a map from the filtered squares where each element is an
	//				array [value[square].length, square]
	//		(3) reduce the new array using a function that compares each element to see which has the shortest length
	var filtered_squares = squares.filter(function(square) { return values[square].length > 1; });
	var tuples = filtered_squares.map(function(square) { return [values[square].length, square]; });
	var tuple = tuples.reduce(function(prev, curr) { return prev[0] <= curr[0] ? prev : curr; });
	var s = tuple[1];	// tuple[0] is the length, tuple[1] is the square.
	return some(values[s].split('').map(function(d) { return search(assign(Python.object_copy(values), s, d)); }));
}

// Return some element of seq that is true
function some(seq) {
	for (var name in seq) {
		if (seq[name]) {
			return seq[name];
		}
	}
	return false;
}

// test
var puzzle = "4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......";
console.log(grid_values(puzzle));

function debug_values(values) {
	var output = '';
	for (name in values) {
		var value = values[name];
		output += "(" + name + ":" + value + ') ';
	}
	return output;
}