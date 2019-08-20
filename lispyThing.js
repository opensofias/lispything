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
	if (item instanceof Array) switch (item.type) {
		case '()': return evaluate (item, scope)
		case '[]': return list (item, scope)
		case '{}': return item
		default: throw 'unknown list type ' + item.type
	} else return (item in scope) ? scope [item] : parseLiteral (item)
})

const evaluate = (tree, scope) => { console.log (tree, scope)
	return (([first, ...rest]) => first (rest, scope)) (list (tree, scope))
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

const builtins = {
	'+': (param) => param.reduce ((acc, cur) => acc + cur, 0),
	'*': (param) => param.reduce ((acc, cur) => acc * cur, 1),
	'-': (param) => 0 - param.reduce ((acc, cur) => acc + cur, 0),
	'/': (param) => 1 / param.reduce ((acc, cur) => acc * cur, 1),
	at: ([list, pos]) => list [pos],
	slice: ([list, start, end]) => list.slice (start, end),
	cat: (param) => param.reduce ((acc, cur) => [...acc, ...cur], []),
	map: ([list, func]) => list.map (func),
	reduce: ([list, func, init]) => list.map (func, init),
	cons: ([item, list]) => [item, ...list],
	let: ([[name, value], body], scope) => evaluate (body, {__proto__: scope, [name]: value}),
	set: ([name, value]) => permaScope [name] = value,
	del: (param) => param.forEach (name => {delete permaScope [name]}),
	lambda: ([names, ...body], scope) => (...values) => evaluate (body, {
		...names.reduce ((subScope, name, idx) => subScope [name] = values [idx]),
		__proto__: scope,
	}),
	list, eval: evaluate	
}

const permaScope = {__proto__: builtins}