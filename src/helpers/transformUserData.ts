export const transformUserData = UserData => {
  return {
    name: UserData.name,
    email: UserData.email,
    // image: UserData.OAuth2.picture,
    role: UserData.role,
    method: UserData.method,
    lastlogin: UserData.lastLogin,
  };
};
