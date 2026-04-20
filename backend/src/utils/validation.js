const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,72}$/;

export const normalizeEmail = (value = "") => value.trim().toLowerCase();

export const buildDefaultName = (email) => {
  const [localPart = "Eventcinity User"] = normalizeEmail(email).split("@");
  const cleaned = localPart
    .replace(/[._-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

  if (!cleaned) {
    return "Eventcinity User";
  }

  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const validateEmail = (email) => {
  if (!email) {
    return "Email is required.";
  }

  if (!EMAIL_REGEX.test(email)) {
    return "Please enter a valid email address.";
  }

  return "";
};

const validatePassword = (password, { allowEmpty = false } = {}) => {
  if (!password) {
    return allowEmpty ? "" : "Password is required.";
  }

  if (!PASSWORD_REGEX.test(password)) {
    return "Password must be 8-72 characters and include uppercase, lowercase, number, and symbol.";
  }

  return "";
};

export const validateSignupPayload = ({ email, password, name }) => {
  const normalizedEmail = normalizeEmail(email);
  const trimmedName = name?.trim() || "";

  const emailError = validateEmail(normalizedEmail);
  if (emailError) {
    return emailError;
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return passwordError;
  }

  if (trimmedName && (trimmedName.length < 2 || trimmedName.length > 80)) {
    return "Name must be between 2 and 80 characters.";
  }

  return "";
};

export const validateLoginPayload = ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  const emailError = validateEmail(normalizedEmail);
  if (emailError) {
    return emailError;
  }

  if (!password?.trim()) {
    return "Password is required.";
  }

  return "";
};
