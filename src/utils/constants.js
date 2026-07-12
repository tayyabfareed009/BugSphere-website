export const ROLES = ['Admin', 'Developer', 'Tester']

export const STATUSES = ['Open', 'Assigned', 'In Progress', 'Testing', 'Resolved', 'Closed', 'Reopened']

export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

export const SEVERITIES = ['Minor', 'Major', 'Critical', 'Blocker']

export const rolePermissions = {
  Admin: ['manage-users', 'manage-projects', 'manage-bugs', 'view-reports'],
  Developer: ['manage-bugs', 'comment', 'view-reports'],
  Tester: ['create-bugs', 'comment', 'view-reports']
}
