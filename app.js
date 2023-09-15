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
// const acad = require("./controller/testeSupabase")
//ISSO AQUI NÃO FAÇO IDEIA DO QUE É:
// const { updateData } = require('moongose/controller/comments_controller')

//A partir daqui as resquisições
app.get('/', async (req,res)=>{ 
    // try{
    //     const dados = await acad()
    //     res.status(200).json({dados})
    // }catch(error){
    //     console.error('Erro ao obter dados da academia:', error.message);
    //     res.status(500).json({ msg: 'Ocorreu um erro no servidor' });
    // }



})

//Concluído

//  Private route
app.get("/user/:id", checkToken, async (req,res)=>{
    const {id} = req.params

    const user = await User.findOne({_id:Object(id)})
    
    if(!user){
        return res.status(404).json({msg:'Usuário não foi encontrado'})
    }
    try{
    
        res.status(200).json({user, id})

    }catch(error){
        console.log(error)
        
        return res.status(400).json({msg:'Token inválido!'})
    }
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
        console.log(error)
        
        res.status(500).json({   msg:'Aconteceu um erro no servidor, tente novamente mais tarde!'   })
    }
}

//Concluído

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
    const cpfLimpo = cpf.replace(/[^0-9]/g, '')
    const userCpfExist = await User.findOne({cpf:cpfLimpo})
    
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
        cpf: cpfLimpo,
        senha:hashSenha
    })
    
    try{
    //Aqui executa a ação de salva o usuario no banco
        await user.save()
        res.status(201).json({  msg:'Usuário criado com sucesso'    })
    }
    //Aqui gera o erro caso aconteça algo diferente 
    catch (error) {
        console.log(error)

        res.status(500).json({   msg:'Aconteceu um erro no servidor, tente novamente mais tarde!'   })
    }

})

//Concluído

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

//Concluído

app.delete("/user/:id", checkToken, async(req,res)=>{
    const {id} = req.params
    const user = await User.findOne({_id:Object(id)})
    
    if(!user){
        return res.status(404).json({ msg: 'Usuário não encontrado' });
    }
    
    try{
        await user.deleteOne();
        
        res.status(200).json({ msg: 'Usuário excluído com sucesso' })
    }catch(error){
        console.log(error)

        res.status(500).json({   msg:'Aconteceu um erro no servidor, tente novamente mais tarde!'   })
    }
    


    
})

//Concluído

app.put("/user/:id", checkToken, async(req,res)=>{
    const { nome, email, senha, senhaUsuarioAnterior } = req.body
    const { id } = req.params
    
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
    
    const userFind = await User.findOne({ _id : Object(id) })
    
    if (!userFind) {
        return res.status(404).json({ msg: 'Usuário não encontrado.' });
    }
    
    const salt = await bcrypt.genSalt(12)

    const senhaUsuarioAnteriorHashCompare = await bcrypt.compare(senhaUsuarioAnterior, userFind.senha);
    // console.log(senhaUsuarioAnteriorHashCompare)
    
    if(!senhaUsuarioAnteriorHashCompare){
        return res.status(422).json({   msg:'Senha anterior incorreta. Por favor, verifique sua senha anterior e tente novamente.'})
    }
    
    const senhaAtualSenhaAnterior = await bcrypt.compare(senha,userFind.senha)
    
    
    if(senhaAtualSenhaAnterior){
        return res.status(422).json({   msg:'A nova senha não pode ser igual à senha atual.'})
    }
    
    const hashSenha = await bcrypt.hash(senha, salt)
    
    userFind.nome = nome
    userFind.email = email
    userFind.senha = hashSenha
    
        
    try{
        await userFind.save()
        res.status(201).json({  msg:'Usuário modificado com sucesso'    })
    }catch (error) {
        res.status(500).json({   msg:'Aconteceu um erro no servidor, tente novamente mais tarde!'   })
    }
})

//Academias



//Route private acad
app.get("/enterprise/:id", checkToken, async(req,res)=>{
    const {id} = req.params
    //CASO DE MERDA VOLTA PARA ISSO
    /*
    const id = req.params.id
    const acad = await Academia.findbyid(id)
    */
    const acad = await Academia.findOne({_id:Object(id)})
    
    if(!acad){
        return res.status(404).json({msg:'Academia não foi encontrada'})
    }

    try{
        res.status(200).json({user, id})
    }catch(error){
        console.log(error)
        
        return res.status(400).json({msg:'Token inválido!'})
    }

})

//cadastro
app.post("/enterprise", async (req,res)=>{
    const { nome_Academia, senha_Academia, CNPJ_Academia, email_Academia, num_contato_Academia,frequencia_Academia, quantidade_Academia } = req.body

    if(!nome_Academia){
        res.status(422).json({   msg:'A Nome da Academia é obrigatório.'   })
    }
    
    if(!senha_Academia){
        res.status(422).json({   msg:'A senha é obrigatória'   })
    }

    if(!CNPJ_Academia){
        res.status(422).json({   msg:'O CNPJ é obrigatório.'   })
    }

    if(!email_Academia){
        res.status(422).json({   msg:'O Email é obrigatório.'   })
    }

    if(!num_contato_Academia){
        res.status(422).json({   msg:'O Numero para contato é obrigatório.'   })
    }

    if(quantidade_Academia == "0"){
        quantidade_Academia = "1"
    }

    
    if(!validator.isEmail(email)){
        return res.status(400).json({ error: 'Endereço de email inválido' });
    }
    
    //Aqui coloca criptografa gera a criptografia da senha
    const salt = await bcrypt.genSalt(12)
    //E aqui criptografa a senha colocando ela na variavel hashSenha
    const hashSenhaAcademia = await bcrypt.hash(senha_Academia, salt)

    const acad = new Academia({
        nome_Academia,
        senha_Academia:hashSenhaAcademia,
        CNPJ_Academia,
        email_Academia,
        num_contato_Academia,
        frequencia_Academia,
        quantidade_Academia
    })

    try{
        await acad.save()
        res.status(201).json({  msg:'Usuário modificado com sucesso'    })
    }catch(error){
        console.log(error)
        
        res.status(500).json({   msg:'Aconteceu um erro no servidor, tente novamente mais tarde!'   })
    }
})

//Login
app.post("/loginEnterpresie", async (req,res)=>{
    const { email, senha } = req.body

    if(!email){
        return res.status(422).json({   msg:'O email é obrigatório.' })
    }
    
    if(!senha){
        return res.status(422).json({   msg:'A senha é obrigatório.' })
    }

    const user = await User.findOne({ email: email })

    if(!user){
        return res.status(404).json({msg:'Usuario não encontrado'})
    }


    const checarSenha = await bcrypt.compare(senha,user.senha)

    if(!checarSenha){
        return res.status(422).json({msg:'Senha inválida'})
    }


    try{
        const secret = process.env.SECRET2

        const token = jwt.sign(
            {
                id:user._id
            },
            secret,
        )
        res.status(200).json({msg:'Autenticação realizada com sucesso', token})
    }catch(error){
        console.log(error)

        res.status(500).json({   msg:'Aconteceu um erro no servidor, tente novamente mais tarde!'   })
    }
})

app.put("/enterprise/:id",checkToken , async (req,res)=>{
    const { nome_Academia,email_Academia,senha_Academia, senha_Academia_Anterior,quantidade_Academia } = req.body

    const { id } = req.params

    if(!nome_Academia){
        return res.status(422).json(    {msg:'O nome da academia é obrigatório.'}    )
    }

    if(!email_Academia){
        return res.status(422).json({   msg:'O email é obrigatório.' })
    }

    if(!senha_Academia){
        return res.status(422).json({   msg:'A senha é obrigatório.' })
    }

    const acadFind = await Academia.findOne({_id:Object(id)})

    if(!acadFind){
        return res.status(404).json({ msg: 'Academia não encontrada.' });
    }

    const salt = await bcrypt.genSalt(12)

    const comparaSenha = await bcrypt.compare(senha_Academia_Anterior,acadFind.senha)

    if(!comparaSenha){
        return res.status(422).json({   msg:'Senha anterior incorreta. Por favor, verifique sua senha anterior e tente novamente.'})
    }

    const senhaAtualSenhaAnterior = await bcrypt.compare(senha_Academia,acadFind.senha)

    if(senhaAtualSenhaAnterior){
        return res.status(422).json({   msg:'A nova senha não pode ser igual à senha atual.'})
    }

    const hashSenha = await bcrypt.hash(senha_Academia,salt)

    acadFind.nome_Academia = nome_Academia
    acadFind.senha_Academia = hashSenha
    acadFind.email_Academia =email_Academia
    acadFind.quantidade_Academia = quantidade_Academia

    try{
        await acadFind.save()
        res.status(201).json({  msg:'Usuário modificado com sucesso'    })
    }catch(error){
        res.status(500).json({   msg:'Aconteceu um erro no servidor, tente novamente mais tarde!'   })
    }
})

app.delete("/enterpriseDelete:id", checkToken , async (req,res)=>{
    const {id} = req.params
    const acadFind = await Academia.findOne(id)

    if(!acadFind){
        return res.status(404).json({ msg: 'Usuário não encontrado' });
    }

    try {
        await acadFind.deleteOne()

        res.status(200).json({ msg: 'Academia excluída com sucesso' })
    } catch (error) {
        console.log(error)

        res.status(500).json({   msg:'Aconteceu um erro no servidor, tente novamente mais tarde!'   })
    }

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