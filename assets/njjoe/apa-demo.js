const demoLinks = document.querySelectorAll('[data-demo-label]');
const demoFrame = document.getElementById('apa-email-preview');
for (const link of demoLinks) {
  link.addEventListener('click', () => {
    for (const other of demoLinks) other.removeAttribute('aria-current');
    link.setAttribute('aria-current', 'true');
    const label = link.dataset.demoLabel;
    demoFrame.title = `${label} email template with fictional customer data`;
    document.getElementById('apa-preview-label').textContent = `${label} · fictional customer`;
    document.getElementById('apa-demo-open').href = link.href;
  });
}
