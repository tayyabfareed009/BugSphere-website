import Bug from '../models/Bug.js'
import Comment from '../models/Comment.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const populateBug = (query) => query.populate('project', 'name key').populate('reporter assignedDeveloper', 'name email role avatar')

export const getBugs = asyncHandler(async (req, res) => {
  const { search, status, priority, severity, project, developer, page = 1, limit = 10 } = req.query
  const query = {}
  if (status) query.status = status
  if (priority) query.priority = priority
  if (severity) query.severity = severity
  if (project) query.project = project
  if (developer) query.assignedDeveloper = developer
  if (search) query.$or = [{ bugId: new RegExp(search, 'i') }, { title: new RegExp(search, 'i') }]

  const skip = (Number(page) - 1) * Number(limit)
  const [bugs, total] = await Promise.all([
    populateBug(Bug.find(query)).sort('-updatedAt').skip(skip).limit(Number(limit)),
    Bug.countDocuments(query)
  ])
  res.json({ data: bugs, page: Number(page), total, pages: Math.ceil(total / Number(limit)) })
})

export const createBug = asyncHandler(async (req, res) => {
  const attachments = req.file ? [{ filename: req.file.filename, url: `/uploads/${req.file.filename}` }] : []
  const bug = await Bug.create({ ...req.body, reporter: req.user._id, attachments, activity: [{ message: 'Bug created', actor: req.user._id }] })
  res.status(201).json(await populateBug(Bug.findById(bug._id)))
})

export const getBug = asyncHandler(async (req, res) => {
  const bug = await populateBug(Bug.findById(req.params.id))
  if (!bug) return res.status(404).json({ message: 'Bug not found' })
  const comments = await Comment.find({ bug: bug._id }).populate('author mentions', 'name email role avatar').sort('createdAt')
  res.json({ ...bug.toObject(), comments })
})

export const updateBug = asyncHandler(async (req, res) => {
  const bug = await Bug.findByIdAndUpdate(req.params.id, { ...req.body, $push: { activity: { message: 'Bug updated', actor: req.user._id } } }, { new: true, runValidators: true })
  if (!bug) return res.status(404).json({ message: 'Bug not found' })
  res.json(await populateBug(Bug.findById(bug._id)))
})

export const deleteBug = asyncHandler(async (req, res) => {
  const bug = await Bug.findByIdAndDelete(req.params.id)
  if (!bug) return res.status(404).json({ message: 'Bug not found' })
  await Comment.deleteMany({ bug: bug._id })
  res.json({ message: 'Bug deleted' })
})
