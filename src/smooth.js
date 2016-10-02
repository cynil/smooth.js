(function(window, factory){
	if(typeof define === 'function' && define.amd){
		define(factory)
	}
	else if(typeof exports === 'object' && typeof module !== 'undefined'){
		module.exports = factory()
	}else{
		window.Smooth = factory()
	}
})(window, function(){
	'use strict';

	function toArray(list){
		return Array.prototype.slice.call(list)
	}

	function isFunction(fn){
		return Object.prototype.toString.call(fn) === '[object Function]'
	}

	function debounce(fn, delay){
		var timer
		return function(){
			var self = this,
				args = arguments

			clearTimeout(timer)
			timer = setTimeout(function(){
				fn.apply(self, arguments)
			}, delay||400)
		}
	}

	function touch(el){
		el = typeof el === 'string' ? document.querySelector(el) : el
		if(!el) throw 'touch element not found'
		return new Touch(el)
	}
	function Smooth(){
		console.log('hello')
	}

	Smooth.prototype = {}

	function Touch(){}

	Touch.prototype = {}

	return Smooth
})