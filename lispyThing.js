// myLispyThing: attempt at a programming language that may be lisp-like
// released into the public domain

'use strict'

Object.defineProperties (Array.prototype, {
	top: {
		get () {return this [this.length - 1];}
}})

const str2tokens = (string = '') => {
	const result = []
	let word = ""
	const append = char => {
		word && (result.push (word), word = '') 
		char && result.push (char)
	}
	for (const char of string.split ('')) {
		if ('()[]{}⟨⟩⌊⌋⌈⌉'.includes (char))
			append (char)
		else if (' \n\t'.includes (char))
			append ()
		else word += char
	} append ()
	return result
}

const tokens2tree = tokenList => {
	const stack = [[]]
	for (const token of tokenList) {
		if ('([{⟨'.includes (token)) {
			const [current, newList] = [stack.top, []]
			current.push (newList)
			stack.push (newList)
			newList.type = token
		} else if (')]}⟩'.includes (token)) {
			stack.pop ().type += token
		} else stack.top.push (token)
	}
	if (stack.length != 1) throw 'unbalanced brackets.'
	return stack[0]
}

const list = (tree, scope) => tree.map (item => {
	if (! (item instanceof Array)) return item
	else switch (item.type) {
		case '()': return evaluate (item, scope)
		case '[]': return list (item, scope)
		case '{}': return item
		default: throw 'unknown list type ' + item.type
	} 
})

const evaluate = (tree, scope) => {
	switch (tree [0]) {
		case 'eval': return evaluate (tree [1], scope);
		case 'list': return list (tree.slice (1), scope);
	}
	
	tree = tree.map (item =>
		(item in scope) ? scope [item] : parseLiteral (item)
	)
	
}

const parseLiteral = str => {
	for (const prefix in literalMap) {
		if (str.startsWith (prefix)) return literalMap [prefix] (str)
	}

	return str
}

const literalMap = {
	'#': lit => Number.parseInt(lit.slice (1), 16),
	'd#': lit => Number.parseInt(lit.slice (2), 10),
	'b#': lit => Number.parseInt(lit.slice (2), 2),
	"'": lit => lit.slice (1)
}

const functions = {
	'+': (...nums) => nums.reduce ((acc, cur) => acc + cur, 0),
	'*': (...nums) => nums.reduce ((acc, cur) => acc * cur, 1),
	'-': (...nums) => 0 - nums.reduce ((acc, cur) => acc + cur, 0),
	'/': (...nums) => 1 / nums.reduce ((acc, cur) => acc * cur, 1),
	
}
