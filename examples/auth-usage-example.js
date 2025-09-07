/**
 * Authentication System Usage Examples
 * 
 * This file demonstrates how to use the enhanced authentication system
 * with MFA and RBAC features in ConstructPro.
 */

// Example 1: User Registration
async function registerUser() {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'john.doe@construction.com',
      password: 'SecurePassword123',
      firstName: 'John',
      lastName: 'Doe',
      company: 'ABC Construction',
      title: 'Site Manager',
      phone: '+1234567890',
      role: 'PROJECT_MANAGER'
    })
  });

  const data = await response.json();
  
  if (response.ok) {
    console.log('User registered successfully:', data.user);
    console.log('Access token:', data.accessToken);
    // Store access token for API requests
    localStorage.setItem('accessToken', data.accessToken);
  } else {
    console.error('Registration failed:', data.message);
  }
}

// Example 2: User Login
async function loginUser() {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'john.doe@construction.com',
      password: 'SecurePassword123'
    })
  });

  const data = await response.json();
  
  if (response.ok) {
    if (data.requiresMFA) {
      console.log('MFA code required');
      // Prompt user for MFA code
      const mfaCode = prompt('Enter MFA code:');
      return loginWithMFA('john.doe@construction.com', 'SecurePassword123', mfaCode);
    } else {
      console.log('Login successful:', data.user);
      localStorage.setItem('accessToken', data.accessToken);
    }
  } else {
    console.error('Login failed:', data.message);
  }
}

// Example 3: Login with MFA
async function loginWithMFA(email, password, mfaCode) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      mfaCode
    })
  });

  const data = await response.json();
  
  if (response.ok) {
    console.log('Login with MFA successful:', data.user);
    localStorage.setItem('accessToken', data.accessToken);
  } else {
    console.error('MFA login failed:', data.message);
  }
}

// Example 4: Setup MFA
async function setupMFA() {
  const accessToken = localStorage.getItem('accessToken');
  
  const response = await fetch('/api/auth/mfa/setup', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  });

  const data = await response.json();
  
  if (response.ok) {
    console.log('MFA setup initiated');
    console.log('Secret:', data.secret);
    console.log('QR Code URL:', data.qrCodeUrl);
    console.log('Backup codes:', data.backupCodes);
    
    // Display QR code to user and ask for verification
    const verificationCode = prompt('Enter verification code from authenticator app:');
    return verifyMFA(verificationCode);
  } else {
    console.error('MFA setup failed:', data.error);
  }
}

// Example 5: Verify MFA Setup
async function verifyMFA(code) {
  const accessToken = localStorage.getItem('accessToken');
  
  const response = await fetch('/api/auth/mfa/verify', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code })
  });

  const data = await response.json();
  
  if (response.ok) {
    console.log('MFA enabled successfully');
  } else {
    console.error('MFA verification failed:', data.error);
  }
}

// Example 6: Check User Permissions
async function checkPermissions() {
  const accessToken = localStorage.getItem('accessToken');
  
  const response = await fetch('/api/auth/permissions', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    }
  });

  const data = await response.json();
  
  if (response.ok) {
    console.log('User role:', data.role);
    console.log('Permissions:', data.permissions);
    
    // Check specific permissions
    const projectPermissions = data.permissions.find(p => p.resource === 'projects');
    if (projectPermissions && projectPermissions.actions.includes('create')) {
      console.log('User can create projects');
    }
  } else {
    console.error('Failed to get permissions:', data.error);
  }
}

// Example 7: Make Authenticated API Request
async function makeAuthenticatedRequest(url, options = {}) {
  const accessToken = localStorage.getItem('accessToken');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  // Handle token expiration
  if (response.status === 401) {
    console.log('Token expired, attempting refresh...');
    const refreshed = await refreshToken();
    if (refreshed) {
      // Retry the request with new token
      return makeAuthenticatedRequest(url, options);
    } else {
      // Redirect to login
      window.location.href = '/login';
      return;
    }
  }

  return response;
}

// Example 8: Refresh Access Token
async function refreshToken() {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include', // Include HTTP-only refresh token cookie
  });

  const data = await response.json();
  
  if (response.ok) {
    console.log('Token refreshed successfully');
    localStorage.setItem('accessToken', data.accessToken);
    return true;
  } else {
    console.error('Token refresh failed:', data.error);
    localStorage.removeItem('accessToken');
    return false;
  }
}

// Example 9: Logout User
async function logoutUser() {
  const accessToken = localStorage.getItem('accessToken');
  
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    }
  });

  if (response.ok) {
    console.log('Logged out successfully');
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  } else {
    console.error('Logout failed');
  }
}

// Example 10: Check Session Status
async function checkSession() {
  const accessToken = localStorage.getItem('accessToken');
  
  const response = await fetch('/api/auth/session', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    }
  });

  const data = await response.json();
  
  if (response.ok) {
    if (data.authenticated) {
      console.log('User is authenticated:', data.session.user);
      console.log('Session active:', data.session.isActive);
    } else {
      console.log('User is not authenticated');
    }
  }
}

// Example 11: Role-based UI Rendering
function renderUIBasedOnRole(userRole, permissions) {
  const projectPermissions = permissions.find(p => p.resource === 'projects');
  const taskPermissions = permissions.find(p => p.resource === 'tasks');
  
  // Show/hide UI elements based on permissions
  if (projectPermissions && projectPermissions.actions.includes('create')) {
    document.getElementById('create-project-btn').style.display = 'block';
  }
  
  if (taskPermissions && taskPermissions.actions.includes('assign')) {
    document.getElementById('assign-task-btn').style.display = 'block';
  }
  
  // Role-specific navigation
  switch (userRole) {
    case 'ADMIN':
      document.getElementById('admin-panel').style.display = 'block';
      break;
    case 'PROJECT_MANAGER':
      document.getElementById('project-dashboard').style.display = 'block';
      break;
    case 'SITE_SUPERVISOR':
      document.getElementById('site-dashboard').style.display = 'block';
      break;
    case 'WORKER':
      document.getElementById('task-list').style.display = 'block';
      break;
    case 'CLIENT':
      document.getElementById('project-view').style.display = 'block';
      break;
  }
}

// Example 12: Automatic Token Refresh Setup
function setupAutoTokenRefresh() {
  // Refresh token 5 minutes before expiration (access token expires in 15 minutes)
  setInterval(async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        // Decode JWT to check expiration (in production, use a proper JWT library)
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const expirationTime = payload.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;
        
        // Refresh if token expires in less than 5 minutes
        if (timeUntilExpiration < 5 * 60 * 1000) {
          await refreshToken();
        }
      } catch (error) {
        console.error('Error checking token expiration:', error);
      }
    }
  }, 60000); // Check every minute
}

// Initialize authentication system
document.addEventListener('DOMContentLoaded', () => {
  setupAutoTokenRefresh();
  checkSession();
});

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    registerUser,
    loginUser,
    loginWithMFA,
    setupMFA,
    verifyMFA,
    checkPermissions,
    makeAuthenticatedRequest,
    refreshToken,
    logoutUser,
    checkSession,
    renderUIBasedOnRole,
    setupAutoTokenRefresh
  };
}