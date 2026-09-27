export function waitlistPermissions(capabilities = {}) {
  const isAdmin = capabilities?.isAdmin === true;
  return {
    canViewWaitlist: isAdmin || capabilities?.canViewWaitlist === true,
    canImportWaitlist: isAdmin || capabilities?.canImportWaitlist === true,
    canManageWaitlistInvitations: isAdmin || capabilities?.canManageWaitlistInvitations === true,
  };
}
