// الأدوار في النظام (يجب أن تتطابق مع Backend)
export const ROLES = {
  PRESIDENT: "President", // رئيس الجامعة
  GENERAL_MANAGER: "GeneralManager", // مدير عام
  DEPARTMENT_MANAGER: "DepartmentManager", // مدير إدارة
  LAWYER: "Lawyer", // محامي
  SECRETARY: "Secretary", // سكرتير
};

// الأدوار التي يمكنها الوصول لصفحة معينة
export const hasRole = (user, allowedRoles) => {
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
};

// التحقق من صلاحيات المستخدم
export const canAccess = (user, resource, action) => {
  if (!user || !user.role) return false;

  const role = user.role;

  // رئيس الجامعة ومدير عام: صلاحيات كاملة
  if (role === ROLES.PRESIDENT || role === ROLES.GENERAL_MANAGER) {
    return true;
  }

  // مدير إدارة: يرى فقط موارد إدارته
  if (role === ROLES.DEPARTMENT_MANAGER) {
    return true; // سيتم الفلترة حسب الإدارة في الـ API calls
  }

  // محامي: يرى القضايا المخصصة له
  if (role === ROLES.LAWYER) {
    return resource === "cases" || resource === "profile";
  }

  // سكرتير: صلاحيات محدودة
  if (role === ROLES.SECRETARY) {
    return ["cases", "investigations", "appeals"].includes(resource);
  }

  return false;
};

