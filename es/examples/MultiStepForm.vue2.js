/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { defineComponent, ref, computed, watch, onMounted, onBeforeUnmount, createElementBlock, openBlock, createElementVNode, createCommentVNode, toDisplayString, Fragment, renderList, normalizeClass, withModifiers, withDirectives, vModelText, createStaticVNode, vModelSelect, createTextVNode, vModelCheckbox } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const _hoisted_1 = {
  class: "multi-step-form"
};
const _hoisted_2 = {
  class: "form-header"
};
const _hoisted_3 = {
  class: "progress-bar"
};
const _hoisted_4 = ["onClick"];
const _hoisted_5 = {
  class: "step-number"
};
const _hoisted_6 = {
  class: "step-label"
};
const _hoisted_7 = {
  key: 0,
  class: "form-step"
};
const _hoisted_8 = {
  class: "form-group"
};
const _hoisted_9 = {
  key: 0,
  class: "error"
};
const _hoisted_10 = {
  class: "form-group"
};
const _hoisted_11 = {
  key: 0,
  class: "error"
};
const _hoisted_12 = {
  class: "form-group"
};
const _hoisted_13 = {
  key: 0,
  class: "error"
};
const _hoisted_14 = {
  class: "form-group"
};
const _hoisted_15 = {
  key: 0,
  class: "error"
};
const _hoisted_16 = {
  key: 1,
  class: "form-step"
};
const _hoisted_17 = {
  class: "form-group"
};
const _hoisted_18 = {
  key: 0,
  class: "error"
};
const _hoisted_19 = {
  class: "form-group"
};
const _hoisted_20 = {
  key: 0,
  class: "error"
};
const _hoisted_21 = {
  class: "form-group"
};
const _hoisted_22 = {
  key: 0,
  class: "error"
};
const _hoisted_23 = {
  class: "form-group"
};
const _hoisted_24 = {
  key: 0,
  class: "error"
};
const _hoisted_25 = {
  class: "form-group"
};
const _hoisted_26 = {
  key: 0,
  class: "error"
};
const _hoisted_27 = {
  key: 2,
  class: "form-step"
};
const _hoisted_28 = {
  class: "form-group"
};
const _hoisted_29 = {
  class: "checkbox-group"
};
const _hoisted_30 = {
  class: "form-group"
};
const _hoisted_31 = {
  class: "form-group"
};
const _hoisted_32 = {
  class: "form-group"
};
const _hoisted_33 = {
  key: 3,
  class: "form-step"
};
const _hoisted_34 = {
  class: "review-section"
};
const _hoisted_35 = {
  class: "review-section"
};
const _hoisted_36 = {
  class: "review-section"
};
const _hoisted_37 = {
  key: 0
};
const _hoisted_38 = {
  key: 1
};
const _hoisted_39 = {
  key: 2
};
const _hoisted_40 = {
  key: 3
};
const _hoisted_41 = {
  class: "form-group"
};
const _hoisted_42 = {
  key: 0,
  class: "error"
};
const _hoisted_43 = {
  class: "form-navigation"
};
const _hoisted_44 = ["disabled"];
const _hoisted_45 = ["disabled"];
const _hoisted_46 = ["disabled"];
const _hoisted_47 = {
  key: 0,
  class: "auto-save-status"
};
var script = /* @__PURE__ */ defineComponent({
  __name: "MultiStepForm",
  setup(__props) {
    const router = useRouter();
    const route = useRoute();
    const initialFormData = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      preferences: {
        email: true,
        sms: false,
        push: false
      },
      newsletterFrequency: "monthly",
      language: "en",
      timezone: "UTC",
      agreeToTerms: false
    };
    const steps = [{
      name: "personal",
      label: "Personal Info",
      title: "Personal Information"
    }, {
      name: "address",
      label: "Address",
      title: "Address Information"
    }, {
      name: "preferences",
      label: "Preferences",
      title: "Communication Preferences"
    }, {
      name: "review",
      label: "Review",
      title: "Review & Submit"
    }];
    const formData = ref({
      ...initialFormData
    });
    const errors = ref({});
    const currentStep = ref(steps[0].name);
    const currentStepIndex = computed(() => steps.findIndex((s) => s.name === currentStep.value));
    const currentStepInfo = computed(() => steps[currentStepIndex.value]);
    const completedSteps = ref(/* @__PURE__ */ new Set());
    const stepErrors = ref(/* @__PURE__ */ new Set());
    const isNavigating = ref(false);
    const isSubmitting = ref(false);
    const autoSaveStatus = ref("");
    const {
      hasUnsavedChanges,
      saveForm,
      loadForm,
      clearForm,
      validateStep,
      isStepValid,
      canNavigateAway
    } = useFormRoute("multi-step-form", {
      formData: formData.value,
      currentStep: currentStep.value
    });
    const validationRules = {
      firstName: (value) => !value ? "First name is required" : null,
      lastName: (value) => !value ? "Last name is required" : null,
      email: (value) => {
        if (!value) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? "Invalid email format" : null;
      },
      phone: (value) => {
        if (!value) return null;
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return !phoneRegex.test(value) ? "Invalid phone format" : null;
      },
      street: (value) => !value ? "Street address is required" : null,
      city: (value) => !value ? "City is required" : null,
      state: (value) => !value ? "State/Province is required" : null,
      zipCode: (value) => !value ? "Zip/Postal code is required" : null,
      country: (value) => !value ? "Country is required" : null,
      agreeToTerms: (value) => !value ? "You must agree to the terms" : null
    };
    const validateField = (fieldName) => {
      const value = fieldName.includes(".") ? fieldName.split(".").reduce((obj, key) => obj?.[key], formData.value) : formData.value[fieldName];
      const validator = validationRules[fieldName];
      if (validator) {
        const error = validator(value);
        if (error) {
          errors.value[fieldName] = error;
        } else {
          delete errors.value[fieldName];
        }
      }
    };
    const validateCurrentStep = () => {
      const stepFields = getStepFields(currentStep.value);
      let isValid = true;
      stepFields.forEach((field) => {
        validateField(field);
        if (errors.value[field]) {
          isValid = false;
        }
      });
      if (isValid) {
        stepErrors.value.delete(currentStep.value);
      } else {
        stepErrors.value.add(currentStep.value);
      }
      return isValid;
    };
    const getStepFields = (stepName) => {
      switch (stepName) {
        case "personal":
          return ["firstName", "lastName", "email", "phone"];
        case "address":
          return ["street", "city", "state", "zipCode", "country"];
        case "preferences":
          return [];
        case "review":
          return ["agreeToTerms"];
        default:
          return [];
      }
    };
    const canProceed = computed(() => {
      if (currentStep.value === "review") {
        return formData.value.agreeToTerms;
      }
      return !stepErrors.value.has(currentStep.value);
    });
    const isFormValid = computed(() => {
      return completedSteps.value.size === steps.length - 1 && formData.value.agreeToTerms && stepErrors.value.size === 0;
    });
    const navigateToStep = async (stepIndex) => {
      if (isNavigating.value) return;
      const targetStep = steps[stepIndex];
      if (!targetStep) return;
      if (stepIndex > currentStepIndex.value) {
        if (!validateCurrentStep()) {
          return;
        }
      }
      isNavigating.value = true;
      try {
        if (validateCurrentStep()) {
          completedSteps.value.add(currentStep.value);
        }
        currentStep.value = targetStep.name;
        await router.push({
          ...route.value,
          query: {
            ...route.value.query,
            step: targetStep.name
          }
        });
      } finally {
        isNavigating.value = false;
      }
    };
    const nextStep = () => {
      if (currentStepIndex.value < steps.length - 1) {
        navigateToStep(currentStepIndex.value + 1);
      }
    };
    const previousStep = () => {
      if (currentStepIndex.value > 0) {
        navigateToStep(currentStepIndex.value - 1);
      }
    };
    const autoSave = async () => {
      try {
        autoSaveStatus.value = "Saving...";
        await saveForm({
          formData: formData.value,
          currentStep: currentStep.value,
          completedSteps: Array.from(completedSteps.value)
        });
        autoSaveStatus.value = "Saved";
        setTimeout(() => {
          autoSaveStatus.value = "";
        }, 2e3);
      } catch (error) {
        autoSaveStatus.value = "Save failed";
        console.error("Auto-save failed:", error);
      }
    };
    const saveAndExit = async () => {
      await autoSave();
      router.push("/");
    };
    const handleSubmit = async () => {
      if (!isFormValid.value) return;
      isSubmitting.value = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 2e3));
        await clearForm();
        await router.push("/success");
      } catch (error) {
        console.error("Form submission failed:", error);
      } finally {
        isSubmitting.value = false;
      }
    };
    let autoSaveTimer = null;
    watch(formData, () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      autoSaveTimer = setTimeout(autoSave, 3e3);
    }, {
      deep: true
    });
    onMounted(async () => {
      const savedData = await loadForm();
      if (savedData) {
        formData.value = savedData.formData || formData.value;
        currentStep.value = savedData.currentStep || currentStep.value;
        if (savedData.completedSteps) {
          completedSteps.value = new Set(savedData.completedSteps);
        }
      }
      const stepQuery = route.value.query.step;
      if (stepQuery && steps.some((s) => s.name === stepQuery)) {
        currentStep.value = stepQuery;
      }
    });
    onBeforeUnmount(() => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [createElementVNode("div", _hoisted_2, [createElementVNode(
        "h2",
        null,
        toDisplayString(currentStepInfo.value.title),
        1
        /* TEXT */
      ), createElementVNode("div", _hoisted_3, [(openBlock(), createElementBlock(
        Fragment,
        null,
        renderList(steps, (step, index) => {
          return createElementVNode("div", {
            key: step.name,
            class: normalizeClass(["step-indicator", {
              "active": currentStepIndex.value === index,
              "completed": completedSteps.value.has(step.name),
              "error": stepErrors.value.has(step.name)
            }]),
            onClick: ($event) => navigateToStep(index)
          }, [createElementVNode(
            "span",
            _hoisted_5,
            toDisplayString(index + 1),
            1
            /* TEXT */
          ), createElementVNode(
            "span",
            _hoisted_6,
            toDisplayString(step.label),
            1
            /* TEXT */
          )], 10, _hoisted_4);
        }),
        64
        /* STABLE_FRAGMENT */
      ))])]), createElementVNode(
        "form",
        {
          onSubmit: withModifiers(handleSubmit, ["prevent"])
        },
        [createCommentVNode(" Step 1: Personal Info "), currentStep.value === "personal" ? (openBlock(), createElementBlock("div", _hoisted_7, [createElementVNode("div", _hoisted_8, [_cache[25] || (_cache[25] = createElementVNode(
          "label",
          {
            for: "firstName"
          },
          "First Name *",
          -1
          /* CACHED */
        )), withDirectives(createElementVNode(
          "input",
          {
            id: "firstName",
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => formData.value.firstName = $event),
            type: "text",
            required: "",
            onBlur: _cache[1] || (_cache[1] = ($event) => validateField("firstName"))
          },
          null,
          544
          /* NEED_HYDRATION, NEED_PATCH */
        ), [[vModelText, formData.value.firstName]]), errors.value.firstName ? (openBlock(), createElementBlock(
          "span",
          _hoisted_9,
          toDisplayString(errors.value.firstName),
          1
          /* TEXT */
        )) : createCommentVNode("v-if", true)]), createElementVNode("div", _hoisted_10, [_cache[26] || (_cache[26] = createElementVNode(
          "label",
          {
            for: "lastName"
          },
          "Last Name *",
          -1
          /* CACHED */
        )), withDirectives(createElementVNode(
          "input",
          {
            id: "lastName",
            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => formData.value.lastName = $event),
            type: "text",
            required: "",
            onBlur: _cache[3] || (_cache[3] = ($event) => validateField("lastName"))
          },
          null,
          544
          /* NEED_HYDRATION, NEED_PATCH */
        ), [[vModelText, formData.value.lastName]]), errors.value.lastName ? (openBlock(), createElementBlock(
          "span",
          _hoisted_11,
          toDisplayString(errors.value.lastName),
          1
          /* TEXT */
        )) : createCommentVNode("v-if", true)]), createElementVNode("div", _hoisted_12, [_cache[27] || (_cache[27] = createElementVNode(
          "label",
          {
            for: "email"
          },
          "Email *",
          -1
          /* CACHED */
        )), withDirectives(createElementVNode(
          "input",
          {
            id: "email",
            "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => formData.value.email = $event),
            type: "email",
            required: "",
            onBlur: _cache[5] || (_cache[5] = ($event) => validateField("email"))
          },
          null,
          544
          /* NEED_HYDRATION, NEED_PATCH */
        ), [[vModelText, formData.value.email]]), errors.value.email ? (openBlock(), createElementBlock(
          "span",
          _hoisted_13,
          toDisplayString(errors.value.email),
          1
          /* TEXT */
        )) : createCommentVNode("v-if", true)]), createElementVNode("div", _hoisted_14, [_cache[28] || (_cache[28] = createElementVNode(
          "label",
          {
            for: "phone"
          },
          "Phone",
          -1
          /* CACHED */
        )), withDirectives(createElementVNode(
          "input",
          {
            id: "phone",
            "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => formData.value.phone = $event),
            type: "tel",
            onBlur: _cache[7] || (_cache[7] = ($event) => validateField("phone"))
          },
          null,
          544
          /* NEED_HYDRATION, NEED_PATCH */
        ), [[vModelText, formData.value.phone]]), errors.value.phone ? (openBlock(), createElementBlock(
          "span",
          _hoisted_15,
          toDisplayString(errors.value.phone),
          1
          /* TEXT */
        )) : createCommentVNode("v-if", true)])])) : createCommentVNode("v-if", true), createCommentVNode(" Step 2: Address "), currentStep.value === "address" ? (openBlock(), createElementBlock("div", _hoisted_16, [createElementVNode("div", _hoisted_17, [_cache[29] || (_cache[29] = createElementVNode(
          "label",
          {
            for: "street"
          },
          "Street Address *",
          -1
          /* CACHED */
        )), withDirectives(createElementVNode(
          "input",
          {
            id: "street",
            "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => formData.value.street = $event),
            type: "text",
            required: "",
            onBlur: _cache[9] || (_cache[9] = ($event) => validateField("street"))
          },
          null,
          544
          /* NEED_HYDRATION, NEED_PATCH */
        ), [[vModelText, formData.value.street]]), errors.value.street ? (openBlock(), createElementBlock(
          "span",
          _hoisted_18,
          toDisplayString(errors.value.street),
          1
          /* TEXT */
        )) : createCommentVNode("v-if", true)]), createElementVNode("div", _hoisted_19, [_cache[30] || (_cache[30] = createElementVNode(
          "label",
          {
            for: "city"
          },
          "City *",
          -1
          /* CACHED */
        )), withDirectives(createElementVNode(
          "input",
          {
            id: "city",
            "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => formData.value.city = $event),
            type: "text",
            required: "",
            onBlur: _cache[11] || (_cache[11] = ($event) => validateField("city"))
          },
          null,
          544
          /* NEED_HYDRATION, NEED_PATCH */
        ), [[vModelText, formData.value.city]]), errors.value.city ? (openBlock(), createElementBlock(
          "span",
          _hoisted_20,
          toDisplayString(errors.value.city),
          1
          /* TEXT */
        )) : createCommentVNode("v-if", true)]), createElementVNode("div", _hoisted_21, [_cache[31] || (_cache[31] = createElementVNode(
          "label",
          {
            for: "state"
          },
          "State/Province *",
          -1
          /* CACHED */
        )), withDirectives(createElementVNode(
          "input",
          {
            id: "state",
            "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => formData.value.state = $event),
            type: "text",
            required: "",
            onBlur: _cache[13] || (_cache[13] = ($event) => validateField("state"))
          },
          null,
          544
          /* NEED_HYDRATION, NEED_PATCH */
        ), [[vModelText, formData.value.state]]), errors.value.state ? (openBlock(), createElementBlock(
          "span",
          _hoisted_22,
          toDisplayString(errors.value.state),
          1
          /* TEXT */
        )) : createCommentVNode("v-if", true)]), createElementVNode("div", _hoisted_23, [_cache[32] || (_cache[32] = createElementVNode(
          "label",
          {
            for: "zipCode"
          },
          "Zip/Postal Code *",
          -1
          /* CACHED */
        )), withDirectives(createElementVNode(
          "input",
          {
            id: "zipCode",
            "onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => formData.value.zipCode = $event),
            type: "text",
            required: "",
            onBlur: _cache[15] || (_cache[15] = ($event) => validateField("zipCode"))
          },
          null,
          544
          /* NEED_HYDRATION, NEED_PATCH */
        ), [[vModelText, formData.value.zipCode]]), errors.value.zipCode ? (openBlock(), createElementBlock(
          "span",
          _hoisted_24,
          toDisplayString(errors.value.zipCode),
          1
          /* TEXT */
        )) : createCommentVNode("v-if", true)]), createElementVNode("div", _hoisted_25, [_cache[34] || (_cache[34] = createElementVNode(
          "label",
          {
            for: "country"
          },
          "Country *",
          -1
          /* CACHED */
        )), withDirectives(createElementVNode(
          "select",
          {
            id: "country",
            "onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => formData.value.country = $event),
            required: "",
            onBlur: _cache[17] || (_cache[17] = ($event) => validateField("country"))
          },
          [..._cache[33] || (_cache[33] = [createStaticVNode('<option value="" data-v-85180f88>Select a country</option><option value="US" data-v-85180f88>United States</option><option value="CA" data-v-85180f88>Canada</option><option value="UK" data-v-85180f88>United Kingdom</option><option value="AU" data-v-85180f88>Australia</option><option value="CN" data-v-85180f88>China</option><option value="JP" data-v-85180f88>Japan</option><option value="KR" data-v-85180f88>South Korea</option><option value="SG" data-v-85180f88>Singapore</option>', 9)])],
          544
          /* NEED_HYDRATION, NEED_PATCH */
        ), [[vModelSelect, formData.value.country]]), errors.value.country ? (openBlock(), createElementBlock(
          "span",
          _hoisted_26,
          toDisplayString(errors.value.country),
          1
          /* TEXT */
        )) : createCommentVNode("v-if", true)])])) : createCommentVNode("v-if", true), createCommentVNode(" Step 3: Preferences "), currentStep.value === "preferences" ? (openBlock(), createElementBlock("div", _hoisted_27, [createElementVNode("div", _hoisted_28, [_cache[38] || (_cache[38] = createElementVNode(
          "label",
          null,
          "Communication Preferences *",
          -1
          /* CACHED */
        )), createElementVNode("div", _hoisted_29, [createElementVNode("label", null, [withDirectives(createElementVNode(
          "input",
          {
            "onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => formData.value.preferences.email = $event),
            type: "checkbox"
          },
          null,
          512
          /* NEED_PATCH */
        ), [[vModelCheckbox, formData.value.preferences.email]]), _cache[35] || (_cache[35] = createTextVNode(
          " Email notifications ",
          -1
          /* CACHED */
        ))]), createElementVNode("label", null, [withDirectives(createElementVNode(
          "input",
          {
            "onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => formData.value.preferences.sms = $event),
            type: "checkbox"
          },
          null,
          512
          /* NEED_PATCH */
        ), [[vModelCheckbox, formData.value.preferences.sms]]), _cache[36] || (_cache[36] = createTextVNode(
          " SMS notifications ",
          -1
          /* CACHED */
        ))]), createElementVNode("label", null, [withDirectives(createElementVNode(
          "input",
          {
            "onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => formData.value.preferences.push = $event),
            type: "checkbox"
          },
          null,
          512
          /* NEED_PATCH */
        ), [[vModelCheckbox, formData.value.preferences.push]]), _cache[37] || (_cache[37] = createTextVNode(
          " Push notifications ",
          -1
          /* CACHED */
        ))])])]), createElementVNode("div", _hoisted_30, [_cache[40] || (_cache[40] = createElementVNode(
          "label",
          {
            for: "newsletter"
          },
          "Newsletter Frequency",
          -1
          /* CACHED */
        )), withDirectives(createElementVNode(
          "select",
          {
            id: "newsletter",
            "onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => formData.value.newsletterFrequency = $event)
          },
          [..._cache[39] || (_cache[39] = [createElementVNode(
            "option",
            {
              value: "never"
            },
            "Never",
            -1
            /* CACHED */
          ), createElementVNode(
            "option",
            {
              value: "daily"
            },
            "Daily",
            -1
            /* CACHED */
          ), createElementVNode(
            "option",
            {
              value: "weekly"
            },
            "Weekly",
            -1
            /* CACHED */
          ), createElementVNode(
            "option",
            {
              value: "monthly"
            },
            "Monthly",
            -1
            /* CACHED */
          )])],
          512
          /* NEED_PATCH */
        ), [[vModelSelect, formData.value.newsletterFrequency]])]), createElementVNode("div", _hoisted_31, [_cache[42] || (_cache[42] = createElementVNode(
          "label",
          {
            for: "language"
          },
          "Preferred Language",
          -1
          /* CACHED */
        )), withDirectives(createElementVNode(
          "select",
          {
            id: "language",
            "onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => formData.value.language = $event)
          },
          [..._cache[41] || (_cache[41] = [createStaticVNode('<option value="en" data-v-85180f88>English</option><option value="zh" data-v-85180f88>Chinese</option><option value="es" data-v-85180f88>Spanish</option><option value="fr" data-v-85180f88>French</option><option value="de" data-v-85180f88>German</option><option value="ja" data-v-85180f88>Japanese</option><option value="ko" data-v-85180f88>Korean</option>', 7)])],
          512
          /* NEED_PATCH */
        ), [[vModelSelect, formData.value.language]])]), createElementVNode("div", _hoisted_32, [_cache[44] || (_cache[44] = createElementVNode(
          "label",
          {
            for: "timezone"
          },
          "Timezone",
          -1
          /* CACHED */
        )), withDirectives(createElementVNode(
          "select",
          {
            id: "timezone",
            "onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => formData.value.timezone = $event)
          },
          [..._cache[43] || (_cache[43] = [createStaticVNode('<option value="UTC" data-v-85180f88>UTC</option><option value="EST" data-v-85180f88>Eastern Time</option><option value="CST" data-v-85180f88>Central Time</option><option value="PST" data-v-85180f88>Pacific Time</option><option value="GMT" data-v-85180f88>GMT</option><option value="JST" data-v-85180f88>Japan Time</option><option value="CST_CN" data-v-85180f88>China Time</option>', 7)])],
          512
          /* NEED_PATCH */
        ), [[vModelSelect, formData.value.timezone]])])])) : createCommentVNode("v-if", true), createCommentVNode(" Step 4: Review "), currentStep.value === "review" ? (openBlock(), createElementBlock("div", _hoisted_33, [createElementVNode("div", _hoisted_34, [_cache[48] || (_cache[48] = createElementVNode(
          "h3",
          null,
          "Personal Information",
          -1
          /* CACHED */
        )), createElementVNode("dl", null, [_cache[45] || (_cache[45] = createElementVNode(
          "dt",
          null,
          "Name:",
          -1
          /* CACHED */
        )), createElementVNode(
          "dd",
          null,
          toDisplayString(formData.value.firstName) + " " + toDisplayString(formData.value.lastName),
          1
          /* TEXT */
        ), _cache[46] || (_cache[46] = createElementVNode(
          "dt",
          null,
          "Email:",
          -1
          /* CACHED */
        )), createElementVNode(
          "dd",
          null,
          toDisplayString(formData.value.email),
          1
          /* TEXT */
        ), _cache[47] || (_cache[47] = createElementVNode(
          "dt",
          null,
          "Phone:",
          -1
          /* CACHED */
        )), createElementVNode(
          "dd",
          null,
          toDisplayString(formData.value.phone || "Not provided"),
          1
          /* TEXT */
        )])]), createElementVNode("div", _hoisted_35, [_cache[54] || (_cache[54] = createElementVNode(
          "h3",
          null,
          "Address",
          -1
          /* CACHED */
        )), createElementVNode("dl", null, [_cache[49] || (_cache[49] = createElementVNode(
          "dt",
          null,
          "Street:",
          -1
          /* CACHED */
        )), createElementVNode(
          "dd",
          null,
          toDisplayString(formData.value.street),
          1
          /* TEXT */
        ), _cache[50] || (_cache[50] = createElementVNode(
          "dt",
          null,
          "City:",
          -1
          /* CACHED */
        )), createElementVNode(
          "dd",
          null,
          toDisplayString(formData.value.city),
          1
          /* TEXT */
        ), _cache[51] || (_cache[51] = createElementVNode(
          "dt",
          null,
          "State/Province:",
          -1
          /* CACHED */
        )), createElementVNode(
          "dd",
          null,
          toDisplayString(formData.value.state),
          1
          /* TEXT */
        ), _cache[52] || (_cache[52] = createElementVNode(
          "dt",
          null,
          "Zip/Postal Code:",
          -1
          /* CACHED */
        )), createElementVNode(
          "dd",
          null,
          toDisplayString(formData.value.zipCode),
          1
          /* TEXT */
        ), _cache[53] || (_cache[53] = createElementVNode(
          "dt",
          null,
          "Country:",
          -1
          /* CACHED */
        )), createElementVNode(
          "dd",
          null,
          toDisplayString(formData.value.country),
          1
          /* TEXT */
        )])]), createElementVNode("div", _hoisted_36, [_cache[59] || (_cache[59] = createElementVNode(
          "h3",
          null,
          "Preferences",
          -1
          /* CACHED */
        )), createElementVNode("dl", null, [_cache[55] || (_cache[55] = createElementVNode(
          "dt",
          null,
          "Notifications:",
          -1
          /* CACHED */
        )), createElementVNode("dd", null, [formData.value.preferences.email ? (openBlock(), createElementBlock("span", _hoisted_37, "Email ")) : createCommentVNode("v-if", true), formData.value.preferences.sms ? (openBlock(), createElementBlock("span", _hoisted_38, "SMS ")) : createCommentVNode("v-if", true), formData.value.preferences.push ? (openBlock(), createElementBlock("span", _hoisted_39, "Push ")) : createCommentVNode("v-if", true), !formData.value.preferences.email && !formData.value.preferences.sms && !formData.value.preferences.push ? (openBlock(), createElementBlock("span", _hoisted_40, "None")) : createCommentVNode("v-if", true)]), _cache[56] || (_cache[56] = createElementVNode(
          "dt",
          null,
          "Newsletter:",
          -1
          /* CACHED */
        )), createElementVNode(
          "dd",
          null,
          toDisplayString(formData.value.newsletterFrequency),
          1
          /* TEXT */
        ), _cache[57] || (_cache[57] = createElementVNode(
          "dt",
          null,
          "Language:",
          -1
          /* CACHED */
        )), createElementVNode(
          "dd",
          null,
          toDisplayString(formData.value.language),
          1
          /* TEXT */
        ), _cache[58] || (_cache[58] = createElementVNode(
          "dt",
          null,
          "Timezone:",
          -1
          /* CACHED */
        )), createElementVNode(
          "dd",
          null,
          toDisplayString(formData.value.timezone),
          1
          /* TEXT */
        )])]), createElementVNode("div", _hoisted_41, [createElementVNode("label", null, [withDirectives(createElementVNode(
          "input",
          {
            "onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => formData.value.agreeToTerms = $event),
            type: "checkbox",
            required: ""
          },
          null,
          512
          /* NEED_PATCH */
        ), [[vModelCheckbox, formData.value.agreeToTerms]]), _cache[60] || (_cache[60] = createTextVNode(
          " I agree to the terms and conditions ",
          -1
          /* CACHED */
        ))]), errors.value.agreeToTerms ? (openBlock(), createElementBlock(
          "span",
          _hoisted_42,
          toDisplayString(errors.value.agreeToTerms),
          1
          /* TEXT */
        )) : createCommentVNode("v-if", true)])])) : createCommentVNode("v-if", true), createCommentVNode(" Navigation buttons "), createElementVNode("div", _hoisted_43, [currentStepIndex.value > 0 ? (openBlock(), createElementBlock("button", {
          key: 0,
          type: "button",
          class: "btn btn-secondary",
          onClick: previousStep,
          disabled: isNavigating.value
        }, " Previous ", 8, _hoisted_44)) : createCommentVNode("v-if", true), currentStepIndex.value < steps.length - 1 ? (openBlock(), createElementBlock("button", {
          key: 1,
          type: "button",
          class: "btn btn-primary",
          onClick: nextStep,
          disabled: !canProceed.value || isNavigating.value
        }, " Next ", 8, _hoisted_45)) : createCommentVNode("v-if", true), currentStepIndex.value === steps.length - 1 ? (openBlock(), createElementBlock("button", {
          key: 2,
          type: "submit",
          class: "btn btn-success",
          disabled: !isFormValid.value || isSubmitting.value
        }, toDisplayString(isSubmitting.value ? "Submitting..." : "Submit"), 9, _hoisted_46)) : createCommentVNode("v-if", true), createElementVNode("button", {
          type: "button",
          class: "btn btn-link",
          onClick: saveAndExit
        }, " Save & Exit ")])],
        32
        /* NEED_HYDRATION */
      ), createCommentVNode(" Auto-save indicator "), autoSaveStatus.value ? (openBlock(), createElementBlock(
        "div",
        _hoisted_47,
        toDisplayString(autoSaveStatus.value),
        1
        /* TEXT */
      )) : createCommentVNode("v-if", true)]);
    };
  }
});

export { script as default };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=MultiStepForm.vue2.js.map
