// ═══════════════════════════════════════════════════════════════
//  Inline form validation — the browser Constraint Validation API,
//  rendered OUR way: a localized `.field-error` line + red
//  `.is-invalid` border directly under the input (same visual
//  convention as CreateAdminModal.vue). The native floating bubbles
//  ("default errors") are suppressed everywhere.
//
//  UX contract (per field):
//    • before first blur → silent (no nagging while typing)
//    • on blur           → inline error if invalid
//    • while invalid     → live re-validate on every keystroke
//    • on submit         → every invalid field marked at once;
//                          the browser focuses the first one
//    • forms with `novalidate` are LEFT ALONE — those components
//      (e.g. CreateAdminModal) own their validation state already.
//
//  Zero template changes: installed once from main.js, works for
//  Login / Register / Forgot / Reset / SuperAdmin and any future form
//  that uses `required`, `type=email`, `minlength`, `pattern`, etc.
// ═══════════════════════════════════════════════════════════════
import { watch } from "vue";

const ERROR_CLASS = "field-error";
const INVALID_CLASS = "is-invalid";
const ERROR_ID_PREFIX = "fv-err";

let installed = false;
let errorSeq = 0;

// Fields the global handler currently shows an error for. A real Set (not a
// WeakSet) so a locale switch can re-render every visible message.
const activeFields = new Set();

function isField(el) {
  return (
    el instanceof HTMLElement &&
    el.matches("input, select, textarea") &&
    el.type !== "hidden" &&
    !el.disabled &&
    el.willValidate !== false
  );
}

// Forms that opt out (`novalidate`) own their validation — never inject there.
function ownsItsValidation(el) {
  return typeof el.closest === "function" && el.closest("form[novalidate]");
}

// Localized message straight from the reactive i18n store — re-read on every
// call so it always matches the current locale.
function messageFor(field, i18n) {
  const t = i18n.t;
  const v = field.validity;
  if (!v || v.valid) return "";

  if (v.valueMissing) return t.validation_required;
  if (v.typeMismatch) {
    return field.type === "email"
      ? t.validation_email_invalid
      : t.validation_invalid;
  }
  if (v.tooShort && field.minLength > 0) {
    return t.validation_min_length.replace("{min}", field.minLength);
  }
  if (v.tooLong && field.maxLength > 0) {
    return t.validation_max_length.replace("{max}", field.maxLength);
  }
  if (v.rangeUnderflow) {
    return t.validation_number_min.replace("{min}", field.min);
  }
  if (v.rangeOverflow) {
    return t.validation_number_max.replace("{max}", field.max);
  }
  if (v.patternMismatch) return t.validation_pattern;
  return t.validation_invalid; // badInput / anything else
}

// Password inputs live inside `.password-wrap` (input + eye-toggle button in a
// flex row) — the error must appear AFTER the wrapper, never between them.
function errorAnchor(field) {
  const parent = field.parentElement;
  if (parent && parent.classList && parent.classList.contains("password-wrap")) {
    return parent;
  }
  return field;
}

function clearInline(field) {
  if (!activeFields.delete(field)) return;
  field.classList.remove(INVALID_CLASS);
  field.removeAttribute("aria-invalid");
  const describedBy = (field.getAttribute("aria-describedby") || "")
    .split(/\s+/)
    .filter((id) => !id.startsWith(ERROR_ID_PREFIX))
    .join(" ");
  if (describedBy) field.setAttribute("aria-describedby", describedBy);
  else field.removeAttribute("aria-describedby");
  document.getElementById(`${ERROR_ID_PREFIX}-${field._fvId}`)?.remove();
}

function showInline(field, i18n) {
  const message = messageFor(field, i18n);
  if (!message) return clearInline(field);

  const isNew = !activeFields.has(field);
  activeFields.add(field);
  field.classList.add(INVALID_CLASS);
  field.setAttribute("aria-invalid", "true");

  if (isNew) {
    field._fvId = ++errorSeq;
    const node = document.createElement("p");
    node.id = `${ERROR_ID_PREFIX}-${field._fvId}`;
    node.className = ERROR_CLASS;
    node.setAttribute("role", "alert");
    errorAnchor(field).after(node);
    const describedBy = (field.getAttribute("aria-describedby") || "")
      .split(/\s+/)
      .filter(Boolean)
      .concat(node.id)
      .join(" ");
    field.setAttribute("aria-describedby", describedBy);
  }

  const node = document.getElementById(`${ERROR_ID_PREFIX}-${field._fvId}`);
  if (node) node.textContent = message;
}

function validateField(field, i18n) {
  // Silent for fields that are fine AND not already showing an error —
  // this keeps the "no nagging before first blur" contract.
  if (!activeFields.has(field) && field.checkValidity()) return;
  showInline(field, i18n);
}

export function installNativeFormValidation(i18n) {
  if (installed || typeof document === "undefined") return;
  installed = true;

  // 1) Native bubbles are the "default error" — swallow them, render inline.
  //    preventDefault() only cancels the bubble; the browser STILL blocks
  //    submission of invalid forms and focuses the first invalid field.
  document.addEventListener(
    "invalid",
    (event) => {
      event.preventDefault();
      const field = event.target;
      if (!isField(field) || ownsItsValidation(field)) return;
      showInline(field, i18n);
    },
    true,
  );

  // 2) Leaving a field reveals its inline error (CreateAdminModal-style UX)
  document.addEventListener(
    "focusout",
    (event) => {
      const field = event.target;
      if (!isField(field) || ownsItsValidation(field)) return;
      validateField(field, i18n);
    },
    true,
  );

  // 3) Once a field is showing an error, fix it live as the user types
  document.addEventListener(
    "input",
    (event) => {
      const field = event.target;
      if (!activeFields.has(field)) return;
      if (field.checkValidity()) clearInline(field);
      else showInline(field, i18n);
    },
    true,
  );

  // 4) Locale switch → re-render every visible message in the new language
  watch(
    () => i18n.locale,
    () => {
      for (const field of [...activeFields]) {
        if (!field.isConnected) activeFields.delete(field);
        else showInline(field, i18n);
      }
    },
  );
}
