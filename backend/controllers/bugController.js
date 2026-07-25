import Bug from '../models/Bug.js'
import Comment from '../models/Comment.js'
import cloudinary from '../config/cloudinary.js'
import Attachment from '../models/Attachment.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const populateBug = (query) => query.populate('project', 'name key').populate('reporter assignedDeveloper', 'name email role avatar')
const uploadAttachment = (file) => new Promise((resolve, reject) => cloudinary.uploader.upload_stream({ resource_type: 'auto', folder: 'bugsphere/attachments', public_id: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-')}` }, (error, result) => error ? reject(error) : resolve({ filename: file.originalname, url: result.secure_url, publicId: result.public_id, resourceType: result.resource_type })).end(file.buffer))
const transitions = { Open: ['Assigned'], Assigned: ['In Progress'], 'In Progress': ['Ready for Testing'], 'Ready for Testing': ['Testing'], Testing: ['Resolved', 'Reopened'], Reopened: ['Assigned', 'In Progress'], Resolved: ['Closed', 'Reopened'], Closed: ['Reopened'] }

export const getBugs = asyncHandler(async (req, res) => {
  const { search, status, priority, severity, project, developer, page = 1, limit = 10 } = req.query
  const query = { organization: req.user.organization }
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
  const attachments = req.file ? [await uploadAttachment(req.file)] : []
  const bug = await Bug.create({ ...req.body, organization: req.user.organization, reporter: req.user._id, attachments, activity: [{ message: 'Bug created', actor: req.user._id }] })
  if (attachments.length) await Attachment.create({ ...attachments[0], organization: req.user.organization, bug: bug._id, uploadedBy: req.user._id })
  res.status(201).json(await populateBug(Bug.findById(bug._id)))
})

export const getBug = asyncHandler(async (req, res) => {
  const bug = await populateBug(Bug.findOne({ _id: req.params.id, organization: req.user.organization }))
  if (!bug) return res.status(404).json({ message: 'Bug not found' })
  const comments = await Comment.find({ bug: bug._id }).populate('author mentions', 'name email role avatar').sort('createdAt')
  res.json({ ...bug.toObject(), comments })
})

export const updateBug = asyncHandler(async (req, res) => {
  const allowed = ['title', 'description', 'priority', 'severity', 'status', 'assignedDeveloper', 'labels', 'dueDate']
  const current = await Bug.findOne({ _id: req.params.id, organization: req.user.organization }).select('status assignedDeveloper reporter')
  if (!current) return res.status(404).json({ message: 'Bug not found' })
  if (req.body.status && req.body.status !== current.status) {
    if (!transitions[current.status]?.includes(req.body.status)) return res.status(422).json({ message: `Cannot transition from ${current.status} to ${req.body.status}` })
    const canUpdate = ['Owner', 'Project Manager', 'Team Lead'].includes(req.user.role) || current.assignedDeveloper?.equals(req.user._id) || current.reporter.equals(req.user._id)
    if (!canUpdate) return res.status(403).json({ message: 'You are not permitted to change this bug status' })
  }
  const updates = { ...Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key))), $push: { activity: { message: req.body.status ? `Status changed to ${req.body.status}` : 'Bug updated', actor: req.user._id } } }
  if (req.file) {
    const attachment = await uploadAttachment(req.file)
    updates.$push.attachments = attachment
    await Attachment.create({ ...attachment, organization: req.user.organization, bug: req.params.id, uploadedBy: req.user._id })
  }
  const bug = await Bug.findOneAndUpdate({ _id: req.params.id, organization: req.user.organization }, updates, { new: true, runValidators: true })
  if (!bug) return res.status(404).json({ message: 'Bug not found' })
  res.json(await populateBug(Bug.findById(bug._id)))
})

export const deleteBug = asyncHandler(async (req, res) => {
  const bug = await Bug.findOneAndDelete({ _id: req.params.id, organization: req.user.organization })
  if (!bug) return res.status(404).json({ message: 'Bug not found' })
  await Comment.deleteMany({ bug: bug._id })
  res.json({ message: 'Bug deleted' })
})
