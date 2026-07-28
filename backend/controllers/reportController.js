import Bug from '../models/Bug.js'
import Project from '../models/Project.js'
import User from '../models/User.js'
import Team from '../models/Team.js'
import Task from '../models/Task.js'
import Requirement from '../models/Requirement.js'
import Invitation from '../models/Invitation.js'
import AuditLog from '../models/AuditLog.js'
import Attachment from '../models/Attachment.js'
import Notification from '../models/Notification.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const groupBy = (organization, field) => Bug.aggregate([{ $match: { organization } }, { $group: { _id: `$${field}`, count: { $sum: 1 } } }, { $sort: { count: -1 } }])

export const getDashboard = asyncHandler(async (req, res) => {
  const [total, open, resolved, critical, projects, developers, recentBugs] = await Promise.all([
    Bug.countDocuments({ organization: req.user.organization }),
    Bug.countDocuments({ organization: req.user.organization, status: { $in: ['Open', 'Assigned', 'In Progress', 'Reopened'] } }),
    Bug.countDocuments({ organization: req.user.organization, status: 'Resolved' }),
    Bug.countDocuments({ organization: req.user.organization, priority: 'Critical' }),
    Project.countDocuments({ organization: req.user.organization }),
    User.countDocuments({ organization: req.user.organization, role: 'Developer' }),
    Bug.find({ organization: req.user.organization }).populate('project reporter assignedDeveloper', 'name key email').sort('-updatedAt').limit(6)
  ])
  res.json({ total, open, resolved, critical, projects, developers, recentBugs })
})

export const getReports = asyncHandler(async (req, res) => {
  const [byStatus, byPriority, bySeverity, byProject, monthly] = await Promise.all([
    groupBy(req.user.organization, 'status'),
    groupBy(req.user.organization, 'priority'),
    groupBy(req.user.organization, 'severity'),
    Bug.aggregate([{ $match: { organization: req.user.organization } }, { $group: { _id: '$project', count: { $sum: 1 } } }, { $lookup: { from: 'projects', localField: '_id', foreignField: '_id', as: 'project' } }]),
    Bug.aggregate([{ $match: { organization: req.user.organization } }, { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, bugs: { $sum: 1 } } }, { $sort: { '_id.year': 1, '_id.month': 1 } }])
  ])
  res.json({ byStatus, byPriority, bySeverity, byProject, monthly })
})

export const getOwnerDashboard = asyncHandler(async (req, res) => {
  const org = req.user.organization; const now = new Date(); const thirtyDays = new Date(now.getTime() - 30 * 86400000)
  const [employees, activeUsers, teams, projects, tasks, requirements, bugs, pendingInvitations, recentActivity, recentUploads, unreadNotifications, growth, workload] = await Promise.all([
    User.countDocuments({ organization: org }), User.countDocuments({ organization: org, active: true }), Team.countDocuments({ organization: org }), Project.countDocuments({ organization: org }), Task.countDocuments({ organization: org }), Requirement.countDocuments({ organization: org }), Bug.countDocuments({ organization: org }), Invitation.countDocuments({ organization: org, acceptedAt: null, canceledAt: null, expiresAt: { $gt: now } }),
    AuditLog.find({ organization: org }).populate('actor', 'name email').sort('-createdAt').limit(10),
    Attachment.find({ organization: org }).populate('uploadedBy', 'name').sort('-createdAt').limit(8),
    Notification.countDocuments({ user: req.user._id, read: false }),
    User.aggregate([{ $match: { organization: req.user.organization, createdAt: { $gte: thirtyDays } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, users: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Task.aggregate([{ $match: { organization: req.user.organization } }, { $group: { _id: '$assignee', tasks: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } } } }, { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } }, { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }, { $project: { tasks: 1, completed: 1, name: '$user.name' } }, { $sort: { tasks: -1 } }, { $limit: 8 }])
  ])
  console.log('[API] Owner dashboard loaded', { organizationId: org })
  res.json({ stats: { employees, activeUsers, disabledUsers: employees - activeUsers, teams, projects, tasks, requirements, bugs, pendingInvitations, unreadNotifications }, recentActivity, recentUploads, growth, workload })
})
