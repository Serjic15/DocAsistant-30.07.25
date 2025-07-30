/**
 * CardioAssistant Pro - Consultations Management Module (ОБНОВЛЕН v2.0)
 * Модуль управления консультациями - ИНТЕГРИРОВАН С IndexedDB
 * НОВАЯ ЛОГИКА: консультации сохраняются в IndexedDB через StorageManager
 */

class ConsultationsManager {
    constructor() {
        this.consultations = [];
        this.storageKey = 'cardio_consultations'; // Оставляем для обратной совместимости
        this.currentConsultation = null;
        this.currentPatient = null;
        this.isInitialized = false;
        this.doctorId = 'default'; // В будущем будет браться из системы авторизации
    }

    async init() {
        console.log('🔄 Инициализация менеджера консультаций...');
        
        // Ждем инициализации системы хранения
        if (!window.storageManager || !window.storageManager.isInitialized) {
            await new Promise(resolve => {
                const checkInterval = setInterval(() => {
                    if (window.storageManager && window.storageManager.isInitialized) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            });
        }
        
        await this.loadConsultations();
        console.log('✅ Менеджер консультаций инициализирован');
        this.isInitialized = true;
    }

    async loadConsultations() {
        try {
            // Сначала пытаемся загрузить из IndexedDB
            if (window.storageManager && window.storageManager.isInitialized) {
                this.consultations = await storageManager.getAllConsultations();
                console.log(`📊 Загружено консультаций из IndexedDB: ${this.consultations.length}`);
            } else {
                // Fallback на localStorage
                this.consultations = utils.loadFromStorage(this.storageKey, []);
                console.log(`📊 Загружено консультаций из localStorage: ${this.consultations.length}`);
            }
        } catch (error) {
            console.error('Ошибка загрузки консультаций:', error);
            this.consultations = [];
        }
    }

    async saveConsultations() {
        try {
            // Сохраняем в IndexedDB если доступно
            if (window.storageManager && window.storageManager.isInitialized) {
                // Сохраняем все консультации в IndexedDB
                for (const consultation of this.consultations) {
                    await storageManager.saveConsultation(consultation);
                }
                console.log('✅ Консультации сохранены в IndexedDB');
            } else {
                // Fallback на localStorage
                utils.saveToStorage(this.storageKey, this.consultations);
                console.log('✅ Консультации сохранены в localStorage');
            }
            return true;
        } catch (error) {
            console.error('Ошибка сохранения консультаций:', error);
            return false;
        }
    }

    // НОВЫЙ МЕТОД: Обработчик горячих клавиш для автоподстановок
    handleAutofillHotkey(event, fieldType) {
        // Ctrl+Space - показать автоподстановки
        if (event.ctrlKey && event.code === 'Space') {
            event.preventDefault();
            autofillManager.showPanel(fieldType);
        }
    }

    // ОБНОВЛЕННАЯ ВЕРСИЯ: получение HTML формы консультации (убрана информация о выборе пациента)
    getConsultationForm() {
        return `
            <form id="consultationForm" class="needs-validation" novalidate>
                <!-- Тип приема -->
                <div class="form-section">
                    <h3>Тип приема</h3>
                    <div class="row">
                        <div class="col-md-12">
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="appointmentType" id="appointmentPrimary" value="primary">
                                <label class="form-check-label" for="appointmentPrimary">
                                    Первичный
                                </label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="appointmentType" id="appointmentSecondary" value="secondary">
                                <label class="form-check-label" for="appointmentSecondary">
                                    Повторный
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Жалобы -->
                <div class="form-section">
                    <h3>Жалобы <span class="required">*</span></h3>
                    <div class="mb-3">
                        <div class="input-group">
                            <textarea class="form-control" id="complaints" rows="3" required
                                placeholder="Опишите основные жалобы пациента..."
                                onkeydown="consultationsManager.handleAutofillHotkey(event, 'complaints')"></textarea>
                            <button class="btn btn-outline-secondary" type="button" 
                                    onclick="autofillManager.showPanel('complaints')"
                                    title="Автоподстановки (Ctrl+Space)">
                                <i class="fas fa-list"></i>
                            </button>
                        </div>
                        <small class="text-muted">💡 Печатайте с клавиатуры или используйте Ctrl+Space для автоподстановок</small>
                        <div class="invalid-feedback">Пожалуйста, укажите жалобы пациента</div>
                    </div>
                </div>

                <!-- Анамнез заболевания -->
                <div class="form-section">
                    <h3>Анамнез заболевания <span class="required">*</span></h3>
                    <div class="mb-3">
                        <div class="input-group">
                            <textarea class="form-control" id="anamnesisDisease" rows="4" required
                                placeholder="Опишите анамнез развития заболевания..."
                                onkeydown="consultationsManager.handleAutofillHotkey(event, 'anamnesis-disease')"></textarea>
                            <button class="btn btn-outline-secondary" type="button" 
                                    onclick="autofillManager.showPanel('anamnesis-disease')"
                                    title="Автоподстановки (Ctrl+Space)">
                                <i class="fas fa-list"></i>
                            </button>
                        </div>
                        <small class="text-muted">💡 Печатайте с клавиатуры или используйте Ctrl+Space для автоподстановок</small>
                        <div class="invalid-feedback">Пожалуйста, укажите анамнез заболевания</div>
                    </div>
                </div>

                <!-- Анамнез жизни -->
                <div class="form-section">
                    <h3>Анамнез жизни</h3>
                    
                    <!-- Наследственность -->
                    <div class="mb-3">
                        <label class="form-label">Наследственность</label>
                        <div class="row">
                            <div class="col-md-12">
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="radio" name="heredity" id="heredityNo" value="no" onchange="consultationsManager.toggleHeredity()">
                                    <label class="form-check-label" for="heredityNo">
                                        Не отягощена
                                    </label>
                                </div>
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="radio" name="heredity" id="heredityYes" value="yes" onchange="consultationsManager.toggleHeredity()">
                                    <label class="form-check-label" for="heredityYes">
                                        Отягощена
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div id="heredityDetails" style="display: none;" class="mt-2">
                            <textarea class="form-control" id="heredityText" rows="2" 
                                placeholder="Укажите подробности наследственности..."></textarea>
                        </div>
                    </div>

                    <!-- Аллергологический анамнез -->
                    <div class="mb-3">
                        <label class="form-label">Аллергологический анамнез</label>
                        <div class="row">
                            <div class="col-md-12">
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="radio" name="allergy" id="allergyNo" value="no" onchange="consultationsManager.toggleAllergy()">
                                    <label class="form-check-label" for="allergyNo">
                                        Не отягощен
                                    </label>
                                </div>
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="radio" name="allergy" id="allergyYes" value="yes" onchange="consultationsManager.toggleAllergy()">
                                    <label class="form-check-label" for="allergyYes">
                                        Отягощен
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div id="allergyDetails" style="display: none;" class="mt-2">
                            <textarea class="form-control" id="allergyText" rows="2" 
                                placeholder="Укажите на что аллергия и как проявляется..."></textarea>
                        </div>
                    </div>

                    <!-- Вредные привычки - поля ЗАКРЫТЫ по умолчанию -->
                    <div class="mb-3">
                        <label class="form-label">Вредные привычки</label>
                        <div class="row">
                            <div class="col-md-12">
                                <div class="habit-checkbox">
                                    <input class="form-check-input" type="checkbox" id="smokingCheckbox" onchange="consultationsManager.toggleHabit('smoking')">
                                    <label class="form-check-label" for="smokingCheckbox">
                                        Курение
                                    </label>
                                </div>
                                <div id="smokingDetails" class="habit-details" style="display: none;">
                                    <div class="row">
                                        <div class="col-md-3">
                                            <input type="number" class="form-control form-control-sm" id="smokingYears" placeholder="Стаж лет" onkeyup="consultationsManager.calculatePYI()">
                                        </div>
                                        <div class="col-md-3">
                                            <input type="number" class="form-control form-control-sm" id="smokingDaily" placeholder="Сиг/день" onkeyup="consultationsManager.calculatePYI()">
                                        </div>
                                        <div class="col-md-3">
                                            <input type="text" class="form-control form-control-sm" id="pyi" placeholder="ИКЧ" readonly>
                                        </div>
                                    </div>
                                </div>

                                <div class="habit-checkbox">
                                    <input class="form-check-input" type="checkbox" id="alcoholCheckbox" onchange="consultationsManager.toggleHabit('alcohol')">
                                    <label class="form-check-label" for="alcoholCheckbox">
                                        Злоупотребление алкоголем
                                    </label>
                                </div>
                                <div id="alcoholDetails" class="habit-details" style="display: none;">
                                    <textarea class="form-control" rows="2" id="alcoholText" placeholder="Частота употребления, количество..."></textarea>
                                </div>

                                <div class="habit-checkbox">
                                    <input class="form-check-input" type="checkbox" id="drugsCheckbox" onchange="consultationsManager.toggleHabit('drugs')">
                                    <label class="form-check-label" for="drugsCheckbox">
                                        Употребление наркотиков и психоактивных веществ
                                    </label>
                                </div>
                                <div id="drugsDetails" class="habit-details" style="display: none;">
                                    <textarea class="form-control" rows="2" id="drugsText" placeholder="Какие вещества, частота..."></textarea>
                                </div>

                                <div class="habit-checkbox">
                                    <input class="form-check-input" type="checkbox" id="stressCheckbox" onchange="consultationsManager.toggleHabit('stress')">
                                    <label class="form-check-label" for="stressCheckbox">
                                        Хронический стресс
                                    </label>
                                </div>
                                <div id="stressDetails" class="habit-details" style="display: none;">
                                    <textarea class="form-control" rows="2" id="stressText" placeholder="Причины стресса, длительность..."></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Объективный осмотр -->
                <div class="form-section">
                    <h3>Объективный осмотр <span class="required">*</span></h3>
                    
                    <!-- Антропометрические данные -->
                    <div class="row mb-3">
                        <div class="col-md-3">
                            <label for="patientWeight" class="form-label">Вес (кг)</label>
                            <input type="number" class="form-control" id="patientWeight" step="0.1" min="0" onkeyup="consultationsManager.calculateBMIandBSA()">
                        </div>
                        <div class="col-md-3">
                            <label for="patientHeight" class="form-label">Рост (см)</label>
                            <input type="number" class="form-control" id="patientHeight" min="0" onkeyup="consultationsManager.calculateBMIandBSA()">
                        </div>
                        <div class="col-md-3">
                            <label for="patientBMI" class="form-label">ИМТ</label>
                            <input type="text" class="form-control" id="patientBMI" readonly>
                            <span class="text-muted small">кг/м²</span>
                        </div>
                        <div class="col-md-3">
                            <label for="patientBSA" class="form-label">ППТ</label>
                            <input type="text" class="form-control" id="patientBSA" readonly>
                            <span class="text-muted small">м²</span>
                        </div>
                    </div>
                    
                    <!-- Параметры витальных функций -->
                    <div class="row mb-3">
                        <div class="col-md-3">
                            <label for="bloodPressure1" class="form-label">АД 1</label>
                            <input type="text" class="form-control" id="bloodPressure1" 
                                placeholder="120/80" onkeyup="consultationsManager.calculateAverageBP()">
                        </div>
                        <div class="col-md-3">
                            <label for="bloodPressure2" class="form-label">АД 2</label>
                            <input type="text" class="form-control" id="bloodPressure2" 
                                placeholder="120/80" onkeyup="consultationsManager.calculateAverageBP()">
                        </div>
                        <div class="col-md-3">
                            <label for="bloodPressure3" class="form-label">АД 3</label>
                            <input type="text" class="form-control" id="bloodPressure3" 
                                placeholder="120/80" onkeyup="consultationsManager.calculateAverageBP()">
                        </div>
                        <div class="col-md-3">
                            <label for="heartRate" class="form-label">ЧСС/ЧСЖ</label>
                            <input type="number" class="form-control" id="heartRate" 
                                min="30" max="200" onkeyup="consultationsManager.updateObjectiveExam()">
                            <small class="text-muted">уд/мин</small>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-3">
                            <label for="respiratoryRate" class="form-label">ЧДД</label>
                            <input type="number" class="form-control" id="respiratoryRate" 
                                min="10" max="40" onkeyup="consultationsManager.updateObjectiveExam()">
                            <small class="text-muted">в мин</small>
                        </div>
                        <div class="col-md-3">
                            <label for="spo2" class="form-label">SpO₂</label>
                            <input type="number" class="form-control" id="spo2" 
                                min="50" max="100" onkeyup="consultationsManager.updateObjectiveExam()">
                            <small class="text-muted">%</small>
                        </div>
                        <div class="col-md-3">
                            <label for="temperature" class="form-label">Температура</label>
                            <input type="number" class="form-control" id="temperature" 
                                step="0.1" min="35" max="42">
                            <small class="text-muted">°C</small>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="objectiveExam" class="form-label">Данные осмотра <span class="required">*</span></label>
                        <textarea class="form-control" id="objectiveExam" rows="4" required
                            placeholder="Общее состояние, кожные покровы, аускультация..."></textarea>
                        <div class="invalid-feedback">Пожалуйста, укажите данные объективного осмотра</div>
                    </div>
                </div>

                <!-- Диагноз - дополнительные диагнозы СКРЫТЫ по умолчанию -->
                <div class="form-section">
                    <h3>Диагноз <span class="required">*</span></h3>
                    
                    <div class="diagnosis-container">
                        <label for="mainDiagnosis" class="form-label">Основное заболевание <span class="required">*</span></label>
                        <textarea class="form-control" id="mainDiagnosis" rows="2" required
                            placeholder="Основной диагноз..." ondblclick="mkb10Manager.showClassifier(this)"></textarea>
                        <small class="text-muted">Двойной клик для открытия классификатора МКБ-10</small>
                        <div class="invalid-feedback">Пожалуйста, укажите основной диагноз</div>
                    </div>

                    <!-- Дополнительные диагнозы СКРЫТЫ по умолчанию -->
                    <div class="diagnosis-container mt-3">
                        <div class="diagnosis-checkbox">
                            <input type="checkbox" id="competingCheckbox" onchange="consultationsManager.toggleDiagnosis('competing')">
                            <label for="competingCheckbox" class="form-check-label">Конкурирующее заболевание</label>
                        </div>
                        <div class="diagnosis-content" id="competingContent" style="display: none;">
                            <textarea class="form-control" id="competingDiagnosis" rows="2" 
                                placeholder="Конкурирующий диагноз..." ondblclick="mkb10Manager.showClassifier(this)"></textarea>
                        </div>
                    </div>

                    <div class="diagnosis-container">
                        <div class="diagnosis-checkbox">
                            <input type="checkbox" id="backgroundCheckbox" onchange="consultationsManager.toggleDiagnosis('background')">
                            <label for="backgroundCheckbox" class="form-check-label">Фоновое заболевание</label>
                        </div>
                        <div class="diagnosis-content" id="backgroundContent" style="display: none;">
                            <textarea class="form-control" id="backgroundDiagnosis" rows="2" 
                                placeholder="Фоновый диагноз..." ondblclick="mkb10Manager.showClassifier(this)"></textarea>
                        </div>
                    </div>

                    <div class="diagnosis-container">
                        <div class="diagnosis-checkbox">
                            <input type="checkbox" id="complicationCheckbox" onchange="consultationsManager.toggleDiagnosis('complication')">
                            <label for="complicationCheckbox" class="form-check-label">Осложнение основного заболевания</label>
                        </div>
                        <div class="diagnosis-content" id="complicationContent" style="display: none;">
                            <textarea class="form-control" id="complicationDiagnosis" rows="2" 
                                placeholder="Осложнение основного заболевания..." ondblclick="mkb10Manager.showClassifier(this)"></textarea>
                        </div>
                    </div>

                    <div class="diagnosis-container">
                        <div class="diagnosis-checkbox">
                            <input type="checkbox" id="concomitantCheckbox" onchange="consultationsManager.toggleDiagnosis('concomitant')">
                            <label class="form-check-label" for="concomitantCheckbox">Сопутствующее заболевание</label>
                        </div>
                        <div class="diagnosis-content" id="concomitantContent" style="display: none;">
                            <textarea class="form-control" id="concomitantDiagnosis" rows="2" 
                                placeholder="Сопутствующий диагноз..." ondblclick="mkb10Manager.showClassifier(this)"></textarea>
                        </div>
                    </div>
                </div>

                <!-- План обследования -->
                <div class="form-section">
                    <h3>План обследования <span class="required">*</span></h3>
                    <div class="mb-3">
                        <div class="input-group">
                            <textarea class="form-control" id="examPlan" rows="4" required
                                placeholder="План дополнительного обследования..."
                                onkeydown="consultationsManager.handleAutofillHotkey(event, 'exam-plan')"></textarea>
                            <button class="btn btn-outline-secondary" type="button" 
                                    onclick="autofillManager.showPanel('exam-plan')"
                                    title="Автоподстановки (Ctrl+Space)">
                                <i class="fas fa-list"></i>
                            </button>
                        </div>
                        <small class="text-muted">💡 Печатайте с клавиатуры или используйте Ctrl+Space для автоподстановок</small>
                        <div class="invalid-feedback">Пожалуйста, укажите план обследования</div>
                    </div>
                </div>

                <!-- Рекомендации -->
                <div class="form-section">
                    <h3>Рекомендации <span class="required">*</span></h3>
                    
                    <div class="mb-3">
                        <label for="medications" class="form-label">Медикаментозная терапия</label>
                        <div class="input-group">
                            <textarea class="form-control" id="medications" rows="4" 
                                placeholder="Препарат, дозировка, кратность приема..."
                                onkeydown="consultationsManager.handleAutofillHotkey(event, 'medications')"></textarea>
                            <button class="btn btn-outline-secondary" type="button" 
                                    onclick="autofillManager.showPanel('medications')"
                                    title="Автоподстановки (Ctrl+Space)">
                                <i class="fas fa-list"></i>
                            </button>
                        </div>
                        <small class="text-muted">💡 Печатайте с клавиатуры или используйте Ctrl+Space для автоподстановок</small>
                    </div>
                    
                    <div class="mb-3">
                        <label for="regime" class="form-label">Режим</label>
                        <div class="input-group">
                            <textarea class="form-control" id="regime" rows="2" 
                                placeholder="Режим дня, физические нагрузки..."
                                onkeydown="consultationsManager.handleAutofillHotkey(event, 'regime')"></textarea>
                            <button class="btn btn-outline-secondary" type="button" 
                                    onclick="autofillManager.showPanel('regime')"
                                    title="Автоподстановки (Ctrl+Space)">
                                <i class="fas fa-list"></i>
                            </button>
                        </div>
                        <small class="text-muted">💡 Печатайте с клавиатуры или используйте Ctrl+Space для автоподстановок</small>
                    </div>
                    
                    <div class="mb-3">
                        <label for="diet" class="form-label">Диета</label>
                        <div class="input-group">
                            <textarea class="form-control" id="diet" rows="2" 
                                placeholder="Диетические рекомендации..."
                                onkeydown="consultationsManager.handleAutofillHotkey(event, 'diet')"></textarea>
                            <button class="btn btn-outline-secondary" type="button" 
                                    onclick="autofillManager.showPanel('diet')"
                                    title="Автоподстановки (Ctrl+Space)">
                                <i class="fas fa-list"></i>
                            </button>
                        </div>
                        <small class="text-muted">💡 Печатайте с клавиатуры или используйте Ctrl+Space для автоподстановок</small>
                    </div>
                    
                    <!-- Следующий визит -->
                    <div class="next-visit-container">
                        <h5>Следующий визит</h5>
                        <div class="next-visit-options">
                            <div class="next-visit-option">
                                <input type="radio" name="nextVisitType" id="nextVisitDate" value="date" onchange="consultationsManager.toggleNextVisitType()">
                                <label for="nextVisitDate">На конкретную дату</label>
                            </div>
                            <div class="next-visit-option">
                                <input type="radio" name="nextVisitType" id="nextVisitNeeded" value="needed" onchange="consultationsManager.toggleNextVisitType()">
                                <label for="nextVisitNeeded">По необходимости</label>
                            </div>
                        </div>
                        <div id="nextVisitDateContainer" style="display: none;">
                            <input type="date" class="form-control" id="nextVisit">
                        </div>
                        <div id="nextVisitNeededContainer" style="display: none;">
                            <select class="form-select" id="nextVisitReason">
                                <option value="">Выберите причину</option>
                                <option value="Ухудшение состояния">При ухудшении состояния</option>
                                <option value="Появление новых симптомов">При появлении новых симптомов</option>
                                <option value="Коррекция терапии">Для коррекции терапии</option>
                                <option value="Контроль анализов">Для контроля анализов</option>
                                <option value="Плановое наблюдение">Плановое наблюдение</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- УБРАНЫ ОБЩИЕ КНОПКИ - управление через главное приложение -->

            </form>

            <style>
            .habit-details {
                display: none;
                margin-top: 0.5rem;
                margin-left: 1.5rem;
                padding: 0.75rem;
                background: #f8f9fa;
                border-radius: 4px;
                border: 1px solid #e9ecef;
            }
            
            .habit-details.active {
                display: block;
            }
            
            .habit-checkbox {
                margin-bottom: 0.5rem;
            }
            
            .diagnosis-container {
                margin-bottom: 1rem;
            }
            
            .diagnosis-checkbox {
                margin-bottom: 0.5rem;
            }
            
            .diagnosis-content {
                display: none;
                margin-left: 1.5rem;
            }
            
            .diagnosis-content.active {
                display: block;
            }
            
            .next-visit-container {
                background: #f8f9fa;
                padding: 1rem;
                border-radius: 8px;
                border: 1px solid #e9ecef;
                margin-top: 1rem;
            }
            
            .next-visit-options {
                display: flex;
                gap: 2rem;
                margin-bottom: 1rem;
            }
            
            .next-visit-option {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            /* Стили для кнопок автоподстановок */
            .input-group .btn-outline-secondary {
                border-color: #ced4da;
                color: #6c757d;
            }
            
            .input-group .btn-outline-secondary:hover {
                background-color: #e9ecef;
                border-color: var(--primary-color);
                color: var(--primary-color);
            }
            
            /* Подсказки */
            .text-muted small {
                font-size: 0.8rem;
            }
            </style>
        `;
    }

    // НОВЫЙ МЕТОД: Создание консультации для конкретного пациента (вызывается из app.js)
    createNewConsultation(patient) {
        console.log('📝 Создание новой консультации для пациента:', patient);
        
        this.currentPatient = patient;
        this.currentConsultation = null;
        
        // Заполняем только медицинские данные из карты пациента
        setTimeout(() => {
            this.fillMedicalDataFromPatient(patient);
        }, 100);
        
        // Очищаем поля консультации
        this.clearConsultationFields();
        
        // Устанавливаем фокус на жалобы
        setTimeout(() => {
            const complaintsField = document.getElementById('complaints');
            if (complaintsField) {
                complaintsField.focus();
            }
        }, 200);
    }

    // Заполнение медицинских данных из карты пациента
    fillMedicalDataFromPatient(patient) {
        // Заполняем только медицинские данные (вес, рост) если они есть
        if (patient.weight) {
            const weightField = document.getElementById('patientWeight');
            if (weightField) weightField.value = patient.weight;
        }
        
        if (patient.height) {
            const heightField = document.getElementById('patientHeight');
            if (heightField) heightField.value = patient.height;
        }
        
        // Пересчитываем ИМТ и ППТ
        this.calculateBMIandBSA();
        
        console.log('📋 Медицинские данные пациента заполнены в форму консультации');
    }

    // ОСНОВНОЙ МЕТОД СОХРАНЕНИЯ (обновлен для интеграции с IndexedDB)
    async saveConsultation() {
        // Проверяем, что пациент выбран
        if (!this.currentPatient) {
            utils.showErrorMessage('Ошибка: пациент не выбран для консультации');
            return false;
        }

        const form = document.getElementById('consultationForm');
        
        if (!utils.validateForm(form)) {
            utils.showErrorMessage('Пожалуйста, заполните все обязательные поля');
            return false;
        }

        utils.showLoading();

        try {
            // Сохраняем консультацию (привязываем к пациенту и доктору)
            const consultationData = this.collectConsultationData();
            consultationData.patientId = this.currentPatient.id;
            consultationData.doctorId = this.doctorId;

            let savedConsultation;
            
            if (this.currentConsultation) {
                // Обновление существующей консультации
                consultationData.id = this.currentConsultation.id;
                savedConsultation = await this.updateConsultation(this.currentConsultation.id, consultationData);
                utils.showSuccessMessage('Консультация обновлена');
            } else {
                // Создание новой консультации
                savedConsultation = await this.addConsultation(consultationData);
                this.currentConsultation = savedConsultation;
                utils.showSuccessMessage('Консультация сохранена');
            }

            // Обновляем медицинские данные в карте пациента (вес, рост)
            await this.updatePatientMedicalData();

            console.log('✅ Консультация успешно сохранена:', consultationData);
            return true;

        } catch (error) {
            console.error('❌ Ошибка сохранения консультации:', error);
            utils.showErrorMessage('Ошибка сохранения консультации: ' + error.message);
            return false;
        } finally {
            utils.hideLoading();
        }
    }

    // Обновление медицинских данных пациента
    async updatePatientMedicalData() {
        if (!this.currentPatient) return;

        const weight = parseFloat(document.getElementById('patientWeight').value);
        const height = parseFloat(document.getElementById('patientHeight').value);
        
        if (weight || height) {
            const updateData = {};
            if (weight) updateData.weight = weight;
            if (height) updateData.height = height;
            
            // Обновляем данные пациента через storageManager или patientsManager
            if (window.storageManager && window.storageManager.isInitialized) {
                const patient = await storageManager.getPatient(this.currentPatient.id);
                if (patient) {
                    Object.assign(patient, updateData);
                    await storageManager.savePatient(patient);
                    console.log('📊 Медицинские данные пациента обновлены в IndexedDB');
                }
            } else if (window.patientsManager && window.patientsManager.updatePatient) {
                patientsManager.updatePatient(this.currentPatient.id, updateData);
                console.log('📊 Медицинские данные пациента обновлены в localStorage');
            }
        }
    }

    // Загрузка данных консультации в форму
    async loadConsultationData(consultation) {
        this.currentConsultation = consultation;
        
        // Заполняем все поля формы
        // Тип приема
        if (consultation.appointmentType) {
            const radio = document.querySelector(`input[name="appointmentType"][value="${consultation.appointmentType}"]`);
            if (radio) radio.checked = true;
        }
        
        // Основные поля
        document.getElementById('complaints').value = consultation.complaints || '';
        document.getElementById('anamnesisDisease').value = consultation.anamnesisDisease || '';
        document.getElementById('objectiveExam').value = consultation.objectiveExam || '';
        document.getElementById('mainDiagnosis').value = consultation.mainDiagnosis || '';
        document.getElementById('examPlan').value = consultation.examPlan || '';
        document.getElementById('medications').value = consultation.medications || '';
        document.getElementById('regime').value = consultation.regime || '';
        document.getElementById('diet').value = consultation.diet || '';
        
        // Витальные функции
        if (consultation.vitals) {
            document.getElementById('patientWeight').value = consultation.vitals.weight || '';
            document.getElementById('patientHeight').value = consultation.vitals.height || '';
            document.getElementById('heartRate').value = consultation.vitals.heartRate || '';
            document.getElementById('respiratoryRate').value = consultation.vitals.respiratoryRate || '';
            document.getElementById('spo2').value = consultation.vitals.spo2 || '';
            document.getElementById('temperature').value = consultation.vitals.temperature || '';
            
            if (consultation.vitals.bloodPressure) {
                document.getElementById('bloodPressure1').value = consultation.vitals.bloodPressure;
            }
        }
        
        // Диагнозы
        if (consultation.competingDiagnosis) {
            document.getElementById('competingCheckbox').checked = true;
            this.toggleDiagnosis('competing');
            document.getElementById('competingDiagnosis').value = consultation.competingDiagnosis;
        }
        
        if (consultation.backgroundDiagnosis) {
            document.getElementById('backgroundCheckbox').checked = true;
            this.toggleDiagnosis('background');
            document.getElementById('backgroundDiagnosis').value = consultation.backgroundDiagnosis;
        }
        
        if (consultation.complicationDiagnosis) {
            document.getElementById('complicationCheckbox').checked = true;
            this.toggleDiagnosis('complication');
            document.getElementById('complicationDiagnosis').value = consultation.complicationDiagnosis;
        }
        
        if (consultation.concomitantDiagnosis) {
            document.getElementById('concomitantCheckbox').checked = true;
            this.toggleDiagnosis('concomitant');
            document.getElementById('concomitantDiagnosis').value = consultation.concomitantDiagnosis;
        }
        
        console.log('📋 Данные консультации загружены в форму');
    }

    // Методы переключения интерфейса (без изменений)
    toggleHeredity() {
        const heredityYes = document.getElementById('heredityYes').checked;
        const details = document.getElementById('heredityDetails');
        
        if (heredityYes) {
            details.style.display = 'block';
        } else {
            details.style.display = 'none';
            document.getElementById('heredityText').value = '';
        }
    }

    toggleAllergy() {
        const allergyYes = document.getElementById('allergyYes').checked;
        const details = document.getElementById('allergyDetails');
        
        if (allergyYes) {
            details.style.display = 'block';
        } else {
            details.style.display = 'none';
            document.getElementById('allergyText').value = '';
        }
    }

    // Логика вредных привычек - данные НЕ теряются при снятии галочки
    toggleHabit(habitType) {
        const checkbox = document.getElementById(habitType + 'Checkbox');
        const details = document.getElementById(habitType + 'Details');
        
        if (checkbox.checked) {
            details.style.display = 'block';
            details.classList.add('active');
        } else {
            details.style.display = 'none';
            details.classList.remove('active');
            // НЕ очищаем поля - данные сохраняются для протокола
        }
    }

    toggleDiagnosis(type) {
        const checkbox = document.getElementById(type + 'Checkbox');
        const content = document.getElementById(type + 'Content');
        
        if (checkbox.checked) {
            content.style.display = 'block';
            content.classList.add('active');
        } else {
            content.style.display = 'none';
            content.classList.remove('active');
            
            // Очищаем поле при снятии галочки
            const textarea = content.querySelector('textarea');
            if (textarea) textarea.value = '';
        }
    }

    toggleNextVisitType() {
        const dateRadio = document.getElementById('nextVisitDate');
        const neededRadio = document.getElementById('nextVisitNeeded');
        const dateContainer = document.getElementById('nextVisitDateContainer');
        const neededContainer = document.getElementById('nextVisitNeededContainer');
        
        if (dateRadio.checked) {
            dateContainer.style.display = 'block';
            neededContainer.style.display = 'none';
        } else if (neededRadio.checked) {
            dateContainer.style.display = 'none';
            neededContainer.style.display = 'block';
        }
    }

    // Расчетные методы (без изменений)
    calculateBMIandBSA() {
        const weight = parseFloat(document.getElementById('patientWeight').value);
        const height = parseFloat(document.getElementById('patientHeight').value);
        
        if (weight && height) {
            const bmi = utils.calculateBMI(weight, height);
            const bsa = utils.calculateBSA(weight, height);
            
            document.getElementById('patientBMI').value = bmi ? bmi.toFixed(1) : '';
            document.getElementById('patientBSA').value = bsa ? bsa.toFixed(2) : '';
        }
    }

    calculatePYI() {
        const years = parseFloat(document.getElementById('smokingYears').value);
        const daily = parseFloat(document.getElementById('smokingDaily').value);
        
        if (years && daily && years > 0 && daily > 0) {
            const pyi = (daily * years) / 20;
            document.getElementById('pyi').value = pyi.toFixed(1);
        } else {
            document.getElementById('pyi').value = '';
        }
    }

    calculateAverageBP() {
        const bp1 = document.getElementById('bloodPressure1').value;
        const bp2 = document.getElementById('bloodPressure2').value;
        const bp3 = document.getElementById('bloodPressure3').value;
        
        const bpValues = [bp1, bp2, bp3].filter(bp => bp && bp.includes('/'));
        
        if (bpValues.length > 0) {
            let totalSystolic = 0;
            let totalDiastolic = 0;
            let validCount = 0;
            
            bpValues.forEach(bp => {
                const parts = bp.split('/');
                if (parts.length === 2) {
                    const systolic = parseInt(parts[0]);
                    const diastolic = parseInt(parts[1]);
                    if (!isNaN(systolic) && !isNaN(diastolic)) {
                        totalSystolic += systolic;
                        totalDiastolic += diastolic;
                        validCount++;
                    }
                }
            });
            
            if (validCount > 0) {
                const avgSystolic = Math.round(totalSystolic / validCount);
                const avgDiastolic = Math.round(totalDiastolic / validCount);
                this.updateObjectiveExam(`${avgSystolic}/${avgDiastolic}`);
            }
        }
    }

    updateObjectiveExam(averageBP) {
        // Автоматическое обновление поля объективного осмотра
        const heartRate = document.getElementById('heartRate').value;
        const respiratoryRate = document.getElementById('respiratoryRate').value;
        const spo2 = document.getElementById('spo2').value;
        const temperature = document.getElementById('temperature').value;
        
        let vitalsText = 'Общее состояние удовлетворительное. ';
        
        if (averageBP) vitalsText += `АД ${averageBP} мм рт.ст. `;
        if (heartRate) vitalsText += `ЧСС ${heartRate} уд/мин. `;
        if (respiratoryRate) vitalsText += `ЧДД ${respiratoryRate} в мин. `;
        if (spo2) vitalsText += `SpO₂ ${spo2}%. `;
        if (temperature) vitalsText += `Температура ${temperature}°C. `;
        
        vitalsText += 'Кожные покровы обычной окраски. Отеков нет. В легких дыхание везикулярное, хрипов нет. Тоны сердца ритмичные, шумов нет.';
        
        const currentText = document.getElementById('objectiveExam').value;
        if (!currentText || currentText.startsWith('Общее состояние удовлетворительное')) {
            document.getElementById('objectiveExam').value = vitalsText;
        }
    }

    // Сбор данных консультации
    collectConsultationData() {
        return {
            id: this.currentConsultation?.id || this.generateConsultationId(),
            date: new Date().toISOString(),
            appointmentType: document.querySelector('input[name="appointmentType"]:checked')?.value || '',
            complaints: document.getElementById('complaints').value,
            anamnesisDisease: document.getElementById('anamnesisDisease').value,
            heredity: this.getHeredityData(),
            allergy: this.getAllergyData(),
            habits: this.getHabitsData(),
            vitals: this.getVitalsData(),
            objectiveExam: document.getElementById('objectiveExam').value,
            mainDiagnosis: document.getElementById('mainDiagnosis').value,
            competingDiagnosis: document.getElementById('competingDiagnosis').value,
            backgroundDiagnosis: document.getElementById('backgroundDiagnosis').value,
            complicationDiagnosis: document.getElementById('complicationDiagnosis').value,
            concomitantDiagnosis: document.getElementById('concomitantDiagnosis').value,
            examPlan: document.getElementById('examPlan').value,
            medications: document.getElementById('medications').value,
            regime: document.getElementById('regime').value,
            diet: document.getElementById('diet').value,
            nextVisit: this.getNextVisitData()
        };
    }

    // Сбор данных вредных привычек - если есть ЛЮБОЙ текст, включаем в протокол
    getHabitsData() {
        const habits = [];
        
        // Курение - собираем данные если есть ЛЮБАЯ введенная информация
        const years = document.getElementById('smokingYears').value;
        const daily = document.getElementById('smokingDaily').value;
        const pyi = document.getElementById('pyi').value;
        
        if (years || daily || pyi) {
            let smokingText = 'Курение';
            if (years) smokingText += `: стаж ${years} лет`;
            if (daily) smokingText += `, ${daily} сиг/день`;
            if (pyi) smokingText += `, ИКЧ ${pyi} пачка/лет`;
            habits.push(smokingText);
        }
        
        // Алкоголь - собираем данные если есть текст
        const alcoholText = document.getElementById('alcoholText').value;
        if (alcoholText.trim()) {
            habits.push(`Злоупотребление алкоголем: ${alcoholText}`);
        }
        
        // Наркотики - собираем данные если есть текст
        const drugsText = document.getElementById('drugsText').value;
        if (drugsText.trim()) {
            habits.push(`Употребление наркотиков и ПАВ: ${drugsText}`);
        }
        
        // Стресс - собираем данные если есть текст
        const stressText = document.getElementById('stressText').value;
        if (stressText.trim()) {
            habits.push(`Хронический стресс: ${stressText}`);
        }
        
        return habits.join('. ');
    }

    getHeredityData() {
        const heredityNo = document.getElementById('heredityNo').checked;
        const heredityYes = document.getElementById('heredityYes').checked;
        const heredityText = document.getElementById('heredityText').value;
        
        if (heredityNo) return 'Не отягощена';
        if (heredityYes) return heredityText || 'Отягощена';
        return '';
    }

    getAllergyData() {
        const allergyNo = document.getElementById('allergyNo').checked;
        const allergyYes = document.getElementById('allergyYes').checked;
        const allergyText = document.getElementById('allergyText').value;
        
        if (allergyNo) return 'Не отягощен';
        if (allergyYes) return allergyText || 'Отягощен';
        return '';
    }

    getVitalsData() {
        return {
            heartRate: document.getElementById('heartRate').value,
            bloodPressure: this.getBestBP(),
            respiratoryRate: document.getElementById('respiratoryRate').value,
            spo2: document.getElementById('spo2').value,
            temperature: document.getElementById('temperature').value,
            weight: document.getElementById('patientWeight').value,
            height: document.getElementById('patientHeight').value,
            bmi: document.getElementById('patientBMI').value,
            bsa: document.getElementById('patientBSA').value
        };
    }

    getBestBP() {
        const bp1 = document.getElementById('bloodPressure1').value;
        const bp2 = document.getElementById('bloodPressure2').value;
        const bp3 = document.getElementById('bloodPressure3').value;
        
        // Возвращаем среднее значение или первое доступное
        if (bp1 && bp2 && bp3) {
            return this.calculateAverageBPValue([bp1, bp2, bp3]);
        } else if (bp1) {
            return bp1;
        } else if (bp2) {
            return bp2;
        } else if (bp3) {
            return bp3;
        }
        return '';
    }

    calculateAverageBPValue(bpArray) {
        let totalSystolic = 0;
        let totalDiastolic = 0;
        let validCount = 0;
        
        bpArray.forEach(bp => {
            if (bp && bp.includes('/')) {
                const parts = bp.split('/');
                if (parts.length === 2) {
                    const systolic = parseInt(parts[0]);
                    const diastolic = parseInt(parts[1]);
                    if (!isNaN(systolic) && !isNaN(diastolic)) {
                        totalSystolic += systolic;
                        totalDiastolic += diastolic;
                        validCount++;
                    }
                }
            }
        });
        
        if (validCount > 0) {
            const avgSystolic = Math.round(totalSystolic / validCount);
            const avgDiastolic = Math.round(totalDiastolic / validCount);
            return `${avgSystolic}/${avgDiastolic}`;
        }
        
        return '';
    }

    getNextVisitData() {
        const dateRadio = document.getElementById('nextVisitDate');
        const neededRadio = document.getElementById('nextVisitNeeded');
        
        if (dateRadio && dateRadio.checked) {
            const visitDate = document.getElementById('nextVisit').value;
            if (visitDate) {
                return new Date(visitDate).toLocaleDateString('ru-RU');
            }
        } else if (neededRadio && neededRadio.checked) {
            const reason = document.getElementById('nextVisitReason').value;
            return reason || 'По необходимости';
        }
        
        return '';
    }

    // CRUD операции (обновлены для работы с IndexedDB)
    async addConsultation(consultationData) {
        try {
            // Сохраняем в IndexedDB если доступно
            if (window.storageManager && window.storageManager.isInitialized) {
                consultationData.doctorId = this.doctorId;
                const savedId = await storageManager.saveConsultation(consultationData);
                consultationData.id = savedId;
                console.log('✅ Консультация сохранена в IndexedDB:', savedId);
            }
            
            // Также сохраняем в локальный массив для быстрого доступа
            this.consultations.push(consultationData);
            await this.saveConsultations();
            
            return consultationData;
        } catch (error) {
            console.error('Ошибка добавления консультации:', error);
            throw error;
        }
    }

    async updateConsultation(consultationId, updateData) {
        try {
            // Обновляем в IndexedDB если доступно
            if (window.storageManager && window.storageManager.isInitialized) {
                updateData.id = consultationId;
                updateData.doctorId = this.doctorId;
                await storageManager.saveConsultation(updateData);
                console.log('✅ Консультация обновлена в IndexedDB:', consultationId);
            }
            
            // Обновляем в локальном массиве
            const index = this.consultations.findIndex(c => c.id === consultationId);
            if (index >= 0) {
                this.consultations[index] = { ...this.consultations[index], ...updateData };
                await this.saveConsultations();
                return this.consultations[index];
            }
            
            return null;
        } catch (error) {
            console.error('Ошибка обновления консультации:', error);
            throw error;
        }
    }

    async getConsultation(consultationId) {
        // Сначала ищем в локальном массиве
        let consultation = this.consultations.find(c => c.id === consultationId);
        
        // Если не нашли и есть IndexedDB, ищем там
        if (!consultation && window.storageManager && window.storageManager.isInitialized) {
            const allConsultations = await storageManager.getAllConsultations();
            consultation = allConsultations.find(c => c.id === consultationId);
        }
        
        return consultation || null;
    }

    async getPatientConsultations(patientId) {
        try {
            // Если есть IndexedDB, получаем оттуда
            if (window.storageManager && window.storageManager.isInitialized) {
                const consultations = await storageManager.getPatientConsultations(patientId);
                return consultations;
            } else {
                // Иначе из локального массива
                return this.consultations.filter(c => c.patientId === patientId);
            }
        } catch (error) {
            console.error('Ошибка получения консультаций пациента:', error);
            return [];
        }
    }

    // Получение всех консультаций
    async getAllConsultations() {
        try {
            if (window.storageManager && window.storageManager.isInitialized) {
                return await storageManager.getAllConsultations();
            } else {
                return this.consultations;
            }
        } catch (error) {
            console.error('Ошибка получения всех консультаций:', error);
            return this.consultations;
        }
    }

    // Очистка полей консультации
    clearConsultationFields() {
        // Очищаем только поля консультации, оставляя данные пациента
        const consultationFields = [
            'complaints', 'anamnesisDisease', 'objectiveExam', 'mainDiagnosis',
            'examPlan', 'medications', 'regime', 'diet',
            'heartRate', 'respiratoryRate', 'spo2', 'temperature',
            'bloodPressure1', 'bloodPressure2', 'bloodPressure3'
        ];
        
        consultationFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) field.value = '';
        });
        
        // Сбрасываем радио кнопки и чекбоксы
        document.querySelectorAll('#consultationForm input[type="radio"]').forEach(radio => radio.checked = false);
        document.querySelectorAll('#consultationForm input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
            // Скрываем связанные детали
            if (checkbox.id.includes('Checkbox')) {
                const detailsId = checkbox.id.replace('Checkbox', 'Details');
                const details = document.getElementById(detailsId);
                if (details) details.style.display = 'none';
            }
        });
        
        // Скрываем блоки диагнозов
        ['competing', 'background', 'complication', 'concomitant'].forEach(type => {
            const content = document.getElementById(type + 'Content');
            if (content) content.style.display = 'none';
        });
        
        // Скрываем блоки анамнеза жизни
        const heredityDetails = document.getElementById('heredityDetails');
        const allergyDetails = document.getElementById('allergyDetails');
        if (heredityDetails) heredityDetails.style.display = 'none';
        if (allergyDetails) allergyDetails.style.display = 'none';
    }

    generateConsultationId() {
        return Date.now().toString();
    }
}

// Создаем глобальный экземпляр
const consultationsManager = new ConsultationsManager();

// Экспорт для использования в других модулях
window.consultationsManager = consultationsManager;