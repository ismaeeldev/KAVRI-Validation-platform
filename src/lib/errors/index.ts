export const ERROR_CODES = {
  AUTHENTICATION_REQUIRED: "AUTHENTICATION_REQUIRED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  INVALID_STATE: "INVALID_STATE",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  CONFLICT: "CONFLICT",
  TOKEN_INVALID: "TOKEN_INVALID",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TOKEN_USED: "TOKEN_USED",
  SYSTEM_ERROR: "SYSTEM_ERROR",
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code: ErrorCode, statusCode: number = 400, details?: Record<string, unknown>) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintain proper stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  static authenticationRequired(message = "Authentication is required to perform this action") {
    return new AppError(message, ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  static forbidden(message = "You do not have permission to perform this action") {
    return new AppError(message, ERROR_CODES.FORBIDDEN, 403);
  }

  static notFound(message = "The requested resource was not found") {
    return new AppError(message, ERROR_CODES.NOT_FOUND, 404);
  }

  static invalidState(message = "The action is invalid for the current resource state") {
    return new AppError(message, ERROR_CODES.INVALID_STATE, 400);
  }

  static validationError(message = "Provided input validation failed", details?: Record<string, unknown>) {
    return new AppError(message, ERROR_CODES.VALIDATION_ERROR, 400, details);
  }

  static conflict(message = "A conflict occurred with the current state of the resource") {
    return new AppError(message, ERROR_CODES.CONFLICT, 409);
  }

  static tokenInvalid(message = "The provided token is invalid") {
    return new AppError(message, ERROR_CODES.TOKEN_INVALID, 400);
  }

  static tokenExpired(message = "The provided token has expired") {
    return new AppError(message, ERROR_CODES.TOKEN_EXPIRED, 400);
  }

  static tokenUsed(message = "The provided token has already been used") {
    return new AppError(message, ERROR_CODES.TOKEN_USED, 400);
  }

  static systemError(message = "An internal system error occurred", details?: Record<string, unknown>) {
    return new AppError(message, ERROR_CODES.SYSTEM_ERROR, 500, details);
  }
}
