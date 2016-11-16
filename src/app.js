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

    var indicator = document.createElement('div')
    indicator.style.cssText = "position:absolute;height:24px;width:100%;top:0;bottom:0;margin:auto;color:#323232;font-size:20px;text-align:center;"
    document.body.appendChild(indicator)

    smooth.on('ready', function(e){
        document.body.removeChild(indicator)
    })

    smooth.on('progress', function(e){
        console.log(e.current + '/' + e.total)
        indicator.innerHTML = e.current + '/' + e.total
    })
})