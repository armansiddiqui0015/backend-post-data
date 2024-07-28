const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
    content: String,
    like: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    date: {
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model('post', postSchema)


