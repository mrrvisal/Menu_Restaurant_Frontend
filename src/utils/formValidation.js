export function installNativeFormValidation(i18n) {
  document.addEventListener(
    "invalid",
    (event) => {
      const field = event.target;
      const validity = field?.validity;
      if (!validity || typeof field.setCustomValidity !== "function") return;

      const t = i18n.t;
      let message = t.validation_invalid;
      if (validity.valueMissing) message = t.validation_required;
      else if (validity.typeMismatch && field.type === "email") {
        message = t.validation_email_invalid;
      } else if (validity.tooShort) {
        message = t.validation_min_length.replace("{min}", field.minLength);
      } else if (validity.tooLong) {
        message = t.validation_max_length.replace("{max}", field.maxLength);
      } else if (validity.rangeUnderflow) {
        message = t.validation_number_min.replace("{min}", field.min);
      } else if (validity.rangeOverflow) {
        message = t.validation_number_max.replace("{max}", field.max);
      } else if (validity.patternMismatch) {
        message = t.validation_pattern;
      }

      field.setCustomValidity(message);
    },
    true,
  );

  const clearMessage = (event) => {
    event.target?.setCustomValidity?.("");
  };
  document.addEventListener("input", clearMessage, true);
  document.addEventListener("change", clearMessage, true);
}
