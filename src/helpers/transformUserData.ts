export const transformUserData = UserData => {
  return {
    _id: UserData._id,
    name: UserData.name,
    email: UserData.email,
    picture: UserData.method == 'local' ? UserData.picture : UserData.OAuth2.picture,
    mobileno: UserData.mobileno || null,
    role: UserData.role,
    method: UserData.method,
    division: UserData.division || null,
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
