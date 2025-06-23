const joystick = document.getElementById('joystick');
const activeKeys = new Set();

// Maps arrow keys to joystick direction parts
const keyToPart = {
  'ArrowUp': 'Forward',
  'ArrowDown': 'Backward',
  'ArrowLeft': 'Left',
  'ArrowRight': 'Right',
};

function updateJoystickImage() {
  // Get only valid arrow keys currently pressed
  const directions = Array.from(activeKeys)
    .filter(key => key in keyToPart)
    .map(key => keyToPart[key]);

  let filename;

  if (directions.length === 0) {
    filename = 'Central';
  } else if (directions.length === 1) {
    filename = directions[0];
  } else if (directions.length === 2) {
    // Combine into one of the 4 diagonals
    const dirSet = new Set(directions);
    if (dirSet.has('Forward') && dirSet.has('Left')) filename = 'Forward Left';
    else if (dirSet.has('Forward') && dirSet.has('Right')) filename = 'Forward Right';
    else if (dirSet.has('Backward') && dirSet.has('Left')) filename = 'Backward Left';
    else if (dirSet.has('Backward') && dirSet.has('Right')) filename = 'Backward Right';
    else {
      // Invalid diagonal (e.g. Left + Right or Forward + Back) — treat as Central
      filename = 'Central';
    }
  } else {
    // More than 2 keys or invalid combo
    filename = 'Central';
  }

  joystick.src = `assets/joystick/${filename}.png`;
}

// Handle key press
window.addEventListener('keydown', (e) => {
  if (keyToPart[e.key]) {
    activeKeys.add(e.key);
    updateJoystickImage();
  }
});

// Handle key release
window.addEventListener('keyup', (e) => {
  if (keyToPart[e.key]) {
    activeKeys.delete(e.key);
    updateJoystickImage();
  }
});

document.querySelectorAll('.mobile-arrows .arrow').forEach(btn => {
  const key = btn.dataset.dir;

  btn.addEventListener('touchstart', e => {
    e.preventDefault();
    activeKeys.add(key);
    updateJoystickImage();
    btn.classList.add('active');
  });

  btn.addEventListener('touchend', e => {
    e.preventDefault();
    activeKeys.delete(key);
    updateJoystickImage();
    btn.classList.remove('active');
  });

  // Optional: Remove active state if touch leaves the button
  btn.addEventListener('touchcancel', e => {
    activeKeys.delete(key);
    updateJoystickImage();
    btn.classList.remove('active');
  });
});