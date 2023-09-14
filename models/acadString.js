const mongoose = require("mongoose")

const Academia = mongoose.model('Academia', {
    nome_Academia:String,
    CNPJ_Academia:String,
    email_Academia:String,
    numTelefone_Academia:String,
    frquencia_Academia: Int8Array,
    quantidade_Academia: Int8Array,
})


module.exports = Academia