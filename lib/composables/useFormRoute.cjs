/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

var vue = require('vue');
var index = require('./index.cjs');
var FormRouteManager = require('../managers/FormRouteManager.cjs');

function useFormRoute(options = {}) {
  const manager = vue.inject("formRouteManager", new FormRouteManager.FormRouteManager());
  const route = index.useRoute();
  const formId = options.formId || route.value.path;
  const initializeForm = () => {
    let initialData = {};
    if (options.persistToStorage) {
      const storageKey = options.storageKey || `form_${formId}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          initialData = JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse stored form data:", e);
        }
      }
    }
    return manager.initForm(formId, initialData, options);
  };
  initializeForm();
  const form = vue.computed(() => manager.getForm(formId));
  const isDirty = vue.computed(() => form.value?.isDirty ?? false);
  const errors = vue.computed(() => form.value?.errors ?? {});
  const touched = vue.computed(() => form.value?.touched ?? /* @__PURE__ */ new Set());
  const isValid = vue.computed(() => Object.keys(errors.value).length === 0);
  if (options.watchRoute) {
    vue.watch(() => route.value.path, (newPath, oldPath) => {
      if (newPath !== oldPath) {
        if (isDirty.value && options.autoSave) {
          saveForm();
        }
      }
    });
  }
  const saveForm = async () => {
    const saved = await manager.saveForm(formId);
    if (saved && options.persistToStorage) {
      const storageKey = options.storageKey || `form_${formId}`;
      localStorage.removeItem(storageKey);
    }
    return saved;
  };
  if (options.persistToStorage) {
    vue.watch(() => form.value?.data, (data) => {
      if (data) {
        const storageKey = options.storageKey || `form_${formId}`;
        localStorage.setItem(storageKey, JSON.stringify(data));
      }
    }, {
      deep: true
    });
  }
  const updateField = (field, value) => {
    manager.updateField(formId, field, value);
  };
  const updateForm = (data) => {
    manager.updateFormData(formId, data);
  };
  const setFieldError = (field, errors2) => {
    manager.setFieldError(formId, field, errors2);
  };
  const setFormErrors = (errors2) => {
    manager.setFormErrors(formId, errors2);
  };
  const validateForm = async (validators2) => {
    return await manager.validateForm(formId, validators2);
  };
  const resetForm = () => {
    manager.resetForm(formId);
  };
  const clearForm = () => {
    if (options.persistToStorage) {
      const storageKey = options.storageKey || `form_${formId}`;
      localStorage.removeItem(storageKey);
    }
    manager.clearForm(formId);
  };
  const hasError = (field) => {
    return (errors.value[field]?.length ?? 0) > 0;
  };
  const getError = (field) => {
    return errors.value[field] ?? [];
  };
  const isTouched = (field) => {
    return touched.value.has(field);
  };
  const isValidating = (field) => {
    return form.value?.validating.has(field) ?? false;
  };
  vue.onUnmounted(() => {
    if (!options.persistToStorage && !isDirty.value) {
      clearForm();
    }
  });
  return {
    form,
    isDirty,
    isValid,
    errors,
    touched,
    updateField,
    updateForm,
    setFieldError,
    setFormErrors,
    validateForm,
    resetForm,
    saveForm,
    clearForm,
    hasError,
    getError,
    isTouched,
    isValidating
  };
}
function useMultiStepForm(config, options = {}) {
  const manager = vue.inject("formRouteManager", new FormRouteManager.FormRouteManager());
  const route = index.useRoute();
  const formId = options.formId || `multi-step-${route.value.path}`;
  manager.initMultiStepForm(formId, config);
  const formReturn = useFormRoute({
    ...options,
    formId
  });
  const multiStepConfig = vue.computed(() => manager.getMultiStepForm(formId));
  const currentStep = vue.computed(() => multiStepConfig.value?.currentStep ?? 0);
  const totalSteps = vue.computed(() => multiStepConfig.value?.steps.length ?? 0);
  const canGoNext = vue.computed(() => currentStep.value < totalSteps.value - 1);
  const canGoPrevious = vue.computed(() => currentStep.value > 0);
  const stepCompletion = vue.computed(() => manager.getStepCompletion(formId));
  const nextStep = async () => {
    return await manager.nextStep(formId);
  };
  const previousStep = async () => {
    return await manager.previousStep(formId);
  };
  const goToStep = async (stepIndex) => {
    return await manager.goToStep(formId, stepIndex);
  };
  const completeForm = async () => {
    return await manager.completeMultiStepForm(formId);
  };
  return {
    ...formReturn,
    currentStep,
    totalSteps,
    canGoNext,
    canGoPrevious,
    stepCompletion,
    nextStep,
    previousStep,
    goToStep,
    completeForm
  };
}
const validators = {
  required: (message = "This field is required") => {
    return (value) => {
      if (value === null || value === void 0 || value === "") {
        return [message];
      }
      return [];
    };
  },
  minLength: (min, message) => {
    return (value) => {
      if (value && value.length < min) {
        return [message || `Minimum length is ${min}`];
      }
      return [];
    };
  },
  maxLength: (max, message) => {
    return (value) => {
      if (value && value.length > max) {
        return [message || `Maximum length is ${max}`];
      }
      return [];
    };
  },
  email: (message = "Invalid email address") => {
    return (value) => {
      const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        return [message];
      }
      return [];
    };
  },
  pattern: (regex, message = "Invalid format") => {
    return (value) => {
      if (value && !regex.test(value)) {
        return [message];
      }
      return [];
    };
  },
  numeric: (message = "Must be a number") => {
    return (value) => {
      if (value && isNaN(Number(value))) {
        return [message];
      }
      return [];
    };
  },
  min: (min, message) => {
    return (value) => {
      if (value !== void 0 && value !== null && value < min) {
        return [message || `Minimum value is ${min}`];
      }
      return [];
    };
  },
  max: (max, message) => {
    return (value) => {
      if (value !== void 0 && value !== null && value > max) {
        return [message || `Maximum value is ${max}`];
      }
      return [];
    };
  },
  // 组合多个验证器
  compose: (...validators2) => {
    return async (value) => {
      const errors = [];
      for (const validator of validators2) {
        const result = await validator(value);
        errors.push(...result);
      }
      return errors;
    };
  }
};
const FormRoutePlugin = {
  install(app, options = {}) {
    const manager = options.manager || new FormRouteManager.FormRouteManager();
    app.provide("formRouteManager", manager);
    app.config.globalProperties.$formManager = manager;
    app.mixin({
      beforeRouteLeave(_to, _from, next) {
        const dirtyForms = Array.from(manager.forms.values()).filter((form) => form.isDirty).map((form) => form.id);
        if (dirtyForms.length > 0) {
          const confirmed = window.confirm("You have unsaved changes. Are you sure you want to leave?");
          if (confirmed) {
            dirtyForms.forEach((formId) => {
              manager.clearForm(formId);
            });
            next();
          } else {
            next(false);
          }
        } else {
          next();
        }
      }
    });
  }
};
function useFormField(formReturn, fieldName, validators2) {
  const value = vue.computed({
    get: () => formReturn.form.value?.data[fieldName],
    set: (val) => formReturn.updateField(fieldName, val)
  });
  const error = vue.computed(() => formReturn.getError(fieldName));
  const hasError = vue.computed(() => formReturn.hasError(fieldName));
  const touched = vue.computed(() => formReturn.isTouched(fieldName));
  const validating = vue.computed(() => formReturn.isValidating(fieldName));
  const validate = async () => {
    if (validators2 && validators2.length > 0) {
      const composedValidator = validators2.length === 1 ? validators2[0] : async (val) => {
        const allErrors = [];
        for (const validator of validators2) {
          const errors2 = await validator(val);
          allErrors.push(...errors2);
        }
        return allErrors;
      };
      if (!composedValidator) return true;
      const errors = await composedValidator(value.value);
      formReturn.setFieldError(fieldName, errors);
      return errors.length === 0;
    }
    return true;
  };
  const blur = () => {
    formReturn.updateField(fieldName, value.value);
    validate();
  };
  return {
    value,
    error,
    hasError,
    touched,
    validating,
    validate,
    blur,
    props: vue.computed(() => ({
      modelValue: value.value,
      "onUpdate:modelValue": (val) => {
        value.value = val;
      },
      onBlur: blur,
      error: hasError.value,
      errorMessage: error.value[0],
      loading: validating.value
    }))
  };
}

exports.FormRoutePlugin = FormRoutePlugin;
exports.useFormField = useFormField;
exports.useFormRoute = useFormRoute;
exports.useMultiStepForm = useMultiStepForm;
exports.validators = validators;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=useFormRoute.cjs.map
