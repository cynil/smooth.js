require.config({
    paths: {
        'hammer': '../bower_components/hammerjs/hammer.min',
        'zepto': '../bower_components/zepto/zepto.min',
        'ppt': '../lib/ppt'
    },
    shim: {
        'zepto': {
            exports: 'Zepto'
        }
    }
})

require(['ppt'], function(PPT){

    var ppt = document.querySelector('.ppt')
    var app = new PPT(ppt, {
        rollback: false
    })
    
    PPT.utils.hm('#back').on('press', function(event){
        app.load(app.stages[0])
    })

//end require
})