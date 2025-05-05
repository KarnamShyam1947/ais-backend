const express = require('express');
const {
    createProperty,
    getAllProperties,
    getPropertyById,
    updateProperty,
    deleteProperty
} = require('../controllers/PropertyController');

const propertyRouter = express.Router();

propertyRouter.route("/")
    .post(createProperty)
    .get(getAllProperties);

propertyRouter.route("/:id")
    .get(getPropertyById)
    .put(updateProperty)
    .delete(deleteProperty);

module.exports = propertyRouter;
