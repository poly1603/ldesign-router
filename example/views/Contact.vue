<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useI18n } from '../../src'

const { t } = useI18n()

// 表单数据
const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const submitting = ref(false)
const showSuccess = ref(false)

// FAQ数据
const faqs = ref([
  { key: 'installation', open: false },
  { key: 'configuration', open: false },
  { key: 'performance', open: false },
  { key: 'compatibility', open: false },
  { key: 'support', open: false },
])

// 处理表单提交
async function handleSubmit() {
  submitting.value = true

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log('Form submitted:', form)
    showSuccess.value = true
    resetForm()
  }
 catch (error) {
    console.error('Failed to submit form:', error)
  }
 finally {
    submitting.value = false
  }
}

// 重置表单
function resetForm() {
  form.name = ''
  form.email = ''
  form.subject = ''
  form.message = ''
}

// 切换FAQ
function toggleFaq(index: number) {
  faqs.value[index].open = !faqs.value[index].open
}

// 打开聊天
function openChat() {
  console.log('Opening chat...')
  alert(t('contact.info.chat.comingSoon'))
}
</script>

<template>
  <div class="contact-page">
    <div class="page-header">
      <h1 class="page-title">
        {{ t('contact.title') }}
      </h1>
      <p class="page-subtitle">
        {{ t('contact.subtitle') }}
      </p>
    </div>

    <div class="contact-content">
      <div class="contact-form-section">
        <div class="form-card">
          <h2>{{ t('contact.form.title') }}</h2>
          <form class="contact-form" @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="name">{{ t('contact.form.name') }}</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                :placeholder="t('contact.form.namePlaceholder')"
                required
              >
            </div>

            <div class="form-group">
              <label for="email">{{ t('contact.form.email') }}</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                :placeholder="t('contact.form.emailPlaceholder')"
                required
              >
            </div>

            <div class="form-group">
              <label for="subject">{{ t('contact.form.subject') }}</label>
              <select id="subject" v-model="form.subject" required>
                <option value="">
                  {{ t('contact.form.selectSubject') }}
                </option>
                <option value="general">
                  {{ t('contact.form.subjects.general') }}
                </option>
                <option value="support">
                  {{ t('contact.form.subjects.support') }}
                </option>
                <option value="feature">
                  {{ t('contact.form.subjects.feature') }}
                </option>
                <option value="bug">
                  {{ t('contact.form.subjects.bug') }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="message">{{ t('contact.form.message') }}</label>
              <textarea
                id="message"
                v-model="form.message"
                :placeholder="t('contact.form.messagePlaceholder')"
                rows="6"
                required
              />
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                {{ submitting ? t('contact.form.sending') : t('contact.form.send') }}
              </button>
              <button type="button" class="btn btn-secondary" @click="resetForm">
                {{ t('contact.form.reset') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="contact-info-section">
        <div class="info-card">
          <h2>{{ t('contact.info.title') }}</h2>

          <div class="contact-methods">
            <div class="contact-method">
              <div class="method-icon">
                📧
              </div>
              <div class="method-content">
                <h3>{{ t('contact.info.email.title') }}</h3>
                <p>{{ t('contact.info.email.description') }}</p>
                <a href="mailto:contact@ldesign.com" class="contact-link">
                  contact@ldesign.com
                </a>
              </div>
            </div>

            <div class="contact-method">
              <div class="method-icon">
                💬
              </div>
              <div class="method-content">
                <h3>{{ t('contact.info.chat.title') }}</h3>
                <p>{{ t('contact.info.chat.description') }}</p>
                <button class="contact-link" @click="openChat">
                  {{ t('contact.info.chat.action') }}
                </button>
              </div>
            </div>

            <div class="contact-method">
              <div class="method-icon">
                📚
              </div>
              <div class="method-content">
                <h3>{{ t('contact.info.docs.title') }}</h3>
                <p>{{ t('contact.info.docs.description') }}</p>
                <RouterLink to="/docs" class="contact-link">
                  {{ t('contact.info.docs.action') }}
                </RouterLink>
              </div>
            </div>

            <div class="contact-method">
              <div class="method-icon">
                🐛
              </div>
              <div class="method-content">
                <h3>{{ t('contact.info.github.title') }}</h3>
                <p>{{ t('contact.info.github.description') }}</p>
                <a href="https://github.com/ldesign/router" target="_blank" class="contact-link">
                  {{ t('contact.info.github.action') }}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="faq-card">
          <h2>{{ t('contact.faq.title') }}</h2>
          <div class="faq-list">
            <div
              v-for="(faq, index) in faqs"
              :key="index"
              class="faq-item"
              @click="toggleFaq(index)"
            >
              <div class="faq-question">
                <span>{{ t(`contact.faq.items.${faq.key}.question`) }}</span>
                <span class="faq-toggle">{{ faq.open ? '−' : '+' }}</span>
              </div>
              <div v-show="faq.open" class="faq-answer">
                {{ t(`contact.faq.items.${faq.key}.answer`) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成功提示 -->
    <div v-if="showSuccess" class="success-message">
      <div class="success-content">
        <div class="success-icon">
          ✅
        </div>
        <h3>{{ t('contact.success.title') }}</h3>
        <p>{{ t('contact.success.message') }}</p>
        <button class="btn btn-primary" @click="showSuccess = false">
          {{ t('contact.success.close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: #333;
}

.page-subtitle {
  font-size: 1.125rem;
  color: #666;
  margin: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

.form-card,
.info-card,
.faq-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.form-card h2,
.info-card h2,
.faq-card h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  color: #333;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: #1890ff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #40a9ff;
}

.btn-primary:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.contact-methods {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.contact-method {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.method-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.method-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #333;
}

.method-content p {
  color: #666;
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}

.contact-link {
  color: #1890ff;
  text-decoration: none;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  font-size: inherit;
}

.contact-link:hover {
  text-decoration: underline;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.faq-item {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
}

.faq-question {
  padding: 1rem;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.faq-question:hover {
  background: #e9ecef;
}

.faq-toggle {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1890ff;
}

.faq-answer {
  padding: 1rem;
  color: #666;
  line-height: 1.6;
  border-top: 1px solid #e9ecef;
}

.success-message {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.success-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  max-width: 400px;
  margin: 1rem;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.success-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #333;
}

.success-content p {
  color: #666;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .contact-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .contact-method {
    flex-direction: column;
    text-align: center;
  }
}

/* 暗色主题适配 */
:global(.theme-dark) .form-card,
:global(.theme-dark) .info-card,
:global(.theme-dark) .faq-card,
:global(.theme-dark) .success-content {
  background: #2d2d2d;
  color: white;
}

:global(.theme-dark) .page-title,
:global(.theme-dark) .form-card h2,
:global(.theme-dark) .info-card h2,
:global(.theme-dark) .faq-card h2,
:global(.theme-dark) .method-content h3,
:global(.theme-dark) .success-content h3,
:global(.theme-dark) .form-group label {
  color: white;
}

:global(.theme-dark) .page-subtitle,
:global(.theme-dark) .method-content p,
:global(.theme-dark) .success-content p,
:global(.theme-dark) .faq-answer {
  color: #ccc;
}

:global(.theme-dark) .form-group input,
:global(.theme-dark) .form-group select,
:global(.theme-dark) .form-group textarea {
  background: #404040;
  border-color: #555;
  color: white;
}

:global(.theme-dark) .btn-secondary {
  background: #404040;
  color: white;
}

:global(.theme-dark) .btn-secondary:hover {
  background: #555;
}

:global(.theme-dark) .faq-item {
  border-color: #555;
}

:global(.theme-dark) .faq-question {
  background: #404040;
  color: white;
}

:global(.theme-dark) .faq-question:hover {
  background: #555;
}

:global(.theme-dark) .faq-answer {
  border-color: #555;
}
</style>
