import Bug from '../models/Bug.js';
import Comment from '../models/Comment.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Populate helper with project owner for permission checks
const populateBug = (query) =>
  query
    .populate('project', 'name key owner')
    .populate('reporter assignedDeveloper', 'name email role avatar');

// Status transition rules
const transitions = {
  Open: ['Assigned'],
  Assigned: ['In Progress'],
  'In Progress': ['Ready for Testing'],
  'Ready for Testing': ['Testing'],
  Testing: ['Resolved', 'Reopened'],
  Reopened: ['Assigned', 'In Progress'],
  Resolved: ['Closed', 'Reopened'],
  Closed: ['Reopened'],
};

// ---------- GET all bugs (with filters and pagination) ----------
export const getBugs = asyncHandler(async (req, res) => {
  const { search, status, priority, severity, project, developer, page = 1, limit = 10 } = req.query;
  const query = { organization: req.user.organization };
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (severity) query.severity = severity;
  if (project) query.project = project;
  if (developer) query.assignedDeveloper = developer;
  if (search) {
    query.$or = [
      { bugId: new RegExp(search, 'i') },
      { title: new RegExp(search, 'i') },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [bugs, total] = await Promise.all([
    populateBug(Bug.find(query)).sort('-updatedAt').skip(skip).limit(Number(limit)),
    Bug.countDocuments(query),
  ]);
  res.json({ data: bugs, page: Number(page), total, pages: Math.ceil(total / Number(limit)) });
});

// ---------- CREATE bug ----------
export const createBug = asyncHandler(async (req, res) => {
  const { screenshotUrl, ...rest } = req.body;

  // Build attachment from Cloudinary URL if provided
  let attachments = [];
  if (screenshotUrl) {
    const filename = screenshotUrl.split('/').pop() || 'screenshot';
    attachments.push({
      url: screenshotUrl,
      filename,
      publicId: `screenshot-${Date.now()}`,
    });
  }

  const bugData = {
    ...rest,
    organization: req.user.organization,
    reporter: req.user._id,
    attachments,
    activity: [{ message: 'Bug created', actor: req.user._id }],
  };

  // Remove empty assignee (null/empty string)
  if (!bugData.assignedDeveloper) delete bugData.assignedDeveloper;

  const bug = await Bug.create(bugData);
  const populated = await populateBug(Bug.findById(bug._id));
  res.status(201).json(populated);
});

// ---------- GET single bug (with comments) ----------
export const getBug = asyncHandler(async (req, res) => {
  const bug = await populateBug(
    Bug.findOne({ _id: req.params.id, organization: req.user.organization })
  );
  if (!bug) return res.status(404).json({ message: 'Bug not found' });

  const comments = await Comment.find({ bug: bug._id })
    .populate('author mentions', 'name email role avatar')
    .sort('createdAt');

  res.json({ ...bug.toObject(), comments });
});

// ---------- UPDATE bug ----------
export const updateBug = asyncHandler(async (req, res) => {
  const allowed = ['title', 'description', 'priority', 'severity', 'status', 'assignedDeveloper', 'labels', 'dueDate', 'screenshotUrl'];

  // Find current bug with project populated for permission checks
  const current = await Bug.findOne({ _id: req.params.id, organization: req.user.organization })
    .populate('project', 'owner');
  if (!current) return res.status(404).json({ message: 'Bug not found' });

  // --- Permission check ---
  const isOwner = req.user.role === 'Owner';
  const isReporter = current.reporter?.toString() === req.user._id.toString();
  const isProjectOwner = current.project?.owner?.toString() === req.user._id.toString();
  if (!(isOwner || isReporter || isProjectOwner)) {
    return res.status(403).json({ message: 'You are not permitted to edit this bug' });
  }

  // --- Status transition validation ---
  if (req.body.status && req.body.status !== current.status) {
    if (!transitions[current.status]?.includes(req.body.status)) {
      return res.status(422).json({
        message: `Cannot transition from ${current.status} to ${req.body.status}`,
      });
    }
  }

  // Build update object
  const updates = {};
  const activityMessage = req.body.status && req.body.status !== current.status
    ? `Status changed to ${req.body.status}`
    : 'Bug updated';

  // Apply allowed fields
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      if (key === 'assignedDeveloper') {
        updates[key] = req.body[key] || null; // unassign if empty string
      } else if (key === 'screenshotUrl') {
        // Add new screenshot as attachment
        if (req.body.screenshotUrl) {
          const filename = req.body.screenshotUrl.split('/').pop() || 'screenshot';
          const attachment = {
            url: req.body.screenshotUrl,
            filename,
            publicId: `screenshot-${Date.now()}`,
          };
          updates.$push = { attachments: attachment };
        }
      } else {
        updates[key] = req.body[key];
      }
    }
  }

  // Add activity entry
  updates.$push = updates.$push || {};
  updates.$push.activity = { message: activityMessage, actor: req.user._id };

  // Perform update
  const updatedBug = await Bug.findOneAndUpdate(
    { _id: req.params.id, organization: req.user.organization },
    updates,
    { new: true, runValidators: true }
  );
  if (!updatedBug) return res.status(404).json({ message: 'Bug not found' });

  const populated = await populateBug(Bug.findById(updatedBug._id));
  res.json(populated);
});

// ---------- DELETE bug ----------
export const deleteBug = asyncHandler(async (req, res) => {
  // Find bug with project populated for permission check
  const bug = await Bug.findOne({ _id: req.params.id, organization: req.user.organization })
    .populate('project', 'owner');
  if (!bug) return res.status(404).json({ message: 'Bug not found' });

  // Permission check
  const isOwner = req.user.role === 'Owner';
  const isReporter = bug.reporter?.toString() === req.user._id.toString();
  const isProjectOwner = bug.project?.owner?.toString() === req.user._id.toString();
  if (!(isOwner || isReporter || isProjectOwner)) {
    return res.status(403).json({ message: 'You are not permitted to delete this bug' });
  }

  await Bug.findOneAndDelete({ _id: req.params.id, organization: req.user.organization });
  await Comment.deleteMany({ bug: bug._id });

  res.json({ message: 'Bug deleted' });
});