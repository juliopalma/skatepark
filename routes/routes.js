const express = require('express');
const { get_users, set_auth } = require('../db.js');
const router = express.Router();


function protected_routes(req, res, next) {
    if (!req.session.user) {
        req.flash('errors', 'Debe ingresar al sistema primero');


        //BORRAR LA SIGUIENTE LINEA AL TERMINAR DE CARGAR LA PAGINA DE DATOS 
        //return res.redirect('/login')
    }
    next();
}

router.get('/', protected_routes, async(req, res) => {
    const user = req.session.user;
    const users = await get_users();

    res.render('index.html', { user, users })
});

//AGREGAR LA PAGINA PARA ACTUALIZAR LOS DATOS DE UN SKATER
router.get('/datos', protected_routes, async(req, res) => {
    const user = req.session.user;

    res.render('datos.html', { user });

});

router.post('/datos', protected_routes, async(req, res) => {
    // 1. Recuperamos los valores del formulario
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const password_confirm = req.body.password_confirm;
    const anos_experiencia = req.body.anos_experiencia;
    const especialidad = req.body.especialidad;



    res.render('datos.html', { user });
});

module.exports = router;