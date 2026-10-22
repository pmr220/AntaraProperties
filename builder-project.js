(() => {
  const form = document.getElementById('projectEnquiry');
  const status = document.getElementById('projectEnquiryStatus');
  const button = form.querySelector('button[type="submit"]');
  let sending = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    const name = form.elements.name.value.trim();
    const phone = form.elements.phone.value.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    if (name.length < 2 || !/^[6-9]\d{9}$/.test(phone)) {
      status.textContent = 'Please enter your name and a valid 10-digit Indian mobile number.';
      return;
    }
    sending = true;
    button.disabled = true;
    button.textContent = 'Sending…';
    status.textContent = '';
    try {
      await window.Antara.request('/rest/v1/rpc/submit_rangoli_enquiry', {
        method: 'POST', body: {visitor_name: name, visitor_phone: phone}
      });
      form.reset();
      status.textContent = 'Thank you. Your 2 BHK enquiry has been received. Antara Properties will contact you.';
    } catch {
      status.textContent = 'Your enquiry could not be sent. Please try again, or call 8329788386.';
    } finally {
      sending = false;
      button.disabled = false;
      button.textContent = 'Request a callback ↗';
    }
  });
})();
