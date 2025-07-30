/**
 * CardioAssistant Pro - Autofill Module (ИСПРАВЛЕН - БАГ С ИСЧЕЗНОВЕНИЕМ)
 * Модуль автоподстановок - устранены проблемы с исчезновением
 */

class AutofillManager {
    constructor() {
        this.autofillData = {};
        this.currentField = null;
        this.currentAutofillData = [];
        this.hideTimeout = null;
        this.isInitialized = false;
        this.isMouseOverPanel = false;
        this.isPanelPinned = false;
        this.activeFieldType = null;
        this.focusedElement = null;
    }

    init() {
        console.log('🔄 Инициализация менеджера автоподстановок...');
        this.loadAutofillData();
        this.setupEventListeners();
        console.log('✅ Менеджер автоподстановок инициализирован');
        this.isInitialized = true;
    }

    loadAutofillData() {
        // Загружаем данные из глобальной переменной или используем встроенные
        if (typeof window.autofillData !== 'undefined') {
            this.autofillData = window.autofillData;
            console.log('✅ Данные автоподстановок загружены из autofill-data.js');
        } else {
            console.warn('⚠️ Файл autofill-data.js не найден, используются встроенные данные');
            this.loadBuiltinData();
        }
    }

    loadBuiltinData() {
        this.autofillData = {
            complaints: [
                "Боли в области сердца давящего характера, возникающие при физической нагрузке",
                "Боли в области сердца колющего характера в покое",
                "Одышка при физической нагрузке (подъем на 2-3 этаж)",
                "Одышка в покое",
                "Учащенное сердцебиение",
                "Перебои в работе сердца",
                "Головные боли",
                "Головокружение",
                "Отеки нижних конечностей",
                "Повышение артериального давления",
                "Снижение переносимости физических нагрузок",
                "Общая слабость, повышенная утомляемость"
            ],
            "anamnesis-disease": [
                "Заболевание развилось постепенно в течение последних",
                "Острое начало заболевания",
                "Считает себя больным с",
                "Впервые симптомы появились",
                "Ухудшение состояния отмечает в течение",
                "Связывает начало заболевания с физической нагрузкой",
                "Связывает начало заболевания со стрессом",
                "Обращался к врачу по поводу данного заболевания",
                "Госпитализировался по поводу",
                "Принимал лечение:",
                "Эффект от проводимого лечения положительный",
                "Последнее обострение отмечает"
            ],
            "exam-plan": [
                "ЭКГ покоя в 12 отведениях",
                "ЭХО-КГ (трансторакальная эхокардиография)",
                "Холтеровское мониторирование ЭКГ 24 часа",
                "СМАД (суточное мониторирование артериального давления)",
                "Нагрузочная проба (тредмил-тест/велоэргометрия)",
                "Рентгенография органов грудной клетки",
                "ОАК (общий анализ крови)",
                "Биохимический анализ крови (глюкоза, мочевина, креатинин)",
                "Липидный спектр (общий ХС, ЛНП, ЛВП, ТГ)",
                "Коагулограмма (ПТИ, МНО, АЧТВ, фибриноген)",
                "Гормоны щитовидной железы (ТТГ, Т3, Т4)",
                "Маркеры повреждения миокарда (тропонин I, КФК-МВ)",
                "ОАМ (общий анализ мочи)"
            ],
            medications: [
                "Аспирин 100 мг 1 раз в сутки утром после еды длительно",
                "Клопидогрел 75 мг 1 раз в сутки утром",
                "Аторвастатин 20 мг 1 раз в сутки вечером",
                "Розувастатин 10 мг 1 раз в сутки вечером",
                "Бисопролол 2,5 мг 1 раз в сутки утром",
                "Метопролол 50 мг 2 раза в сутки",
                "Эналаприл 10 мг 2 раза в сутки",
                "Лизиноприл 10 мг 1 раз в сутки утром",
                "Амлодипин 5 мг 1 раз в сутки утром",
                "Индапамид 2,5 мг 1 раз в сутки утром"
            ],
            regime: [
                "Режим активности расширенный",
                "Дозированные физические нагрузки",
                "Ограничение тяжелых физических нагрузок",
                "Ходьба в медленном темпе 30-40 минут ежедневно",
                "Контроль АД ежедневно утром и вечером",
                "Контроль ЧСС ежедневно",
                "Достаточный сон не менее 8 часов",
                "Избегать стрессовых ситуаций",
                "Отказ от курения",
                "Регулярный прием назначенных препаратов"
            ],
            diet: [
                "Диета с ограничением соли до 3-5 г/сут",
                "Средиземноморская диета",
                "Ограничение животных жиров",
                "Увеличение потребления овощей и фруктов",
                "Дробное питание 4-5 раз в день",
                "Ограничение жидкости до 1,5 л/сут при отеках",
                "Ограничение холестерина в пище",
                "Включение в рацион рыбы жирных сортов 2-3 раза в неделю",
                "Ограничение кофеина",
                "Контроль калорийности рациона"
            ]
        };
    }

    setupEventListeners() {
        const panel = document.getElementById('autofillPanel');
        if (panel) {
            // ИСПРАВЛЕНО: Более стабильные обработчики мыши
            panel.addEventListener('mouseenter', (e) => {
                e.stopPropagation();
                this.isMouseOverPanel = true;
                this.cancelHideTimeout();
                console.log('🐭 Мышь над панелью автоподстановок');
            });

            panel.addEventListener('mouseleave', (e) => {
                e.stopPropagation();
                this.isMouseOverPanel = false;
                
                // НЕ закрываем панель автоматически при уходе мыши
                // Только если панель не закреплена И нет фокуса на поле
                if (!this.isPanelPinned && !this.focusedElement) {
                    this.hidePanelDelayed(2000); // Увеличена задержка
                }
                console.log('🐭 Мышь покинула панель автоподстановок');
            });

            // Предотвращаем всплытие событий внутри панели
            panel.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            // Добавляем кнопку закрепления панели
            this.addPinButton();
        }

        // ИСПРАВЛЕНО: Обработчик клавиш
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isPanelVisible()) {
                this.closePanel();
            }
            // Закрепление/открепление панели по Ctrl+Space
            if (e.ctrlKey && e.code === 'Space' && this.isPanelVisible()) {
                e.preventDefault();
                this.togglePinPanel();
            }
        });

        // ИСПРАВЛЕНО: Убираем агрессивное закрытие при клике
        document.addEventListener('click', (e) => {
            // Проверяем, что клик НЕ по полю с автоподстановкой и НЕ по панели
            const isAutofillField = e.target.matches('textarea[onfocus*="showPanel"], input[onfocus*="showPanel"]') ||
                                   e.target.closest('textarea[onfocus*="showPanel"], input[onfocus*="showPanel"]');
            
            const isAutofillPanel = e.target.closest('.autofill-panel');
            
            if (!isAutofillField && !isAutofillPanel && this.isPanelVisible() && !this.isPanelPinned) {
                // Задержка перед закрытием, чтобы дать время на клик по элементу
                setTimeout(() => {
                    if (!this.isMouseOverPanel && !this.focusedElement) {
                        this.closePanel();
                    }
                }, 200);
            }
        });
    }

    addPinButton() {
        const header = document.querySelector('.autofill-header');
        if (header && !header.querySelector('.autofill-pin')) {
            const pinButton = document.createElement('span');
            pinButton.className = 'autofill-pin';
            pinButton.innerHTML = '📌';
            pinButton.title = 'Закрепить панель (Ctrl+Space)';
            pinButton.style.cursor = 'pointer';
            pinButton.style.marginRight = '10px';
            pinButton.onclick = (e) => {
                e.stopPropagation();
                this.togglePinPanel();
            };
            
            const closeButton = header.querySelector('.autofill-close');
            header.insertBefore(pinButton, closeButton);
        }
    }

    togglePinPanel() {
        this.isPanelPinned = !this.isPanelPinned;
        const pinButton = document.querySelector('.autofill-pin');
        
        if (pinButton) {
            pinButton.innerHTML = this.isPanelPinned ? '📍' : '📌';
            pinButton.title = this.isPanelPinned ? 
                'Открепить панель (Ctrl+Space)' : 'Закрепить панель (Ctrl+Space)';
        }
        
        const panel = document.getElementById('autofillPanel');
        if (panel) {
            panel.classList.toggle('pinned', this.isPanelPinned);
        }
        
        console.log(`📌 Панель ${this.isPanelPinned ? 'закреплена' : 'откреплена'}`);
        utils.showNotification(
            `Панель автоподстановок ${this.isPanelPinned ? 'закреплена' : 'откреплена'}`, 
            'info'
        );
    }

    // ИСПРАВЛЕН ОСНОВНОЙ МЕТОД ПОКАЗА ПАНЕЛИ
    showPanel(fieldType) {
        if (!this.isInitialized) {
            this.init();
        }

        // Отменяем любые таймеры скрытия
        this.cancelHideTimeout();

        const panel = document.getElementById('autofillPanel');
        const title = document.getElementById('autofillTitle');
        const searchInput = document.getElementById('autofillSearch');
        
        if (!panel || !title || !searchInput) {
            console.error('❌ Элементы автоподстановки не найдены');
            return;
        }

        // Запоминаем активное поле
        this.currentField = fieldType;
        this.activeFieldType = fieldType;
        this.focusedElement = document.activeElement;
        
        const data = this.autofillData[fieldType] || [];
        this.currentAutofillData = [...data];
        
        title.textContent = `Автоподстановка - ${this.getFieldTitle(fieldType)}`;
        
        // Очищаем поиск
        searchInput.value = '';
        
        this.displayAutofillItems(this.currentAutofillData);
        
        // ИСПРАВЛЕНО: Стабильное отображение панели
        panel.classList.add('active');
        
        // Устанавливаем фокус на поиск с задержкой
        setTimeout(() => {
            if (searchInput && this.isPanelVisible()) {
                searchInput.focus();
            }
        }, 150);
        
        console.log(`✅ Панель автоподстановок открыта для поля: ${fieldType}`);
        utils.log('Панель автоподстановок открыта', 'info', { 
            fieldType, 
            itemsCount: data.length 
        });
    }

    // ИСПРАВЛЕНО: Метод скрытия с задержкой
    hidePanelDelayed(delay = 1000) {
        // НЕ скрываем панель если:
        // 1. Панель закреплена
        // 2. Мышь над панелью  
        // 3. Есть фокус на поле с автоподстановкой
        if (this.isPanelPinned || this.isMouseOverPanel) {
            return;
        }
        
        // Проверяем, что активный элемент НЕ поле с автоподстановкой
        const activeElement = document.activeElement;
        const isAutofillField = activeElement && (
            activeElement.getAttribute('onfocus') && activeElement.getAttribute('onfocus').includes('showPanel')
        );
        
        if (isAutofillField) {
            return; // НЕ закрываем если фокус на поле автоподстановки
        }
        
        this.cancelHideTimeout();
        
        this.hideTimeout = setTimeout(() => {
            // Дополнительная проверка перед закрытием
            if (!this.isMouseOverPanel && !this.isPanelPinned) {
                const currentActiveElement = document.activeElement;
                const isStillFocused = currentActiveElement && (
                    currentActiveElement.getAttribute('onfocus') && 
                    currentActiveElement.getAttribute('onfocus').includes('showPanel')
                );
                
                if (!isStillFocused) {
                    this.closePanel();
                }
            }
        }, delay);
        
        console.log(`⏰ Планирование скрытия панели через ${delay}мс`);
    }

    cancelHideTimeout() {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
            console.log('⏰ Отменен таймер скрытия панели');
        }
    }

    closePanel() {
        const panel = document.getElementById('autofillPanel');
        if (panel) {
            panel.classList.remove('active');
        }
        
        this.cancelHideTimeout();
        this.currentField = null;
        this.activeFieldType = null;
        this.currentAutofillData = [];
        this.isMouseOverPanel = false;
        this.focusedElement = null;
        
        // НЕ сбрасываем закрепление при закрытии
        
        console.log('✅ Панель автоподстановок закрыта');
        utils.log('Панель автоподстановок закрыта', 'info');
    }

    isPanelVisible() {
        const panel = document.getElementById('autofillPanel');
        return panel && panel.classList.contains('active');
    }

    filterItems() {
        const searchInput = document.getElementById('autofillSearch');
        if (!searchInput) return;

        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm.length === 0) {
            this.displayAutofillItems(this.currentAutofillData);
            return;
        }
        
        const filtered = this.currentAutofillData.filter(item => 
            item.toLowerCase().includes(searchTerm)
        );
        
        this.displayAutofillItems(filtered);
        console.log(`🔍 Поиск "${searchTerm}": найдено ${filtered.length} элементов`);
    }
    
    displayAutofillItems(items) {
        const container = document.getElementById('autofillItems');
        if (!container) return;
        
        if (items.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted p-3">
                    <i class="fas fa-search fa-2x mb-2"></i>
                    <div>Ничего не найдено</div>
                    <small>Попробуйте изменить поисковый запрос</small>
                </div>
            `;
            return;
        }
        
        container.innerHTML = items.map((item, index) => 
            `<div class="autofill-item" 
                  data-index="${index}" 
                  onclick="autofillManager.insertAutofill(this.getAttribute('data-text'))"
                  data-text="${this.escapeHtml(item)}">
                ${this.highlightSearchTerm(item)}
             </div>`
        ).join('');
        
        console.log(`📝 Отображено ${items.length} элементов автоподстановки`);
    }

    highlightSearchTerm(text) {
        const searchInput = document.getElementById('autofillSearch');
        if (!searchInput || !searchInput.value) return this.escapeHtml(text);
        
        const searchTerm = this.escapeHtml(searchInput.value.trim());
        if (!searchTerm) return this.escapeHtml(text);
        
        const escapedText = this.escapeHtml(text);
        const regex = new RegExp(`(${this.escapeRegExp(searchTerm)})`, 'gi');
        
        return escapedText.replace(regex, '<mark>$1</mark>');
    }

    // ИСПРАВЛЕНО: Метод вставки автоподстановки
    insertAutofill(text) {
        if (!this.currentField) {
            utils.showErrorMessage('Ошибка: не выбрано поле для автоподстановки');
            return;
        }

        try {
            // Находим активное поле более надежно
            let field = null;
            
            // Сначала пробуем найти через сохраненный элемент
            if (this.focusedElement && this.focusedElement.getAttribute('onfocus') && 
                this.focusedElement.getAttribute('onfocus').includes('showPanel')) {
                field = this.focusedElement;
            }
            
            // Если не найдено, ищем по ID
            if (!field) {
                const fieldMap = {
                    'complaints': 'complaints',
                    'anamnesis-disease': 'anamnesisDisease',
                    'exam-plan': 'examPlan',
                    'medications': 'medications',
                    'regime': 'regime',
                    'diet': 'diet'
                };
                
                const fieldId = fieldMap[this.currentField];
                field = document.getElementById(fieldId);
            }
            
            if (!field) {
                console.error(`❌ Поле для автоподстановки не найдено`);
                utils.showErrorMessage('Ошибка: поле не найдено');
                return;
            }

            const currentText = field.value || '';
            let newText;
            
            // Умная вставка текста
            if (currentText.trim()) {
                if (!currentText.endsWith('\n') && !currentText.endsWith('. ')) {
                    newText = currentText + '\n' + text;
                } else {
                    newText = currentText + text;
                }
            } else {
                newText = text;
            }
            
            field.value = newText;
            
            // Устанавливаем фокус и курсор в конец
            field.focus();
            field.setSelectionRange(field.value.length, field.value.length);
            
            // Обновляем сохраненный элемент
            this.focusedElement = field;
            
            // Закрываем панель только если она не закреплена
            if (!this.isPanelPinned) {
                this.closePanel();
            }
            
            utils.showSuccessMessage('Текст добавлен');
            utils.log('Автоподстановка вставлена', 'info', { 
                field: field.id, 
                textLength: text.length 
            });
            
        } catch (error) {
            console.error('❌ Ошибка при вставке автоподстановки:', error);
            utils.showErrorMessage('Ошибка при вставке текста');
        }
    }

    getFieldTitle(fieldType) {
        const titles = {
            'complaints': 'Жалобы',
            'anamnesis-disease': 'Анамнез заболевания',
            'exam-plan': 'План обследования',
            'medications': 'Медикаментозная терапия',
            'regime': 'Режим',
            'diet': 'Диета'
        };
        return titles[fieldType] || 'Автоподстановка';
    }

    // НОВЫЕ МЕТОДЫ для улучшенной работы

    // Обработчик фокуса поля (вызывается из HTML)
    onFieldFocus(fieldType, element) {
        this.focusedElement = element;
        this.showPanel(fieldType);
    }

    // Обработчик потери фокуса поля (вызывается из HTML)
    onFieldBlur(element) {
        // Задержка перед потенциальным закрытием
        setTimeout(() => {
            if (this.focusedElement === element) {
                this.focusedElement = null;
            }
            // Закрываем только если не закреплена и мышь не над панелью
            if (!this.isPanelPinned && !this.isMouseOverPanel) {
                this.hidePanelDelayed(1500);
            }
        }, 100);
    }

    // Утилиты для безопасности
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Метод для отладки
    debugInfo() {
        return {
            isInitialized: this.isInitialized,
            currentField: this.currentField,
            activeFieldType: this.activeFieldType,
            isVisible: this.isPanelVisible(),
            isMouseOver: this.isMouseOverPanel,
            isPinned: this.isPanelPinned,
            hasTimeout: !!this.hideTimeout,
            focusedElement: this.focusedElement?.id || null,
            dataKeys: Object.keys(this.autofillData),
            currentDataLength: this.currentAutofillData.length
        };
    }
}

// Создаем глобальный экземпляр
const autofillManager = new AutofillManager();

// Экспорт для использования в других модулях
window.autofillManager = autofillManager;