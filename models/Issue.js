const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const issueSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        createdby: {
            type: String
        },
        title: {
            type: String,
            required: true
        },
        type: {
            type: String
        },
        priority: {
            type: String
        },
        environment: {
            type: String,
            required: true
        },
        actions: {
            type: String,
            required: true
        },
        expected: {
            type: String,
            required: true
        },
        actual: {
            type: String,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

issueSchema.plugin(AutoIncrement, {
    inc_field: 'ticket',
    id: 'ticketNums',
    start_seq: 500
})

module.exports = mongoose.model('Issue', issueSchema)