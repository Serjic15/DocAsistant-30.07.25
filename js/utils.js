/**
 * CardioAssistant Pro - Utilities Module
 * Модуль утилит и вспомогательных функций
 */

class Utils {
    constructor() {
        this.loadingElement = null;
        this.notificationQueue = [];
        this.autosaveTimeout = null;
    }

    // Управление загрузкой
    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('show');
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    // Система уведомлений
    showNotification(message, type = 'info', duration = 5000) {
        const notification = this.createNotification(message, type);
        document.body.appendChild(notification);
        
        // Автоудаление
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
        
        return notification;
    }

    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} notification-toast`;
        
        const iconMap = {
            success: 'check-circle',
            danger: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${iconMap[type] || 'info-circle'} me-2"></i>
                <span class="flex-grow-1">${message}</span>
                <button type="button" class="btn-close ms-2" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
        
        return notification;
    }

    showSuccessMessage(message) {
        return this.showNotification(message, 'success');
    }

    showErrorMessage(message) {
        return this.showNotification(message, 'danger');
    }

    showWarningMessage(message) {
        return this.showNotification(message, 'warning');
    }

    showInfoMessage(message) {
        return this.showNotification(message, 'info');
    }

    // Автосохранение
    showAutoSaveIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'auto-save-indicator';
        indicator.innerHTML = '<i class="fas fa-check"></i> Автосохранение';
        
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.remove();
            }
        }, 2000);
    }

    // Валидация форм
    validateForm(formElement) {
        const isValid = formElement.checkValidity();
        
        if (!isValid) {
            formElement.classList.add('was-validated');
            
            // Находим первое невалидное поле и фокусируемся на нем
            const firstInvalidField = formElement.querySelector(':invalid');
            if (firstInvalidField) {
                firstInvalidField.focus();
                firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        
        return isValid;
    }

    validateField(field) {
        const isValid = field.checkValidity();
        
        field.classList.remove('is-valid', 'is-invalid');
        
        if (field.value.trim() !== '') {
            if (isValid) {
                field.classList.add('is-valid');
            } else {
                field.classList.add('is-invalid');
            }
        }
        
        return isValid;
    }

    // Работа с localStorage
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения в localStorage:', error);
            this.showErrorMessage('Ошибка сохранения данных');
            return false;
        }
    }

    loadFromStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Ошибка загрузки из localStorage:', error);
            return defaultValue;
        }
    }

    removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Ошибка удаления из localStorage:', error);
            return false;
        }
    }

    // Медицинские расчеты
    calculateAge(birthDate) {
        if (!birthDate) return null;
        
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    calculateBMI(weight, height) {
        if (!weight || !height || weight <= 0 || height <= 0) return null;
        
        const heightM = height / 100;
        const bmi = weight / (heightM * heightM);
        
        return Math.round(bmi * 10) / 10;
    }

    getBMICategory(bmi) {
        if (!bmi) return '';
        
        if (bmi < 18.5) return 'Недостаточный вес';
        if (bmi < 25) return 'Нормальный вес';
        if (bmi < 30) return 'Избыточный вес';
        if (bmi < 35) return 'Ожирение I степени';
        if (bmi < 40) return 'Ожирение II степени';
        return 'Ожирение III степени';
    }

    calculateBSA(weight, height, formula = 'dubois') {
        if (!weight || !height || weight <= 0 || height <= 0) return null;
        
        let bsa;
        
        switch (formula.toLowerCase()) {
            case 'dubois':
                bsa = 0.007184 * Math.pow(height, 0.725) * Math.pow(weight, 0.425);
                break;
            case 'mosteller':
                bsa = Math.sqrt((height * weight) / 3600);
                break;
            case 'haycock':
                bsa = 0.024265 * Math.pow(height, 0.3964) * Math.pow(weight, 0.5378);
                break;
            default:
                bsa = 0.007184 * Math.pow(height, 0.725) * Math.pow(weight, 0.425);
        }
        
        return Math.round(bsa * 100) / 100;
    }

    // Валидация медицинских данных
    validateBloodPressure(bp) {
        if (!bp) return false;
        
        const pattern = /^\d{2,3}\/\d{2,3}$/;
        if (!pattern.test(bp)) return false;
        
        const [systolic, diastolic] = bp.split('/').map(Number);
        
        return systolic >= 70 && systolic <= 250 && 
               diastolic >= 40 && diastolic <= 150 && 
               systolic > diastolic;
    }

    validateHeartRate(hr) {
        const rate = parseInt(hr);
        return !isNaN(rate) && rate >= 30 && rate <= 220;
    }

    validateTemperature(temp) {
        const temperature = parseFloat(temp);
        return !isNaN(temperature) && temperature >= 35 && temperature <= 42;
    }

    // Форматирование данных
    formatDate(date, format = 'ru') {
        if (!date) return '';
        
        const d = new Date(date);
        
        if (format === 'ru') {
            return d.toLocaleDateString('ru-RU');
        } else if (format === 'iso') {
            return d.toISOString().split('T')[0];
        }
        
        return d.toLocaleDateString();
    }

    formatDateTime(date) {
        if (!date) return '';
        
        const d = new Date(date);
        return d.toLocaleDateString('ru-RU') + ' ' + d.toLocaleTimeString('ru-RU');
    }

    formatPhone(phone) {
        if (!phone) return '';
        
        // Удаляем все нецифровые символы
        const digits = phone.replace(/\D/g, '');
        
        // Форматируем как российский номер
        if (digits.length === 11 && digits.startsWith('7')) {
            return `+7 (${digits.substring(1, 4)}) ${digits.substring(4, 7)}-${digits.substring(7, 9)}-${digits.substring(9)}`;
        } else if (digits.length === 10) {
            return `+7 (${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6, 8)}-${digits.substring(8)}`;
        }
        
        return phone;
    }

    // Работа с файлами
    async readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    downloadFile(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Копирование в буфер обмена
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showSuccessMessage('Скопировано в буфер обмена');
            return true;
        } catch (error) {
            console.error('Ошибка копирования:', error);
            this.showErrorMessage('Ошибка копирования в буфер обмена');
            return false;
        }
    }

    // Дебаунс функций
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Троттлинг функций
    throttle(func, delay) {
        let lastCall = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return func.apply(this, args);
            }
        };
    }

    // Генерация уникальных ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generatePatientCardNumber() {
        const date = new Date();
        const year = date.getFullYear().toString().substr(2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        
        return `К${year}${month}${random}`;
    }

    // Работа с DOM
    createElement(tag, className = '', innerHTML = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    }

    removeAllChildren(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    // Анимации
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const start = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    fadeOut(element, duration = 300) {
        const start = performance.now();
        const startOpacity = parseFloat(element.style.opacity) || 1;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = startOpacity * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Безопасность и санитизация
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Проверка поддержки браузера
    checkBrowserSupport() {
        const features = {
            localStorage: typeof Storage !== 'undefined',
            flexbox: CSS.supports('display', 'flex'),
            grid: CSS.supports('display', 'grid'),
            customProperties: CSS.supports('color', 'var(--test)'),
            fetch: typeof fetch !== 'undefined',
            promises: typeof Promise !== 'undefined'
        };
        
        const unsupported = Object.entries(features)
            .filter(([_, supported]) => !supported)
            .map(([feature, _]) => feature);
        
        if (unsupported.length > 0) {
            this.showWarningMessage(
                `Ваш браузер не поддерживает: ${unsupported.join(', ')}. Рекомендуется обновить браузер.`
            );
        }
        
        return features;
    }

    // Логирование
    log(message, type = 'info', data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            type,
            message,
            data
        };
        
        console[type](logEntry);
        
        // Сохранение в localStorage для отладки
        const logs = this.loadFromStorage('cardio_logs', []);
        logs.push(logEntry);
        
        // Ограничиваем количество логов
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        
        this.saveToStorage('cardio_logs', logs);
    }

    // Очистка кешей
    clearCache() {
        const keysToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('cardio_')) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        this.showSuccessMessage('Кеш очищен');
    }
}

// Создаем глобальный экземпляр
const utils = new Utils();

// Экспорт для использования в других модулях
window.utils = utils;