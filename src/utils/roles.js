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

// الحصول على الروابط المسموحة للمستخدم حسب دوره (بدون الصفحة الرئيسية)
export const getRoleBasedLinks = (userRole) => {
  if (!userRole) return [];

  const links = [];

  // رئيس الجامعة ومدير عام: جميع الصفحات
  if (userRole === ROLES.PRESIDENT) {
    links.push(
      { to: "/users", icon: "ri-team-line", label: "إدارة المستخدمين" },
      { to: "/cases", icon: "ri-file-list-3-line", label: "القضايا" },
      { to: "/investigations", icon: "ri-search-line", label: "التحقيقات" },
      { to: "/appeals", icon: "ri-alert-line", label: "التظلمات" },
      { to: "/contracts", icon: "ri-file-text-line", label: "العقود" },
      { to: "/fatwas", icon: "ri-book-open-line", label: "الفتاوى" },
      {
        to: "/reports",
        icon: "ri-bar-chart-line",
        label: "التقارير والإحصائيات",
      }
    );
  } else if (userRole === ROLES.GENERAL_MANAGER) {
    links.push(
      { to: "/cases", icon: "ri-file-list-3-line", label: "القضايا" },
      { to: "/investigations", icon: "ri-search-line", label: "التحقيقات" },
      { to: "/appeals", icon: "ri-alert-line", label: "التظلمات" },
      { to: "/contracts", icon: "ri-file-text-line", label: "العقود" },
      {
        to: "/reports",
        icon: "ri-bar-chart-line",
        label: "التقارير والإحصائيات",
      }
    );
  }
  // مدير إدارة: قضايا و تحقيقات و تظلمات إدارته فقط
  else if (userRole === ROLES.DEPARTMENT_MANAGER) {
    links.push(
      { to: "/cases", icon: "ri-file-list-3-line", label: "القضايا" },
      { to: "/investigations", icon: "ri-search-line", label: "التحقيقات" },
      { to: "/appeals", icon: "ri-alert-line", label: "التظلمات" },
      { to: "/contracts", icon: "ri-file-text-line", label: "العقود" },
      { to: "/fatwas", icon: "ri-book-open-line", label: "الفتاوى" }
    );
  }
  // محامي: القضايا فقط
  else if (userRole === ROLES.LAWYER) {
    links.push({ to: "/cases", icon: "ri-file-list-3-line", label: "القضايا" });
  }
  // سكرتير: قضايا و تحقيقات و تظلمات
  else if (userRole === ROLES.SECRETARY) {
    links.push(
      { to: "/cases", icon: "ri-file-list-3-line", label: "القضايا" },
      { to: "/investigations", icon: "ri-search-line", label: "التحقيقات" },
      { to: "/appeals", icon: "ri-alert-line", label: "التظلمات" }
    );
  }

  return links;
};

// التحقق من إمكانية المستخدم على إنشاء/تعديل/حذف البيانات
// الرئيس والمدير العام يمكنهما التعديل الكامل
export const canModifyData = (user) => {
  if (!user || !user.role) return false;

  // الرئيس والمدير العام يمكنهما التعديل الكامل
  if (user.role === ROLES.PRESIDENT || user.role === ROLES.GENERAL_MANAGER) {
    return true;
  }

  // مدير الإدارة يمكن التعديل حسب الصلاحيات
  return user.role === ROLES.DEPARTMENT_MANAGER;
};
