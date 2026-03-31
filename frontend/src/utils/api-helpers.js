export function buildQueryString(params = {}) {
  const cleanParams = {};

  Object.keys(params).forEach((key) => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      cleanParams[key] = params[key];
    }
  });

  return new URLSearchParams(cleanParams).toString();
}

export function handleApiError(error, fallbackMessage = 'An error occurred') {
  if (error?.message) {
    return error.message;
  }

  return fallbackMessage;
}
