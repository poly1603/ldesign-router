import type { Router } from '../types';
export interface FormState {
    isDirty: boolean;
    data: Record<string, any>;
    originalData: Record<string, any>;
    errors: Record<string, string[]>;
    touched: Set<string>;
    validating: Set<string>;
}
export interface FormRouteOptions {
    confirmMessage?: string;
    autoSave?: boolean;
    autoSaveInterval?: number;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    preserveOnError?: boolean;
}
export interface MultiStepFormConfig {
    steps: Array<{
        name: string;
        path: string;
        component?: any;
        validate?: (data: any) => boolean | Promise<boolean>;
        canSkip?: boolean;
    }>;
    currentStep?: number;
    allowJumpToStep?: boolean;
    preserveDataOnBack?: boolean;
}
export type FormRouteConfig = FormRouteOptions;
export declare class FormRouteManager {
    forms: Map<string, FormState>;
    private autoSaveTimers;
    private multiStepForms;
    private router;
    constructor(router?: Router);
    /**
     * 初始化表单状态
     */
    initForm(formId: string, initialData?: Record<string, any>, options?: FormRouteOptions): FormState;
    /**
     * 获取表单状态
     */
    getForm(formId: string): FormState | undefined;
    /**
     * 更新表单字段
     */
    updateField(formId: string, field: string, value: any): void;
    /**
     * 批量更新表单数据
     */
    updateFormData(formId: string, data: Record<string, any>): void;
    /**
     * 检查表单是否已修改
     */
    private checkDirty;
    /**
     * 重置表单
     */
    resetForm(formId: string): void;
    /**
     * 清理表单
     */
    clearForm(formId: string): void;
    /**
     * 设置表单错误
     */
    setFieldError(formId: string, field: string, errors: string[]): void;
    /**
     * 设置多个字段错误
     */
    setFormErrors(formId: string, errors: Record<string, string[]>): void;
    /**
     * 验证表单
     */
    validateForm(formId: string, validators?: Record<string, (value: any) => string[] | Promise<string[]>>): Promise<boolean>;
    /**
     * 设置自动保存
     */
    private setupAutoSave;
    /**
     * 保存表单（需要实现具体逻辑）
     */
    saveForm(formId: string): Promise<boolean>;
    /**
     * 设置导航守卫
     */
    private setupNavigationGuards;
    /**
     * 初始化多步骤表单
     */
    initMultiStepForm(formId: string, config: MultiStepFormConfig): MultiStepFormConfig | undefined;
    /**
     * 获取多步骤表单配置
     */
    getMultiStepForm(formId: string): MultiStepFormConfig | undefined;
    /**
     * 下一步
     */
    nextStep(formId: string): Promise<boolean>;
    /**
     * 上一步
     */
    previousStep(formId: string): Promise<boolean>;
    /**
     * 跳转到指定步骤
     */
    goToStep(formId: string, stepIndex: number): Promise<boolean>;
    /**
     * 获取当前步骤索引
     */
    getCurrentStepIndex(formId: string): number;
    /**
     * 获取步骤完成状态
     */
    getStepCompletion(formId: string): boolean[];
    /**
     * 完成多步骤表单
     */
    completeMultiStepForm(formId: string): Promise<boolean>;
}
export declare const formRouteManager: FormRouteManager;
declare const _default: {
    install(app: any, options?: {
        router?: Router;
    }): void;
};
export default _default;
