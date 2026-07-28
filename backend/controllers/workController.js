import Project from '../models/Project.js'
import Requirement from '../models/Requirement.js'
import Task from '../models/Task.js'
import TaskSubmission from '../models/TaskSubmission.js'
import Team from '../models/Team.js'
import User from '../models/User.js'
import cloudinary from '../config/cloudinary.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const managers = ['Owner', 'Project Manager', 'Team Manager', 'Team Lead']
const managerOf = async (user, teamId) => managers.includes(user.role) || Boolean(teamId && await Team.exists({ _id: teamId, organization: user.organization, lead: user._id }))
const ensureProject = (id, org) => Project.exists({ _id: id, organization: org })
const uploadFiles = async (files = [], folder) => Promise.all(files.map((file) => new Promise((resolve, reject) => cloudinary.uploader.upload_stream({ resource_type: 'auto', folder, public_id: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-')}` }, (error, result) => error ? reject(error) : resolve({ url: result.secure_url, publicId: result.public_id, filename: file.originalname, mimeType: file.mimetype, uploadedAt: new Date() })).end(file.buffer))))

export const getRequirements = asyncHandler(async (req, res) => {
  const query = { organization: req.user.organization }; if (req.query.project) query.project = req.query.project; if (req.query.status) query.status = req.query.status
  res.json(await Requirement.find(query).populate('project createdBy', 'name key name email').sort('-updatedAt'))
})
export const createRequirement = asyncHandler(async (req, res) => {
    console.log("========== CREATE REQUIREMENT ==========");
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
    console.log("USER:", req.user);

    if (!await ensureProject(req.body.project, req.user.organization)) {
        return res.status(422).json({
            message: "Project not found"
        });
    }

    const files = await uploadFiles(req.files || [], "worksphere/requirements");

    const requirement = await Requirement.create({
        ...req.body,
        files,
        organization: req.user.organization,
        createdBy: req.user._id,
    });

    res.status(201).json(requirement);
});
export const updateRequirement = asyncHandler(async (req, res) => {
  const allowed = ['title', 'content', 'status', 'files']; const current = await Requirement.findOne({ _id: req.params.id, organization: req.user.organization })
  if (!current) return res.status(404).json({ message: 'Requirement not found' })
  const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)))
  if (update.status && update.status !== current.status) { update.$push = { approvalHistory: { status: update.status, note: req.body.note || '', actor: req.user._id } }; update.version = current.version + 1 }
  const requirement = await Requirement.findByIdAndUpdate(current._id, update, { new: true, runValidators: true })
  res.json(requirement)
})
export const deleteRequirement = asyncHandler(async (req, res) => { const item = await Requirement.findOneAndDelete({ _id: req.params.id, organization: req.user.organization }); if (!item) return res.status(404).json({ message: 'Requirement not found' }); res.json({ message: 'Requirement deleted' }) })

export const getTasks = asyncHandler(async (req, res) => {
  const query = { organization: req.user.organization }; ['project', 'status', 'assignee', 'team'].forEach((key) => { if (req.query[key]) query[key] = req.query[key] })
  if (!managers.includes(req.user.role)) query.$or = [{ assignee: req.user._id }, { team: { $in: (await Team.find({ organization: req.user.organization, members: req.user._id }).distinct('_id')) } }]
  res.json(await Task.find(query).populate('project requirement team assignee createdBy', 'name key title email role').sort('deadline -updatedAt'))
})
export const createTask = asyncHandler(async (req, res) => {
  const { project, assignee, team } = req.body
  if (!await ensureProject(project, req.user.organization)) return res.status(422).json({ message: 'Project not found' })
  if (!await managerOf(req.user, team)) return res.status(403).json({ message: 'Only managers can assign tasks' })
  if (assignee && !await User.exists({ _id: assignee, organization: req.user.organization })) return res.status(422).json({ message: 'Assignee not found' })
  if (team && !await Team.exists({ _id: team, organization: req.user.organization })) return res.status(422).json({ message: 'Team not found' })
  const attachments = await uploadFiles(req.files, 'worksphere/tasks')
  const task = await Task.create({ ...req.body, attachments, organization: req.user.organization, createdBy: req.user._id, status: assignee || team ? 'Assigned' : req.body.status })
  res.status(201).json(await Task.findById(task._id).populate('project requirement team assignee createdBy', 'name key title email role'))
})
export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, organization: req.user.organization }); if (!task) return res.status(404).json({ message: 'Task not found' })
  const owns = task.assignee?.equals(req.user._id) || await Team.exists({ _id: task.team, lead: req.user._id, organization: req.user.organization })
  if (!managers.includes(req.user.role) && !owns) return res.status(403).json({ message: 'You cannot update this task' })
  const allowed = managers.includes(req.user.role) || owns ? ['title', 'description', 'priority', 'deadline', 'estimatedHours', 'status', 'assignee', 'team', 'requirement', 'dependencies'] : ['status']
  const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)))
  const result = await Task.findByIdAndUpdate(task._id, update, { new: true, runValidators: true }).populate('project requirement team assignee createdBy', 'name key title email role')
  res.json(result)
})
export const deleteTask = asyncHandler(async (req, res) => { const task = await Task.findOneAndDelete({ _id: req.params.id, organization: req.user.organization }); if (!task) return res.status(404).json({ message: 'Task not found' }); await TaskSubmission.deleteMany({ task: task._id }); res.json({ message: 'Task deleted' }) })

export const getSubmissions = asyncHandler(async (req, res) => {
  const query = { organization: req.user.organization }; if (req.query.task) query.task = req.query.task
  if (!managers.includes(req.user.role)) query.employee = req.user._id
  res.json(await TaskSubmission.find(query).populate('task employee reviewedBy', 'title name email role').sort('-submissionDate'))
})
export const createSubmission = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.body.task, organization: req.user.organization }); if (!task) return res.status(422).json({ message: 'Task not found' })
  const permitted = task.assignee?.equals(req.user._id) || await Team.exists({ _id: task.team, organization: req.user.organization, members: req.user._id })
  if (!permitted) return res.status(403).json({ message: 'You can submit work only for assigned tasks' })
  const attachments = await uploadFiles(req.files, 'worksphere/submissions')
  res.status(201).json(await TaskSubmission.create({ ...req.body, attachments, organization: req.user.organization, employee: req.user._id }))
})
export const reviewSubmission = asyncHandler(async (req, res) => {
  const submission = await TaskSubmission.findOne({ _id: req.params.id, organization: req.user.organization }).populate('task'); if (!submission) return res.status(404).json({ message: 'Submission not found' })
  if (!await managerOf(req.user, submission.task.team)) return res.status(403).json({ message: 'Only managers can review submissions' })
  if (!['Approved', 'Rejected', 'Changes Requested'].includes(req.body.status)) return res.status(422).json({ message: 'Invalid review status' })
  submission.status = req.body.status; submission.reviewNote = req.body.reviewNote || ''; submission.reviewedBy = req.user._id; await submission.save(); res.json(submission)
})
