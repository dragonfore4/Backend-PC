const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    projectId : {
        type: String,
    },
    title: {
        type: String,
    },
    file : {
        type: String,
    }
   
}, {timestamps: true});

module.exports = mongoose.model("Projects", projectSchema);