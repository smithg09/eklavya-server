export const transformUserData = UserData => {
  return {
    _id: UserData._id,
    name: UserData.name,
    email: UserData.email,
    image: UserData.method == 'local' ? null : UserData.OAuth2.picture,
    mobileno: UserData.mobileno || null,
    role: UserData.role,
    method: UserData.method,
    Class: UserData.class || null,
    uid: UserData.uid || null,
    semester: UserData.semester || null,
    department: UserData.department || null,
    course: UserData.course || null,
    verified: UserData.verified,
    profileCompletion: UserData.profileCompletion,
    lastLogin: new Date(UserData.lastLogin).toString() || null,
    createdAt: new Date(UserData.createdAt).toString() || null,
    updatedAt: new Date(UserData.createdAt).toString() || null,
  };
};
