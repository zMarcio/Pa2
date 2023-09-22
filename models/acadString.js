const mongoose = require("mongoose")

const Academia = mongoose.model('academias', {
    nome:String,
    senha:String,
    CNPJ:String,
    email:String,
    numContato:String,
    quantidade:String
})


module.exports = Academia