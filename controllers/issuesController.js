const Issue = require('../models/Issue')
const User = require('../models/User')

// @desc Get all issues 
// @route GET /issues
// @access Private
const getAllIssues = async (req, res) => {
    // Get all issues from MongoDB
    const issues = await Issue.find().lean()

    // If no issues 
    if (!issues?.length) {
        return res.status(400).json({ message: 'No issues found' })
    }

    // Add username to each issue before sending the response 
    // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE 
    // You could also do this with a for...of loop
    const issuesWithUser = await Promise.all(issues.map(async (issue) => {
        const user = await User.findById(issue.user).lean().exec()
        return { ...issue, username: user.username }
    }))

    res.json(issuesWithUser)
}

// @desc Create new issue
// @route POST /issues
// @access Private
const createNewIssue = async (req, res) => {
    const { user, createdby, title, type, priority, environment, actions, expected, actual } = req.body

    // Confirm data
    if (!user || !title || !type || !priority ||!environment||!actions||!actual||!expected ) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate title
    const duplicate = await Issue.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate bug title' })
    }

    // Create and store the new user 
    const issue = await Issue.create({ user, createdby, title, type, priority, environment, actions, expected, actual })

    if (issue) { // Created 
        return res.status(201).json({ message: 'New issue created' })
    } else {
        return res.status(400).json({ message: 'Invalid issue data received' })
    }

}

// @desc Update a issue
// @route PATCH /issues
// @access Private
const updateIssue = async (req, res) => {
    const { id, user, createdby, title, type, priority, environment, actions, expected, actual, completed } = req.body

    // Confirm data
    if (!id || !user || !title || !type || !priority ||!environment||!actions||!actual||!expected || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Confirm issue exists to update
    const issue = await Issue.findById(id).exec()

    if (!issue) {
        return res.status(400).json({ message: 'Bug report not found' })
    }

    // Check for duplicate title
    const duplicate = await Issue.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()

    // Allow renaming of the original issue 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate bug title' })
    }

    issue.user = user
    issue.createdby=createdby
    issue.title = title
    issue.type = type
    issue.completed = completed
    issue.priority = priority
    issue.environment = environment
    issue.actions = actions
    issue.expected = expected
    issue.actual = actual
    const updatedIssue = await issue.save()

    res.json(`'${updatedIssue.title}' updated`)
}

// @desc Delete a issue
// @route DELETE /issues
// @access Private
const deleteIssue = async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Bug ID required' })
    }

    // Confirm issue exists to delete 
    const issue = await Issue.findById(id).exec()

    if (!issue) {
        return res.status(400).json({ message: 'Bug not found' })
    }

    const result = await issue.deleteOne()

    const reply = `Bug '${result.title}' with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllIssues,
    createNewIssue,
    updateIssue,
    deleteIssue
}
