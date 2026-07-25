export const ROLES = ['Owner', 'Project Manager', 'Team Lead', 'Developer', 'Tester', 'Viewer']

export const STATUSES = ['Open', 'Assigned', 'In Progress', 'Ready for Testing', 'Testing', 'Reopened', 'Resolved', 'Closed']

export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

export const SEVERITIES = ['Minor', 'Major', 'Critical', 'Blocker']

export const rolePermissions = {
  Owner: ['manage-users', 'manage-projects', 'manage-bugs', 'view-reports', 'manage-organization'],
  'Project Manager': ['manage-projects', 'manage-bugs', 'view-reports'],
  'Team Lead': ['manage-bugs', 'view-reports'],
  Developer: ['manage-bugs', 'comment'],
  Tester: ['create-bugs', 'comment'],
  Viewer: []
}
