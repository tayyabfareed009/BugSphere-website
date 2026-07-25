import Project from '../models/Project.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getProjects = asyncHandler(async (req, res) => {
  const { search, status } = req.query
  const query = { organization: req.user.organization }
  if (status) query.status = status
  if (search) query.$or = [{ name: new RegExp(search, 'i') }, { key: new RegExp(search, 'i') }]
  const projects = await Project.find(query).populate('owner members', 'name email role avatar').sort('-createdAt')
  res.json(projects)
})

export const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create({ ...req.body, organization: req.user.organization, owner: req.user._id })
  res.status(201).json(project)
})

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, organization: req.user.organization }).populate('owner members', 'name email role avatar')
  if (!project) return res.status(404).json({ message: 'Project not found' })
  res.json(project)
})

export const updateProject = asyncHandler(async (req, res) => {
  const allowed = ['name', 'description', 'status', 'members', 'teams', 'milestones', 'dueDate']
  const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)))
  const project = await Project.findOneAndUpdate({ _id: req.params.id, organization: req.user.organization }, update, { new: true, runValidators: true })
  if (!project) return res.status(404).json({ message: 'Project not found' })
  res.json(project)
})

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOneAndDelete({ _id: req.params.id, organization: req.user.organization })
  if (!project) return res.status(404).json({ message: 'Project not found' })
  res.json({ message: 'Project deleted' })
})
