var h1 = document.querySelector('h1')
var add = document.querySelector('#add')
var remove = document.querySelector('#remove')

add.addEventListener('click', function(event){
    document.body.appendChild(h1)
})

remove.addEventListener('click', function(event){
    document.body.removeChild(h1)
})