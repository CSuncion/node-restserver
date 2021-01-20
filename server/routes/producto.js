const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');

let app = express();

let Producto = require('../models/producto');

// ===========================
// Obtener todos los productos
// ===========================

app.get('/producto', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(5)
        .sort('nombre')
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, producto) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            };
            res.json({
                ok: true,
                producto
            });
        })
});


// ===========================
// Obtener un producto por ID
// ===========================
app.get('/producto/:id', (req, res) => {
    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            };
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            };

            res.json({
                ok: true,
                producto: productoDB
            })
        });

});


// ===========================
// Crear un nuevo producto
// ===========================
app.post('/producto', verificaToken, (req, res) => {

    // regresa el nuevo producto

    let body = req.body;

    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        };
        res.json({
            ok: true,
            producto: productoDB
        });
    });
});


// ===========================
// Actualizar un producto
// ===========================
app.put('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    let datosProductos = ({
        nombre: body.nombre,
        precioUni: body.precioUni,
        disponible: body.disponible,
        categoria: body.categoria
    })

    Producto.findByIdAndUpdate(id, datosProductos, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        };
        res.json({
            ok: true,
            producto: productoDB
        });
    });

});


// ===========================
// Borrar un producto
// ===========================
app.delete('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    let cambiaestado = {
        disponible: false
    }
    Producto.findByIdAndUpdate(id, cambiaestado, { new: true }, (err, productoBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };
        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            producto: productoBorrado
        })
    })


});

// ===========================
// Buscar un producto
// ===========================

app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            };
            res.json({
                ok: true,
                productos
            });
        })
});

module.exports = app;