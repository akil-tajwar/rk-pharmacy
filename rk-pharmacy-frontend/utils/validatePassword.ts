
export function validatePassword(password: string): string[] {
  const MIN_LENGTH = 8
  const MAX_LENGTH = 32
  const errors: string[] = []

  if (password.length < MIN_LENGTH) {
    errors.push(`Password must be at least ${MIN_LENGTH} characters long`)
  }

  if (password.length > MAX_LENGTH) {
    errors.push(`Password must not exceed ${MAX_LENGTH} characters`)
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  const commonPasswords = ["password123", "admin123", "12345678"]
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("Password is too common")
  }

  return errors
}
