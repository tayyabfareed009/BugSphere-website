export const users = [
  { id: 'u1', name: 'Ava Richardson', role: 'Admin', email: 'ava@bugsphere.dev', avatar: 'AR', status: 'Active' },
  { id: 'u2', name: 'Noah Khan', role: 'Developer', email: 'noah@bugsphere.dev', avatar: 'NK', status: 'Active' },
  { id: 'u3', name: 'Mia Carter', role: 'Tester', email: 'mia@bugsphere.dev', avatar: 'MC', status: 'Active' },
  { id: 'u4', name: 'Leo Martins', role: 'Developer', email: 'leo@bugsphere.dev', avatar: 'LM', status: 'Away' }
]

export const projects = [
  { id: 'p1', name: 'BugSphere Web', key: 'BSW', owner: 'Ava Richardson', progress: 72, bugs: 28, status: 'Active', due: '2026-08-14' },
  { id: 'p2', name: 'Mobile QA Portal', key: 'MQP', owner: 'Noah Khan', progress: 48, bugs: 17, status: 'Planning', due: '2026-09-02' },
  { id: 'p3', name: 'Billing Console', key: 'BIL', owner: 'Mia Carter', progress: 89, bugs: 9, status: 'Active', due: '2026-07-30' }
]

export const bugs = [
  {
    id: 'BUG-1042',
    title: 'Kanban drag state freezes after rapid column switch',
    description: 'Dragging a card between status columns sometimes leaves an overlay card mounted until refresh.',
    project: 'BugSphere Web',
    priority: 'Critical',
    severity: 'Blocker',
    status: 'In Progress',
    reporter: 'Mia Carter',
    assignee: 'Noah Khan',
    createdAt: '2026-07-01',
    updatedAt: '2026-07-10',
    attachments: ['kanban-freeze.png'],
    comments: [
      { id: 'c1', author: 'Mia Carter', text: '@Noah this reproduces on Chrome and Edge.', createdAt: '2026-07-10 09:12' },
      { id: 'c2', author: 'Noah Khan', text: 'Patch is in review, adding regression coverage.', createdAt: '2026-07-10 12:44' }
    ],
    timeline: ['Bug created by Mia Carter', 'Assigned to Noah Khan', 'Status changed to In Progress']
  },
  {
    id: 'BUG-1037',
    title: 'CSV export omits closed bugs when project filter is active',
    description: 'Exported files should reflect filters and include the matching closed records.',
    project: 'Billing Console',
    priority: 'High',
    severity: 'Major',
    status: 'Testing',
    reporter: 'Ava Richardson',
    assignee: 'Leo Martins',
    createdAt: '2026-06-26',
    updatedAt: '2026-07-08',
    attachments: ['export-sample.csv'],
    comments: [],
    timeline: ['Bug created by Ava Richardson', 'Status changed to Testing']
  },
  {
    id: 'BUG-1028',
    title: 'Avatar upload preview does not update after save',
    description: 'Profile image updates in storage but old cached avatar remains in the header.',
    project: 'Mobile QA Portal',
    priority: 'Medium',
    severity: 'Minor',
    status: 'Open',
    reporter: 'Leo Martins',
    assignee: 'Unassigned',
    createdAt: '2026-06-22',
    updatedAt: '2026-07-02',
    attachments: [],
    comments: [],
    timeline: ['Bug created by Leo Martins']
  }
]

export const dashboardStats = [
  { label: 'Total Bugs', value: 224, delta: '+12%', tone: 'sky' },
  { label: 'Open Bugs', value: 58, delta: '-8%', tone: 'amber' },
  { label: 'Resolved Bugs', value: 131, delta: '+21%', tone: 'emerald' },
  { label: 'Critical Bugs', value: 11, delta: '-3%', tone: 'rose' }
]

export const statusChart = [
  { name: 'Open', value: 58 },
  { name: 'Assigned', value: 34 },
  { name: 'In Progress', value: 42 },
  { name: 'Testing', value: 28 },
  { name: 'Resolved', value: 51 },
  { name: 'Closed', value: 39 }
]

export const priorityChart = [
  { name: 'Low', value: 38 },
  { name: 'Medium', value: 84 },
  { name: 'High', value: 67 },
  { name: 'Critical', value: 35 }
]

export const monthlyReports = [
  { month: 'Jan', bugs: 22, resolved: 15 },
  { month: 'Feb', bugs: 31, resolved: 21 },
  { month: 'Mar', bugs: 28, resolved: 24 },
  { month: 'Apr', bugs: 41, resolved: 33 },
  { month: 'May', bugs: 36, resolved: 31 },
  { month: 'Jun', bugs: 49, resolved: 38 },
  { month: 'Jul', bugs: 27, resolved: 24 }
]
