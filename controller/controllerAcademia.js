const Academia = require('../models/acadString');
const validator = require('validator');
const bcrypt = require('bcrypt')
require('dotenv').config()
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')


exports.privateRouteAcad = async(req,res)=>{
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

}

exports.signAcad = async (req,res)=>{
    const { nome, senha, CNPJ, email, numContato, quantidade } = req.body

    if(!nome){
        return res.status(422).json({   msg:'A Nome da Academia é obrigatório.'   })
    }
    
    if(!senha){
        return res.status(422).json({   msg:'A senha é obrigatória'   })
    }

    if(!CNPJ){
        return res.status(422).json({   msg:'O CNPJ é obrigatório.'   })
    }

    if(!email){
        return res.status(422).json({   msg:'O Email é obrigatório.'   })
    }
    
    if(!numContato){
        return res.status(422).json({   msg:'O Numero para contato é obrigatório.'   })
    }

    const academia = await Academia.findOne({email:email})

    if(academia){
        return res.status(404).json({msg:'Academia não encontrada'})
    }

    if(quantidade == "0"){
        quantidade = "1"
    }

    
    if(!validator.isEmail(email)){
        return res.status(400).json({ error: 'Endereço de email inválido' });
    }
    
    //Aqui coloca criptografa gera a criptografia da senha
    const salt = await bcrypt.genSalt(12)
    //E aqui criptografa a senha colocando ela na variavel hashSenha
    const hashSenhaAcademia = await bcrypt.hash(senha, salt)

    const acad = new Academia({
        nome,
        senha:hashSenhaAcademia,
        CNPJ,
        email,
        numContato,
        quantidade
    })

    try{
        await acad.save()
        return res.status(201).json({ msg: 'Academia criado com sucesso' })
    }catch(error){
        console.log(error)
        
        return res.status(500).json({   msg:'Aconteceu um erro no servidor, tente novamente mais tarde!'   })
    }
}

exports.loginAcad = async (req,res)=>{
    const { email, senha } = req.body

    if(!email){
        return res.status(422).json({   msg:'O email é obrigatório.' })
    }
    
    if(!senha){
        return res.status(422).json({   msg:'A senha é obrigatório.' })
    }

    const acad = await Academia.findOne({ email: email })

    if(!acad){
        return res.status(404).json({msg:'Academia não encontrado'})
    }


    const checarSenha = await bcrypt.compare(senha,acad.senha)

    if(!checarSenha){
        return res.status(422).json({msg:'Senha inválida'})
    }


    try{
        const secret = process.env.SECRET

        const token = jwt.sign(
            {
                id:acad._id
            },
            secret,
        )
        return res.status(200).json({msg:'Autenticação realizada com sucesso', token})
    }catch(error){
        console.log(error)

        return res.status(500).json({   msg:'Aconteceu um erro no servidor, tente novamente mais tarde!'   })
    }
}

exports.updateAcad = async (req,res)=>{
    const { nome,email,senha, senhaAnterior,quantidade } = req.body

    const { id } = req.params

    if(!nome){
        return res.status(422).json(    {msg:'O nome da academia é obrigatório.'}    )
    }

    if(!email){
        return res.status(422).json({   msg:'O email é obrigatório.' })
    }

    if(!senha){
        return res.status(422).json({   msg:'A senha é obrigatório.' })
    }

    const acadFind = await Academia.findOne({_id:Object(id)})

    if(!acadFind){
        return res.status(404).json({ msg: 'Academia não encontrada.' });
    }

    const salt = await bcrypt.genSalt(12)

    const comparaSenha = await bcrypt.compare(senhaAnterior,acadFind.senha)

    if(!comparaSenha){
        return res.status(422).json({   msg:'Senha anterior incorreta. Por favor, verifique sua senha anterior e tente novamente.'})
    }

    const senhaAtualSenhaAnterior = await bcrypt.compare(senha,acadFind.senha)

    if(senhaAtualSenhaAnterior){
        return res.status(422).json({   msg:'A nova senha não pode ser igual à senha atual.'})
    }

    const hashSenha = await bcrypt.hash(senha, salt)

    acadFind.nome = nome
    acadFind.senha = hashSenha
    acadFind.email = email
    acadFind.quantidade = quantidade

    try{
        await acadFind.save()
        return res.status(201).json({  msg:'Academia modificado com sucesso'    })
    }catch(error){
        return res.status(500).json({   msg:'Aconteceu um erro no servidor, tente novamente mais tarde!'   })
    }
}

exports.deleteAcad = async (req,res)=>{
    const {id} = req.params
    const acadFind = await Academia.findOne({ _id:Object(id) })

    if(!acadFind){
        return res.status(404).json({ msg: 'Usuário não encontrado' });
    }

    try {
        await acadFind.deleteOne()

        return res.status(200).json({ msg: 'Academia excluída com sucesso' })
    } catch (error) {
        console.log(error)

        return res.status(500).json({   msg:'Aconteceu um erro no servidor, tente novamente mais tarde!'   })
    }

}