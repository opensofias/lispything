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

const list = (tree, scope) => tree.map (subTree => {
	if (subTree.type == '()') return eval (subTree, scope)
	else if (subTree.type == '[]') return list (subTree, scope)
	else if (subTree.type == '{}') return subTree
	else throw 'unknown type of subtree: ' + subTree
})

const eval = (tree, scope) => {
	
	
	switch (tree [0]) {
		case 'eval': return eval (tree [1], scope);
		case 'list': return list (tree.slice (1), scope);
	}
	

}

