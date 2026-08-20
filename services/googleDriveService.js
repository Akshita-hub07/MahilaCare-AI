/**
 * Google Drive Integration Module (Isolated Service Interface)
 * 
 * Pre-configured for future Google Drive API / Google Picker SDK integration.
 * Currently isolated until production OAuth client ID and Picker API credentials are configured.
 */

export const googleDriveConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || null,
  appId: import.meta.env.VITE_GOOGLE_APP_ID || null,
  isConfigured: () => false // Disabled until OAuth credentials are provided
};

export const googleDriveService = {
  /**
   * Checks whether Google Drive Picker SDK is ready and authorized
   */
  isAvailable() {
    return googleDriveConfig.isConfigured();
  },

  /**
   * Triggers Google Drive Picker authorization & document selector flow.
   * Resolves with file metadata and text content if supported.
   */
  async openPicker() {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'GOOGLE_DRIVE_NOT_CONFIGURED',
        message: 'Google Drive integration is pending OAuth API configuration.'
      };
    }
    // Future Google Drive Picker API implementation
    throw new Error('Google Drive API client not configured');
  }
};
