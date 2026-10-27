document.addEventListener('click', event => {
  const button = event.target.closest('[data-certificate-preview]');
  if (!button) return;
  const section = button.closest('.certificates-section');
  const dialog = section?.querySelector('.certificate-dialog');
  if (!dialog) return;
  dialog.setAttribute('aria-label', button.dataset.certificatePreview + ' preview');
  dialog.showModal();
});
