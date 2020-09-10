export const transformUserData = UserData => {
  return {
    _id: UserData._id,
    name: UserData.name,
    email: UserData.email,
    image: UserData.method == 'local' ? null : UserData.OAuth2.picture,
    role: UserData.role,
    method: UserData.method,
    class: UserData.class || null,
    rollNo: UserData.rollNo || null,
    semester: UserData.semester || null,
    department: UserData.department || null,
    course: UserData.course || null,
    verified: UserData.verified,
    profileCompletion: {
      status: UserData.profileCompletion,
      // eslint-disable-next-line prettier/prettier
      completed: (((5 - (Object.keys(UserData).filter(El => UserData[El] == null && El != 'lastLogin').length)) / 5) * 100),
    },
    lastLogin: new Date(UserData.lastLogin).toString() || null,
    createdAt: new Date(UserData.createdAt).toString() || null,
    updatedAt: new Date(UserData.createdAt).toString() || null,
  };
};
