/**
 * Session Configuration
 * Centralized settings for all session behavior across the application
 */

export const SESSION_CONFIG = {
  /**
   * Maximum session duration in seconds
   * Controls how long the session remains valid after login
   * Default: 15 seconds (for development)
   * Production recommended: 3600 (1 hour) or 28800 (8 hours)
   */
  maxAge: 15,

  /**
   * Session update threshold in seconds
   * Controls when NextAuth will automatically refresh the session
   * Must be less than maxAge
   */
  updateAge: 5,

  /**
   * Time before session expiration to show warning modal (seconds)
   */
  warningTime: 5,

  /**
   * Auto refresh session on user activity when remaining time is below this threshold
   */
  autoRefreshThreshold: 5,

  /**
   * Idle timeout settings (optional future use)
   */
  idleTimeout: {
    enabled: false,
    timeout: 1800, // 30 minutes
    warningTime: 300, // 5 minutes
  },

  /**
   * Security settings
   */
  security: {
    /** Bind session to user's IP address */
    ipLocking: true,

    /** Bind session to user's browser fingerprint */
    fingerprintBinding: true,

    /** Validate user agent string on each request */
    userAgentValidation: true,

    /** Enable anti-replay protection */
    antiReplay: true,
  },
} as const;

export type SessionConfig = typeof SESSION_CONFIG;

export default SESSION_CONFIG;
