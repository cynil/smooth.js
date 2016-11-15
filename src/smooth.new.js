//smooth.js
//git repository: https://github.com/cynil/smooth.js
//?todo: on('event') hooks
//todo: canvas animation
//todo: a theme
//?todo: abstract of Event
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

	//utils

	function makeArray(list){
		return Array.prototype.slice.call(list)
	}
	function isFunc(thing){
		return Object.prototype.toString.call(thing) === '[object Function]'
	}
	function extend(optional, base){
		for(var prop in optional){
			if(!base[prop]) base[prop] = optional[prop]
        }
    }
	function throttle(fn, interval){
		var stamp = Date.now()
		return function(){
			if(Date.now() - stamp > (interval || 800)){
				fn.apply(this, arguments)
				stamp = Date.now()
			}
		}
	}
	function touch(el){
		el = typeof el === 'string' ? document.querySelector(el) : el
		if(!el) throw 'touch element not found'
		return new Touch(el)
	}
	function cssAnimate(node, parent, klass, cb){
		node.classList.add(klass)
		parent.appendChild(node)
		node.addEventListener('webkitAnimationEnd', function clearAnimation(event){
			this.removeEventListener('webkitAnimationEnd', clearAnimation)
			if(cb && isFunc(cb)){
				cb()
			}
		})
	}

	//smooth

	function Smooth(el, options){
		Event.apply(this, arguments)
		
		this.el = el
		this.index = -1
		this.options = options || {}
		this.methods = options.methods || {}
		this.animations = options.animations || {}
		this.stages = []
		this._init()
	}

	Smooth.prototype = {
		constructor: Smooth,
		_init: function(){
			var self = this

			var rawStage = this.el.querySelectorAll('.stage')

			makeArray(rawStage).map(function(raw){
				var stage = self.el.removeChild(raw)
				self.stages.push(new Stage(stage))
			})

			this._bindDOMEvents()
			this.on('ready', function(e){
				this.el.classList.add('show')
				this._load(this.stages[0])
            })
            if(this.options.resources){
                this.getResource()
            }
            else{
                this._emit('ready')
            }
		},
		getResource: function(){
			var images = this.el.querySelectorAll('img'),
			    progress = 0,
			    self = this
			
			if(images.length < 1) {
				this._emit('ready')
				return
            }
			
			makeArray(images).map(function(img, index){
				var src = img.dataset.src
				if(src){
					img.onerror = img.onload = function(e){
						if(++progress < images.length){
							self._emit('progress', {
							    current: progress,
							    total: images.length
                            })
                        }else{
                            self._emit('ready')
                        }
                        
                        img.onload = null; img = null
                    }
                    img.src = src
                }
            })
        },
        
		_bindDOMEvents: function(){
			touch(this.el)
				.on('swipe', throttle(this.swipeDelegateHandler.bind(this)))
				.on('tap', throttle(this.tapDelegateHandler.bind(this)))
		},
		
		swipeDelegateHandler: function(event){
			if(this.options.direction === 'vertical' && (event.direction === 0 || event.direction === 2)) return
			if(this.options.direction === 'horizontal' && (event.direction === 1 || event.direction === 3)) return

			if(event.direction === 2 || event.direction === 3){
				var next = this.index + 1
			}
			else{
				next = this.index - 1
			}
		    this._load(this.stages[next])
		},

		tapDelegateHandler: function(event){
			var stage = this.stages[this.index],
			    possibleAnchor = event.target.getAttribute('anchor'),
			    possibleHandler = event.target.getAttribute('ontap')

			if(possibleHandler && isFunc(this.methods[possibleHandler])){
				this.methods[possibleHandler].call(this, event, stage)
            }
            else if(!possibleHandler && possibleAnchor){
				this._load(this.stages[possibleAnchor])
            }
			else if(!possibleAnchor){
				if(!stage.next()){
					this._load(this.stages[this.index + 1])
                }
			}
		},

		_load: function(stage){			
			if(!(stage instanceof Stage)) return

			var nextIndex = this.stages.indexOf(stage),
				currentStage = this.stages[this.index],
				animation = this.options.stageAnimation,
				klass = nextIndex > this.index ? animation : animation + 'Reverse'
				self = this
				
			cssAnimate(stage.el, this.el, klass, function(){
				try{
					self.el.removeChild(currentStage.el)
				}catch(e){}
				if(!stage.played){
					stage.blocs.map(function(bloc, index){
						var delay = bloc.el.getAttribute('delay') || 0
						if(bloc.now === 'now'){
							var clock = setTimeout(function(){								
								//check javascript animation first
								var possibleJSAnimation = self.animations[bloc.animation]

								if(possibleJSAnimation && isFunc(possibleJSAnimation)){
									possibleJSAnimation(bloc.el, stage.el)
                                }else{
                                    //no js animation provided, use CSS instead
									cssAnimate(bloc.el, stage.el, bloc.animation, function(){
										bloc.el.classList.remove(bloc.animation)
										clearTimeout(clock)
									})
								}
							}, delay)
						}
					})
					stage.played = true
				}
				stage.el.classList.remove(klass)
            })
			this.index = nextIndex
		},
		
		flow: function(){
			var currentStage = this.stages[this.index]
	            if(!currentStage.next()){
                this.goto(this.stages[this.index + 1])
            }
        }
	}
    extend(Event, Smooth.prototype)    
	Smooth.prototype.goto = Smooth.prototype._load

	function Stage(el){
		this.el = el
		this.played = false
		this.blocs = []
		this.currentBloc = 0
		this._init()
	}
	Stage.prototype = {
		constructor: Stage,
		_init: function(){
			var self = this,
				rawBlocs = this.el.querySelectorAll('.bloc')

			makeArray(rawBlocs).map(function(raw){
				var animation = raw.getAttribute('animation') || 'expandIn',
					now = raw.getAttribute('now')

				self.blocs.push({
					el: self.el.removeChild(raw),
					now: now,
					animation: animation
				})
			})
		},
		next: function(){
			var currentBloc = this.blocs.filter(function(bloc){
				    return bloc.now !== 'now'
			    })[this.currentBloc],
			    self = this

			if(currentBloc){
                cssAnimate(currentBloc.el, this.el, currentBloc.animation, function(){
                    currentBloc.el.classList.remove(currentBloc.animation)
				    self.currentBloc++
				})
				return true
			}
            
            return false
        }
	}

    //Event.js
    
    var Event = (function(){
        function Event(){
            this.events = {}
        }
        
        Event.prototype = {
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
			}
        }
        
        return Event
    })()
	//Touch.js

	var Touch = (function(){
		var TAP_DURATION = 200,
		    TAP_DISTANCE = 30
		
		function getDistance(x0, y0){
			return Math.sqrt(x0 * x0 + y0 * y0)
		}
		function getDirection(x1, x2, y1, y2) {
            return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 2 : 0) : (y1 - y2 > 0 ? 3 : 1)
        }

		function Touch(el){
			Event.apply(this, arguments)
			this.el = el
			this._init()
		}
		
		Touch.prototype = {
			constructor: Touch,
			_init: function(){
				this.el.addEventListener('touchstart', this._start.bind(this))
				this.el.addEventListener('touchend', this._end.bind(this))
			},

			_start: function(event){
				var pointer = event.touches[0]

				this.then = Date.now()
				this.x0 = pointer.pageX
				this.y0 = pointer.pageY
			},
			_end: function(event){
				var pointer = event.changedTouches[0]

				event.duration = Date.now() - this.then 
				event.endX = pointer.pageX
				event.endY = pointer.pageY

				var dX = event.endX - this.x0,
					dY = event.endY - this.y0

				event.distance = getDistance(dX, dY)

				if(event.duration < TAP_DURATION && event.distance <= TAP_DISTANCE){
					this._emit('tap', event)
				}
				else if(event.distance > TAP_DISTANCE){
					event.direction = getDirection(this.x0, event.endX, this.y0, event.endY)
					this._emit('swipe', event)
				}
			}
		}
		extend(Event, Touch.prototype)
		
		return Touch
	})()

	//expose some utilities
	Smooth.animate = cssAnimate
	Smooth.touch = touch

	//expose Smooth to global
	return Smooth
})

$(document).ready(function(){
    var node = document.querySelector('.smooth')
    
    var smooth = new Smooth(node, {
        direction: 'horizontal',
        stageAnimation: 'bottomExpandIn',
        resources: true,
        methods: {
            coupon: function(e){
                var self = this
                
                axios.get(api).then(function(data){
                    self.stages[self.index].addBloc(data)
                })
            },
            jump: function(e, url){
                window.location = url
            }
        }
    })
    
    var indicator = document.body.appendChild('loading')
    
    smooth.on('progress', function(e){
        indicator.innerHTML = e.current / e.total
    })
    
    smooth.on('ready', function(e){
        document.body.removeChild(indicator)
    })
    
    Smooth.touch('#pointer').on('tap', function(e){
        smooth.flow()
    })
})