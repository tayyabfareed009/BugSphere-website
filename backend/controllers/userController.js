import User from '../models/User.js'
import Team from '../models/Team.js'
import Task from '../models/Task.js'
import TaskSubmission from '../models/TaskSubmission.js'
import Project from '../models/Project.js'
import Bug from '../models/Bug.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getUsers = asyncHandler(async (req, res) => {
  res.json(await User.find({ organization: req.user.organization }).sort('name'))
})

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.user._id, organization: req.user.organization })
  Object.assign(user, { name: req.body.name || user.name, avatar: req.body.avatar || user.avatar, notificationsEnabled: req.body.notificationsEnabled ?? user.notificationsEnabled })
  await user.save()
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar })
})

export const updateUser = asyncHandler(async (req, res) => {
  const allowed = ['role', 'name', 'avatar', 'phone', 'notificationsEnabled', 'active']
  const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)))
  const user = await User.findOneAndUpdate({ _id: req.params.id, organization: req.user.organization }, update, { new: true, runValidators: true })
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(user)
})

export const getEmployeeOverview = asyncHandler(async (req, res) => {
  const employee = await User.findOne({ _id: req.params.id, organization: req.user.organization }).select('-firebaseUid')
  if (!employee) return res.status(404).json({ message: 'Employee not found' })
  const [tasks, bugs, submissions, projects] = await Promise.all([
    Task.find({ organization: req.user.organization, assignee: employee._id }).select('title status deadline estimatedHours').sort('-updatedAt').limit(20),
    Bug.find({ organization: req.user.organization, assignedDeveloper: employee._id }).select('bugId title status priority').sort('-updatedAt').limit(20),
    TaskSubmission.find({ organization: req.user.organization, employee: employee._id }).select('task status hoursWorked submissionDate').populate('task', 'title').sort('-submissionDate').limit(20),
    Project.find({ organization: req.user.organization, members: employee._id }).select('name key status').sort('name')
  ])
  const approvedHours = submissions.filter((item) => item.status === 'Approved').reduce((sum, item) => sum + item.hoursWorked, 0)
  res.json({ employee, tasks, bugs, submissions, projects, productivity: { approvedHours, completedTasks: tasks.filter((task) => task.status === 'Completed').length, totalTasks: tasks.length } })
})

export const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) return res.status(422).json({ message: 'Transfer ownership before removing your own account' })
  const user = await User.findOneAndDelete({ _id: req.params.id, organization: req.user.organization })
  if (!user) return res.status(404).json({ message: 'User not found' })
  await Promise.all([
    Team.updateMany({ organization: req.user.organization }, { $pull: { members: user._id } }),
    Team.updateMany({ organization: req.user.organization, lead: user._id }, { $unset: { lead: 1 } }),
    Task.updateMany({ organization: req.user.organization, assignee: user._id }, { $unset: { assignee: 1 } }),
    TaskSubmission.deleteMany({ organization: req.user.organization, employee: user._id })
  ])
  res.json({ message: 'User deleted' })
})
