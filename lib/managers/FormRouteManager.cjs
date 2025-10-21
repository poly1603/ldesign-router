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

Object.defineProperty(exports, '__esModule', { value: true });

var vue = require('vue');

class FormRouteManager {
  constructor(router) {
    this.forms = /* @__PURE__ */ new Map();
    this.autoSaveTimers = /* @__PURE__ */ new Map();
    this.multiStepForms = /* @__PURE__ */ new Map();
    this.router = null;
    if (router) {
      this.router = router;
      this.setupNavigationGuards();
    }
  }
  /**
   * 初始化表单状态
   */
  initForm(formId, initialData = {}, options) {
    const state = vue.reactive({
      isDirty: false,
      data: {
        ...initialData
      },
      originalData: {
        ...initialData
      },
      errors: {},
      touched: /* @__PURE__ */ new Set(),
      validating: /* @__PURE__ */ new Set()
    });
    this.forms.set(formId, state);
    if (options?.autoSave) {
      this.setupAutoSave(formId, options.autoSaveInterval || 3e4);
    }
    return state;
  }
  /**
   * 获取表单状态
   */
  getForm(formId) {
    return this.forms.get(formId);
  }
  /**
   * 更新表单字段
   */
  updateField(formId, field, value) {
    const form = this.forms.get(formId);
    if (!form) return;
    form.data[field] = value;
    form.touched.add(field);
    form.isDirty = this.checkDirty(form);
    delete form.errors[field];
  }
  /**
   * 批量更新表单数据
   */
  updateFormData(formId, data) {
    const form = this.forms.get(formId);
    if (!form) return;
    Object.assign(form.data, data);
    Object.keys(data).forEach((key) => form.touched.add(key));
    form.isDirty = this.checkDirty(form);
  }
  /**
   * 检查表单是否已修改
   */
  checkDirty(form) {
    return JSON.stringify(form.data) !== JSON.stringify(form.originalData);
  }
  /**
   * 重置表单
   */
  resetForm(formId) {
    const form = this.forms.get(formId);
    if (!form) return;
    form.data = {
      ...form.originalData
    };
    form.errors = {};
    form.touched.clear();
    form.validating.clear();
    form.isDirty = false;
  }
  /**
   * 清理表单
   */
  clearForm(formId) {
    const form = this.forms.get(formId);
    if (!form) return;
    const timer = this.autoSaveTimers.get(formId);
    if (timer) {
      clearInterval(timer);
      this.autoSaveTimers.delete(formId);
    }
    this.forms.delete(formId);
  }
  /**
   * 设置表单错误
   */
  setFieldError(formId, field, errors) {
    const form = this.forms.get(formId);
    if (!form) return;
    if (errors.length > 0) {
      form.errors[field] = errors;
    } else {
      delete form.errors[field];
    }
  }
  /**
   * 设置多个字段错误
   */
  setFormErrors(formId, errors) {
    const form = this.forms.get(formId);
    if (!form) return;
    form.errors = {
      ...errors
    };
  }
  /**
   * 验证表单
   */
  async validateForm(formId, validators) {
    const form = this.forms.get(formId);
    if (!form || !validators) return true;
    const errors = {};
    const validationPromises = [];
    for (const [field, validator] of Object.entries(validators)) {
      form.validating.add(field);
      const promise = Promise.resolve(validator(form.data[field])).then((fieldErrors) => {
        if (fieldErrors.length > 0) {
          errors[field] = fieldErrors;
        }
      }).finally(() => {
        form.validating.delete(field);
      });
      validationPromises.push(promise);
    }
    await Promise.all(validationPromises);
    form.errors = errors;
    return Object.keys(errors).length === 0;
  }
  /**
   * 设置自动保存
   */
  setupAutoSave(formId, interval) {
    const timer = setInterval(() => {
      const form = this.forms.get(formId);
      if (form && form.isDirty) {
        this.saveForm(formId);
      }
    }, interval);
    this.autoSaveTimers.set(formId, timer);
  }
  /**
   * 保存表单（需要实现具体逻辑）
   */
  async saveForm(formId) {
    const form = this.forms.get(formId);
    if (!form) return false;
    console.log("Saving form:", formId, form.data);
    form.originalData = {
      ...form.data
    };
    form.isDirty = false;
    return true;
  }
  /**
   * 设置导航守卫
   */
  setupNavigationGuards() {
    if (!this.router) return;
    this.router.beforeEach((_to, _from, next) => {
      const dirtyForms = Array.from(this.forms.entries()).filter(([_, form]) => form.isDirty).map(([id, _]) => id);
      if (dirtyForms.length > 0) {
        const message = `You have unsaved changes in form(s): ${dirtyForms.join(", ")}. Do you want to leave?`;
        if (confirm(message)) {
          dirtyForms.forEach((id) => this.clearForm(id));
          next();
        } else {
          next(false);
        }
      } else {
        next();
      }
    });
  }
  /**
   * 初始化多步骤表单
   */
  initMultiStepForm(formId, config) {
    this.multiStepForms.set(formId, {
      ...config,
      currentStep: config.currentStep || 0
    });
    this.initForm(formId);
    return this.getMultiStepForm(formId);
  }
  /**
   * 获取多步骤表单配置
   */
  getMultiStepForm(formId) {
    return this.multiStepForms.get(formId);
  }
  /**
   * 下一步
   */
  async nextStep(formId) {
    const config = this.multiStepForms.get(formId);
    const form = this.forms.get(formId);
    if (!config || !form) return false;
    const currentStep = config.steps[config.currentStep];
    if (currentStep && currentStep.validate) {
      const isValid = currentStep ? await currentStep.validate(form.data) : false;
      if (!isValid) return false;
    }
    if (config.currentStep < config.steps.length - 1) {
      config.currentStep++;
      if (this.router) {
        const nextStep = config.steps[config.currentStep];
        if (nextStep) await this.router.push(nextStep.path);
      }
      return true;
    }
    return false;
  }
  /**
   * 上一步
   */
  async previousStep(formId) {
    const config = this.multiStepForms.get(formId);
    const form = this.forms.get(formId);
    if (!config || !form) return false;
    if (config.currentStep > 0) {
      if (!config.preserveDataOnBack) ;
      config.currentStep--;
      if (this.router) {
        const previousStep = config.steps[config.currentStep];
        if (previousStep) await this.router.push(previousStep.path);
      }
      return true;
    }
    return false;
  }
  /**
   * 跳转到指定步骤
   */
  async goToStep(formId, stepIndex) {
    const config = this.multiStepForms.get(formId);
    if (!config || !config.allowJumpToStep) return false;
    if (stepIndex >= 0 && stepIndex < config.steps.length) {
      config.currentStep = stepIndex;
      if (this.router) {
        const targetStep = config.steps[stepIndex];
        if (targetStep) await this.router.push(targetStep.path);
      }
      return true;
    }
    return false;
  }
  /**
   * 获取当前步骤索引
   */
  getCurrentStepIndex(formId) {
    const config = this.multiStepForms.get(formId);
    return config?.currentStep ?? -1;
  }
  /**
   * 获取步骤完成状态
   */
  getStepCompletion(formId) {
    const config = this.multiStepForms.get(formId);
    const form = this.forms.get(formId);
    if (!config || !form) return [];
    return config.steps.map((step, index) => {
      if (index < config.currentStep) return true;
      if (index === config.currentStep) {
        return !step.validate;
      }
      return false;
    });
  }
  /**
   * 完成多步骤表单
   */
  async completeMultiStepForm(formId) {
    const config = this.multiStepForms.get(formId);
    const form = this.forms.get(formId);
    if (!config || !form) return false;
    const lastStep = config.steps[config.steps.length - 1];
    if (lastStep && lastStep.validate) {
      const isValid = await lastStep.validate(form.data);
      if (!isValid) return false;
    }
    const saved = await this.saveForm(formId);
    if (saved) {
      this.multiStepForms.delete(formId);
      this.clearForm(formId);
    }
    return saved;
  }
}
const formRouteManager = new FormRouteManager();
var FormRouteManager$1 = {
  install(app, options = {}) {
    const manager = new FormRouteManager(options.router);
    app.config.globalProperties.$formRoute = manager;
    app.provide("formRouteManager", manager);
  }
};

exports.FormRouteManager = FormRouteManager;
exports.default = FormRouteManager$1;
exports.formRouteManager = formRouteManager;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=FormRouteManager.cjs.map
