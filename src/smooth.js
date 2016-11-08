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

/**
 * utils
 */
	function makeArray(list){
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


/**
 * smooth.js
 * git repository: https://github.com/cynil/smooth.js
 */
	function Smooth(el, options){
		this.el = document.querySelector(el)
		this.options = options || {}
		this.stages = []
		this.init()
	}

	Smooth.prototype = {
		constructor: Smooth,
		init: function(){
			var self = this

			var rawStage = this.el.querySelectorAll('.stage')

			makeArray(rawStage).map(function(raw){
				self.stages.push(new Stage(raw, self))
			})

			this._bindAll()
			this.currentStage = null
			this.load(this.stages[0])
		},
		_bindAll: function(){
			var self = this

			touch(document.body).on('tap', debounce(function(event){
				
			}, 500))
		}
	}

	function Stage(){}

	Stage.prototype = {}



/**
 * Touch.js by cynii
 * git repository: https://github.com/cynil/touch.js
 */
	var NEAR = 10,
		PRESS_DURATION = 600,
		DOUBLE_INTERVAL = 300

	function getTime(){
		return Date.now()
	}

	function getDistance(x0, y0){
		return Math.sqrt(x0 * x0 + y0 * y0)
	}

	function Touch(el){
		this.el = el
		this.events = {}
		this._previous = null
		this._init()
	}

	Touch.prototype = {
		_init: function(){
			this.el.addEventListener('touchstart', this._touchstart.bind(this))
			this.el.addEventListener('touchmove', this._touchmove.bind(this))
			this.el.addEventListener('touchend', this._touchend.bind(this))
		},
		_emit: function(type, event){
			var callbacks = this.events[type],
				self = this

			if(!callbacks) return
			callbacks.map(function(cb){
				cb.call(self.el, event)
			})
		},
		on: function(type, cb){
			if(this.events[type] === undefined) {
				this.events[type] = [cb]
			}
			else{
				this.events[type].push(cb)
			}

			return this
		},
		off: function(type, cb){
			if (!this.events[type]) return
			if(!cb) this.events[type] = []

			this.events[type] = this.events[type].filter(function(fn){
				return fn !== cb
			})
		},

		_touchstart: function(event){
			var pointer = event.touches[0],
				self = this

			if(this.e) this._previous = this.e
			this.e = {}
			this.e.startX = pointer.pageX
			this.e.startY = pointer.pageY
			this.e.startTime = getTime()

			this.pressClock = setTimeout(function(){
				self.e.endTime = getTime()
				self.e.duration = self.e.endTime - self.e.startTime
				self._emit('press', self.e)
			}, PRESS_DURATION)
		},
		_touchmove: function(event){
			var pointer = event.touches[0],
				X = pointer.pageX - this.e.startX,
				Y = pointer.pageY - this.e.startY

			if(getDistance(X, Y) > NEAR) clearTimeout(this.pressClock)

			this.e.deltaX = X - (this._previousX || 0)
			this.e.deltaY = Y - (this._previousY || 0)
			this._previousX = X;this._previousY = Y

			this._emit('move', this.e)

		},
		_touchend: function(event){
			var pointer = event.changedTouches[0]
			this.e.endTime = getTime()
			this.e.duration = this.e.endTime -this.e.startTime
			this.e.endX = pointer.pageX
			this.e.endY = pointer.pageY

			clearTimeout(this.pressClock)

			var diffX = this.e.endX - this.e.startX,
				diffY = this.e.endY - this.e.startY,
				distance = getDistance(diffX, diffY),
				rightWards = this.e.endX - this.e.startX > 0,
				downWards = this.e.endY - this.e.startY > 0,
				horizontal = Math.abs(diffX) > Math.abs(diffY)

			if(distance > NEAR){
				if(horizontal && rightWards){
					this._emit('rswipe', this.e)
				}
				else if(horizontal && !rightWards){
					this._emit('lswipe', this.e)
				}
				else if(!horizontal && downWards){
					this._emit('dswipe', this.e)
				}
				else if(!horizontal && !downWards){
					this._emit('uswipe', this.e)
				}
			}
			else if(distance <= NEAR){
				if(this.e.duration > PRESS_DURATION){
					//this._emit('press', this.e)
				}
				else if(this.e.duration <= PRESS_DURATION){
					if(this._previous){
						if(this.e.startTime - this._previous.endTime > DOUBLE_INTERVAL){
							this._emit('tap', this.e)
						}
						else if(this.e.startTime - this._previous.endTime <= DOUBLE_INTERVAL){
								this._emit('dbltap', this.e)
						}
					}
					else{
						this._emit('tap', this.e)
					}
				}
			}

			this._previousX = null;this._previousY = null
		}
	}
	//↑↑↑ touch.js ends here

	//expose Smooth to global
	return Smooth
})