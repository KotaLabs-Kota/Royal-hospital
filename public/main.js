const header = document.querySelector('.site-header');
const nav = document.querySelector('#main-navigation');
const menuToggle = document.querySelector('.menu-toggle');
const compactNav = matchMedia('(max-width: 915px)');
const navDestinations = [...nav.querySelectorAll('a:not([data-appointment])')].map((link) => ({
  link,
  section: document.querySelector(link.hash),
}));

const isPrimaryClick = (event) => !event.defaultPrevented && event.button === 0 &&
  !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;

function setMenu(open, returnFocus = false) {
  nav.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  menuToggle.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
  if (returnFocus) menuToggle.focus();
}

header.classList.add('has-menu');
menuToggle.hidden = false;
menuToggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
compactNav.addEventListener('change', () => setMenu(false));
nav.addEventListener('click', (event) => {
  if (isPrimaryClick(event) && event.target.closest('a')) setMenu(false);
});
document.addEventListener('pointerdown', (event) => {
  if (nav.classList.contains('is-open') && !header.contains(event.target)) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false, true);
});

let updateFrame;
let currentLink = navDestinations[0].link;
function updateCurrentSection() {
  updateFrame = undefined;
  const cutoff = header.offsetHeight + Math.min(120, window.innerHeight * 0.18);
  let next = navDestinations[0].link;
  for (const { link, section } of navDestinations) {
    if (section.getBoundingClientRect().top <= cutoff) next = link;
  }
  if (next === currentLink) return;
  currentLink.removeAttribute('aria-current');
  next.setAttribute('aria-current', 'location');
  currentLink = next;
}
function scheduleSectionUpdate() {
  if (updateFrame === undefined) updateFrame = requestAnimationFrame(updateCurrentSection);
}
window.addEventListener('scroll', scheduleSectionUpdate, { passive: true });
window.addEventListener('resize', scheduleSectionUpdate);
window.addEventListener('load', scheduleSectionUpdate, { once: true });
scheduleSectionUpdate();

const appointmentDialog = document.querySelector('#appointment-dialog');
const specialtyDialog = document.querySelector('#specialty-dialog');
const photoDialog = document.querySelector('#photo-dialog');
const photoLinks = [...document.querySelectorAll('[data-photo]')];
const supportsDialogs = typeof appointmentDialog.showModal === 'function';
let activeDialog = null;
let dialogOpener = null;
let photoIndex = 0;

function showDialog(dialog, opener) {
  if (activeDialog?.open) activeDialog.close();
  dialogOpener = opener;
  activeDialog = dialog;
  dialog.returnValue = '';
  dialog.showModal();
  document.documentElement.classList.add('modal-open');
}

for (const dialog of [appointmentDialog, specialtyDialog, photoDialog]) {
  dialog.addEventListener('close', () => {
    if (dialog !== activeDialog || dialog.open) return;
    activeDialog = null;
    document.documentElement.classList.remove('modal-open');
    if (dialog.returnValue !== 'navigate') dialogOpener?.focus({ preventScroll: true });
    dialogOpener = null;
  });
  dialog.addEventListener('click', (event) => {
    // A backdrop click targets the dialog itself, including its border box.
    if (event.target !== dialog || !event.detail) return;
    const { left, right, top, bottom } = dialog.getBoundingClientRect();
    if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) dialog.close();
  });
}

const specialties = {
  ear: {
    icon: 'ear',
    description: 'Dr. Imran Khan evaluates ear symptoms and discusses next steps, including earwax removal or examination of the eardrum when appropriate.',
    reasons: ['Ear pain or repeated ear infections', 'Earwax buildup or a blocked feeling', 'Changes in hearing'],
    appointment: 'ENT',
  },
  nose: {
    icon: 'nose',
    description: 'The ENT clinic evaluates nasal allergies, sinus symptoms and difficulty breathing through the nose. Ask reception about an assessment with Dr. Imran Khan.',
    reasons: ['Ongoing nasal blockage', 'Sneezing or suspected nasal allergies', 'Repeated sinus symptoms'],
    appointment: 'ENT',
  },
  throat: {
    icon: 'throat',
    description: 'The ENT clinic assesses persistent throat symptoms, tonsil problems and changes in voice. Your doctor can explain which tests or treatment options may be appropriate.',
    reasons: ['Repeated sore throats or tonsillitis', 'Ongoing hoarseness', 'Swallowing concerns'],
    appointment: 'ENT',
  },
  surgery: {
    icon: 'scope',
    description: 'Dr. Imran Khan sees patients for ENT surgical opinions, including endoscopic assessment and evaluation of head, neck and thyroid concerns.',
    reasons: ['Head or neck lumps', 'Thyroid-related concerns', 'A referral for ENT surgery or endoscopic assessment'],
    appointment: 'ENT',
  },
  ortho: {
    icon: 'bone',
    description: 'The orthopaedic department evaluates conditions affecting bones and joints. Call reception to confirm which specialist is available for your concern.',
    reasons: ['Fractures and follow-up care', 'Ongoing joint pain or stiffness', 'A joint replacement consultation'],
  },
  general: {
    icon: 'kit',
    description: 'Royal Hospital lists general and laparoscopic surgery as well as urology. The hospital team can direct you to the appropriate department.',
    reasons: ['A referral for general or laparoscopic surgery', 'Kidney stone concerns', 'Urinary or prostate symptoms'],
  },
};

function openSpecialty(trigger) {
  const specialty = specialties[trigger.dataset.specialty];
  if (!specialty) return;
  document.querySelector('#specialty-title').textContent = trigger.querySelector('h3').textContent;
  document.querySelector('#specialty-description').textContent = specialty.description;
  document.querySelector('#specialty-icon').setAttribute('href', `#i-${specialty.icon}`);
  document.querySelector('#specialty-appointment').dataset.appointment = specialty.appointment ?? '';
  document.querySelector('#specialty-reasons').replaceChildren(...specialty.reasons.map((reason) => {
    const item = document.createElement('li');
    item.textContent = reason;
    return item;
  }));
  showDialog(specialtyDialog, trigger);
}

function openAppointment(trigger) {
  const isEnt = trigger.dataset.appointment === 'ENT';
  document.querySelector('#appointment-title').textContent = isEnt ? 'Book an ENT Consultation' : 'Book an Appointment';
  document.querySelector('#appointment-intro').textContent = isEnt
    ? 'Ask reception about a visit with Dr. Imran Khan. The hospital team will confirm your appointment directly.'
    : 'Contact reception to check availability and confirm your visit. Appointments are not booked on this website.';
  const returnTo = activeDialog === specialtyDialog ? dialogOpener : trigger;
  const opener = returnTo?.getClientRects().length ? returnTo : menuToggle;
  showDialog(appointmentDialog, opener);
}

function displayPhoto(index) {
  photoIndex = (index + photoLinks.length) % photoLinks.length;
  const link = photoLinks[photoIndex];
  const photo = document.querySelector('#lightbox-image');
  photo.alt = link.querySelector('img').alt;
  photo.src = link.href;
  document.querySelector('#photo-caption').textContent = link.closest('figure').querySelector('figcaption').textContent;
  document.querySelector('#photo-count').textContent = `${photoIndex + 1} / ${photoLinks.length}`;
}

if (supportsDialogs) {
  document.querySelectorAll('[data-appointment], [data-specialty], [data-photo]').forEach((link) => link.setAttribute('aria-haspopup', 'dialog'));
  document.addEventListener('click', (event) => {
    if (!isPrimaryClick(event)) return;
    const trigger = event.target.closest('a');
    if (!trigger) return;

    if (trigger.hasAttribute('data-close-for-link')) {
      activeDialog?.close('navigate');
      document.documentElement.classList.remove('modal-open');
    } else if (trigger.hasAttribute('data-appointment')) {
      event.preventDefault();
      openAppointment(trigger);
    } else if (trigger.hasAttribute('data-specialty')) {
      event.preventDefault();
      openSpecialty(trigger);
    } else if (trigger.hasAttribute('data-photo')) {
      event.preventDefault();
      displayPhoto(photoLinks.indexOf(trigger));
      showDialog(photoDialog, trigger);
    }
  });
  document.querySelector('[data-previous-photo]').addEventListener('click', () => displayPhoto(photoIndex - 1));
  document.querySelector('[data-next-photo]').addEventListener('click', () => displayPhoto(photoIndex + 1));
  photoDialog.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    displayPhoto(photoIndex + (event.key === 'ArrowLeft' ? -1 : 1));
  });
}

const mapLink = document.querySelector('[data-load-map]');
mapLink.addEventListener('click', (event) => {
  const preview = document.querySelector('[data-map-preview]');
  if (!preview || !isPrimaryClick(event)) return;
  event.preventDefault();

  const frameContainer = document.createElement('div');
  frameContainer.className = 'map-card__frame';
  const frame = document.createElement('iframe');
  frame.title = 'Royal Hospital in Vigyan Nagar, Kota on Google Maps';
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.src = 'https://www.google.com/maps/embed?origin=mfe&pb=!1m4!3m2!1m1!4s5387212416705130336!6i16';
  frameContainer.append(frame);
  preview.replaceWith(frameContainer);
  mapLink.querySelector('span').textContent = 'Open in Maps';
});
