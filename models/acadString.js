const mongoose = require("mongoose")

const Academia = mongoose.model('Academia', {
    nome_Academia:String,
    senha_Academia:String,
    CNPJ_Academia:String,
    email_Academia:String,
    num_contato_Academia:String,
    frequencia_Academia:Int8Array,
    quantidade_Academia:String
})


module.exports = Academia