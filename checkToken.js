const jwt = require('jsonwebtoken')
require('dotenv').config()

checkToken = (req,res,next) =>{
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

module.exports = checkToken