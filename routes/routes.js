const express = require('express');
const bcrypt = require('bcrypt');

const { get_users, update, get_user, set_auth } = require('../db.js');
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

router.get('/datos', protected_routes, async(req, res) => {
    const user = req.session.user;

    res.render('datos.html', { user });

});

router.post('/datos', protected_routes, async(req, res) => {
    // 1. Recuperamos los valores del formulario
    const email = req.session.user.email;
    const name = req.body.name;
    const password = req.body.password;
    const password_confirm = req.body.password_confirm;
    const anos_experiencia = req.body.anos_experiencia;
    const especialidad = req.body.especialidad;

    // 1. Validamos que ambas contraeeña coincidan
    const user = await get_user(email);
    if (!user) {
        req.flash('errors', 'Usuario no existe o contraseña incorrecta');
        console.log(req.body, 'Usuario no existe o contraseña incorrecta');
        return res.redirect('/login');
    }

    // 3. Validar que contraseña coincida con lo de la base de datos
    if (password != password_confirm) {
        req.flash('errors', 'Usuario no existe o contraseña incorrecta');
        console.log('errors', 'contraseña');
        return res.redirect('/login');
    }
    console.log('Todo ok con el update');

    // 2. Actualizar al usuario actual
    const password_encrypt = await bcrypt.hash(password, 10)
    await update(email, name, password_encrypt, parseInt(anos_experiencia), especialidad);
    req.session.user = { email, nombre: name, anos_experiencia, especialidad }
    res.redirect('/');

});

module.exports = router;