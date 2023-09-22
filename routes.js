const express = require("express")
const route = express.Router()
const checkToken = require("./checkToken")
const controlleSupabase = require('./controller/controllerSupabase')
const controllerUsuario = require('./controller/controllerUsuario')
const controllerAcademia = require('./controller/controllerAcademia')

route.get("/", controlleSupabase.paginaInicialSupabase)

route.get("/user/:id", checkToken, controllerUsuario.privateRouteUsu)

route.post("/cadastro", controllerUsuario.signUsu)

route.post("/login", controllerUsuario.loginUsu)

route.put("/user/:id", checkToken, controllerUsuario.updateUsu)

route.put("/user/:id", checkToken, controllerUsuario.deleteUsu)

route.get('/enterprise/:id', controllerAcademia.privateRouteAcad)

route.post('/enterprise', controllerAcademia.signAcad)

route.post('/loginEnterprise', controllerAcademia.loginAcad)

route.put('/enterprise/:id', checkToken, controllerAcademia.updateAcad)

route.delete('/enterpriseDelete/:id', checkToken, controllerAcademia.deleteAcad)

module.exports = route 