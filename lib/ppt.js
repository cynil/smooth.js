define(['hammer', 'zepto'], function(Hammer, $){
'use strict'

function toArray(list){
    return Array.prototype.slice.call(list)
}
function isFunction(fn){
  return Object.prototype.toString.call(fn) === '[object Function]'
}

function hm(el){
    var el = typeof el === 'string' ? document.querySelector(el) : el
    var hmer = new Hammer(el)
    hmer.get('swipe').set({direction: Hammer.DIRECTION_ALL})
    hmer.get('pan').set({direction: Hammer.DIRECTION_ALL})
    
    return hmer
}

function anime(el, klass, cb){
    el.addClass(klass)
    //大坑。。每次都会绑定一遍，导致函数重复执行，所以要先去绑定
    el.one('animationend', function(event){
        el.removeClass(klass)
        if(isFunction(cb)){
            cb()
        }
    })
}

function next(dir, val, arr){
    var index = arr.indexOf(val)
    if(index === -1) return -1
    return arr[(index + dir + arr.length) % arr.length]
}

function PPT(el, options){
    PPT.options = options
    this.el = el
    this.stages = []
    this.init()
}

PPT.prototype = {
    constructor: PPT,
    init: function(){
        var self = this
        var rawStage = this.el.querySelectorAll('.stage')
        
        toArray(rawStage).map(function(raw){
            self.stages.push(new Stage(raw, self))
        })

        this.currentStage = null
        this.load(this.stages[0])
    },
    load: function(stage){
        if(!(stage instanceof Stage)) return false
         console.log('loaded: stage[' + this.stages.indexOf(stage) + ']')       
        var self = this,
            $el = $(stage.el),
            toBeRemoved = this.currentStage
        var index = this.stages.indexOf(stage),
            prevIndex = this.stages.indexOf(this.currentStage),
            isFromNextStage = index < prevIndex
            console.log(index, prevIndex, isFromNextStage)

        if(toBeRemoved) $(toBeRemoved.el).css({'zIndex': '0'})
        $el.css({zIndex:'1',transform: 'translateX(0)'})

        anime($el, isFromNextStage ? stage.animate + 'Reverse': stage.animate, function(){
            self.currentStage = stage
            $el.css({opacity: '1'})
            stage.clean = false
            if(toBeRemoved && !!toBeRemoved.clean === false) {
                toBeRemoved.clear()
            }
            if(stage.nowblocs.length > 0){
                stage.nowblocs.map(function(nowbloc){
                    anime($(nowbloc.el), nowbloc.animate, function(){
                        $(nowbloc.el).css({'opacity': '1'})
                    })
                })
            }
        })
    }
}

function Stage(el, host){
    this.el = el
    this.host = host
    this.animate = this.el.getAttribute('animate') || 'bottomIn'
    this.init()
}

Stage.prototype = {
    constructor: Stage,
    init: function(){
        var self = this
        var rawBlocs = this.el.querySelectorAll('.bloc')

        this.blocs = []; this.nowblocs = []; this.currentBloc = 0

        toArray(rawBlocs).map(function(raw){
            var animate = raw.getAttribute('animate') || 'bottomIn',
                now = raw.getAttribute('now')

            if(now !== undefined && now !== null){
                self.nowblocs.push({
                    el: raw,
                    animate: animate
                })
            }else{
                self.blocs.push({
                    el: raw,
                    animate: animate
                })
            }
        })
        
        hm(this.el).on('swipe', function(event){
            if(event.direction === 8){
                self.host.load(next(1, self, self.host.stages))
            }else if(event.direction === 16){
                self.host.load(next(-1, self, self.host.stages))
            }
        })
      
        hm(this.el).on('tap', function(event){
            var current = self.blocs[self.currentBloc]
            
            if(current){
                anime($(current.el), current.animate, function(){
                    $(current.el).css({'opacity': '1'})
                    console.log('current: stages[' + self.host.stages.indexOf(self) + '], blocs[' + self.currentBloc + ']')
                    self.currentBloc++
                })
            }else if(!current){
                self.host.load(next(1, self, self.host.stages))
                self.currentBloc = 0
            }
        })
    },
    clear: function(){
        var self = this, 
            blocs = this.blocs.concat(this.nowblocs),
            $el = $(this.el)

        console.log('cleared: stages[' + self.host.stages.indexOf(self) + ']')

        this.currentBloc = 0
        $el.css({
            'transform':'translateX(-100%)',
            'opacity': '0'
        })

        blocs.map(function(bloc){
            $(bloc.el).css({'opacity': '0'})
        })
        this.clean = true
    }
}

PPT.utils = {
    toArray: toArray,
    hm: hm
}

return PPT
})