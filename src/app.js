var Smooth = require('./smooth.js')

var smooth = document.querySelector('main')
var app = new Smooth(smooth, {
    direction: 'vertical',
    stageAnimation: 'bottomExpandIn',
    animations: {
        typing: function(node, parent){
            var p = node.getElementsByTagName('p')[0],
                content = p.innerHTML,
                index = 0

            p.innerHTML = ''
            parent.appendChild(node)
            var timer = setInterval(function(){
                p.innerHTML += content[index++]
                if(!content[index]) clearInterval(timer)
            }, 100)
        }
    },
    methods: {
        download: function(event, currentStage){
            window.location = 'https://github.com/cynil/smooth.js'
        }
    }
})

Smooth.touch('#dot').on('tap', function(event){
	var currentStage = app.stages[app.index]
	if(!currentStage.next()){
        app.goto(app.stages[app.index + 1])
    }
})