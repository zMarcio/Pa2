const User = require('../models/userString');
const validator = require('validator')
const bcrypt = require('bcrypt')
require('dotenv').config()
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

exports.privateRouteUsu =  async (req,res)=>{
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
}


exports.signUsu = async(req,res) => {
    
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

}

exports.loginUsu = async (req,res) => {
    const { email, senha, cpf } = req.body
     

    if (!email) {
        return res.status(422).json({   msg:'O email é obrigatório.' })
    }

    if (!senha) {
        return res.status(422).json({   msg:'A senha é obrigatório.' })
    }
    const cpfLimpo = cpf.replace(/[^0-9]/g, '')
    const userCpfExist = await User.findOne({cpf:cpfLimpo})
    const user = await User.findOne({email:email})

    if(!user){
        return res.status(404).json({msg:'Email do usuario não encontrado'})
    }

    if(!userCpfExist){
        return res.status(404).json({msg:'CPF do usuario não encontrado'})
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
}


exports.deleteUsu = async(req,res)=>{
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
}

exports.updateUsu = async(req,res)=>{
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
}