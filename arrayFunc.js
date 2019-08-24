'use strict'
Object.defineProperties (Array.prototype, {
	reversed: {
		get () {return this.slice ().reverse ();}
	},
	transposed: {
		get () {return Object.keys (this[0]).map (
			colNum => this.map (rowNum => rowNum[colNum])
	)}}
})

