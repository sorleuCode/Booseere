// Centralized API exports
export { default as api } from './axios';
export { authAPI } from './auth';
export { adminAPI } from './admin';
export { memberAPI } from './members';
export { contributionAPI } from './contributions';
export { loanAPI } from './loans';
export { contactAPI } from './contact';

// For backward compatibility
export {
  getMembers,
  addMember,
  updateMember,
  deleteMember,
} from './members';