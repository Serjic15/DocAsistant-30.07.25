/**
 * CardioAssistant Pro - MKB-10 (ICD-10) Module
 * Модуль МКБ-10 классификатора (ИСПРАВЛЕННЫЙ)
 */

class MKB10Manager {
    constructor() {
        this.icdData = [];
        this.filteredData = [];
        this.currentDiagnosisField = null;
        this.isInitialized = false;
        this.searchTimeout = null;
    }

    init() {
        console.log('🔄 Инициализация МКБ-10 классификатора...');
        this.loadICD10Data();
        this.setupEventListeners();
        console.log('✅ МКБ-10 классификатор инициализирован');
        this.isInitialized = true;
    }

    loadICD10Data() {
        // Проверяем, загружены ли данные из файла mkb10-data.js
        if (typeof window.ICD10_DATA !== 'undefined' && Array.isArray(window.ICD10_DATA) && window.ICD10_DATA.length > 0) {
            this.icdData = window.ICD10_DATA;
            console.log(`✅ МКБ-10 данные загружены: ${this.icdData.length} диагнозов`);
        } else {
            console.warn('⚠️ Файл mkb10-data.js не найден или поврежден, используются базовые данные');
            this.loadFallbackData();
        }
        
        this.filteredData = [...this.icdData];
        this.displayICD10Items(this.filteredData);
    }

    loadFallbackData() {
        // Базовый набор кардиологических диагнозов
        this.icdData = [
            // Артериальная гипертензия
            { code: "I10", name: "Эссенциальная (первичная) гипертензия" },
            { code: "I11", name: "Гипертензивная болезнь сердца [гипертоническая болезнь сердца с преимущественным поражением сердца]" },
            { code: "I11.0", name: "Гипертензивная болезнь сердца с (застойной) сердечной недостаточностью" },
            { code: "I11.9", name: "Гипертензивная болезнь сердца без (застойной) сердечной недостаточности" },
            { code: "I12", name: "Гипертензивная [гипертоническая] болезнь с преимущественным поражением почек" },
            { code: "I13", name: "Гипертензивная [гипертоническая] болезнь с преимущественным поражением сердца и почек" },
            
            // ИБС и стенокардия
            { code: "I20", name: "Стенокардия [грудная жаба]" },
            { code: "I20.0", name: "Нестабильная стенокардия" },
            { code: "I20.1", name: "Стенокардия с документированным спазмом" },
            { code: "I20.8", name: "Другие формы стенокардии" },
            { code: "I20.9", name: "Стенокардия неуточненная" },
            
            // Инфаркт миокарда
            { code: "I21", name: "Острый инфаркт миокарда" },
            { code: "I21.0", name: "Острый трансмуральный инфаркт передней стенки миокарда" },
            { code: "I21.1", name: "Острый трансмуральный инфаркт нижней стенки миокарда" },
            { code: "I21.2", name: "Острый трансмуральный инфаркт миокарда других уточненных локализаций" },
            { code: "I21.3", name: "Острый трансмуральный инфаркт миокарда неуточненной локализации" },
            { code: "I21.4", name: "Острый субэндокардиальный инфаркт миокарда" },
            { code: "I21.9", name: "Острый инфаркт миокарда неуточненный" },
            { code: "I22", name: "Повторный инфаркт миокарда" },
            
            // Хроническая ИБС
            { code: "I25", name: "Хроническая ишемическая болезнь сердца" },
            { code: "I25.0", name: "Атеросклеротическая сердечно-сосудистая болезнь, описанная таким образом" },
            { code: "I25.1", name: "Атеросклеротическая болезнь сердца" },
            { code: "I25.2", name: "Перенесенный в прошлом инфаркт миокарда" },
            { code: "I25.5", name: "Ишемическая кардиомиопатия" },
            { code: "I25.9", name: "Хроническая ишемическая болезнь сердца неуточненная" },
            
            // Нарушения ритма
            { code: "I47", name: "Пароксизмальная тахикардия" },
            { code: "I47.1", name: "Наджелудочковая тахикардия" },
            { code: "I47.2", name: "Желудочковая тахикардия" },
            { code: "I48", name: "Фибрилляция и трепетание предсердий" },
            { code: "I48.0", name: "Фибрилляция предсердий" },
            { code: "I48.1", name: "Трепетание предсердий" },
            { code: "I49", name: "Другие нарушения сердечного ритма" },
            { code: "I49.0", name: "Фибрилляция и трепетание желудочков" },
            { code: "I49.3", name: "Преждевременная деполяризация желудочков" },
            { code: "I49.4", name: "Другая и неуточненная преждевременная деполяризация" },
            { code: "I49.5", name: "Синдром слабости синусового узла" },
            
            // Блокады
            { code: "I44", name: "Предсердно-желудочковая блокада и блокада левой ножки пучка [Гиса]" },
            { code: "I44.0", name: "Предсердно-желудочковая блокада первой степени" },
            { code: "I44.1", name: "Предсердно-желудочковая блокада второй степени" },
            { code: "I44.2", name: "Предсердно-желудочковая блокада полная" },
            { code: "I44.3", name: "Другая и неуточненная предсердно-желудочковая блокада" },
            { code: "I44.4", name: "Блокада передне-левой ветви" },
            { code: "I44.5", name: "Блокада задне-левой ветви" },
            { code: "I44.7", name: "Блокада левой ножки пучка неуточненная" },
            { code: "I45", name: "Другие нарушения проводимости" },
            { code: "I45.0", name: "Блокада правой ножки пучка" },
            
            // Сердечная недостаточность
            { code: "I50", name: "Сердечная недостаточность" },
            { code: "I50.0", name: "Застойная сердечная недостаточность" },
            { code: "I50.1", name: "Левожелудочковая недостаточность" },
            { code: "I50.9", name: "Сердечная недостаточность неуточненная" },
            
            // Кардиомиопатии
            { code: "I42", name: "Кардиомиопатия" },
            { code: "I42.0", name: "Дилатационная кардиомиопатия" },
            { code: "I42.1", name: "Обструктивная гипертрофическая кардиомиопатия" },
            { code: "I42.2", name: "Другая гипертрофическая кардиомиопатия" },
            { code: "I42.5", name: "Другая рестриктивная кардиомиопатия" },
            { code: "I42.9", name: "Кардиомиопатия неуточненная" },
            
            // Болезни клапанов
            { code: "I34", name: "Неревматические поражения митрального клапана" },
            { code: "I34.0", name: "Митральная недостаточность" },
            { code: "I34.1", name: "Пролапс митрального клапана" },
            { code: "I34.2", name: "Неревматический стеноз митрального клапана" },
            { code: "I35", name: "Неревматические поражения аортального клапана" },
            { code: "I35.0", name: "Аортальный стеноз" },
            { code: "I35.1", name: "Аортальная недостаточность" },
            { code: "I36", name: "Неревматические поражения трехстворчатого клапана" },
            { code: "I37", name: "Поражения клапана легочной артерии" },
            
            // Дислипидемии
            { code: "E78", name: "Нарушения обмена липопротеинов и другие липидемии" },
            { code: "E78.0", name: "Чистая гиперхолестеринемия" },
            { code: "E78.1", name: "Чистая гиперглицеридемия" },
            { code: "E78.2", name: "Смешанная гиперлипидемия" },
            { code: "E78.3", name: "Гиперхилимикронемия" },
            { code: "E78.4", name: "Другие гиперлипидемии" },
            { code: "E78.5", name: "Гиперлипидемия неуточненная" },
            
            // Сахарный диабет
            { code: "E10", name: "Сахарный диабет 1 типа" },
            { code: "E11", name: "Сахарный диабет 2 типа" },
            { code: "E11.7", name: "Сахарный диабет 2 типа с множественными осложнениями" },
            { code: "E11.9", name: "Сахарный диабет 2 типа без осложнений" },
            
            // Тромбоэмболии
            { code: "I26", name: "Легочная эмболия" },
            { code: "I26.0", name: "Легочная эмболия с упоминанием об остром легочном сердце" },
            { code: "I26.9", name: "Легочная эмболия без упоминания об остром легочном сердце" },
            { code: "I74", name: "Эмболия и тромбоз артерий" },
            
            // Другие важные состояния
            { code: "R06.0", name: "Одышка" },
            { code: "R50", name: "Лихорадка неуточненная" },
            { code: "R06.2", name: "Свистящее дыхание" },
            { code: "Z95.1", name: "Наличие аортокоронарного шунта" },
            { code: "Z95.5", name: "Наличие имплантата и трансплантата сердечного клапана" }
        ];
        
        utils.showNotification('МКБ-10: используются базовые данные. Для полной версии добавьте файл mkb10-data.js', 'warning');
    }

    setupEventListeners() {
        // Обработчик поиска с дебаунсом
        const searchInput = document.getElementById('icdSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.search(e.target.value);
                }, 300); // Задержка 300мс для оптимизации
            });
        }

        // Обработчик клавиш
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isClassifierVisible()) {
                this.closeClassifier();
            }
        });

        // Закрытие при клике вне классификатора
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.icd-classifier') && 
                !e.target.closest('textarea[ondblclick*="showClassifier"]') && 
                this.isClassifierVisible()) {
                this.closeClassifier();
            }
        });
    }

    showClassifier(field) {
        if (!this.isInitialized) {
            this.init();
        }

        this.currentDiagnosisField = field;
        const classifier = document.getElementById('icdClassifier');
        
        if (!classifier) {
            console.error('Элемент icdClassifier не найден');
            return;
        }

        classifier.classList.add('active');
        
        // Очищаем поиск и показываем все данные
        const searchInput = document.getElementById('icdSearch');
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
        
        this.displayICD10Items(this.icdData);
        
        utils.log('МКБ-10 классификатор открыт', 'info');
    }

    closeClassifier() {
        const classifier = document.getElementById('icdClassifier');
        if (classifier) {
            classifier.classList.remove('active');
        }
        
        this.currentDiagnosisField = null;
        utils.log('МКБ-10 классификатор закрыт', 'info');
    }

    isClassifierVisible() {
        const classifier = document.getElementById('icdClassifier');
        return classifier && classifier.classList.contains('active');
    }

    search(searchTerm = '') {
        if (!searchTerm || searchTerm.trim() === '') {
            this.filteredData = [...this.icdData];
        } else {
            const term = searchTerm.toLowerCase().trim();
            this.filteredData = this.icdData.filter(item => 
                item.code.toLowerCase().includes(term) || 
                item.name.toLowerCase().includes(term)
            );
        }
        
        this.displayICD10Items(this.filteredData);
    }

    displayICD10Items(items) {
        const icdList = document.getElementById('icdList');
        if (!icdList) {
            console.error('Элемент icdList не найден');
            return;
        }
        
        if (items.length === 0) {
            icdList.innerHTML = `
                <div class="text-center text-muted p-4">
                    <i class="fas fa-search fa-2x mb-2"></i>
                    <div>Ничего не найдено</div>
                    <small>Попробуйте изменить поисковый запрос</small>
                </div>
            `;
            return;
        }
        
        // Ограничиваем количество отображаемых элементов для производительности
        const displayItems = items.slice(0, 100);
        
        icdList.innerHTML = displayItems.map(item => `
            <div class="icd-item" onclick="mkb10Manager.selectICD10('${this.escapeHtml(item.code)}', '${this.escapeHtml(item.name)}')">
                <div class="icd-code">${this.highlightSearchTerm(item.code)}</div>
                <div class="icd-description">${this.highlightSearchTerm(item.name)}</div>
            </div>
        `).join('');
        
        if (items.length > 100) {
            icdList.innerHTML += `
                <div class="text-center text-muted p-3">
                    <small>Показано первые 100 результатов из ${items.length}. Уточните поиск для лучших результатов.</small>
                </div>
            `;
        }
    }

    highlightSearchTerm(text) {
        const searchInput = document.getElementById('icdSearch');
        if (!searchInput || !searchInput.value) return this.escapeHtml(text);
        
        const searchTerm = this.escapeHtml(searchInput.value.trim());
        if (!searchTerm) return this.escapeHtml(text);
        
        const escapedText = this.escapeHtml(text);
        const regex = new RegExp(`(${this.escapeRegExp(searchTerm)})`, 'gi');
        
        return escapedText.replace(regex, '<mark>$1</mark>');
    }

    selectICD10(code, name) {
        if (!this.currentDiagnosisField) {
            utils.showErrorMessage('Ошибка: не выбрано поле для диагноза');
            return;
        }

        try {
            const currentText = this.currentDiagnosisField.value || '';
            const newText = `${code} ${name}`;
            
            // Вставляем диагноз в поле
            if (currentText.trim()) {
                // Если в поле уже есть текст, добавляем новый диагноз с новой строки
                this.currentDiagnosisField.value = currentText + '\n' + newText;
            } else {
                // Если поле пустое, просто вставляем диагноз
                this.currentDiagnosisField.value = newText;
            }
            
            // Устанавливаем фокус на поле и перемещаем курсор в конец
            this.currentDiagnosisField.focus();
            this.currentDiagnosisField.setSelectionRange(
                this.currentDiagnosisField.value.length, 
                this.currentDiagnosisField.value.length
            );
            
            // Закрываем классификатор
            this.closeClassifier();
            
            utils.showSuccessMessage(`Диагноз добавлен: ${code} ${name}`);
            utils.log('Диагноз выбран из МКБ-10', 'info', { code, name });
            
        } catch (error) {
            console.error('Ошибка при выборе диагноза:', error);
            utils.showErrorMessage('Ошибка при добавлении диагноза');
        }
    }

    // Поиск диагнозов по коду или названию
    findDiagnoses(query) {
        if (!query || query.trim() === '') {
            return [];
        }
        
        const searchTerm = query.toLowerCase().trim();
        return this.icdData
            .filter(item => 
                item.code.toLowerCase().includes(searchTerm) || 
                item.name.toLowerCase().includes(searchTerm)
            )
            .slice(0, 50); // Ограничиваем результат
    }

    // Получение диагноза по коду
    getDiagnosisByCode(code) {
        return this.icdData.find(item => item.code === code) || null;
    }

    // Получение всех диагнозов определенной группы
    getDiagnosesByGroup(groupCode) {
        return this.icdData.filter(item => item.code.startsWith(groupCode));
    }

    // Предложения диагнозов для автодополнения
    getSuggestions(query, limit = 10) {
        if (!query || query.length < 2) {
            return [];
        }
        
        const searchTerm = query.toLowerCase();
        const suggestions = this.icdData
            .filter(item => 
                item.name.toLowerCase().includes(searchTerm) ||
                item.code.toLowerCase().includes(searchTerm)
            )
            .slice(0, limit)
            .map(item => ({
                code: item.code,
                name: item.name,
                display: `${item.code} - ${item.name}`
            }));
            
        return suggestions;
    }

    // Валидация кода МКБ-10
    validateCode(code) {
        if (!code) return false;
        
        // Базовая проверка формата МКБ-10 (например, A00, I21.0)
        const icdPattern = /^[A-Z]\d{2}(\.\d{1,2})?$/;
        return icdPattern.test(code.toUpperCase());
    }

    // Экспорт данных МКБ-10
    exportData(format = 'json') {
        try {
            switch (format.toLowerCase()) {
                case 'json':
                    const jsonData = {
                        exportDate: new Date().toISOString(),
                        version: '1.0',
                        totalCodes: this.icdData.length,
                        data: this.icdData
                    };
                    utils.downloadFile(
                        JSON.stringify(jsonData, null, 2),
                        `mkb10_export_${Date.now()}.json`,
                        'application/json'
                    );
                    break;
                    
                case 'csv':
                    const csvContent = [
                        'Код,Название',
                        ...this.icdData.map(item => `"${item.code}","${item.name.replace(/"/g, '""')}"`)
                    ].join('\n');
                    utils.downloadFile(
                        csvContent,
                        `mkb10_export_${Date.now()}.csv`,
                        'text/csv'
                    );
                    break;
                    
                default:
                    throw new Error(`Неподдерживаемый формат: ${format}`);
            }
            
            utils.showSuccessMessage('Данные МКБ-10 экспортированы');
            
        } catch (error) {
            console.error('Ошибка экспорта МКБ-10:', error);
            utils.showErrorMessage('Ошибка экспорта данных МКБ-10');
        }
    }

    // Загрузка дополнительных данных МКБ-10
    async loadExternalData(file) {
        try {
            const content = await utils.readFileAsText(file);
            let newData;
            
            if (file.name.endsWith('.json')) {
                const parsed = JSON.parse(content);
                newData = parsed.data || parsed;
            } else if (file.name.endsWith('.csv')) {
                const lines = content.trim().split('\n');
                const headers = lines[0].toLowerCase().split(',');
                
                newData = lines.slice(1).map(line => {
                    const values = line.split(',').map(v => v.replace(/^"|"$/g, ''));
                    return {
                        code: values[0] || '',
                        name: values[1] || ''
                    };
                });
            } else {
                throw new Error('Неподдерживаемый формат файла');
            }
            
            if (!Array.isArray(newData)) {
                throw new Error('Неверный формат данных');
            }
            
            // Валидируем и добавляем новые данные
            let addedCount = 0;
            newData.forEach(item => {
                if (item.code && item.name && this.validateCode(item.code)) {
                    // Проверяем, нет ли уже такого кода
                    if (!this.icdData.find(existing => existing.code === item.code)) {
                        this.icdData.push({
                            code: item.code.toUpperCase(),
                            name: item.name
                        });
                        addedCount++;
                    }
                }
            });
            
            // Сортируем данные по коду
            this.icdData.sort((a, b) => a.code.localeCompare(b.code));
            this.filteredData = [...this.icdData];
            
            // Обновляем отображение
            this.displayICD10Items(this.filteredData);
            
            utils.showSuccessMessage(`Загружено ${addedCount} новых диагнозов МКБ-10`);
            
        } catch (error) {
            console.error('Ошибка загрузки МКБ-10:', error);
            utils.showErrorMessage('Ошибка загрузки файла МКБ-10: ' + error.message);
        }
    }

    // Получение статистики
    getStatistics() {
        const stats = {
            total: this.icdData.length,
            byChapter: {},
            byBlock: {}
        };
        
        this.icdData.forEach(item => {
            const chapter = item.code.charAt(0);
            const block = item.code.substring(0, 3);
            
            stats.byChapter[chapter] = (stats.byChapter[chapter] || 0) + 1;
            stats.byBlock[block] = (stats.byBlock[block] || 0) + 1;
        });
        
        return stats;
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
            dataLength: this.icdData.length,
            filteredLength: this.filteredData.length,
            currentField: this.currentDiagnosisField?.id || null,
            isVisible: this.isClassifierVisible()
        };
    }
}

// Создаем глобальный экземпляр
const mkb10Manager = new MKB10Manager();

// Экспорт для использования в других модулях
window.mkb10Manager = mkb10Manager;