/**
 * CardioAssistant Pro - Обновлённый модуль калькуляторов
 * НОВОЕ ПОВЕДЕНИЕ: боковая панель раскрывается на всю высоту, сдвигает основной контент
 * Порядок калькуляторов согласно ТЗ + добавлен H2FPEF
 * ИСПРАВЛЕНО: Поисковая строка больше не теряет фокус при вводе
 */

class CalculatorManager {
    constructor() {
        this.calculatorResults = {};
        this.isInitialized = false;
        this.simpleCalcMemory = '0';
        this.simpleCalcDisplay = '';
        this.selectedEHRA = null;
        this.searchQuery = '';
        this.filteredCalculators = [];
        this.isPanelOpen = false; // Новое свойство для отслеживания состояния панели
        
        // Определяем калькуляторы в ТОЧНОМ порядке согласно ТЗ
        this.calculatorConfigs = [
            {
                id: 'simple-calc',
                title: 'Калькулятор',
                category: 'basic',
                keywords: ['калькулятор', 'calculator', 'арифметика', 'вычисления'],
                priority: 1
            },
            {
                id: 'score2',
                title: 'SCORE2 и SCORE2-OP',
                category: 'risk',
                keywords: ['score2', 'score', 'риск', 'ссз', 'статины', 'cardiovascular'],
                priority: 2
            },
            {
                id: 'cha2ds2-vasc',
                title: 'CHA₂DS₂-VASc',
                category: 'anticoagulation',
                keywords: ['cha2ds2', 'vasc', 'инсульт', 'фибрилляция', 'антикоагулянты', 'stroke'],
                priority: 3
            },
            {
                id: 'has-bled',
                title: 'HAS-BLED',
                category: 'anticoagulation',
                keywords: ['hasbled', 'кровотечение', 'антикоагулянты', 'bleeding'],
                priority: 4
            },
            {
                id: 'ckd-epi',
                title: 'CKD-EPI 2021',
                category: 'renal',
                keywords: ['ckd', 'epi', 'скф', 'креатинин', 'почки', 'gfr'],
                priority: 5
            },
            {
                id: 'cockcroft-gault',
                title: 'Кокрофт-Голт',
                category: 'renal',
                keywords: ['кокрофт', 'голт', 'cockcroft', 'gault', 'клиренс', 'креатинин'],
                priority: 6
            },
            {
                id: 'h2fpef',
                title: 'H2FPEF',
                category: 'cardiology',
                keywords: ['h2fpef', 'сердечная', 'недостаточность', 'диастолическая', 'heart failure'],
                priority: 7
            }
        ];

        this.initializeFilteredCalculators();
    }

    init() {
        console.log('🔄 Инициализация обновлённого модуля калькуляторов...');
        this.setupEventListeners();
        this.autoFillPatientData();
        console.log('✅ Обновлённый модуль калькуляторов инициализирован');
        this.isInitialized = true;
    }

    initializeFilteredCalculators() {
        this.filteredCalculators = [...this.calculatorConfigs];
    }

    setupEventListeners() {
        // Закрытие панели при клике вне её
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('calculatorsPanel');
            const mainContainer = document.querySelector('.main-container');
            
            if (panel && this.isPanelOpen && 
                !e.target.closest('.calculators-panel') && 
                !e.target.closest('[onclick*="togglePanel"]')) {
                
                this.closePanel();
            }
        });

        // Обработка клавиш для простого калькулятора
        document.addEventListener('keydown', (e) => {
            if (this.isCalculatorActive()) {
                this.handleCalculatorKeys(e);
            }
            
            // ESC для закрытия панели
            if (e.key === 'Escape' && this.isPanelOpen) {
                this.closePanel();
            }
        });
    }

    isCalculatorActive() {
        const panel = document.getElementById('calculatorsPanel');
        return panel && this.isPanelOpen && 
               document.activeElement && document.activeElement.closest('.calculators-panel');
    }

    handleCalculatorKeys(e) {
        if (e.target.closest('.simple-calculator')) {
            const key = e.key;
            if ('0123456789+-*/.'.includes(key)) {
                e.preventDefault();
                this.calcInput(key === '*' ? '*' : key === '/' ? '/' : key);
            } else if (key === 'Enter' || key === '=') {
                e.preventDefault();
                this.calcEquals();
            } else if (key === 'Escape' || key.toLowerCase() === 'c') {
                e.preventDefault();
                this.calcClear();
            }
        }
    }

    // НОВАЯ ЛОГИКА: Переключение панели с сдвигом основного контента
    togglePanel() {
        if (this.isPanelOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }

    openPanel() {
        const panel = document.getElementById('calculatorsPanel');
        const mainContainer = document.querySelector('.main-container');
        
        if (!panel || !mainContainer) return;

        this.isPanelOpen = true;
        
        // Добавляем класс для анимации
        panel.classList.add('expanded');
        mainContainer.classList.add('calculators-open');
        
        // Загружаем содержимое если ещё не загружено
        if (!this.isInitialized) {
            this.loadCalculators();
        }
        
        // Фокус на поисковую строку
        setTimeout(() => {
            const searchInput = document.getElementById('calculatorSearch');
            if (searchInput) searchInput.focus();
        }, 300);
        
        utils.log('Панель калькуляторов открыта', 'info');
        console.log('📊 Панель калькуляторов раскрыта, контент сдвинут');
    }

    closePanel() {
        const panel = document.getElementById('calculatorsPanel');
        const mainContainer = document.querySelector('.main-container');
        
        if (!panel || !mainContainer) return;

        this.isPanelOpen = false;
        
        // Убираем классы для анимации
        panel.classList.remove('expanded');
        mainContainer.classList.remove('calculators-open');
        
        utils.log('Панель калькуляторов закрыта', 'info');
        console.log('📊 Панель калькуляторов свёрнута, контент возвращён');
    }

    // Автоматическое заполнение данных пациента
    autoFillPatientData() {
        if (!app.currentPatient) {
            console.log('ℹ️ Данные пациента не загружены');
            return;
        }

        const patient = app.currentPatient;
        console.log('📋 Автозаполнение данных пациента:', patient);

        // Заполняем возраст везде где нужно
        if (patient.age) {
            const ageFields = ['score-age', 'ckd-age', 'cockcroft-age', 'h2fpef-age'];
            ageFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) field.value = patient.age;
            });
        }

        // Заполняем пол
        if (patient.gender) {
            const genderFields = ['score-gender', 'ckd-gender', 'cockcroft-gender', 'h2fpef-gender'];
            genderFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.value = patient.gender === 'М' || patient.gender === 'male' ? 'male' : 'female';
                }
            });
        }

        // Заполняем вес
        if (patient.weight) {
            const weightFields = ['cockcroft-weight', 'h2fpef-bmi'];
            weightFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) field.value = patient.weight;
            });
        }

        // Автоматически пересчитываем основные калькуляторы
        setTimeout(() => {
            this.calculateSCORE2();
            this.calculateCKDEPI();
            this.calculateCockcroftGault();
            this.calculateH2FPEF();
        }, 100);
    }

    // ИСПРАВЛЕНО: Поисковая функция теперь не перерисовывает поисковую строку
    performSearch(query) {
        this.searchQuery = query.toLowerCase().trim();
        
        if (!this.searchQuery) {
            this.filteredCalculators = [...this.calculatorConfigs];
        } else {
            this.filteredCalculators = this.calculatorConfigs.filter(calc => {
                const searchableText = [
                    calc.title.toLowerCase(),
                    calc.category.toLowerCase(),
                    ...calc.keywords
                ].join(' ');
                
                return this.searchQuery.split(' ').every(term => 
                    searchableText.includes(term) ||
                    searchableText.split(' ').some(word => word.startsWith(term))
                );
            });
        }
        
        this.updateCalculatorsList();
    }

    // НОВЫЙ МЕТОД: Обновляем только список калькуляторов, не трогая поисковую строку
    updateCalculatorsList() {
        const calculatorsListContainer = document.getElementById('calculatorsList');
        if (!calculatorsListContainer) return;

        // Сохраняем состояние развернутых калькуляторов
        const expandedCalculators = new Set();
        calculatorsListContainer.querySelectorAll('.calculator-container.expanded').forEach(container => {
            const id = container.id;
            if (id) expandedCalculators.add(id);
        });

        // Генерируем HTML только для списка калькуляторов
        let html = '';
        const sortedCalculators = [...this.filteredCalculators].sort((a, b) => {
            return a.priority - b.priority;
        });

        if (sortedCalculators.length === 0) {
            html = `
                <div class="no-results">
                    <p>Калькуляторы не найдены</p>
                    <small>Попробуйте изменить поисковый запрос</small>
                </div>
            `;
        } else {
            sortedCalculators.forEach(config => {
                html += this.generateCalculatorHTML(config);
            });
        }

        // Обновляем только список калькуляторов
        calculatorsListContainer.innerHTML = html;

        // Восстанавливаем состояние развернутых калькуляторов
        expandedCalculators.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.classList.add('expanded');
                const icon = container.querySelector('.collapse-icon');
                if (icon) icon.textContent = '▼';
            }
        });
    }

    // ОБНОВЛЕНО: Загружаем калькуляторы с разделением на поиск и список
    loadCalculators() {
        const content = document.getElementById('calculatorsContent');
        if (!content) return;

        content.innerHTML = `
            <div class="calculators-wrapper">
                <!-- Поисковая строка (остается неизменной при поиске) -->
                <div class="search-container">
                    <div class="search-input-wrapper">
                        <input 
                            type="text" 
                            id="calculatorSearch" 
                            class="search-input" 
                            placeholder="Поиск калькуляторов..." 
                            value="${this.searchQuery}"
                            oninput="calculatorManager.performSearch(this.value)"
                        >
                        <span class="search-icon">🔍</span>
                    </div>
                </div>
                
                <!-- Контейнер для списка калькуляторов (обновляется при поиске) -->
                <div id="calculatorsList">
                    <!-- Калькуляторы будут загружены сюда -->
                </div>
            </div>
            ${this.generateStyles()}
        `;

        // Загружаем список калькуляторов
        this.updateCalculatorsList();
        this.isInitialized = true;
    }

    generateCalculatorHTML(config) {
        switch (config.id) {
            case 'simple-calc':
                return this.generateSimpleCalculatorHTML();
            case 'score2':
                return this.generateSCORE2HTML();
            case 'cha2ds2-vasc':
                return this.generateCHA2DS2VAScHTML();
            case 'has-bled':
                return this.generateHASBLEDHTML();
            case 'ckd-epi':
                return this.generateCKDEPIHTML();
            case 'cockcroft-gault':
                return this.generateCockcroftGaultHTML();
            case 'h2fpef':
                return this.generateH2FPEFHTML();
            default:
                return '';
        }
    }

    // HTML генераторы для каждого калькулятора

    generateSimpleCalculatorHTML() {
        return `
            <div class="calculator-container" id="simple-calc">
                <div class="calculator-title" onclick="calculatorManager.toggleCalculator(this)">
                    <div class="calculator-icon hot-iron-calc">
                        <i class="fas fa-calculator"></i>
                    </div>
                    <span class="calculator-title-text">Калькулятор</span>
                    <span class="collapse-icon">▶</span>
                </div>
                <div class="calculator-content">
                    <div class="simple-calculator">
                        <div class="calc-display" id="calcDisplay" style="background: white; border: 1px solid #e2e8f0; padding: 10px; margin-bottom: 10px; text-align: right; font-family: monospace; min-height: 20px; border-radius: 4px;">0</div>
                        <div class="calc-buttons" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px;">
                            <button class="btn btn-sm btn-secondary" onclick="calculatorManager.calcClear()" title="Очистить">C</button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="calculatorManager.calcInput('(')" title="Открыть скобку">(</button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="calculatorManager.calcInput(')')" title="Закрыть скобку">)</button>
                            <button class="btn btn-sm btn-primary" onclick="calculatorManager.calcInput('/')" title="Деление">÷</button>
                            
                            <button class="btn btn-sm btn-outline-dark" onclick="calculatorManager.calcInput('7')">7</button>
                            <button class="btn btn-sm btn-outline-dark" onclick="calculatorManager.calcInput('8')">8</button>
                            <button class="btn btn-sm btn-outline-dark" onclick="calculatorManager.calcInput('9')">9</button>
                            <button class="btn btn-sm btn-primary" onclick="calculatorManager.calcInput('*')" title="Умножение">×</button>
                            
                            <button class="btn btn-sm btn-outline-dark" onclick="calculatorManager.calcInput('4')">4</button>
                            <button class="btn btn-sm btn-outline-dark" onclick="calculatorManager.calcInput('5')">5</button>
                            <button class="btn btn-sm btn-outline-dark" onclick="calculatorManager.calcInput('6')">6</button>
                            <button class="btn btn-sm btn-primary" onclick="calculatorManager.calcInput('-')" title="Вычитание">−</button>
                            
                            <button class="btn btn-sm btn-outline-dark" onclick="calculatorManager.calcInput('1')">1</button>
                            <button class="btn btn-sm btn-outline-dark" onclick="calculatorManager.calcInput('2')">2</button>
                            <button class="btn btn-sm btn-outline-dark" onclick="calculatorManager.calcInput('3')">3</button>
                            <button class="btn btn-sm btn-primary" onclick="calculatorManager.calcInput('+')" title="Сложение">+</button>
                            
                            <button class="btn btn-sm btn-outline-dark" onclick="calculatorManager.calcInput('0')" style="grid-column: span 2;">0</button>
                            <button class="btn btn-sm btn-outline-dark" onclick="calculatorManager.calcInput('.')">.</button>
                            <button class="btn btn-sm btn-success" onclick="calculatorManager.calcEquals()" title="Равно">=</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateSCORE2HTML() {
        return `
            <div class="calculator-container" id="score2">
                <div class="calculator-title" onclick="calculatorManager.toggleCalculator(this)">
                    <div class="calculator-icon hot-iron-score">
                        <i class="fas fa-chart-area"></i>
                    </div>
                    <span class="calculator-title-text">SCORE2 и SCORE2-OP</span>
                    <span class="collapse-icon">▶</span>
                </div>
                <div class="calculator-content">
                    <small class="text-muted d-block mb-3">Оценка 10-летнего риска сердечно-сосудистых заболеваний</small>
                    <div class="calc-row">
                        <label class="calc-label">Возраст:</label>
                        <input type="number" class="calc-input" id="score-age" min="18" max="100" onkeyup="calculatorManager.calculateSCORE2()" placeholder="40">
                        <span class="unit">лет</span>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">Пол:</label>
                        <select class="calc-select" id="score-gender" style="width: 120px;" onchange="calculatorManager.calculateSCORE2()">
                            <option value="">Выберите</option>
                            <option value="male">Мужской</option>
                            <option value="female">Женский</option>
                        </select>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">Систолическое АД:</label>
                        <input type="number" class="calc-input" id="score-sbp" min="80" max="220" onkeyup="calculatorManager.calculateSCORE2()" placeholder="120">
                        <span class="unit">мм рт.ст.</span>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">Курение:</label>
                        <select class="calc-select" id="score-smoking" style="width: 120px;" onchange="calculatorManager.calculateSCORE2()">
                            <option value="no">Нет</option>
                            <option value="yes">Да</option>
                        </select>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">Общий холестерин:</label>
                        <input type="number" class="calc-input" id="score-chol" step="0.1" min="3" max="12" onkeyup="calculatorManager.calculateSCORE2()" placeholder="5.0">
                        <span class="unit">ммоль/л</span>
                    </div>
                    <div class="calc-result" id="score2-result">
                        Заполните все поля для расчета
                    </div>
                    <button class="add-to-protocol-btn" id="score2-add-btn" onclick="calculatorManager.addToProtocol('score2')" disabled>
                        Добавить в протокол
                    </button>
                </div>
            </div>
        `;
    }

    generateCHA2DS2VAScHTML() {
        return `
            <div class="calculator-container" id="cha2ds2-vasc">
                <div class="calculator-title" onclick="calculatorManager.toggleCalculator(this)">
                    <div class="calculator-icon hot-iron-heart">
                        <i class="fas fa-heartbeat"></i>
                    </div>
                    <span class="calculator-title-text">CHA₂DS₂-VASc</span>
                    <span class="collapse-icon">▶</span>
                </div>
                <div class="calculator-content">
                    <small class="text-muted d-block mb-3">Оценка риска инсульта при фибрилляции предсердий</small>
                    <div class="calc-row">
                        <label class="calc-label">
                            <input type="checkbox" id="chads-chf" onchange="calculatorManager.calculateCHADS()">
                            Застойная СН (1 балл)
                        </label>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">
                            <input type="checkbox" id="chads-htn" onchange="calculatorManager.calculateCHADS()">
                            Гипертензия (1 балл)
                        </label>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">
                            <input type="checkbox" id="chads-age75" onchange="calculatorManager.calculateCHADS()">
                            Возраст ≥75 лет (2 балла)
                        </label>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">
                            <input type="checkbox" id="chads-dm" onchange="calculatorManager.calculateCHADS()">
                            Диабет (1 балл)
                        </label>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">
                            <input type="checkbox" id="chads-stroke" onchange="calculatorManager.calculateCHADS()">
                            Инсульт/ТИА/ТЭ (2 балла)
                        </label>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">
                            <input type="checkbox" id="chads-vasc" onchange="calculatorManager.calculateCHADS()">
                            Сосудистые заболевания (1 балл)
                        </label>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">
                            <input type="checkbox" id="chads-age65" onchange="calculatorManager.calculateCHADS()">
                            Возраст 65-74 года (1 балл)
                        </label>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">
                            <input type="checkbox" id="chads-female" onchange="calculatorManager.calculateCHADS()">
                            Женский пол (1 балл)
                        </label>
                    </div>
                    <div class="calc-result" id="chads-result">
                        Баллы: 0 | Риск инсульта: 0.0%/год
                    </div>
                    <button class="add-to-protocol-btn" id="chads-add-btn" onclick="calculatorManager.addToProtocol('chads')" disabled>
                        Добавить в протокол
                    </button>
                </div>
            </div>
        `;
    }

    generateHASBLEDHTML() {
        return `
            <div class="calculator-container" id="has-bled">
                <div class="calculator-title" onclick="calculatorManager.toggleCalculator(this)">
                    <div class="calculator-icon hot-iron-drop">
                        <i class="fas fa-tint"></i>
                    </div>
                    <span class="calculator-title-text">HAS-BLED</span>
                    <span class="collapse-icon">▶</span>
                </div>
                <div class="calculator-content">
                    <small class="text-muted d-block mb-3">Оценка риска кровотечения при антикоагулянтной терапии</small>
                    <div class="calc-row">
                        <label class="calc-label">
                            <input type="checkbox" id="hasbled-htn" onchange="calculatorManager.calculateHASBLED()">
                            Гипертензия (1 балл)
                        </label>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">
                            <input type="checkbox" id="hasbled-renal" onchange="calculatorManager.calculateHASBLED()">
                            Нарушение почек/печени (1 балл)
                        </label>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">
                            <input type="checkbox" id="hasbled-stroke" onchange="calculatorManager.calculateHASBLED()">
                            Инсульт (1 балл)
                        </label>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">
                            <input type="checkbox" id="hasbled-bleed" onchange="calculatorManager.calculateHASBLED()">
                            Кровотечение в анамнезе (1 балл)
                        </label>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">
                            <input type="checkbox" id="hasbled-inr" onchange="calculatorManager.calculateHASBLED()">
                            Лабильное МНО (1 балл)
                        </label>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">
                            <input type="checkbox" id="hasbled-age" onchange="calculatorManager.calculateHASBLED()">
                            Возраст >65 лет (1 балл)
                        </label>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">
                            <input type="checkbox" id="hasbled-drugs" onchange="calculatorManager.calculateHASBLED()">
                            Препараты/алкоголь (1 балл)
                        </label>
                    </div>
                    <div class="calc-result" id="hasbled-result">
                        Баллы: 0 | Низкий риск кровотечения
                    </div>
                    <button class="add-to-protocol-btn" id="hasbled-add-btn" onclick="calculatorManager.addToProtocol('hasbled')" disabled>
                        Добавить в протокол
                    </button>
                </div>
            </div>
        `;
    }

    generateCKDEPIHTML() {
        return `
            <div class="calculator-container" id="ckd-epi">
                <div class="calculator-title" onclick="calculatorManager.toggleCalculator(this)">
                    <div class="calculator-icon hot-iron-kidney">
                        <i class="fas fa-prescription-bottle"></i>
                    </div>
                    <span class="calculator-title-text">CKD-EPI 2021</span>
                    <span class="collapse-icon">▶</span>
                </div>
                <div class="calculator-content">
                    <small class="text-muted d-block mb-3">Расчет скорости клубочковой фильтрации</small>
                    <div class="calc-row">
                        <label class="calc-label">Креатинин:</label>
                        <input type="number" class="calc-input" id="ckd-creat" min="30" max="1000" onkeyup="calculatorManager.calculateCKDEPI()" placeholder="80">
                        <span class="unit">мкмоль/л</span>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">Возраст:</label>
                        <input type="number" class="calc-input" id="ckd-age" min="18" max="100" onkeyup="calculatorManager.calculateCKDEPI()" placeholder="50">
                        <span class="unit">лет</span>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">Пол:</label>
                        <select class="calc-select" id="ckd-gender" style="width: 120px;" onchange="calculatorManager.calculateCKDEPI()">
                            <option value="">Выберите</option>
                            <option value="male">Мужской</option>
                            <option value="female">Женский</option>
                        </select>
                    </div>
                    <div class="calc-result" id="ckd-result">
                        Заполните все поля для расчета
                    </div>
                    <button class="add-to-protocol-btn" id="ckd-add-btn" onclick="calculatorManager.addToProtocol('ckd')" disabled>
                        Добавить в протокол
                    </button>
                </div>
            </div>
        `;
    }

    generateCockcroftGaultHTML() {
        return `
            <div class="calculator-container" id="cockcroft-gault">
                <div class="calculator-title" onclick="calculatorManager.toggleCalculator(this)">
                    <div class="calculator-icon hot-iron-kidney2">
                        <i class="fas fa-vial"></i>
                    </div>
                    <span class="calculator-title-text">Кокрофт-Голт</span>
                    <span class="collapse-icon">▶</span>
                </div>
                <div class="calculator-content">
                    <small class="text-muted d-block mb-3">Расчет клиренса креатинина</small>
                    <div class="calc-row">
                        <label class="calc-label">Возраст:</label>
                        <input type="number" class="calc-input" id="cockcroft-age" min="18" max="100" onkeyup="calculatorManager.calculateCockcroftGault()" placeholder="50">
                        <span class="unit">лет</span>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">Вес:</label>
                        <input type="number" class="calc-input" id="cockcroft-weight" min="30" max="300" onkeyup="calculatorManager.calculateCockcroftGault()" placeholder="70">
                        <span class="unit">кг</span>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">Креатинин:</label>
                        <input type="number" class="calc-input" id="cockcroft-creat" min="30" max="1000" onkeyup="calculatorManager.calculateCockcroftGault()" placeholder="80">
                        <span class="unit">мкмоль/л</span>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">Пол:</label>
                        <select class="calc-select" id="cockcroft-gender" style="width: 120px;" onchange="calculatorManager.calculateCockcroftGault()">
                            <option value="">Выберите</option>
                            <option value="male">Мужской</option>
                            <option value="female">Женский</option>
                        </select>
                    </div>
                    <div class="calc-result" id="cockcroft-result">
                        Заполните все поля для расчета
                    </div>
                    <button class="add-to-protocol-btn" id="cockcroft-add-btn" onclick="calculatorManager.addToProtocol('cockcroft')" disabled>
                        Добавить в протокол
                    </button>
                </div>
            </div>
        `;
    }

    // НОВЫЙ КАЛЬКУЛЯТОР: H2FPEF
    generateH2FPEFHTML() {
        return `
            <div class="calculator-container" id="h2fpef">
                <div class="calculator-title" onclick="calculatorManager.toggleCalculator(this)">
                    <div class="calculator-icon hot-iron-heart-pulse">
                        <i class="fas fa-heart"></i>
                    </div>
                    <span class="calculator-title-text">H2FPEF</span>
                    <span class="collapse-icon">▶</span>
                </div>
                <div class="calculator-content">
                    <small class="text-muted d-block mb-3">Оценка вероятности диастолической сердечной недостаточности</small>
                    <div class="calc-row">
                        <label class="calc-label">
                            <input type="checkbox" id="h2fpef-heavy" onchange="calculatorManager.calculateH2FPEF()">
                            Тяжёлое ожирение (ИМТ ≥30) (2 балла)
                        </label>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">
                            <input type="checkbox" id="h2fpef-hypertension" onchange="calculatorManager.calculateH2FPEF()">
                            Гипертензия в анамнезе (1 балл)
                        </label>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">
                            <input type="checkbox" id="h2fpef-af" onchange="calculatorManager.calculateH2FPEF()">
                            Фибрилляция предсердий (3 балла)
                        </label>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">
                            <input type="checkbox" id="h2fpef-pulmonary" onchange="calculatorManager.calculateH2FPEF()">
                            Легочная гипертензия (1 балл)
                        </label>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">
                            <input type="checkbox" id="h2fpef-elderly" onchange="calculatorManager.calculateH2FPEF()">
                            Возраст старше 60 лет (1 балл)
                        </label>
                    </div>
                    <div class="calc-row">
                        <label class="calc-label">
                            <input type="checkbox" id="h2fpef-filling" onchange="calculatorManager.calculateH2FPEF()">
                            Повышенное давление наполнения (1 балл)
                        </label>
                    </div>
                    <div class="calc-result" id="h2fpef-result">
                        Баллы: 0 | Низкая вероятность HFpEF
                    </div>
                    <button class="add-to-protocol-btn" id="h2fpef-add-btn" onclick="calculatorManager.addToProtocol('h2fpef')" disabled>
                        Добавить в протокол
                    </button>
                </div>
            </div>
        `;
    }

    // Функции расчета

    calculateSCORE2() {
        const age = parseFloat(document.getElementById('score-age').value);
        const gender = document.getElementById('score-gender').value;
        const sbp = parseFloat(document.getElementById('score-sbp').value);
        const smoking = document.getElementById('score-smoking').value;
        const chol = parseFloat(document.getElementById('score-chol').value);
        const resultElement = document.getElementById('score2-result');
        const addButton = document.getElementById('score2-add-btn');
        
        if (!age || !gender || !sbp || !chol) {
            resultElement.textContent = 'Заполните все поля для расчета';
            addButton.disabled = true;
            return;
        }
        
        if (age < 18 || age > 100) {
            resultElement.textContent = 'Возраст должен быть от 18 до 100 лет';
            addButton.disabled = true;
            return;
        }

        try {
            let score = 0;
            
            if (age < 50) {
                score = gender === 'male' ? 1.2 : 0.8;
            } else if (age < 55) {
                score = gender === 'male' ? 2.5 : 1.8;
            } else if (age < 60) {
                score = gender === 'male' ? 4.0 : 3.0;
            } else if (age < 65) {
                score = gender === 'male' ? 6.5 : 5.0;
            } else if (age < 70) {
                score = gender === 'male' ? 10.0 : 7.5;
            } else {
                score = gender === 'male' ? 15.0 : 12.0;
            }
            
            if (smoking === 'yes') {
                score *= 1.6;
            }
            
            if (sbp >= 180) {
                score *= 2.0;
            } else if (sbp >= 160) {
                score *= 1.6;
            } else if (sbp >= 140) {
                score *= 1.3;
            } else if (sbp >= 120) {
                score *= 1.1;
            }
            
            if (chol >= 8) {
                score *= 2.2;
            } else if (chol >= 7) {
                score *= 1.8;
            } else if (chol >= 6) {
                score *= 1.5;
            } else if (chol >= 5) {
                score *= 1.2;
            }
            
            score = Math.min(score, 50);
            score = Math.max(score, 0.1);
            
            let riskCategory = '';
            let recommendation = '';
            
            if (age >= 70) {
                if (score < 7.5) {
                    riskCategory = 'низкий/умеренный риск';
                    recommendation = 'Статины при наличии показаний';
                } else {
                    riskCategory = 'высокий/очень высокий риск';
                    recommendation = 'Статины показаны';
                }
            } else {
                if (score < 2.5) {
                    riskCategory = 'низкий/умеренный риск';
                    recommendation = 'Статины обычно не показаны';
                } else if (score < 7.5) {
                    riskCategory = 'высокий риск';
                    recommendation = 'Рассмотреть статины';
                } else {
                    riskCategory = 'очень высокий риск';
                    recommendation = 'Статины показаны';
                }
            }
            
            resultElement.innerHTML = 
                `<strong>SCORE2${age >= 70 ? '-OP' : ''}: ${score.toFixed(1)}%</strong><br>
                 <small>${riskCategory}<br>${recommendation}</small>`;
            
            addButton.disabled = false;
            
            this.calculatorResults.score2 = {
                score: score.toFixed(1),
                category: riskCategory,
                recommendation: recommendation,
                text: `SCORE2${age >= 70 ? '-OP' : ''}: ${score.toFixed(1)}% (${riskCategory}). ${recommendation}`
            };
            
            console.log('📊 SCORE2 рассчитан:', this.calculatorResults.score2);
            
        } catch (error) {
            console.error('❌ Ошибка расчета SCORE2:', error);
            resultElement.textContent = 'Ошибка расчета';
            addButton.disabled = true;
        }
    }

    calculateCHADS() {
        let score = 0;
        
        if (document.getElementById('chads-chf').checked) score += 1;
        if (document.getElementById('chads-htn').checked) score += 1;
        if (document.getElementById('chads-age75').checked) score += 2;
        if (document.getElementById('chads-dm').checked) score += 1;
        if (document.getElementById('chads-stroke').checked) score += 2;
        if (document.getElementById('chads-vasc').checked) score += 1;
        if (document.getElementById('chads-age65').checked) score += 1;
        if (document.getElementById('chads-female').checked) score += 1;
        
        const strokeRisks = [0.2, 0.3, 0.9, 1.4, 2.0, 3.2, 4.6, 6.7, 10.0, 15.2];
        const strokeRisk = strokeRisks[Math.min(score, 9)];
        
        let recommendation = '';
        if (score === 0) {
            recommendation = 'Антикоагулянты не показаны';
        } else if (score === 1) {
            recommendation = 'Рассмотреть антикоагулянты (предпочтительно у женщин)';
        } else {
            recommendation = 'Антикоагулянты показаны';
        }
        
        document.getElementById('chads-result').innerHTML = 
            `<strong>Баллы: ${score}</strong><br>
             <small>Риск инсульта: ${strokeRisk}%/год<br>${recommendation}</small>`;
        
        document.getElementById('chads-add-btn').disabled = false;
        
        this.calculatorResults.chads = {
            score: score,
            strokeRisk: strokeRisk,
            recommendation: recommendation,
            text: `CHA₂DS₂-VASc: ${score} баллов (риск инсульта ${strokeRisk}%/год). ${recommendation}`
        };
        
        console.log('📊 CHA2DS2-VASc рассчитан:', this.calculatorResults.chads);
    }

    calculateHASBLED() {
        let score = 0;
        
        if (document.getElementById('hasbled-htn').checked) score += 1;
        if (document.getElementById('hasbled-renal').checked) score += 1;
        if (document.getElementById('hasbled-stroke').checked) score += 1;
        if (document.getElementById('hasbled-bleed').checked) score += 1;
        if (document.getElementById('hasbled-inr').checked) score += 1;
        if (document.getElementById('hasbled-age').checked) score += 1;
        if (document.getElementById('hasbled-drugs').checked) score += 1;
        
        let riskCategory = '';
        let recommendation = '';
        
        if (score < 3) {
            riskCategory = 'Низкий риск кровотечения';
            recommendation = 'Антикоагулянты можно назначать';
        } else {
            riskCategory = 'Высокий риск кровотечения';
            recommendation = 'Осторожность при назначении антикоагулянтов, частый контроль';
        }
        
        document.getElementById('hasbled-result').innerHTML = 
            `<strong>Баллы: ${score}</strong><br>
             <small>${riskCategory}<br>${recommendation}</small>`;
        
        document.getElementById('hasbled-add-btn').disabled = false;
        
        this.calculatorResults.hasbled = {
            score: score,
            category: riskCategory,
            recommendation: recommendation,
            text: `HAS-BLED: ${score} баллов (${riskCategory.toLowerCase()}). ${recommendation}`
        };
        
        console.log('📊 HAS-BLED рассчитан:', this.calculatorResults.hasbled);
    }

    calculateCKDEPI() {
        const creat = parseFloat(document.getElementById('ckd-creat').value);
        const age = parseFloat(document.getElementById('ckd-age').value);
        const gender = document.getElementById('ckd-gender').value;
        const resultElement = document.getElementById('ckd-result');
        const addButton = document.getElementById('ckd-add-btn');
        
        if (!creat || !age || !gender) {
            resultElement.textContent = 'Заполните все поля для расчета';
            addButton.disabled = true;
            return;
        }
        
        try {
            const creatMg = creat / 88.4;
            
            let gfr;
            if (gender === 'female') {
                if (creatMg <= 0.7) {
                    gfr = 142 * Math.pow(creatMg / 0.7, -0.241) * Math.pow(0.9938, age);
                } else {
                    gfr = 142 * Math.pow(creatMg / 0.7, -1.200) * Math.pow(0.9938, age);
                }
            } else {
                if (creatMg <= 0.9) {
                    gfr = 142 * Math.pow(creatMg / 0.9, -0.302) * Math.pow(0.9938, age);
                } else {
                    gfr = 142 * Math.pow(creatMg / 0.9, -1.200) * Math.pow(0.9938, age);
                }
            }
            
            gfr = Math.round(gfr);
            
            let ckdStage = '';
            let stageColor = '';
            
            if (gfr >= 90) {
                ckdStage = 'G1 (норма/высокая)';
                stageColor = 'success';
            } else if (gfr >= 60) {
                ckdStage = 'G2 (легко снижена)';
                stageColor = 'success';
            } else if (gfr >= 45) {
                ckdStage = 'G3a (умеренно снижена)';
                stageColor = 'warning';
            } else if (gfr >= 30) {
                ckdStage = 'G3b (значительно снижена)';
                stageColor = 'warning';
            } else if (gfr >= 15) {
                ckdStage = 'G4 (тяжело снижена)';
                stageColor = 'danger';
            } else {
                ckdStage = 'G5 (терминальная ХПН)';
                stageColor = 'danger';
            }
            
            resultElement.innerHTML = 
                `<strong>СКФ: ${gfr} мл/мин/1.73м²</strong><br>
                 <small class="text-${stageColor}">${ckdStage}</small>`;
            
            addButton.disabled = false;
            
            this.calculatorResults.ckd = {
                gfr: gfr,
                stage: ckdStage,
                text: `CKD-EPI 2021: СКФ ${gfr} мл/мин/1.73м² (${ckdStage})`
            };
            
            console.log('📊 CKD-EPI рассчитан:', this.calculatorResults.ckd);
            
        } catch (error) {
            console.error('❌ Ошибка расчета CKD-EPI:', error);
            resultElement.textContent = 'Ошибка расчета';
            addButton.disabled = true;
        }
    }

    calculateCockcroftGault() {
        const age = parseFloat(document.getElementById('cockcroft-age').value);
        const weight = parseFloat(document.getElementById('cockcroft-weight').value);
        const creat = parseFloat(document.getElementById('cockcroft-creat').value);
        const gender = document.getElementById('cockcroft-gender').value;
        const resultElement = document.getElementById('cockcroft-result');
        const addButton = document.getElementById('cockcroft-add-btn');
        
        if (!age || !weight || !creat || !gender) {
            resultElement.textContent = 'Заполните все поля для расчета';
            addButton.disabled = true;
            return;
        }
        
        try {
            const creatMg = creat / 88.4;
            const genderFactor = gender === 'male' ? 1 : 0.85;
            
            let clcr = ((140 - age) * weight * genderFactor) / (72 * creatMg);
            clcr = Math.round(clcr);
            
            let interpretation = '';
            let interpretationColor = '';
            
            if (clcr >= 90) {
                interpretation = 'Нормальная функция почек';
                interpretationColor = 'success';
            } else if (clcr >= 60) {
                interpretation = 'Легкое снижение функции';
                interpretationColor = 'success';
            } else if (clcr >= 45) {
                interpretation = 'Умеренное снижение функции';
                interpretationColor = 'warning';
            } else if (clcr >= 30) {
                interpretation = 'Значительное снижение функции';
                interpretationColor = 'warning';
            } else if (clcr >= 15) {
                interpretation = 'Тяжелое снижение функции';
                interpretationColor = 'danger';
            } else {
                interpretation = 'Терминальная почечная недостаточность';
                interpretationColor = 'danger';
            }
            
            resultElement.innerHTML = 
                `<strong>Клиренс креатинина: ${clcr} мл/мин</strong><br>
                 <small class="text-${interpretationColor}">${interpretation}</small>`;
            
            addButton.disabled = false;
            
            this.calculatorResults.cockcroft = {
                clcr: clcr,
                interpretation: interpretation,
                text: `Кокрофт-Голт: клиренс креатинина ${clcr} мл/мин (${interpretation.toLowerCase()})`
            };
            
            console.log('📊 Кокрофт-Голт рассчитан:', this.calculatorResults.cockcroft);
            
        } catch (error) {
            console.error('❌ Ошибка расчета Кокрофт-Голт:', error);
            resultElement.textContent = 'Ошибка расчета';
            addButton.disabled = true;
        }
    }

    // НОВАЯ ФУНКЦИЯ: Расчет H2FPEF
    calculateH2FPEF() {
        let score = 0;
        
        if (document.getElementById('h2fpef-heavy').checked) score += 2;
        if (document.getElementById('h2fpef-hypertension').checked) score += 1;
        if (document.getElementById('h2fpef-af').checked) score += 3;
        if (document.getElementById('h2fpef-pulmonary').checked) score += 1;
        if (document.getElementById('h2fpef-elderly').checked) score += 1;
        if (document.getElementById('h2fpef-filling').checked) score += 1;
        
        let probability = '';
        let recommendation = '';
        let probabilityColor = '';
        
        if (score <= 1) {
            probability = 'Низкая вероятность HFpEF (<25%)';
            recommendation = 'HFpEF маловероятна';
            probabilityColor = 'success';
        } else if (score <= 5) {
            probability = 'Промежуточная вероятность HFpEF (25-84%)';
            recommendation = 'Необходимо дополнительное обследование';
            probabilityColor = 'warning';
        } else {
            probability = 'Высокая вероятность HFpEF (≥85%)';
            recommendation = 'HFpEF весьма вероятна';
            probabilityColor = 'danger';
        }
        
        document.getElementById('h2fpef-result').innerHTML = 
            `<strong>Баллы: ${score}</strong><br>
             <small class="text-${probabilityColor}">${probability}<br>${recommendation}</small>`;
        
        document.getElementById('h2fpef-add-btn').disabled = false;
        
        this.calculatorResults.h2fpef = {
            score: score,
            probability: probability,
            recommendation: recommendation,
            text: `H2FPEF: ${score} баллов (${probability}). ${recommendation}`
        };
        
        console.log('📊 H2FPEF рассчитан:', this.calculatorResults.h2fpef);
    }

    // Простой калькулятор
    calcClear() {
        this.simpleCalcDisplay = '';
        this.simpleCalcMemory = '0';
        const display = document.getElementById('calcDisplay');
        if (display) {
            display.textContent = '0';
        }
        console.log('🧮 Калькулятор очищен');
    }

    calcInput(value) {
        const display = document.getElementById('calcDisplay');
        if (!display) return;

        if (this.simpleCalcDisplay === '0' || this.simpleCalcMemory === 'Error') {
            this.simpleCalcDisplay = '';
        }
        
        this.simpleCalcDisplay += value;
        display.textContent = this.simpleCalcDisplay || '0';
        console.log(`🧮 Ввод: ${value}, Дисплей: ${this.simpleCalcDisplay}`);
    }

    calcEquals() {
        const display = document.getElementById('calcDisplay');
        if (!display) return;

        try {
            let expression = this.simpleCalcDisplay
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/−/g, '-');
            
            if (!/^[0-9+\-*/.() ]+$/.test(expression)) {
                throw new Error('Invalid expression');
            }
            
            let result = Function('"use strict"; return (' + expression + ')')();
            
            if (isNaN(result) || !isFinite(result)) {
                throw new Error('Invalid calculation');
            }
            
            result = Math.round(result * 100000000) / 100000000;
            
            display.textContent = result;
            this.simpleCalcDisplay = result.toString();
            this.simpleCalcMemory = result.toString();
            
            console.log(`🧮 Результат: ${result}`);
            
        } catch (error) {
            display.textContent = 'Error';
            this.simpleCalcDisplay = '';
            this.simpleCalcMemory = 'Error';
            console.error('🧮 Ошибка калькулятора:', error);
        }
    }

    toggleCalculator(element) {
        const container = element.parentElement;
        const icon = element.querySelector('.collapse-icon');
        
        container.classList.toggle('expanded');
        
        if (container.classList.contains('expanded')) {
            icon.textContent = '▼';
        } else {
            icon.textContent = '▶';
        }
    }

    // Функция добавления результатов в протокол
    addToProtocol(calculatorType) {
        const result = this.calculatorResults[calculatorType];
        if (!result) {
            utils.showErrorMessage('Результат калькулятора не найден');
            return;
        }
        
        // Добавляем результат в поле медикаментозной терапии
        const medicationsField = document.getElementById('medications');
        if (medicationsField) {
            const currentText = medicationsField.value;
            const newText = currentText ? 
                currentText + '\n\n' + result.text : 
                result.text;
            
            medicationsField.value = newText;
            
            // Устанавливаем фокус и курсор в конец
            medicationsField.focus();
            medicationsField.setSelectionRange(medicationsField.value.length, medicationsField.value.length);
            
            utils.showSuccessMessage(`Результат ${calculatorType.toUpperCase()} добавлен в протокол`);
            utils.log('Результат калькулятора добавлен в протокол', 'info', { 
                calculatorType, 
                resultLength: result.text.length
            });
        } else {
            utils.showErrorMessage('Поле медикаментозной терапии не найдено');
        }
    }

    generateStyles() {
        return `
            <style>
            /* НОВЫЕ СТИЛИ: Боковая панель калькуляторов с полной высотой */
            
            /* Обертка для всего контента калькуляторов */
            .calculators-wrapper {
                padding: 15px;
                height: 100%;
                overflow-y: auto;
                overflow-x: hidden;
                /* Скрываем скроллбар */
                scrollbar-width: none; /* Firefox */
                -ms-overflow-style: none; /* Internet Explorer 10+ */
            }
            
            /* Скрываем скроллбар для Webkit браузеров */
            .calculators-wrapper::-webkit-scrollbar {
                display: none;
            }
            
            /* Поисковая строка - НЕ зафиксирована */
            .search-container {
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                z-index: 20;
                padding: 15px;
                margin: -15px -15px 15px -15px;
                border-bottom: 2px solid var(--primary-color);
                border-radius: 0 0 8px 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }

            .search-input-wrapper {
                position: relative;
                margin-bottom: 0;
            }

            .search-input {
                width: 100%;
                padding: 10px 40px 10px 15px;
                border: 2px solid #ced4da;
                border-radius: 8px;
                font-size: 14px;
                transition: all 0.3s ease;
                background: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }

            .search-input:focus {
                border-color: var(--primary-color);
                outline: none;
                box-shadow: 0 0 0 3px rgba(46, 134, 171, 0.15);
                transform: translateY(-1px);
            }

            .search-icon {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 16px;
                color: #6c757d;
                pointer-events: none;
            }

            .no-results {
                text-align: center;
                padding: 40px 20px;
                color: #6c757d;
            }

            .no-results p {
                margin: 0 0 8px 0;
                font-weight: 600;
                font-size: 15px;
            }

            .no-results small {
                font-size: 13px;
            }

            /* Контейнеры калькуляторов */
            .calculator-container {
                width: 100%;
                margin-bottom: 15px;
                border: 2px solid #e2e8f0;
                border-radius: 10px;
                overflow: hidden;
                transition: all 0.3s ease;
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                box-sizing: border-box;
            }

            .calculator-container:hover {
                border-color: var(--primary-color);
                box-shadow: 0 4px 12px rgba(46, 134, 171, 0.15);
                transform: translateY(-2px);
            }
            
            .calculator-title {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                padding: 12px 16px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                justify-content: flex-start;
                align-items: center;
                gap: 14px;
                font-size: 14px;
                border-bottom: 2px solid #e2e8f0;
                position: relative;
                transition: all 0.3s ease;
            }
            
            .calculator-title:hover {
                background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
                transform: translateX(3px);
            }

            /* НОВЫЕ ИКОНКИ В СТИЛЕ КАЛЕНОГО ЖЕЛЕЗА */
            .calculator-icon {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 15px;
                transition: all 0.3s ease;
                flex-shrink: 0;
                box-shadow: 0 3px 6px rgba(0,0,0,0.2);
                position: relative;
                overflow: hidden;
            }

            .calculator-icon::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(45deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(255,255,255,0.2) 100%);
                border-radius: 8px;
                transition: opacity 0.3s ease;
                opacity: 0;
            }

            .calculator-title:hover .calculator-icon::before {
                opacity: 1;
            }

            .calculator-title:hover .calculator-icon {
                transform: scale(1.1) rotate(3deg);
                box-shadow: 0 4px 8px rgba(0,0,0,0.25);
            }

            /* Специфические цвета для каждого калькулятора */
            .hot-iron-calc {
                background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffcc02 100%);
                color: white;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }

            .hot-iron-score {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #8e2de2 100%);
                color: white;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }

            .hot-iron-heart {
                background: linear-gradient(135deg, #e74c3c 0%, #c0392b 50%, #a93226 100%);
                color: white;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }

            .hot-iron-drop {
                background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 50%, #7d3c98 100%);
                color: white;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }

            .hot-iron-kidney {
                background: linear-gradient(135deg, #2ecc71 0%, #27ae60 50%, #1e8449 100%);
                color: white;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }

            .hot-iron-kidney2 {
                background: linear-gradient(135deg, #16a085 0%, #138d75 50%, #117a65 100%);
                color: white;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }

            .hot-iron-heart-pulse {
                background: linear-gradient(135deg, #f39c12 0%, #e67e22 50%, #d35400 100%);
                color: white;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }

            .calculator-title-text {
                flex: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                min-width: 0;
                font-weight: 600;
            }

            .collapse-icon {
                color: var(--primary-color);
                font-size: 14px;
                transition: all 0.3s ease;
                flex-shrink: 0;
                font-weight: bold;
            }

            .calculator-container.expanded .collapse-icon {
                transform: rotate(90deg);
                color: var(--danger-color);
            }
            
            .calculator-content {
                display: none;
                padding: 18px;
                font-size: 13px;
                background: white;
                width: 100%;
                box-sizing: border-box;
                overflow-x: hidden;
            }
            
            .calculator-container.expanded .calculator-content {
                display: block;
                animation: expandContent 0.3s ease-out;
            }

            @keyframes expandContent {
                from {
                    opacity: 0;
                    max-height: 0;
                    padding-top: 0;
                    padding-bottom: 0;
                }
                to {
                    opacity: 1;
                    max-height: 1000px;
                    padding-top: 18px;
                    padding-bottom: 18px;
                }
            }
            
            .calc-row {
                display: flex;
                align-items: center;
                margin-bottom: 12px;
                gap: 12px;
                flex-wrap: wrap;
                width: 100%;
                box-sizing: border-box;
            }
            
            .calc-label {
                min-width: 160px;
                font-weight: 600;
                font-size: 12px;
                margin: 0;
                color: var(--dark-color);
            }
            
            .calc-input, .calc-select {
                border: 2px solid #ced4da;
                border-radius: 6px;
                padding: 6px 10px;
                font-size: 13px;
                width: 90px;
                transition: all 0.3s ease;
                background: white;
            }
            
            .calc-input:focus, .calc-select:focus {
                border-color: var(--primary-color);
                outline: none;
                box-shadow: 0 0 0 3px rgba(46, 134, 171, 0.15);
                transform: translateY(-1px);
            }
            
            .unit {
                font-size: 12px;
                color: var(--gray-medium);
                white-space: nowrap;
                font-weight: 500;
            }
            
            .calc-result {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border: 2px solid #e9ecef;
                border-radius: 8px;
                padding: 15px;
                margin: 18px 0 12px 0;
                font-size: 13px;
                font-weight: 600;
                line-height: 1.5;
                min-height: 50px;
                display: flex;
                align-items: center;
                color: var(--dark-color);
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            
            .add-to-protocol-btn {
                background: linear-gradient(135deg, var(--success-color) 0%, #45a049 100%);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                width: 100%;
                box-shadow: 0 3px 6px rgba(76, 175, 80, 0.3);
            }
            
            .add-to-protocol-btn:hover:not(:disabled) {
                background: linear-gradient(135deg, #45a049 0%, #388e3c 100%);
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(76, 175, 80, 0.4);
            }
            
            .add-to-protocol-btn:disabled {
                background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
                cursor: not-allowed;
                opacity: 0.7;
                transform: none;
                box-shadow: none;
            }

            /* Чекбоксы для калькуляторов */
            .calc-label input[type="checkbox"] {
                margin-right: 8px;
                transform: scale(1.2);
                accent-color: var(--primary-color);
            }

            /* Адаптивность для узкой панели */
            @media (max-width: 1400px) {
                .calc-input, .calc-select {
                    width: 80px;
                }
                
                .calc-label {
                    min-width: 140px;
                    font-size: 11px;
                }
            }
            </style>
        `;
    }
}

// Создаем глобальный экземпляр
const calculatorManager = new CalculatorManager();

// Экспорт для использования в других модулях
window.calculatorManager = calculatorManager;