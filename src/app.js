var Smooth = require('./smooth.js')

window.addEventListener('DOMContentLoaded', function(){
    var main = document.querySelector('main')
    var smooth = new Smooth(main, {
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
})
