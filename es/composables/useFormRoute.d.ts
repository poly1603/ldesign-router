import type { Ref } from 'vue';
import type { FormRouteOptions, FormState, MultiStepFormConfig } from '../managers/FormRouteManager';
import { FormRouteManager } from '../managers/FormRouteManager';
export interface UseFormRouteOptions extends FormRouteOptions {
    formId?: string;
    watchRoute?: boolean;
    persistToStorage?: boolean;
    storageKey?: string;
}
export interface UseFormReturn {
    form: Ref<FormState | undefined>;
    isDirty: Ref<boolean>;
    isValid: Ref<boolean>;
    errors: Ref<Record<string, string[]>>;
    touched: Ref<Set<string>>;
    updateField: (field: string, value: any) => void;
    updateForm: (data: Record<string, any>) => void;
    setFieldError: (field: string, errors: string[]) => void;
    setFormErrors: (errors: Record<string, string[]>) => void;
    validateForm: (validators?: Record<string, (value: any) => string[] | Promise<string[]>>) => Promise<boolean>;
    resetForm: () => void;
    saveForm: () => Promise<boolean>;
    clearForm: () => void;
    hasError: (field: string) => boolean;
    getError: (field: string) => string[];
    isTouched: (field: string) => boolean;
    isValidating: (field: string) => boolean;
}
export interface UseMultiStepFormReturn extends UseFormReturn {
    currentStep: Ref<number>;
    totalSteps: Ref<number>;
    canGoNext: Ref<boolean>;
    canGoPrevious: Ref<boolean>;
    stepCompletion: Ref<boolean[]>;
    nextStep: () => Promise<boolean>;
    previousStep: () => Promise<boolean>;
    goToStep: (stepIndex: number) => Promise<boolean>;
    completeForm: () => Promise<boolean>;
}
/**
 * 表单路由组合式函数
 */
export declare function useFormRoute(options?: UseFormRouteOptions): UseFormReturn;
/**
 * 多步骤表单组合式函数
 */
export declare function useMultiStepForm(config: MultiStepFormConfig, options?: UseFormRouteOptions): UseMultiStepFormReturn;
/**
 * 字段验证器辅助函数
 */
export declare const validators: {
    required: (message?: string) => (value: any) => string[];
    minLength: (min: number, message?: string) => (value: string) => string[];
    maxLength: (max: number, message?: string) => (value: string) => string[];
    email: (message?: string) => (value: string) => string[];
    pattern: (regex: RegExp, message?: string) => (value: string) => string[];
    numeric: (message?: string) => (value: any) => string[];
    min: (min: number, message?: string) => (value: number) => string[];
    max: (max: number, message?: string) => (value: number) => string[];
    compose: (...validators: Array<(value: any) => string[] | Promise<string[]>>) => (value: any) => Promise<string[]>;
};
/**
 * 表单路由插件
 */
export declare const FormRoutePlugin: {
    install(app: any, options?: {
        manager?: FormRouteManager;
    }): void;
};
/**
 * 创建表单字段绑定
 */
export declare function useFormField(formReturn: UseFormReturn, fieldName: string, validators?: Array<(value: any) => string[] | Promise<string[]>>): {
    value: import("vue").WritableComputedRef<any, any>;
    error: import("vue").ComputedRef<string[]>;
    hasError: import("vue").ComputedRef<boolean>;
    touched: import("vue").ComputedRef<boolean>;
    validating: import("vue").ComputedRef<boolean>;
    validate: () => Promise<boolean>;
    blur: () => void;
    props: import("vue").ComputedRef<{
        modelValue: any;
        'onUpdate:modelValue': (val: any) => void;
        onBlur: () => void;
        error: boolean;
        errorMessage: string | undefined;
        loading: boolean;
    }>;
};
