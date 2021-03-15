const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Orders = require('../models/order');
const authenticationMiddleware = require('../middlewares/authentication');
const orderRouter = new express.Router();

orderRouter.use(authenticationMiddleware)

// admin can view all orders
orderRouter.get('/admin', async(req, res) => {
    try {
        const allOrders = await Orders.find({});
        console.log(allOrders);
        res.send(allOrders)
    } catch (err) {
        console.error(err);
        res.statusCode = 404;
        res.json({ success: false, message: err.message });
    }
})





// user can get his orders
orderRouter.get('/', async(req, res) => {
    console.log(req.signedData.id);
    try {
        const orders = await Orders.find({ user: req.signedData.id });
        res.send(orders);

    } catch (error) {
        console.error(error);
        res.statusCode = 422;
        res.json({ success: false, message: error.message });
    }

})

// user can post order
orderRouter.post('/', async(req, res) => {
    console.log(req);
    console.log(req.body);

    try {
        const { totalPrice, products } = req.body;
        console.log(products);

        const order = await Orders.create({ user: req.signedData.id, totalPrice, products })
        res.statusCode = 201;
        res.send(order);

    } catch (err) {
        console.error(err);
        res.statusCode = 422;
        res.json({ success: false, message: err.message });
    }


})

// admin can modify order status
orderRouter.patch('/:id', async(req, res) => {
    const { status } = req.body;
    console.log(req.body.status);
    console.log(req.params.id);

    try {

        const order = await Orders.updateOne({ _id: req.params.id }, { status: req.body.status });
        res.send(order);
    } catch (error) {
        console.error(error);
        res.statusCode = 422;
        res.json({ success: false, message: error.message });
    }
})

// user can delete order if it is pending

orderRouter.delete('/:id', async(req, res) => {
    console.log(req.params.id);
    console.log(req.signedData.id)
    try {
        const order = await Orders.findOne({ _id: req.params.id, user: req.signedData.id });
        console.log(order);
        if (order.status == "pending") {
            const order = await Orders.deleteOne({ _id: req.params.id, user: req.signedData.id });
            res.json({ success: true, message: "order deleted successfully" });
        } else res.json({ success: false, message: "order not pending" });
    } catch (error) {
        console.error(error);
        res.statusCode = 422;
        res.json({ success: false, message: error.message });
    }
})

module.exports = orderRouter;