const express = require('express');
const app = express();
const routes = require('./routes')
const mongoose = require('mongoose')
app.use(express.json())
app.use(routes)

//Aqui a senha e user do database
const dbUser = process.env.DTB_ACCESS
const dbSenha = process.env.DTB_SENHA

//aqui a conexão com a database
mongoose.connect(`mongodb+srv://${dbUser}:${dbSenha}@cluster0.zckej4f.mongodb.net/?retryWrites=true&w=majority`)
    .then(()=>{
    app.listen(h = 3003, ()=>{
        console.log(`http://localhost:${h}/`)
    })
    console.log('Conectou ao banco!')
    })  
    .catch((err) => console.log(err))