function getAdminSimpleMode() {
  if (typeof window === "undefined") {
    return false;
  }
  const stored = window.localStorage.getItem("mood_admin_simple_bg");
  return stored === "true";
}

export function setAdminSimpleMode(value: boolean) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem("mood_admin_simple_bg", value ? "true" : "false");
}

export function initAdminSimpleMode() {
  return getAdminSimpleMode();
}
