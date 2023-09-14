//Arquivo para colocar senhas importantes do sistema como a do cluster
require('dotenv').config()

//validator
const validator = require('validator')

//Criptografa a senha
const bcrypt = require('bcrypt')

//Manda o token para front-end para confirma a se a senha é aquela msm só que cryptografada
const jwt = require('jsonwebtoken')

//Conectar ao mongoDb ISSO AQUI FOI PARA TESTE
const mongoose = require('mongoose')

//Isso aqui é o express (facilita o sistema de rotas)
const express = require('express');
const app = express();

//Isso aqui é pro express aceitar dados do tipo json (middleware)
app.use(express.json())

//import user
const User = require('./models/userString');
// const { checkout } = require('moongose/routes');

//import Academia
const Academia = require('./models/acadString')

//A partir daqui as resquisições
app.get('/', (req,res)=>{
    res.send('OI')
})

//  Private route
app.get("/user/:id", checkToken, async (req,res)=>{
    const id = req.params.id


    const user = await User.findById(id,'-senha')

    if(!user){
        return res.status(404).json({msg:'Usuário não encontrado'})
    }

    res.status(200).json({user, id})
})

function checkToken(req,res,next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if(!token){
        return res.status(401).json({msg:'Acesso negado!'})
    }

    try{

        const secret = process.env.SECRET

        jwt.verify(token,secret)

        next()

    } catch(error){
        return res.status(400).json({msg:'Token inválido!'})
    }
}

app.post('/cadastro', async(req,res) => {
    
    const { nome, email, cpf, senha, confirmarSenha } = req.body

    if (!nome) {
        return res.status(422).json(    {msg:'O nome é obrigatório.'}    )
    }

    if (!email) {
        return res.status(422).json({   msg:'O email é obrigatório.' })
    }
    
    if(!cpf){
        return res.status(422).json({   msg:'CPF é obrigatório.' })
    }

    if (!senha) {
        return res.status(422).json({   msg:'A senha é obrigatório.' })
    }
    
    if (!confirmarSenha) {
        return res.status(422).json({   msg:'O confirmar a senha é obrigatório.' })
    }
    
    if (senha !== confirmarSenha) {
        return res.status(422).json({   msg:'O campo senha é diferente do campo confirma senha.' })
    }
    
    const userExists = await User.findOne({email:email})
    const userCpfExist = await User.findOne({cpf:cpf})

    if(userExists){
        return res.status(422).json({msg:'Por favor, utilize outro e-mail!'})
    }

    if(userCpfExist){
        return res.status(422).json({msg:'Por favor, utilize outro Cpf!'})
    }
    
    if(!validator.isEmail(email)){
        return res.status(400).json({ error: 'Endereço de email inválido' });
    }

    //Aqui coloca criptografa gera a criptografia da senha
    const salt = await bcrypt.genSalt(12)
    //E aqui criptografa a senha colocando ela na variavel hashSenha
    const hashSenha = await bcrypt.hash(senha, salt)

    // ver se faz o hash de cpf
    // const hashCpf

    //Aqui implementa o usuario dentro do banco
    const user = new User({
        nome,
        email,
        cpf,
        senha:hashSenha
    })

    //Aqui executa a ação de salva o usuario no banco
    try{
        await user.save()
        res.status(201).json({  msg:'Usuário criado com sucesso'    })
    }
    //Aqui gera o erro caso aconteça algo diferente 
    catch (error) {
        res.status(500).json({   msg:'Aconteceu um erro no servidor, tente novamente mais tarde!'   })
    }

})

//  Login Usuario
app.post("/login", async (req,res) => {
    const { email, senha } = req.body
     

    if (!email) {
        return res.status(422).json({   msg:'O email é obrigatório.' })
    }

    if (!senha) {
        return res.status(422).json({   msg:'A senha é obrigatório.' })
    }

    const user = await User.findOne({email:email})

    if(!user){
        return res.status(404).json({msg:'Usuario não encontrado'})
    }

    const checarSenha = await bcrypt.compare(senha,user.senha)

    if(!checarSenha) {
        return res.status(422).json({msg:'Senha inválida'})
    }

    try{

        const secret = process.env.SECRET

        const token = jwt.sign(
            {
                id:user._id,
            }, 
            secret,
        )
        res.status(200).json({msg:'Autenticação realizada com sucesso', token})
    }
    catch (error) {
        console.log(error)

        res.status(500).json({   msg:'Aconteceu um erro no servidor, tente novamente mais tarde!'   })
    }
})

app.delete("/user/:id",checkToken, async(req,res)=>{
    const id = req.params.id

    const user = await User.findById(id,'-senha')

    if(!user){
        return res.status(404).json({ msg: 'Usuário não encontrado' });
    }

    await user.deleteOne();

    res.status(200).json({ msg: 'Usuário excluído com sucesso' })
    
})

app.put("/user/:id", checkToken, async(req,res)=>{
    const { nome, email, senha } = req.body

    if (!nome) {
        return res.status(422).json(    {msg:'O nome é obrigatório.'}    )
    }

    if (!email) {
        return res.status(422).json({   msg:'O email é obrigatório.' })
    }

    if (!senha) {
        return res.status(422).json({   msg:'A senha é obrigatório.' })
    }

    if(!validator.isEmail(email)){
        return res.status(400).json({ error: 'Endereço de email inválido' });
    }

    //Aqui coloca criptografa gera a criptografia da senha
    const salt = await bcrypt.genSalt(12)
    //E aqui criptografa a senha colocando ela na variavel hashSenha
    const hashSenha = await bcrypt.hash(senha, salt)
    //Aqui gera o erro caso aconteça algo diferente 
})

//Academias

app.post("/enterprise", async (req,res)=>{
    const { nome, cnpj, email, num_contato, frequencia,  quantas_academias } = req.body

    if(!nome){
        res.status(422).json({   msg:'A Nome da Academia é obrigatório.'   })
    }

    if(!cnpj){
        res.status(422).json({   msg:'O CNPJ é obrigatório.'   })
    }

    if(!email){
        res.status(422).json({   msg:'O Email é obrigatório.'   })
    }

    if(!num_contato){
        res.status(422).json({   msg:'O Numero para contato é obrigatório.'   })
    }

    // if(!frequencia){
    //     res.status(422).json({   msg:'A frequencia é obrigatório.'   }) 
    // }

    // if(!quantas_academias){
    //     res.status(422).json({   msg:'A quantidade de academias é obrigatório.'   })
    // }

    if(!validator.isEmail(email)){
        return res.status(400).json({ error: 'Endereço de email inválido' });
    }

    const acad = new Academia({
        nome_Academia:nome,
        CNPJ_Academia:cnpj,
        email_Academia:email,
        numTelefone_Academia:num_contato,
        frquencia_Academia: frequencia,
        quantidade_Academia: quantas_academias
    })
})




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