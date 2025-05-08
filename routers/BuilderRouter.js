const express = require('express');
const {
    createBuilder,
    getAllBuilders,
    getBuilderById,
    updateBuilder,
    deleteBuilder
} = require('../controllers/BuliderController');

const builderRouter = express.Router();

builderRouter.route("/")
    .get(getAllBuilders)
    .post(createBuilder)

builderRouter.route("/:id")
    .get(getBuilderById)
    .put(updateBuilder)
    .delete(deleteBuilder);

module.exports = builderRouter;
