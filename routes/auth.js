const express = require('express');
const bcrypt = require('bcrypt');
const { get_user, create_user, eliminar } = require('../db.js');
const { route } = require('./routes.js');
const router = express.Router();


router.get('/login', (req, res) => {
    const errors = req.flash('errors');
    res.render('login.html', { errors });
});

router.post('/login', async(req, res) => {
    // 1. Recuperar los valores del formulario
    const email = req.body.email;
    const password = req.body.password;

    // 2. Validar que usuario sí existe
    const user = await get_user(email);
    if (!user) {
        req.flash('errors', 'Usuario no existe o contraseña incorrecta');
        return res.redirect('/login');
    }

    // 3. Validar que contraseña coincida con lo de la base de datos
    const son_iguales = await bcrypt.compare(password, user.password);
    if (!son_iguales) {
        req.flash('errors', 'Usuario no existe o contraseña incorrecta');
        return res.redirect('/login');
    }

    // 4. Guardamos el usuario en sesión
    req.session.user = user
    res.redirect('/');
});


router.get('/register', (req, res) => {
    const errors = req.flash('errors');
    res.render('register.html', { errors });
});

router.post('/register', async(req, res) => {
    // 1. Recuperamos los valores del formulario
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const password_confirm = req.body.password_confirm;
    const anio_exper = req.body.anio_exper;
    const especialidad = req.body.especialidad;
    const foto = req.files.foto;
    // const estado = req.body.estado;
    const estado = true;

    const ext = foto.name.split('.').slice(-1)[0].toLowerCase();
    //validar que la extencion es permitida, jpg, png, jpeg, bmp
    if (ext != 'jpg' && ext != 'png' && ext != 'jpeg' && ext != 'bmp') {
        req.flash('errors', 'La extension del archivo no es la correcta');
        return res.redirect('/register');
    }

    // 2. validar que contraseñas sean iguales
    if (password != password_confirm) {
        req.flash('errors', 'La contraseñas no coinciden');
        return res.redirect('/register');
    }

    // 3. validar que email no exista previamente
    const user = await get_user(email);
    if (user) {
        req.flash('errors', 'Usuario ya existe o contraseña incorrecta');
        return res.redirect('/register');
    }

    const password_encrypt = await bcrypt.hash(password, 10);
    await create_user(email, name, password_encrypt, anio_exper, especialidad, foto.name, estado);

    // 4. Guardo el nuevo usuario en sesión
    req.session.user = { name, email, anio_exper, especialidad }
    res.redirect('/login')
});


router.get('/eliminar', async(req, res) => {
    const email = req.session.user.email;
    await eliminar(email);

    res.redirect('/login');
});

module.exports = router;