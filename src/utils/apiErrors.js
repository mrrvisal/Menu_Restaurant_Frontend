export function getCurrentLocale() {
  const savedLocale =
    typeof localStorage === "undefined" ? "en" : localStorage.getItem("locale");
  return savedLocale === "en" ? "en" : "km";
}

export function getApiErrorMessage(error, fallback = "Request failed") {
  const payload = error?.response?.data || error;
  const apiError = payload?.error;
  if (typeof apiError === "string") return apiError;

  const message = apiError?.message || payload?.message;
  if (typeof message === "string") return message;
  if (message && typeof message === "object") {
    const locale = getCurrentLocale();
    return message[locale] || message.en || message.km || fallback;
  }

  return error?.message || fallback;
}

// Bilingual error message for the UI (toasts / inline hints).
// `error` may be an axios error, a raw response payload or a plain string.
// The backend can send `error`/`message` as text or as { km, en } — when it is
// an object the message is picked with the caller's current locale.
export function getErrorMessage(error, locale, fallback = "Request failed") {
  const lang = locale === "en" ? "en" : "km";
  const payload = error?.response?.data ?? error;
  const apiError = payload?.error;

  const pick = (value) => {
    if (typeof value === "string") return value.trim();
    if (value && typeof value === "object") {
      const picked = value[lang] || value.en || value.km;
      return typeof picked === "string" ? picked.trim() : "";
    }
    return "";
  };

  return (
    pick(apiError) ||
    pick(apiError?.message) ||
    pick(payload?.message) ||
    fallback
  );
}

export function installApiErrorHandling(axios) {
  axios.interceptors.request.use((config) => {
    config.headers ??= {};
    config.headers["Accept-Language"] = getCurrentLocale();
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const payload = error?.response?.data;
      const details = payload?.error;
      if (details && typeof details === "object" && details.message) {
        payload.errorDetails = details;
        payload.code ||= details.code;
        payload.error = getApiErrorMessage(payload);
      }
      return Promise.reject(error);
    },
  );
}
