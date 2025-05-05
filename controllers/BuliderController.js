const Builder = require('../models/BuilderModel');

const createBuilder = async (req, res) => {
    try {
        const builder = new Builder(req.body);
        await builder.save();
        res.status(201).json({message : "bulider details added successfully", builder});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}


const getAllBuilders = async (req, res) => {
    try {
        const builders = await Builder.find();
        res.status(200).json({message: `fetched ${builders.length} records` ,builders});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const getBuilderById = async (req, res) => {
    try {
        const builder = await Builder.findById(req.params.id);
        if (!builder) {
            return res.status(404).json({ message: 'Builder not found' });
        }
        res.status(200).json(builder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const updateBuilder = async (req, res) => {
    try {
        const builder = await Builder.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!builder) {
            return res.status(404).json({ message: 'Builder not found' });
        }
        res.status(200).json(builder);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}


const deleteBuilder = async (req, res) => {
    try {
        const builder = await Builder.findByIdAndDelete(req.params.id);
        if (!builder) {
            return res.status(404).json({ message: 'Builder not found' });
        }
        res.status(200).json({ message: 'Builder deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


module.exports = {
    createBuilder,
    getAllBuilders,
    getBuilderById,
    updateBuilder,
    deleteBuilder
};
