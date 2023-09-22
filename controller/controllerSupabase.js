const acad = require("../supabase/testeSupabase")

exports.paginaInicialSupabase = async ( req,res )=>{
    try{
        const dados = await acad()
        res.status(200).json({dados})
    }catch(error){
        console.error('Erro ao obter dados da academia:', error.message);
        res.status(500).json({ msg: 'Ocorreu um erro no servidor' });
    }
}