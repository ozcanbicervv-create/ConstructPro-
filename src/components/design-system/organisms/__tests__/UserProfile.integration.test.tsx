/**
 * Integration test suite for UserProfile organism components
 * Tests complete user workflows and component interactions
 */

import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import { 
  renderWithProviders, 
  testAccessibility, 
  testKeyboardNavigation,
  fillForm,
  mockApiResponse,
  waitForApiCall
} from '@/tests/utils/test-utils';
import { UserProfileManagement } from '../UserProfile/UserProfileManagement';
import { AccountSettings } from '../UserProfile/AccountSettings';
import { NotificationPreferences } from '../UserProfile/NotificationPreferences';
import { AccessibilitySettings } from '../UserProfile/AccessibilitySettings';

// Mock user data
const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: '/avatars/john-doe.jpg',
  role: 'Project Manager',
  company: 'Construction Corp',
  phone: '+1-555-0123',
  preferences: {
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
    },
  },
};

describe('UserProfile Integration Tests', () => {
  beforeEach(() => {
    // Mock API responses
    mockApiResponse('/api/user/profile', mockUser);
    mockApiResponse('/api/user/update', { ...mockUser, name: 'Updated Name' });
  });

  describe('UserProfileManagement Component', () => {
    it('loads and displays user profile data', async () => {
      renderWithProviders(<UserProfileManagement />);
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Project Manager')).toBeInTheDocument();
      });
    });

    it('handles profile update workflow', async () => {
      const { user } = renderWithProviders(<UserProfileManagement />);
      
      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      });
      
      // Update name field
      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');
      
      // Submit form
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      // Verify success message
      await waitFor(() => {
        expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
      });
    });

    it('validates required fields', async () => {
      const { user } = renderWithProviders(<UserProfileManagement />);
      
      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      });
      
      // Clear required field
      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);
      
      // Try to submit
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      // Verify validation error
      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
    });

    it('handles avatar upload', async () => {
      const { user } = renderWithProviders(<UserProfileManagement />);
      
      // Mock file upload
      const file = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/upload avatar/i);
      
      await user.upload(fileInput, file);
      
      // Verify file is selected
      expect(fileInput.files?.[0]).toBe(file);
      expect(fileInput.files).toHaveLength(1);
    });

    it('meets accessibility standards', async () => {
      const { container } = renderWithProviders(<UserProfileManagement />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      });
      
      await testAccessibility(container);
    });

    it('supports keyboard navigation', async () => {
      const { container, user } = renderWithProviders(<UserProfileManagement />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      });
      
      await testKeyboardNavigation(container, user);
    });
  });

  describe('AccountSettings Component', () => {
    it('displays current account settings', async () => {
      renderWithProviders(<AccountSettings />);
      
      await waitFor(() => {
        expect(screen.getByText(/account settings/i)).toBeInTheDocument();
        expect(screen.getByText(/security/i)).toBeInTheDocument();
        expect(screen.getByText(/privacy/i)).toBeInTheDocument();
      });
    });

    it('handles password change workflow', async () => {
      const { user } = renderWithProviders(<AccountSettings />);
      
      // Navigate to password change section
      const changePasswordButton = screen.getByRole('button', { name: /change password/i });
      await user.click(changePasswordButton);
      
      // Fill password form
      await fillForm(user, {
        currentPassword: 'currentpass123',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123',
      });
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /update password/i });
      await user.click(submitButton);
      
      // Verify success
      await waitFor(() => {
        expect(screen.getByText(/password updated successfully/i)).toBeInTheDocument();
      });
    });

    it('validates password requirements', async () => {
      const { user } = renderWithProviders(<AccountSettings />);
      
      const changePasswordButton = screen.getByRole('button', { name: /change password/i });
      await user.click(changePasswordButton);
      
      // Enter weak password
      const newPasswordInput = screen.getByLabelText(/new password/i);
      await user.type(newPasswordInput, '123');
      
      const submitButton = screen.getByRole('button', { name: /update password/i });
      await user.click(submitButton);
      
      // Verify validation error
      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('handles two-factor authentication setup', async () => {
      const { user } = renderWithProviders(<AccountSettings />);
      
      // Enable 2FA
      const enable2FAButton = screen.getByRole('button', { name: /enable two-factor/i });
      await user.click(enable2FAButton);
      
      // Verify QR code is displayed
      await waitFor(() => {
        expect(screen.getByText(/scan qr code/i)).toBeInTheDocument();
      });
      
      // Enter verification code
      const codeInput = screen.getByLabelText(/verification code/i);
      await user.type(codeInput, '123456');
      
      const verifyButton = screen.getByRole('button', { name: /verify/i });
      await user.click(verifyButton);
      
      // Verify 2FA is enabled
      await waitFor(() => {
        expect(screen.getByText(/two-factor authentication enabled/i)).toBeInTheDocument();
      });
    });
  });

  describe('NotificationPreferences Component', () => {
    it('displays current notification settings', async () => {
      renderWithProviders(<NotificationPreferences />);
      
      await waitFor(() => {
        expect(screen.getByText(/notification preferences/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email notifications/i)).toBeChecked();
        expect(screen.getByLabelText(/push notifications/i)).toBeChecked();
        expect(screen.getByLabelText(/sms notifications/i)).not.toBeChecked();
      });
    });

    it('handles notification preference updates', async () => {
      const { user } = renderWithProviders(<NotificationPreferences />);
      
      // Toggle email notifications
      const emailToggle = screen.getByLabelText(/email notifications/i);
      await user.click(emailToggle);
      
      // Save changes
      const saveButton = screen.getByRole('button', { name: /save preferences/i });
      await user.click(saveButton);
      
      // Verify success
      await waitFor(() => {
        expect(screen.getByText(/preferences updated/i)).toBeInTheDocument();
      });
    });

    it('handles granular notification settings', async () => {
      const { user } = renderWithProviders(<NotificationPreferences />);
      
      // Expand project notifications section
      const projectSection = screen.getByText(/project notifications/i);
      await user.click(projectSection);
      
      // Toggle specific notification types
      const taskUpdates = screen.getByLabelText(/task updates/i);
      const milestoneAlerts = screen.getByLabelText(/milestone alerts/i);
      
      await user.click(taskUpdates);
      await user.click(milestoneAlerts);
      
      // Save changes
      const saveButton = screen.getByRole('button', { name: /save preferences/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/preferences updated/i)).toBeInTheDocument();
      });
    });
  });

  describe('AccessibilitySettings Component', () => {
    it('displays accessibility options', async () => {
      renderWithProviders(<AccessibilitySettings />);
      
      await waitFor(() => {
        expect(screen.getByText(/accessibility settings/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/high contrast mode/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/large text/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/reduced motion/i)).toBeInTheDocument();
      });
    });

    it('applies accessibility settings immediately', async () => {
      const { user } = renderWithProviders(<AccessibilitySettings />);
      
      // Enable high contrast mode
      const highContrastToggle = screen.getByLabelText(/high contrast mode/i);
      await user.click(highContrastToggle);
      
      // Verify setting is applied to document
      await waitFor(() => {
        expect(document.documentElement).toHaveClass('high-contrast');
      });
    });

    it('handles font size adjustments', async () => {
      const { user } = renderWithProviders(<AccessibilitySettings />);
      
      // Increase font size
      const fontSizeSlider = screen.getByLabelText(/font size/i);
      await user.click(fontSizeSlider);
      
      // Verify font size is applied
      await waitFor(() => {
        expect(document.documentElement.style.fontSize).toBeTruthy();
      });
    });

    it('provides keyboard shortcuts information', async () => {
      const { user } = renderWithProviders(<AccessibilitySettings />);
      
      // Open keyboard shortcuts dialog
      const shortcutsButton = screen.getByRole('button', { name: /keyboard shortcuts/i });
      await user.click(shortcutsButton);
      
      // Verify shortcuts are displayed
      await waitFor(() => {
        expect(screen.getByText(/ctrl \+ k/i)).toBeInTheDocument();
        expect(screen.getByText(/search/i)).toBeInTheDocument();
      });
    });
  });

  describe('Cross-Component Integration', () => {
    it('handles theme changes across all components', async () => {
      const { user } = renderWithProviders(
        <div>
          <UserProfileManagement />
          <AccountSettings />
          <NotificationPreferences />
          <AccessibilitySettings />
        </div>
      );
      
      // Change theme in accessibility settings
      const themeSelect = screen.getByLabelText(/theme/i);
      await user.selectOptions(themeSelect, 'dark');
      
      // Verify theme is applied globally
      await waitFor(() => {
        expect(document.documentElement).toHaveClass('dark');
      });
    });

    it('maintains form state during navigation', async () => {
      const { user } = renderWithProviders(<UserProfileManagement />);
      
      // Start editing profile
      await waitFor(() => {
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      });
      
      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Partially Updated');
      
      // Navigate to another tab (simulate tab navigation)
      const accountTab = screen.getByRole('tab', { name: /account/i });
      await user.click(accountTab);
      
      // Navigate back to profile tab
      const profileTab = screen.getByRole('tab', { name: /profile/i });
      await user.click(profileTab);
      
      // Verify form state is preserved
      expect(screen.getByDisplayValue('Partially Updated')).toBeInTheDocument();
    });

    it('handles error states gracefully', async () => {
      // Mock API error
      mockApiResponse('/api/user/update', { error: 'Server error' }, 500);
      
      const { user } = renderWithProviders(<UserProfileManagement />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      });
      
      // Try to update profile
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      // Verify error message
      await waitFor(() => {
        expect(screen.getByText(/failed to update profile/i)).toBeInTheDocument();
      });
    });

    it('provides consistent loading states', async () => {
      const { user } = renderWithProviders(<UserProfileManagement />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      });
      
      // Trigger save action
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      // Verify loading state
      expect(screen.getByText(/saving/i)).toBeInTheDocument();
      expect(saveButton).toBeDisabled();
      
      // Wait for completion
      await waitFor(() => {
        expect(screen.queryByText(/saving/i)).not.toBeInTheDocument();
        expect(saveButton).not.toBeDisabled();
      });
    });
  });

  describe('Performance Integration', () => {
    it('handles large datasets efficiently', async () => {
      // Mock large notification history
      const largeNotificationHistory = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        type: 'project_update',
        message: `Notification ${i}`,
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
      }));
      
      mockApiResponse('/api/notifications/history', largeNotificationHistory);
      
      const startTime = performance.now();
      renderWithProviders(<NotificationPreferences />);
      
      await waitFor(() => {
        expect(screen.getByText(/notification preferences/i)).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time even with large dataset
      expect(renderTime).toBeLessThan(2000);
    });

    it('optimizes re-renders during rapid interactions', async () => {
      const { user } = renderWithProviders(<AccessibilitySettings />);
      
      const fontSizeSlider = screen.getByLabelText(/font size/i);
      const startTime = performance.now();
      
      // Simulate rapid slider movements
      for (let i = 0; i < 10; i++) {
        await user.click(fontSizeSlider);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should handle rapid interactions efficiently
      expect(totalTime).toBeLessThan(1000);
    });
  });
});