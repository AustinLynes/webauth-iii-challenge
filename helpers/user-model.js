const db = require('../data/dbConfig')

module.exports = {
    find,
    register
}

function find(username){
    let user = null
    
    if(username){
        user = db('user').where({username}).first() 
    }else{
        user = db('user') 
    }

    return user
}
function register(user){
    return db('user').insert(user)
}