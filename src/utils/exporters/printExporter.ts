export function triggerBrowserPrint(patientInitials?: string): void {
  const originalTitle = document.title;
  const dateStamp = new Date().toISOString().slice(0, 10);
  const initials = patientInitials ? `_${patientInitials}` : '';
  document.title = `Pelvic_Health_Report${initials}_${dateStamp}`;

  window.print();

  setTimeout(() => {
    document.title = originalTitle;
  }, 1000);
}
