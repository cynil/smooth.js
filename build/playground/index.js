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
			Event.apply(this)
			this.el = el
			this._init()
		}
		
		Touch.prototype = {
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
		extend(Event.prototype, Touch.prototype)
		
		return Touch
	})()

	function extend(optional, base){
		for(var prop in optional){
			if(!base[prop] && optional.hasOwnProperty(prop)){
				base[prop] = optional[prop]
			}
		}
	}

    window.onload = function(){
        new Touch(document.body)
        .on('tap', function(e){
            console.log(e)
        })
        .on('swipe', function(e){
            console.log(e.direction)
        })
    }