function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return 'AD';
  }

  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

function lockApp() {
  document.body.classList.add('auth-locked');
}

function unlockApp() {
  document.body.classList.remove('auth-locked');
}

function setUserInUi(user) {
  const avatar = document.getElementById('userAvatar');
  const userPill = document.getElementById('authUserPill');

  if (avatar) {
    avatar.textContent = getInitials(user?.nombre || user?.username || 'AD');
  }

  if (userPill) {
    userPill.textContent = user?.username ? `Usuario: ${user.username}` : 'Usuario autenticado';
  }
}

function persistSession(user) {
  sessionStorage.setItem('hus_auth', JSON.stringify({ authenticated: true, user }));
}

function readSession() {
  try {
    const raw = sessionStorage.getItem('hus_auth');
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.authenticated || !parsed?.user) {
      return null;
    }

    return parsed.user;
  } catch {
    return null;
  }
}

function clearSession() {
  sessionStorage.removeItem('hus_auth');
}

export function initAuthentication(onAuthenticated) {
  const loginView = document.getElementById('loginView');
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('loginUsername');
  const passwordInput = document.getElementById('loginPassword');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');

  const existingUser = readSession();
  if (existingUser) {
    unlockApp();
    setUserInUi(existingUser);
    onAuthenticated();
  } else {
    lockApp();
    loginView?.classList.remove('hidden');
  }

  logoutBtn?.addEventListener('click', () => {
    clearSession();
    lockApp();

    if (loginView) {
      loginView.classList.remove('hidden');
    }

    if (loginForm) {
      loginForm.reset();
    }

    if (loginError) {
      loginError.textContent = '';
    }
  });

  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!usernameInput?.value || !passwordInput?.value) {
      if (loginError) {
        loginError.textContent = 'Debes ingresar usuario y contrasena.';
      }
      return;
    }

    if (loginError) {
      loginError.textContent = '';
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: usernameInput.value.trim(),
          password: passwordInput.value
        })
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        if (loginError) {
          loginError.textContent = data.message || 'Credenciales invalidas.';
        }
        return;
      }

      persistSession(data.user);
      setUserInUi(data.user);
      unlockApp();
      loginView?.classList.add('hidden');
      onAuthenticated();
    } catch {
      if (loginError) {
        loginError.textContent = 'No se pudo conectar con el servidor de autenticacion.';
      }
    }
  });
}
