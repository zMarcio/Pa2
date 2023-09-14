const mongoose = require('mongoose')


const User = mongoose.model('User', {
    nome:String,
    email:String,
    cpf:String,
    senha:String
})


module.exports = User