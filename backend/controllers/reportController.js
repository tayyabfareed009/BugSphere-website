import Bug from '../models/Bug.js'
import Project from '../models/Project.js'
import User from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const groupBy = (field) => Bug.aggregate([{ $group: { _id: `$${field}`, count: { $sum: 1 } } }, { $sort: { count: -1 } }])

export const getDashboard = asyncHandler(async (req, res) => {
  const [total, open, resolved, critical, projects, developers, recentBugs] = await Promise.all([
    Bug.countDocuments(),
    Bug.countDocuments({ status: { $in: ['Open', 'Assigned', 'In Progress', 'Reopened'] } }),
    Bug.countDocuments({ status: 'Resolved' }),
    Bug.countDocuments({ priority: 'Critical' }),
    Project.countDocuments(),
    User.countDocuments({ role: 'Developer' }),
    Bug.find().populate('project reporter assignedDeveloper', 'name key email').sort('-updatedAt').limit(6)
  ])
  res.json({ total, open, resolved, critical, projects, developers, recentBugs })
})

export const getReports = asyncHandler(async (req, res) => {
  const [byStatus, byPriority, bySeverity, byProject, monthly] = await Promise.all([
    groupBy('status'),
    groupBy('priority'),
    groupBy('severity'),
    Bug.aggregate([{ $group: { _id: '$project', count: { $sum: 1 } } }, { $lookup: { from: 'projects', localField: '_id', foreignField: '_id', as: 'project' } }]),
    Bug.aggregate([{ $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, bugs: { $sum: 1 } } }, { $sort: { '_id.year': 1, '_id.month': 1 } }])
  ])
  res.json({ byStatus, byPriority, bySeverity, byProject, monthly })
})
