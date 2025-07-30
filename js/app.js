/**
 * DocAssistantPro - ПОЛНЫЙ главный модуль приложения v2.1
 * CardioAssistantPro v2.1 - ИСПРАВЛЕНО: Все проблемы с логикой и навигацией
 * ПРЕМИУМ ВЕРСИЯ: Максимальное качество для медицинских профессионалов
 * ИСПРАВЛЕНО: Z-index, одна панель консультаций, правильная навигация, медицинские цвета
 */

class DocAssistantApp {
    constructor() {
        this.currentPatient = null;
        this.currentTab = 'schedule';
        this.isInitialized = false;
        this.navigationHistory = [];
        this.searchResults = [];
        this.appVersion = 'CardioAssistantPro v2.1';
        this.currentView = 'list';
        this.currentConsultation = null;
        this.previousView = null;
        
        // ИСПРАВЛЕНО: Система активных консультаций с правильной логикой
        this.activeConsultations = new Map();
        this.currentActivePatientId = null;
        this.consultationStates = {
            ACTIVE: 'active',
            COMPLETED: 'completed',
            CANCELLED: 'cancelled',
            SAVED: 'saved'
        };
        
        // Для вкладки "Мои пациенты"
        this.myPatients = [];
        this.myPatientsSearchQuery = '';
        this.myPatientsFilterType = 'all';
        this.doctorId = 'default';
        this.starredPatients = new Set();
        
        // ПРЕМИУМ: Кэширование и оптимизация
        this.cache = new Map();
        this.debounceTimers = new Map();
        this.lastSearchQuery = '';
        this.isLoading = false;
        
        // ПРЕМИУМ: Обработка ошибок
        this.errorCount = 0;
        this.maxErrors = 10;
        this.criticalErrors = [];
        
        // Привязываем методы к контексту
        this.handleGlobalError = this.handleGlobalError.bind(this);
        this.handleUnhandledRejection = this.handleUnhandledRejection.bind(this);
    }

    async init() {
        try {
            console.log('🚀 Инициализация DocAssistantPro - CardioAssistantPro v2.1...');
            
            // ПРЕМИУМ: Глобальная обработка ошибок
            this.setupGlobalErrorHandling();
            
            // ИСПРАВЛЕНО: Принудительно устанавливаем активную вкладку "Расписание"
            this.setDefaultActiveTab();
            
            // Инициализация времени
            this.initializeDateTime();
            
            // Инициализация менеджеров
            await this.initializeManagers();
            
            // Загрузка контента вкладок
            await this.loadTabContents();
            
            // Настройка событий
            this.setupEventListeners();
            
            // Инициализация интерфейса
            this.initializeInterface();
            
            // ИСПРАВЛЕНО: Инициализация ОДНОЙ панели активных консультаций
            this.initializeActiveConsultationsPanel();
            
            // Загрузка данных
            this.loadStarredPatients();
            await this.loadMyPatients();
            this.loadActiveConsultations();
            this.preloadCriticalData();
            
            console.log('✅ DocAssistantPro - CardioAssistantPro v2.1 инициализирован успешно');
            this.isInitialized = true;
            
            this.showNotification('Система готова к работе', 'success', 2000);
            
        } catch (error) {
            console.error('❌ Критическая ошибка инициализации:', error);
            this.handleCriticalError('Критическая ошибка инициализации приложения', error);
        }
    }

    // === ИСПРАВЛЕНО: ЕДИНАЯ ПАНЕЛЬ АКТИВНЫХ КОНСУЛЬТАЦИЙ ===

    // ИСПРАВЛЕНО: Создание ОДНОЙ продуманной панели под хедером
    initializeActiveConsultationsPanel() {
        try {
            if (!document.getElementById('activeConsultationsPanel')) {
                this.createActiveConsultationsPanel();
            }
            
            this.updateActiveConsultationsPanel();
            console.log('🔧 Единая панель активных консультаций инициализирована');
        } catch (error) {
            console.error('Ошибка инициализации панели активных консультаций:', error);
            this.logError('Init Active Consultations Panel Error', error);
        }
    }

    // ИСПРАВЛЕНО: HTML единой панели с правильным z-index
    createActiveConsultationsPanel() {
        const panelHTML = `
            <div id="activeConsultationsPanel" class="active-consultations-panel-premium">
                <div class="active-consultations-header-premium">
                    <div class="panel-title-premium">
                        <div class="panel-icon-premium">
                            <i class="fas fa-user-md"></i>
                        </div>
                        <div class="panel-text-premium">
                            <span class="title-main-premium">Активные консультации</span>
                            <span class="title-count-premium" id="activeConsultationsCount">(0)</span>
                        </div>
                    </div>
                    <div class="panel-controls-premium">
                        <button class="btn-panel-action-premium" onclick="app.addNewConsultationFromPanel()">
                            <i class="fas fa-plus"></i>
                            <span>Новая</span>
                        </button>
                        <div class="panel-toggle-premium" onclick="app.toggleActiveConsultationsPanel()">
                            <i class="fas fa-chevron-up" id="panelToggleIcon"></i>
                        </div>
                    </div>
                </div>
                <div class="active-consultations-content-premium" id="activeConsultationsContent">
                    <div class="no-active-consultations-premium">
                        <div class="no-consultations-icon-premium">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="no-consultations-text-premium">
                            <span class="no-consultations-title">Нет активных консультаций</span>
                            <small class="no-consultations-hint">Откройте запись из расписания для начала работы</small>
                        </div>
                    </div>
                </div>
            </div>

            <style>
            /* ИСПРАВЛЕНО: Стили единой панели с правильным z-index */
            .active-consultations-panel-premium {
                position: fixed;
                top: 98px; /* ИСПРАВЛЕНО: Под хедером, но НАД калькуляторами */
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                border-bottom: 1px solid #e2e8f0;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                z-index: 95; /* ИСПРАВЛЕНО: Ниже хедера (100), но выше контента (90) */
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                backdrop-filter: blur(10px);
                border-top: 3px solid var(--primary-color);
            }

            .active-consultations-panel-premium.collapsed {
                transform: translateY(-100%);
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }

            .active-consultations-header-premium {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem 2rem;
                background: linear-gradient(135deg, #2E86AB 0%, #1D3557 100%);
                color: white;
                position: relative;
                overflow: hidden;
            }

            .active-consultations-header-premium::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><defs><pattern id="grid" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M 6 0 L 0 0 0 6" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="60" height="60" fill="url(%23grid)"/></svg>');
                opacity: 0.3;
            }

            .panel-title-premium {
                display: flex;
                align-items: center;
                gap: 1rem;
                position: relative;
                z-index: 2;
            }

            .panel-icon-premium {
                width: 48px;
                height: 48px;
                background: rgba(255,255,255,0.15);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.2);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            .panel-text-premium {
                display: flex;
                flex-direction: column;
            }

            .title-main-premium {
                font-size: 1.1rem;
                font-weight: 700;
                margin: 0;
                line-height: 1.2;
            }

            .title-count-premium {
                font-size: 0.85rem;
                opacity: 0.9;
                font-weight: 500;
                margin-top: 0.2rem;
            }

            .panel-controls-premium {
                display: flex;
                align-items: center;
                gap: 1rem;
                position: relative;
                z-index: 2;
            }

            .btn-panel-action-premium {
                background: rgba(255,255,255,0.15);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 0.6rem 1.2rem;
                border-radius: 10px;
                font-weight: 600;
                font-size: 0.85rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }

            .btn-panel-action-premium:hover {
                background: rgba(255,255,255,0.25);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }

            .panel-toggle-premium {
                width: 40px;
                height: 40px;
                background: rgba(255,255,255,0.15);
                border: 1px solid rgba(255,255,255,0.3);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }

            .panel-toggle-premium:hover {
                background: rgba(255,255,255,0.25);
                transform: scale(1.05);
            }

            .panel-toggle-premium i {
                color: white;
                font-size: 1rem;
                transition: transform 0.3s ease;
            }

            .active-consultations-content-premium {
                max-height: 120px;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 1rem 2rem;
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                transition: all 0.4s ease;
            }

            .active-consultations-content-premium::-webkit-scrollbar {
                width: 6px;
            }

            .active-consultations-content-premium::-webkit-scrollbar-track {
                background: #f1f3f4;
                border-radius: 3px;
            }

            .active-consultations-content-premium::-webkit-scrollbar-thumb {
                background: var(--primary-color);
                border-radius: 3px;
            }

            .no-active-consultations-premium {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 1rem;
                min-height: 80px;
                color: #6c757d;
                text-align: center;
            }

            .no-consultations-icon-premium {
                font-size: 2rem;
                color: #cbd5e0;
            }

            .no-consultations-text-premium {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }

            .no-consultations-title {
                font-weight: 600;
                color: #495057;
                font-size: 1rem;
            }

            .no-consultations-hint {
                color: #6c757d;
                font-size: 0.85rem;
            }

            /* ПРЕМИУМ: Стили для активных консультаций */
            .active-consultations-scroll-premium {
                display: flex;
                gap: 1rem;
                overflow-x: auto;
                padding: 0.5rem 0;
                scroll-behavior: smooth;
            }

            .active-consultations-scroll-premium::-webkit-scrollbar {
                height: 6px;
            }

            .active-consultations-scroll-premium::-webkit-scrollbar-track {
                background: #f1f3f4;
                border-radius: 3px;
            }

            .active-consultations-scroll-premium::-webkit-scrollbar-thumb {
                background: var(--primary-color);
                border-radius: 3px;
            }

            .active-consultation-item-premium {
                flex: 0 0 auto;
                min-width: 280px;
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                border: 2px solid #e2e8f0;
                border-radius: 12px;
                padding: 1rem;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }

            .active-consultation-item-premium:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0,0,0,0.12);
                border-color: var(--primary-color);
            }

            .active-consultation-item-premium.current {
                border-color: var(--primary-color);
                background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%);
                box-shadow: 0 4px 15px rgba(46, 134, 171, 0.2);
            }

            .active-consultation-item-premium::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, var(--primary-color), var(--success-color));
            }

            .consultation-header-premium {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 0.75rem;
            }

            .consultation-patient-info-premium {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .consultation-avatar-premium {
                width: 44px;
                height: 44px;
                background: linear-gradient(135deg, var(--primary-color), #246185);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 0.9rem;
                position: relative;
                box-shadow: 0 4px 12px rgba(46, 134, 171, 0.3);
            }

            .consultation-status-dot-premium {
                position: absolute;
                bottom: -2px;
                right: -2px;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }

            .consultation-status-dot-premium.active {
                background: #22c55e;
                animation: pulse-status 2s infinite;
            }

            @keyframes pulse-status {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.8; }
                100% { transform: scale(1); opacity: 1; }
            }

            .consultation-details-premium {
                flex: 1;
            }

            .patient-name-premium {
                font-weight: 700;
                color: #1a202c;
                font-size: 0.95rem;
                margin-bottom: 0.25rem;
                line-height: 1.2;
            }

            .consultation-time-premium {
                color: #6c757d;
                font-size: 0.8rem;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }

            .consultation-actions-premium {
                display: flex;
                gap: 0.5rem;
            }

            .btn-consultation-action-premium {
                width: 32px;
                height: 32px;
                border: none;
                border-radius: 8px;
                background: rgba(108, 117, 125, 0.1);
                color: #6c757d;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 0.8rem;
            }

            .btn-consultation-action-premium:hover {
                background: rgba(220, 53, 69, 0.1);
                color: #dc3545;
                transform: scale(1.1);
            }

            /* ИСПРАВЛЕНО: Адаптация контента под панель */
            .main-wrapper {
                padding-top: calc(1.5rem + 80px); /* ИСПРАВЛЕНО: Учитываем высоту панели */
                transition: padding-top 0.4s ease;
            }

            .active-consultations-panel-premium.collapsed + .main-wrapper {
                padding-top: 1.5rem; /* Обычный отступ когда панель свернута */
            }

            /* МЕДИЦИНСКИЕ ЦВЕТА - Премиум палитра */
            :root {
                --medical-primary: #2E86AB;
                --medical-success: #16a085;
                --medical-info: #3498db;
                --medical-warning: #f39c12;
                --medical-danger: #e74c3c;
                --medical-light: #ecf0f1;
                --medical-dark: #2c3e50;
                --medical-accent: #9b59b6;
            }

            @media (max-width: 768px) {
                .active-consultations-panel-premium {
                    top: 85px;
                }

                .active-consultations-header-premium {
                    padding: 0.75rem 1rem;
                }

                .active-consultations-content-premium {
                    padding: 0.75rem 1rem;
                    max-height: 100px;
                }

                .panel-icon-premium {
                    width: 40px;
                    height: 40px;
                    font-size: 1rem;
                }

                .active-consultation-item-premium {
                    min-width: 240px;
                    padding: 0.75rem;
                }

                .main-wrapper {
                    padding-top: calc(1rem + 70px);
                }
            }
            </style>
        `;

        // ИСПРАВЛЕНО: Вставляем панель после хедера
        const header = document.querySelector('.medical-header');
        if (header) {
            header.insertAdjacentHTML('afterend', panelHTML);
        }
    }

    // ИСПРАВЛЕНО: Обновление панели с правильной логикой
    updateActiveConsultationsPanel() {
        const content = document.getElementById('activeConsultationsContent');
        const countElement = document.getElementById('activeConsultationsCount');
        
        if (!content) return;

        const consultationsCount = this.activeConsultations.size;
        
        // Обновляем счетчик
        if (countElement) {
            countElement.textContent = consultationsCount > 0 ? `(${consultationsCount})` : '(0)';
        }

        if (consultationsCount === 0) {
            content.innerHTML = `
                <div class="no-active-consultations-premium">
                    <div class="no-consultations-icon-premium">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div class="no-consultations-text-premium">
                        <span class="no-consultations-title">Нет активных консультаций</span>
                        <small class="no-consultations-hint">Откройте запись из расписания для начала работы</small>
                    </div>
                </div>
            `;
        } else {
            // ИСПРАВЛЕНО: Горизонтальная прокрутка консультаций
            const consultationsHTML = `
                <div class="active-consultations-scroll-premium">
                    ${Array.from(this.activeConsultations.entries()).map(([patientId, consultation]) => {
                        const isActive = patientId === this.currentActivePatientId;
                        const initials = this.getPatientInitials(consultation.patient);
                        const timeElapsed = this.getTimeElapsed(consultation.startTime);
                        
                        return `
                            <div class="active-consultation-item-premium ${isActive ? 'current' : ''}" 
                                 onclick="app.switchToPatientCard('${patientId}')"
                                 title="${consultation.patient.name} - ${timeElapsed}">
                                <div class="consultation-header-premium">
                                    <div class="consultation-patient-info-premium">
                                        <div class="consultation-avatar-premium">
                                            <span>${initials}</span>
                                            <div class="consultation-status-dot-premium ${consultation.state}"></div>
                                        </div>
                                        <div class="consultation-details-premium">
                                            <div class="patient-name-premium">${this.getPatientShortName(consultation.patient)}</div>
                                            <div class="consultation-time-premium">
                                                <i class="fas fa-clock"></i>
                                                ${timeElapsed}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="consultation-actions-premium">
                                        <button class="btn-consultation-action-premium" 
                                                onclick="event.stopPropagation(); app.promptCloseConsultation('${patientId}')"
                                                title="Завершить консультацию">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;

            content.innerHTML = consultationsHTML;
        }
    }

    // ИСПРАВЛЕНО: Переключение видимости панели
    toggleActiveConsultationsPanel() {
        const panel = document.getElementById('activeConsultationsPanel');
        const content = document.getElementById('activeConsultationsContent');
        const toggleIcon = document.getElementById('panelToggleIcon');
        
        if (!panel || !content || !toggleIcon) return;

        const isCollapsed = panel.classList.contains('collapsed');
        
        if (isCollapsed) {
            // Раскрываем
            panel.classList.remove('collapsed');
            toggleIcon.className = 'fas fa-chevron-up';
            
            // Анимация раскрытия
            setTimeout(() => {
                content.style.opacity = '1';
                content.style.transform = 'translateY(0)';
            }, 100);
        } else {
            // Сворачиваем
            panel.classList.add('collapsed');
            toggleIcon.className = 'fas fa-chevron-down';
        }
    }

    // === ИСПРАВЛЕНО: ПРАВИЛЬНАЯ ЛОГИКА КОНСУЛЬТАЦИЙ ===

    // ИСПРАВЛЕНО: Создание активной консультации
    createActiveConsultation(patient, appointmentId = null) {
        try {
            const patientId = patient.id;
            
            // Проверяем, есть ли уже активная консультация
            if (this.activeConsultations.has(patientId)) {
                this.switchToPatientCard(patientId);
                return;
            }

            const consultation = {
                id: this.generateConsultationId(),
                patient: patient,
                appointmentId: appointmentId,
                startTime: new Date().toISOString(),
                state: this.consultationStates.ACTIVE,
                data: {},
                isModified: false
            };

            // Добавляем в активные консультации
            this.activeConsultations.set(patientId, consultation);
            this.currentActivePatientId = patientId;
            this.currentPatient = patient;
            this.currentConsultation = consultation;

            // Сохраняем состояние
            this.saveActiveConsultations();
            this.updateActiveConsultationsPanel();

            // ИСПРАВЛЕНО: Показываем карту пациента с активной консультацией
            this.showPatientCardWithActiveConsultation(patient);

            console.log('📝 Создана активная консультация для пациента:', patient.name);
            this.showNotification(`Начата консультация: ${patient.name}`, 'success', 3000);

        } catch (error) {
            console.error('Ошибка создания активной консультации:', error);
            this.logError('Create Active Consultation Error', error);
            this.showErrorMessage('Ошибка создания консультации');
        }
    }

    // ИСПРАВЛЕНО: Переключение к карте пациента (НЕ к консультации)
    switchToPatientCard(patientId) {
        try {
            const consultation = this.activeConsultations.get(patientId);
            if (!consultation) {
                console.error('Активная консультация не найдена:', patientId);
                return;
            }

            this.currentActivePatientId = patientId;
            this.currentPatient = consultation.patient;
            this.currentConsultation = consultation;

            // Обновляем панель (выделяем активную)
            this.updateActiveConsultationsPanel();

            // ИСПРАВЛЕНО: Показываем карту пациента с выделенной консультацией
            this.showPatientCardWithActiveConsultation(consultation.patient);

            console.log('🔄 Переключение к карте пациента:', consultation.patient.name);

        } catch (error) {
            console.error('Ошибка переключения к карте пациента:', error);
            this.logError('Switch To Patient Card Error', error);
        }
    }

    // ИСПРАВЛЕНО: Показ карты пациента с выделенной активной консультацией
    showPatientCardWithActiveConsultation(patient) {
        try {
            // Переключаемся на вкладку расписания если не там
            if (this.currentTab !== 'schedule') {
                this.switchToTab('schedule');
            }

            // Получаем контейнер расписания
            const scheduleContent = document.getElementById('scheduleContent');
            if (!scheduleContent) return;

            // Скрываем обычное расписание
            const scheduleGrid = scheduleContent.querySelector('.schedule-grid-container');
            if (scheduleGrid) {
                scheduleGrid.style.display = 'none';
            }

            // Создаем или показываем контейнер карты пациента
            let patientCardContainer = scheduleContent.querySelector('.patient-card-container');
            if (!patientCardContainer) {
                patientCardContainer = document.createElement('div');
                patientCardContainer.className = 'patient-card-container';
                scheduleContent.appendChild(patientCardContainer);
            }

            // ПРЕМИУМ: Загружаем карту пациента с медицинским дизайном
            patientCardContainer.innerHTML = this.getPatientCardWithActiveConsultationHTML(patient);
            patientCardContainer.style.display = 'block';

            console.log('👤 Показана карта пациента с активной консультацией');

        } catch (error) {
            console.error('Ошибка показа карты пациента:', error);
            this.logError('Show Patient Card Error', error);
        }
    }

    // ПРЕМИУМ: HTML карты пациента с медицинским дизайном
    getPatientCardWithActiveConsultationHTML(patient) {
        const activeConsultation = this.activeConsultations.get(patient.id);
        const consultations = patient.consultations || [];
        
        return `
            <div class="patient-card-wrapper-premium">
                <!-- ПРЕМИУМ: Навигация с медицинским дизайном -->
                <div class="patient-card-navigation-premium">
                    <button class="btn-nav-premium btn-nav-back" onclick="app.backToSchedule()">
                        <i class="fas fa-arrow-left"></i>
                        <span>Назад к расписанию</span>
                    </button>
                    <div class="patient-card-breadcrumb-premium">
                        <span class="breadcrumb-item-premium" onclick="app.backToSchedule()">
                            <i class="fas fa-calendar-alt"></i>
                            Расписание
                        </span>
                        <i class="fas fa-chevron-right breadcrumb-separator"></i>
                        <span class="breadcrumb-item-premium active">
                            <i class="fas fa-user-md"></i>
                            Карта пациента
                        </span>
                    </div>
                </div>

                <!-- ПРЕМИУМ: Заголовок карты пациента -->
                <div class="patient-card-header-premium">
                    <div class="patient-info-section-premium">
                        <div class="patient-avatar-premium-large">
                            <span class="patient-initials-premium-large">${this.getPatientInitials(patient)}</span>
                            <div class="patient-status-indicator ${activeConsultation ? 'active' : 'inactive'}"></div>
                        </div>
                        <div class="patient-details-premium">
                            <h2 class="patient-name-premium-main">${this.getPatientDisplayName(patient)}</h2>
                            <div class="patient-meta-premium">
                                <div class="patient-meta-item">
                                    <i class="fas fa-birthday-cake"></i>
                                    <span>${this.getPatientAge(patient)} лет</span>
                                </div>
                                <div class="patient-meta-item">
                                    <i class="fas fa-venus-mars"></i>
                                    <span>${this.getPatientGender(patient)}</span>
                                </div>
                                <div class="patient-meta-item">
                                    <i class="fas fa-phone"></i>
                                    <span>${patient.phone || patient.personalInfo?.phone || 'Не указан'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="patient-actions-premium">
                        ${activeConsultation ? `
                            <button class="btn-premium btn-premium-warning" onclick="app.continueActiveConsultation('${patient.id}')">
                                <i class="fas fa-edit"></i>
                                <span>Продолжить консультацию</span>
                                <div class="btn-glow"></div>
                            </button>
                        ` : `
                            <button class="btn-premium btn-premium-primary" onclick="app.startNewConsultation('${patient.id}')">
                                <i class="fas fa-plus-circle"></i>
                                <span>Новая консультация</span>
                                <div class="btn-glow"></div>
                            </button>
                        `}
                        <button class="btn-premium btn-premium-info" onclick="app.exportPatientData('${patient.id}')">
                            <i class="fas fa-download"></i>
                            <span>Экспорт данных</span>
                        </button>
                    </div>
                </div>

                <!-- ПРЕМИУМ: Консультации пациента -->
                <div class="patient-consultations-section-premium">
                    <div class="consultations-header-premium">
                        <h4 class="consultations-title">
                            <i class="fas fa-history"></i>
                            История консультаций
                        </h4>
                        <span class="consultations-count-badge">
                            ${consultations.length + (activeConsultation ? 1 : 0)} записей
                        </span>
                    </div>

                    <div class="consultations-list-premium">
                        ${activeConsultation ? `
                            <!-- ВЫДЕЛЕННАЯ АКТИВНАЯ КОНСУЛЬТАЦИЯ -->
                            <div class="consultation-item-premium active-consultation-highlight">
                                <div class="consultation-status-badge-premium active">
                                    <i class="fas fa-edit"></i>
                                    <span>В работе</span>
                                    <div class="status-pulse"></div>
                                </div>
                                <div class="consultation-content-premium">
                                    <div class="consultation-header-row-premium">
                                        <div class="consultation-date-time-premium">
                                            <i class="fas fa-clock"></i>
                                            <span class="consultation-date">${this.formatDateTime(activeConsultation.startTime)}</span>
                                            <span class="consultation-duration-premium">(${this.getTimeElapsed(activeConsultation.startTime)})</span>
                                        </div>
                                        <div class="consultation-type-premium">
                                            <span class="type-badge-premium active">Активная консультация</span>
                                        </div>
                                    </div>
                                    <div class="consultation-details-premium">
                                        <div class="consultation-detail-item-premium">
                                            <i class="fas fa-info-circle"></i>
                                            <strong>Статус:</strong> 
                                            <span class="status-text active">В процессе работы</span>
                                        </div>
                                        <div class="consultation-detail-item-premium">
                                            <i class="fas fa-user-md"></i>
                                            <strong>Сеанс:</strong> 
                                            <span>Текущий активный сеанс</span>
                                        </div>
                                    </div>
                                    <div class="consultation-actions-premium">
                                        <button class="btn-consultation-premium btn-consultation-continue" onclick="app.continueActiveConsultation('${patient.id}')">
                                            <i class="fas fa-edit"></i>
                                            Продолжить
                                        </button>
                                        <button class="btn-consultation-premium btn-consultation-complete" onclick="app.completeActiveConsultation('${patient.id}')">
                                            <i class="fas fa-check"></i>
                                            Завершить
                                        </button>
                                        <button class="btn-consultation-premium btn-consultation-cancel" onclick="app.promptCloseConsultation('${patient.id}')">
                                            <i class="fas fa-times"></i>
                                            Отменить
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ` : ''}

                        ${consultations.length > 0 ? consultations.map((consultation, index) => `
                            <div class="consultation-item-premium">
                                <div class="consultation-status-badge-premium completed">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Завершена</span>
                                </div>
                                <div class="consultation-content-premium">
                                    <div class="consultation-header-row-premium">
                                        <div class="consultation-date-time-premium">
                                            <i class="fas fa-calendar"></i>
                                            <span class="consultation-date">${this.formatDateTime(consultation.date)}</span>
                                        </div>
                                        <div class="consultation-type-premium">
                                            <span class="type-badge-premium ${consultation.appointmentType || 'primary'}">
                                                ${this.getAppointmentTypeText(consultation.appointmentType)}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="consultation-details-premium">
                                        <div class="consultation-detail-item-premium">
                                            <i class="fas fa-comment-medical"></i>
                                            <strong>Жалобы:</strong> 
                                            <span>${consultation.complaints || 'Не указаны'}</span>
                                        </div>
                                        <div class="consultation-detail-item-premium">
                                            <i class="fas fa-diagnoses"></i>
                                            <strong>Диагноз:</strong> 
                                            <span>${consultation.mainDiagnosis || 'Не указан'}</span>
                                        </div>
                                    </div>
                                    <div class="consultation-actions-premium">
                                        <button class="btn-consultation-premium btn-consultation-view" onclick="app.viewConsultationDetails('${consultation.id}')">
                                            <i class="fas fa-eye"></i>
                                            Подробнее
                                        </button>
                                        <button class="btn-consultation-premium btn-consultation-copy" onclick="app.copyConsultation('${consultation.id}')">
                                            <i class="fas fa-copy"></i>
                                            Копировать
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('') : `
                            <div class="no-consultations-premium">
                                <div class="no-consultations-icon-premium">
                                    <i class="fas fa-clipboard-list"></i>
                                </div>
                                <div class="no-consultations-text-premium">
                                    <h5>История консультаций пуста</h5>
                                    <p>После завершения консультации она появится здесь</p>
                                    <small class="text-muted">Все прошлые записи будут доступны для просмотра и анализа</small>
                                </div>
                            </div>
                        `}
                    </div>
                </div>
            </div>

            <style>
            /* ПРЕМИУМ: Стили карты пациента с медицинским дизайном */
            .patient-card-wrapper-premium {
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.08);
                overflow: hidden;
                border: 1px solid #e2e8f0;
            }

            .patient-card-navigation-premium {
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                padding: 1rem 2rem;
                border-bottom: 1px solid #e2e8f0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .btn-nav-premium {
                background: linear-gradient(135deg, var(--primary-color) 0%, #246185 100%);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 10px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(46, 134, 171, 0.3);
            }

            .btn-nav-premium:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(46, 134, 171, 0.4);
            }

            .patient-card-breadcrumb-premium {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.9rem;
            }

            .breadcrumb-item-premium {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                color: #6c757d;
                cursor: pointer;
                padding: 0.25rem 0.5rem;
                border-radius: 6px;
                transition: all 0.2s ease;
            }

            .breadcrumb-item-premium:hover {
                background: rgba(46, 134, 171, 0.1);
                color: var(--primary-color);
            }

            .breadcrumb-item-premium.active {
                color: var(--primary-color);
                font-weight: 600;
            }

            .breadcrumb-separator {
                color: #cbd5e0;
                font-size: 0.7rem;
            }

            .patient-card-header-premium {
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                padding: 2rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #e2e8f0;
            }

            .patient-info-section-premium {
                display: flex;
                align-items: center;
                gap: 1.5rem;
            }

            .patient-avatar-premium-large {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, var(--primary-color), #246185);
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                box-shadow: 0 8px 24px rgba(46, 134, 171, 0.3);
            }

            .patient-initials-premium-large {
                color: white;
                font-size: 1.8rem;
                font-weight: 700;
            }

            .patient-status-indicator {
                position: absolute;
                bottom: -4px;
                right: -4px;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            }

            .patient-status-indicator.active {
                background: #22c55e;
                animation: pulse-indicator 2s infinite;
            }

            .patient-status-indicator.inactive {
                background: #94a3b8;
            }

            @keyframes pulse-indicator {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.8; }
                100% { transform: scale(1); opacity: 1; }
            }

            .patient-details-premium {
                flex: 1;
            }

            .patient-name-premium-main {
                font-size: 1.8rem;
                font-weight: 700;
                color: #1a202c;
                margin: 0 0 0.75rem 0;
                line-height: 1.2;
            }

            .patient-meta-premium {
                display: flex;
                gap: 1.5rem;
                flex-wrap: wrap;
            }

            .patient-meta-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: #6c757d;
                font-size: 0.95rem;
                font-weight: 500;
            }

            .patient-meta-item i {
                color: var(--primary-color);
                width: 16px;
            }

            .patient-actions-premium {
                display: flex;
                gap: 1rem;
                flex-direction: column;
            }

            .btn-premium {
                padding: 0.875rem 1.5rem;
                border: none;
                border-radius: 12px;
                font-weight: 600;
                font-size: 0.95rem;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
                min-width: 180px;
            }

            .btn-premium-primary {
                background: linear-gradient(135deg, var(--primary-color) 0%, #246185 100%);
                color: white;
                box-shadow: 0 4px 15px rgba(46, 134, 171, 0.3);
            }

            .btn-premium-warning {
                background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
                color: white;
                box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);
            }

            .btn-premium-info {
                background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
                color: white;
                box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
            }

            .btn-premium:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 25px rgba(0,0,0,0.2);
            }

            .btn-glow {
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                transition: left 0.6s ease;
            }

            .btn-premium:hover .btn-glow {
                left: 100%;
            }

            .patient-consultations-section-premium {
                padding: 2rem;
            }

            .consultations-header-premium {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 2px solid #e2e8f0;
            }

            .consultations-title {
                color: #1a202c;
                font-size: 1.3rem;
                font-weight: 700;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .consultations-title i {
                color: var(--primary-color);
            }

            .consultations-count-badge {
                background: linear-gradient(135deg, var(--primary-color), #246185);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 600;
                box-shadow: 0 2px 8px rgba(46, 134, 171, 0.3);
            }

            .consultations-list-premium {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .consultation-item-premium {
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                border: 2px solid #e2e8f0;
                border-radius: 12px;
                overflow: hidden;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }

            .consultation-item-premium:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                border-color: var(--primary-color);
            }

            .consultation-item-premium.active-consultation-highlight {
                border-color: #f39c12;
                background: linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%);
                box-shadow: 0 4px 20px rgba(243, 156, 18, 0.2);
                position: relative;
            }

            .consultation-item-premium.active-consultation-highlight::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #f39c12, #e67e22);
            }

            .consultation-status-badge-premium {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                border-radius: 0 0 12px 0;
                font-size: 0.8rem;
                font-weight: 600;
                position: relative;
            }

            .consultation-status-badge-premium.active {
                background: linear-gradient(135deg, #f39c12, #e67e22);
                color: white;
            }

            .consultation-status-badge-premium.completed {
                background: linear-gradient(135deg, #22c55e, #16a085);
                color: white;
            }

            .status-pulse {
                position: absolute;
                top: 50%;
                right: 8px;
                transform: translateY(-50%);
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
                animation: pulse-status 1.5s infinite;
            }

            .consultation-content-premium {
                padding: 1.5rem;
            }

            .consultation-header-row-premium {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }

            .consultation-date-time-premium {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: #6c757d;
                font-weight: 500;
            }

            .consultation-date-time-premium i {
                color: var(--primary-color);
            }

            .consultation-duration-premium {
                color: #f39c12;
                font-weight: 600;
                font-size: 0.9rem;
            }

            .type-badge-premium {
                padding: 0.25rem 0.75rem;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 600;
                color: white;
            }

            .type-badge-premium.active {
                background: linear-gradient(135deg, #f39c12, #e67e22);
            }

            .type-badge-premium.primary {
                background: linear-gradient(135deg, #3498db, #2980b9);
            }

            .type-badge-premium.secondary {
                background: linear-gradient(135deg, #9b59b6, #8e44ad);
            }

            .consultation-details-premium {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                margin-bottom: 1.5rem;
            }

            .consultation-detail-item-premium {
                display: flex;
                align-items: flex-start;
                gap: 0.5rem;
                font-size: 0.9rem;
                line-height: 1.4;
            }

            .consultation-detail-item-premium i {
                color: var(--primary-color);
                width: 16px;
                margin-top: 0.1rem;
                flex-shrink: 0;
            }

            .consultation-detail-item-premium strong {
                color: #1a202c;
                margin-right: 0.5rem;
            }

            .status-text.active {
                color: #f39c12;
                font-weight: 600;
            }

            .consultation-actions-premium {
                display: flex;
                gap: 0.75rem;
                flex-wrap: wrap;
            }

            .btn-consultation-premium {
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 8px;
                font-size: 0.85rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }

            .btn-consultation-continue {
                background: linear-gradient(135deg, #f39c12, #e67e22);
                color: white;
            }

            .btn-consultation-complete {
                background: linear-gradient(135deg, #22c55e, #16a085);
                color: white;
            }

            .btn-consultation-cancel {
                background: linear-gradient(135deg, #e74c3c, #c0392b);
                color: white;
            }

            .btn-consultation-view {
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white;
            }

            .btn-consultation-copy {
                background: linear-gradient(135deg, #6c757d, #5a6268);
                color: white;
            }

            .btn-consultation-premium:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }

            .no-consultations-premium {
                text-align: center;
                padding: 3rem 2rem;
                color: #6c757d;
            }

            .no-consultations-icon-premium {
                font-size: 3rem;
                color: #cbd5e0;
                margin-bottom: 1rem;
            }

            .no-consultations-text-premium h5 {
                color: #495057;
                font-weight: 600;
                margin-bottom: 0.5rem;
            }

            .no-consultations-text-premium p {
                margin-bottom: 0.5rem;
            }

            /* Адаптивность */
            @media (max-width: 768px) {
                .patient-card-header-premium {
                    flex-direction: column;
                    gap: 1.5rem;
                    text-align: center;
                }

                .patient-actions-premium {
                    flex-direction: row;
                    width: 100%;
                }

                .btn-premium {
                    min-width: auto;
                    flex: 1;
                }

                .consultation-header-row-premium {
                    flex-direction: column;
                    gap: 0.5rem;
                    align-items: flex-start;
                }

                .consultation-actions-premium {
                    justify-content: center;
                }
            }
            </style>
        `;
    }

    // === ПОЛНЫЕ МЕТОДЫ ДЛЯ "МОИ ПАЦИЕНТЫ" ===

    // ПОЛНЫЙ МЕТОД: Загрузка списка "Мои пациенты"
    async loadMyPatients() {
        try {
            console.log('📂 Загрузка списка "Мои пациенты"...');
            
            // Проверяем кэш
            const cacheKey = `my_patients_${this.doctorId}`;
            const cachedData = this.cache.get(cacheKey);
            
            if (cachedData && (Date.now() - cachedData.timestamp < 300000)) { // 5 минут кэш
                this.myPatients = cachedData.data;
                console.log('📄 Данные загружены из кэша:', this.myPatients.length);
                return;
            }
            
            // Загружаем из IndexedDB если доступно
            if (typeof storageManager !== 'undefined' && storageManager && storageManager.isInitialized) {
                try {
                    const patients = await storageManager.getAllPatients();
                    // Фильтруем только пациентов этого доктора с завершенными консультациями
                    this.myPatients = patients.filter(patient => 
                        patient.consultations && 
                        patient.consultations.length > 0 &&
                        patient.consultations.some(c => c.doctorId === this.doctorId || !c.doctorId)
                    );
                } catch (error) {
                    console.warn('Ошибка загрузки из IndexedDB:', error);
                    this.myPatients = [];
                }
            } else {
                // Загружаем из localStorage как fallback
                const savedPatients = localStorage.getItem(`cardio_my_patients_${this.doctorId}`);
                this.myPatients = savedPatients ? JSON.parse(savedPatients) : [];
            }
            
            // Обновляем кэш
            this.cache.set(cacheKey, {
                data: this.myPatients,
                timestamp: Date.now()
            });
            
            console.log('✅ Загружено пациентов:', this.myPatients.length);
            
        } catch (error) {
            console.error('Ошибка загрузки списка пациентов:', error);
            this.logError('Load My Patients Error', error);
            this.myPatients = [];
        }
    }

    // ПОЛНЫЙ МЕТОД: Обновление списка пациентов в интерфейсе
    async updateMyPatientsList() {
        try {
            const listContainer = document.getElementById('myPatientsList');
            if (!listContainer) return;
            
            // Показываем индикатор загрузки
            listContainer.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Обновление...</span>
                    </div>
                    <p class="mt-3">Обновление списка пациентов...</p>
                </div>
            `;
            
            // Фильтруем и сортируем пациентов
            let filteredPatients = [...this.myPatients];
            
            // Применяем поисковый фильтр
            if (this.myPatientsSearchQuery.trim() !== '') {
                const query = this.myPatientsSearchQuery.toLowerCase().trim();
                filteredPatients = filteredPatients.filter(patient => {
                    const name = this.getPatientDisplayName(patient).toLowerCase();
                    const consultations = patient.consultations || [];
                    
                    return name.includes(query) || 
                           consultations.some(c => 
                               (c.complaints && c.complaints.toLowerCase().includes(query)) ||
                               (c.mainDiagnosis && c.mainDiagnosis.toLowerCase().includes(query)) ||
                               (c.date && c.date.includes(query))
                           );
                });
            }
            
            // Применяем типовой фильтр
            switch (this.myPatientsFilterType) {
                case 'starred':
                    filteredPatients = filteredPatients.filter(p => this.starredPatients.has(p.id));
                    break;
                case 'name':
                    filteredPatients.sort((a, b) => 
                        this.getPatientDisplayName(a).localeCompare(this.getPatientDisplayName(b))
                    );
                    break;
                case 'date':
                    filteredPatients.sort((a, b) => 
                        new Date(b.lastConsultationDate || 0) - new Date(a.lastConsultationDate || 0)
                    );
                    break;
                case 'diagnosis':
                    filteredPatients.sort((a, b) => {
                        const getDiagnosis = (p) => p.consultations?.[0]?.mainDiagnosis || '';
                        return getDiagnosis(a).localeCompare(getDiagnosis(b));
                    });
                    break;
            }
            
            // Обновляем статистику
            this.updateMyPatientsStats(filteredPatients);
            
            // Отображаем список
            if (filteredPatients.length === 0) {
                listContainer.innerHTML = this.getNoPatientFoundHTML();
            } else {
                const patientsHTML = filteredPatients.map(patient => 
                    this.getPatientCardHTML(patient)
                ).join('');
                
                listContainer.innerHTML = patientsHTML;
            }
            
            console.log('📋 Список пациентов обновлен:', filteredPatients.length);
            
        } catch (error) {
            console.error('Ошибка обновления списка пациентов:', error);
            this.logError('Update Patients List Error', error);
            
            const listContainer = document.getElementById('myPatientsList');
            if (listContainer) {
                listContainer.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle"></i>
                        Ошибка загрузки списка пациентов. Попробуйте обновить страницу.
                    </div>
                `;
            }
        }
    }

    // ПОЛНЫЙ МЕТОД: Обновление статистики
    updateMyPatientsStats(filteredPatients = null) {
        try {
            const patients = filteredPatients || this.myPatients;
            const now = new Date();
            const today = now.toDateString();
            const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            
            // Подсчитываем статистику
            const totalCount = patients.length;
            const starredCount = patients.filter(p => this.starredPatients.has(p.id)).length;
            const todayCount = patients.filter(p => {
                const lastDate = p.lastConsultationDate ? new Date(p.lastConsultationDate).toDateString() : null;
                return lastDate === today;
            }).length;
            const thisMonthCount = patients.filter(p => {
                const lastDate = p.lastConsultationDate ? p.lastConsultationDate.substring(0, 7) : null;
                return lastDate === thisMonth;
            }).length;
            
            // Обновляем элементы интерфейса
            const updateElement = (id, value) => {
                const element = document.getElementById(id);
                if (element) element.textContent = value;
            };
            
            updateElement('totalPatientsCount', totalCount);
            updateElement('starredPatientsCount', starredCount);
            updateElement('todayCount', todayCount);
            updateElement('thisMonthCount', thisMonthCount);
            
        } catch (error) {
            console.error('Ошибка обновления статистики:', error);
            this.logError('Update Stats Error', error);
        }
    }

    // ПОЛНЫЙ МЕТОД: Поиск по пациентам
    searchMyPatients(query) {
        try {
            // Дебаунс для избежания частых поисков
            const debounceKey = 'myPatientsSearch';
            if (this.debounceTimers.has(debounceKey)) {
                clearTimeout(this.debounceTimers.get(debounceKey));
            }
            
            this.debounceTimers.set(debounceKey, setTimeout(() => {
                this.myPatientsSearchQuery = query || '';
                this.updateMyPatientsList();
            }, 300));
            
        } catch (error) {
            console.error('Ошибка поиска пациентов:', error);
            this.logError('Search Patients Error', error);
        }
    }

    // ПОЛНЫЙ МЕТОД: Очистка поиска
    clearMyPatientsSearch() {
        try {
            const searchInput = document.getElementById('myPatientsSearch');
            if (searchInput) {
                searchInput.value = '';
            }
            this.myPatientsSearchQuery = '';
            this.updateMyPatientsList();
        } catch (error) {
            console.error('Ошибка очистки поиска:', error);
            this.logError('Clear Search Error', error);
        }
    }

    // ПОЛНЫЙ МЕТОД: Фильтрация пациентов
    filterMyPatients(filterType) {
        try {
            this.myPatientsFilterType = filterType || 'all';
            this.updateMyPatientsList();
            console.log('🔍 Применен фильтр:', filterType);
        } catch (error) {
            console.error('Ошибка фильтрации пациентов:', error);
            this.logError('Filter Patients Error', error);
        }
    }

    // ПОЛНЫЙ МЕТОД: Переключение избранного статуса пациента
    togglePatientStar(patientId) {
        try {
            if (this.starredPatients.has(patientId)) {
                this.starredPatients.delete(patientId);
            } else {
                this.starredPatients.add(patientId);
            }
            
            // Сохраняем изменения
            this.saveStarredPatients();
            
            // Обновляем интерфейс
            this.updateMyPatientsList();
            
            const isStarred = this.starredPatients.has(patientId);
            this.showNotification(
                isStarred ? 'Пациент добавлен в избранные' : 'Пациент удален из избранных', 
                'success', 
                2000
            );
            
        } catch (error) {
            console.error('Ошибка переключения избранного:', error);
            this.logError('Toggle Star Error', error);
        }
    }

    // ПОЛНЫЙ МЕТОД: Открытие карты пациента из "Мои пациенты"
    openPatientFromMyPatients(patientId) {
        try {
            console.log('👤 Открытие карты пациента из "Мои пациенты":', patientId);
            
            const patient = this.myPatients.find(p => p.id === patientId);
            if (!patient) {
                this.showErrorMessage('Пациент не найден');
                return;
            }
            
            this.currentPatient = patient;
            this.currentView = 'patient-card';
            this.previousView = 'list';
            
            // Показываем карту пациента
            this.showPatientCard(patient);
            
        } catch (error) {
            console.error('Ошибка открытия карты пациента:', error);
            this.logError('Open Patient Card Error', error);
            this.showErrorMessage('Ошибка открытия карты пациента');
        }
    }

    // ПОЛНЫЙ МЕТОД: Возврат к списку пациентов
    backToPatientsList() {
        try {
            this.currentView = 'list';
            this.currentPatient = null;
            this.previousView = null;
            
            // Показываем список
            const listView = document.getElementById('myPatientsListView');
            const cardView = document.getElementById('myPatientsCardView');
            
            if (listView) listView.style.display = 'block';
            if (cardView) cardView.style.display = 'none';
            
            // Обновляем список
            this.updateMyPatientsList();
            
        } catch (error) {
            console.error('Ошибка возврата к списку:', error);
            this.logError('Back To List Error', error);
        }
    }

    // ПОЛНЫЙ МЕТОД: Активация вкладки "Мои пациенты"
    async onMyPatientsTabActivate() {
        try {
            console.log('🔄 Активация вкладки "Мои пациенты"');
            
            // Загружаем данные если еще не загружены
            if (this.myPatients.length === 0) {
                await this.loadMyPatients();
            }
            
            // Обновляем интерфейс
            await this.updateMyPatientsList();
            
        } catch (error) {
            console.error('Ошибка активации вкладки "Мои пациенты":', error);
            this.logError('My Patients Tab Activate Error', error);
        }
    }

    // ПОЛНЫЙ МЕТОД: Сохранение избранных пациентов
    saveStarredPatients() {
        try {
            const starredArray = [...this.starredPatients];
            localStorage.setItem(`cardio_starred_patients_${this.doctorId}`, JSON.stringify(starredArray));
        } catch (error) {
            console.error('Ошибка сохранения избранных:', error);
            this.logError('Save Starred Error', error);
        }
    }

    // ПОЛНЫЙ МЕТОД: Загрузка избранных пациентов
    loadStarredPatients() {
        try {
            const saved = localStorage.getItem(`cardio_starred_patients_${this.doctorId}`);
            if (saved) {
                const starredArray = JSON.parse(saved);
                this.starredPatients = new Set(starredArray);
            }
        } catch (error) {
            console.error('Ошибка загрузки избранных:', error);
            this.logError('Load Starred Error', error);
            this.starredPatients = new Set();
        }
    }

    // === ПРЕМИУМ ИНТЕРФЕЙС "МОИ ПАЦИЕНТЫ" ===

    // ПРЕМИУМ: Интерфейс вкладки "Мои пациенты" с медицинским дизайном
    getMyPatientsInterface() {
        return `
            <!-- Контейнер для списка пациентов -->
            <div id="myPatientsListView" style="display: block;">
                <div class="my-patients-container-premium">
                    <!-- ПРЕМИУМ: Заголовок с медицинским дизайном -->
                    <div class="my-patients-header-premium">
                        <div class="row align-items-center">
                            <div class="col-md-6">
                                <div class="header-title-section">
                                    <div class="header-icon-premium">
                                        <i class="fas fa-users"></i>
                                    </div>
                                    <div class="header-text-premium">
                                        <h3 class="header-title-premium">Мои пациенты</h3>
                                        <p class="header-subtitle-premium">Все пациенты, которых вы консультировали</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="my-patients-stats-premium">
                                    <div class="stat-item-premium">
                                        <div class="stat-value-premium" id="totalPatientsCount">0</div>
                                        <div class="stat-label-premium">Всего пациентов</div>
                                    </div>
                                    <div class="stat-item-premium starred-stat">
                                        <div class="stat-value-premium" id="starredPatientsCount">0</div>
                                        <div class="stat-label-premium">
                                            <i class="fas fa-star text-warning"></i> Избранных
                                        </div>
                                    </div>
                                    <div class="stat-item-premium">
                                        <div class="stat-value-premium" id="thisMonthCount">0</div>
                                        <div class="stat-label-premium">В этом месяце</div>
                                    </div>
                                    <div class="stat-item-premium">
                                        <div class="stat-value-premium" id="todayCount">0</div>
                                        <div class="stat-label-premium">Сегодня</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ПРЕМИУМ: Панель поиска и фильтров -->
                    <div class="my-patients-search-panel-premium">
                        <div class="row">
                            <div class="col-md-8">
                                <div class="search-group-premium">
                                    <div class="search-input-wrapper">
                                        <div class="search-icon">
                                            <i class="fas fa-search"></i>
                                        </div>
                                        <input type="text" 
                                               class="form-control search-input-premium" 
                                               id="myPatientsSearch"
                                               placeholder="Поиск по ФИО, дате, диагнозу, ключевым словам..."
                                               onkeyup="app.searchMyPatients(this.value)">
                                        <button class="search-clear-btn" 
                                                type="button"
                                                onclick="app.clearMyPatientsSearch()">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                    <small class="search-hint">
                                        <i class="fas fa-lightbulb"></i>
                                        Начните вводить имя, дату (дд.мм.гггг) или диагноз
                                    </small>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="filter-group-premium">
                                    <label class="filter-label">
                                        <i class="fas fa-filter"></i>
                                        Фильтр по типу:
                                    </label>
                                    <select class="form-select filter-select-premium" 
                                            id="myPatientsFilter"
                                            onchange="app.filterMyPatients(this.value)">
                                        <option value="all">Все записи</option>
                                        <option value="starred">⭐ Избранные пациенты</option>
                                        <option value="name">По алфавиту (А-Я)</option>
                                        <option value="date">По дате (новые сверху)</option>
                                        <option value="diagnosis">По диагнозу</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- ПРЕМИУМ: Панель действий -->
                        <div class="action-panel-premium mt-3">
                            <button class="btn-action-premium btn-action-primary" onclick="app.exportAllPatientsData()">
                                <i class="fas fa-download"></i>
                                <span>Экспорт всех данных</span>
                            </button>
                            <button class="btn-action-premium btn-action-secondary" onclick="app.importPatientsData()">
                                <i class="fas fa-upload"></i>
                                <span>Импорт данных</span>
                            </button>
                            <button class="btn-action-premium btn-action-info" onclick="app.showStorageStats()">
                                <i class="fas fa-chart-pie"></i>
                                <span>Статистика хранилища</span>
                            </button>
                        </div>
                    </div>

                    <!-- ПРЕМИУМ: Список пациентов -->
                    <div class="my-patients-list-premium" id="myPatientsList">
                        <div class="text-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Загрузка...</span>
                            </div>
                            <p class="mt-3">Загрузка списка пациентов...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Контейнер для карты пациента (скрыт по умолчанию) -->
            <div id="myPatientsCardView" style="display: none;">
                <!-- Здесь будет отображаться карта пациента -->
            </div>

            <style>
            /* ПРЕМИУМ: Стили для вкладки "Мои пациенты" с медицинским дизайном */
            .my-patients-container-premium {
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                min-height: 600px;
            }

            .my-patients-header-premium {
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                padding: 2rem;
                border-radius: 16px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                margin-bottom: 2rem;
                border: 1px solid #e2e8f0;
                border-left: 4px solid var(--primary-color);
            }

            .header-title-section {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .header-icon-premium {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, var(--primary-color), #246185);
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1.5rem;
                box-shadow: 0 8px 24px rgba(46, 134, 171, 0.3);
            }

            .header-text-premium {
                flex: 1;
            }

            .header-title-premium {
                color: #1a202c;
                font-size: 1.8rem;
                font-weight: 700;
                margin: 0;
                line-height: 1.2;
            }

            .header-subtitle-premium {
                color: #6c757d;
                font-size: 1rem;
                margin: 0.5rem 0 0 0;
                font-weight: 500;
            }

            .my-patients-stats-premium {
                display: flex;
                gap: 1.5rem;
                justify-content: flex-end;
                flex-wrap: wrap;
            }

            .stat-item-premium {
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                border: 2px solid #e2e8f0;
                border-radius: 12px;
                padding: 1rem 1.25rem;
                text-align: center;
                min-width: 100px;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }

            .stat-item-premium:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                border-color: var(--primary-color);
            }

            .stat-item-premium.starred-stat {
                border-color: #ffc107;
                background: linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%);
            }

            .stat-value-premium {
                font-size: 1.8rem;
                font-weight: 800;
                color: var(--primary-color);
                margin-bottom: 0.25rem;
                line-height: 1;
            }

            .stat-item-premium.starred-stat .stat-value-premium {
                color: #f59e0b;
            }

            .stat-label-premium {
                font-size: 0.8rem;
                color: #6c757d;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.25rem;
            }

            .my-patients-search-panel-premium {
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                padding: 2rem;
                border-radius: 16px;
                margin-bottom: 2rem;
                border: 1px solid #e2e8f0;
                box-shadow: 0 2px 12px rgba(0,0,0,0.05);
            }

            .search-group-premium {
                position: relative;
            }

            .search-input-wrapper {
                position: relative;
                display: flex;
                align-items: center;
            }

            .search-icon {
                position: absolute;
                left: 16px;
                z-index: 3;
                color: var(--primary-color);
                font-size: 1.1rem;
            }

            .search-input-premium {
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                border: 2px solid #e2e8f0;
                border-radius: 12px;
                padding: 14px 50px 14px 50px;
                font-size: 1rem;
                font-weight: 500;
                color: #1a202c;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }

            .search-input-premium:focus {
                border-color: var(--primary-color);
                box-shadow: 0 0 0 3px rgba(46, 134, 171, 0.15);
                outline: none;
                transform: translateY(-1px);
                background: #ffffff;
            }

            .search-clear-btn {
                position: absolute;
                right: 12px;
                z-index: 3;
                background: rgba(108, 117, 125, 0.1);
                border: none;
                border-radius: 8px;
                width: 32px;
                height: 32px;
                color: #6c757d;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .search-clear-btn:hover {
                background: rgba(220, 53, 69, 0.1);
                color: #dc3545;
                transform: scale(1.1);
            }

            .search-hint {
                color: #6c757d;
                font-size: 0.85rem;
                margin-top: 0.5rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-weight: 500;
            }

            .search-hint i {
                color: #f59e0b;
            }

            .filter-group-premium {
                height: 100%;
                display: flex;
                flex-direction: column;
            }

            .filter-label {
                font-weight: 600;
                color: #1a202c;
                margin-bottom: 0.75rem;
                font-size: 0.95rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .filter-label i {
                color: var(--primary-color);
            }

            .filter-select-premium {
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                border: 2px solid #e2e8f0;
                border-radius: 12px;
                padding: 14px 16px;
                font-size: 0.95rem;
                font-weight: 500;
                color: #1a202c;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                flex: 1;
            }

            .filter-select-premium:focus {
                border-color: var(--primary-color);
                box-shadow: 0 0 0 3px rgba(46, 134, 171, 0.15);
                outline: none;
                background: #ffffff;
            }

            .action-panel-premium {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
                padding-top: 1.5rem;
                border-top: 1px solid #e2e8f0;
            }

            .btn-action-premium {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 10px;
                font-weight: 600;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                position: relative;
                overflow: hidden;
            }

            .btn-action-premium:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.15);
            }

            .btn-action-primary {
                background: linear-gradient(135deg, var(--primary-color), #246185);
                color: white;
            }

            .btn-action-secondary {
                background: linear-gradient(135deg, #6c757d, #5a6268);
                color: white;
            }

            .btn-action-info {
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white;
            }

            .my-patients-list-premium {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                gap: 1.5rem;
                padding: 1rem;
            }

            /* Адаптивность */
            @media (max-width: 1200px) {
                .my-patients-stats-premium {
                    justify-content: center;
                    margin-top: 1rem;
                }
            }

            @media (max-width: 768px) {
                .my-patients-header-premium {
                    padding: 1.5rem;
                }

                .header-title-section {
                    flex-direction: column;
                    text-align: center;
                    gap: 1rem;
                }

                .my-patients-stats-premium {
                    gap: 1rem;
                }

                .stat-item-premium {
                    min-width: 80px;
                    padding: 0.75rem 1rem;
                }

                .my-patients-search-panel-premium {
                    padding: 1.5rem;
                }

                .action-panel-premium {
                    justify-content: center;
                }

                .my-patients-list-premium {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }
            }
            </style>
        `;
    }

    // ПРЕМИУМ: HTML для карточки пациента с медицинским дизайном
    getPatientCardHTML(patient) {
        const isStarred = this.starredPatients.has(patient.id);
        const lastConsultation = patient.consultations?.[0] || {};
        const consultationsCount = patient.totalConsultations || patient.consultations?.length || 0;
        
        return `
            <div class="patient-card-premium ${isStarred ? 'starred' : ''}" onclick="app.openPatientFromMyPatients('${patient.id}')">
                <div class="patient-card-star-premium ${isStarred ? 'active' : ''}" 
                     onclick="event.stopPropagation(); app.togglePatientStar('${patient.id}')">
                    <i class="fas fa-star"></i>
                </div>
                
                <div class="patient-card-header-premium-card">
                    <div class="patient-avatar-premium-card">
                        <span class="patient-initials-premium-card">${this.getPatientInitials(patient)}</span>
                    </div>
                    <div class="patient-info-premium-card">
                        <div class="patient-name-premium-card">${this.getPatientDisplayName(patient)}</div>
                        <div class="patient-details-premium-card">
                            ${this.getPatientAge(patient)} лет, ${this.getPatientGender(patient)}
                        </div>
                    </div>
                    <div class="consultation-date-premium-card">
                        ${this.formatDate(patient.lastConsultationDate)}
                    </div>
                </div>
                
                <div class="patient-card-body-premium">
                    <div class="patient-card-item-premium">
                        <div class="item-icon-premium">
                            <i class="fas fa-clipboard-list"></i>
                        </div>
                        <div class="item-content-premium">
                            <div class="item-label-premium">Консультаций</div>
                            <div class="item-value-premium">${consultationsCount}</div>
                        </div>
                    </div>
                    
                    <div class="patient-card-item-premium">
                        <div class="item-icon-premium">
                            <i class="fas fa-diagnoses"></i>
                        </div>
                        <div class="item-content-premium">
                            <div class="item-label-premium">Последний диагноз</div>
                            <div class="item-value-premium">${lastConsultation.mainDiagnosis || 'Не указан'}</div>
                        </div>
                    </div>
                    
                    <div class="patient-card-item-premium">
                        <div class="item-icon-premium">
                            <i class="fas fa-phone"></i>
                        </div>
                        <div class="item-content-premium">
                            <div class="item-label-premium">Телефон</div>
                            <div class="item-value-premium">${patient.phone || patient.personalInfo?.phone || 'Не указан'}</div>
                        </div>
                    </div>
                    
                    <div class="patient-card-item-premium">
                        <div class="item-icon-premium">
                            <i class="fas fa-birthday-cake"></i>
                        </div>
                        <div class="item-content-premium">
                            <div class="item-label-premium">Дата рождения</div>
                            <div class="item-value-premium">${this.formatDate(patient.birthDate || patient.personalInfo?.birthDate)}</div>
                        </div>
                    </div>
                </div>
                
                <div class="patient-card-actions-premium">
                    <button class="btn-card-action-premium btn-card-consultation" onclick="event.stopPropagation(); app.createActiveConsultation(app.myPatients.find(p => p.id === '${patient.id}'))">
                        <i class="fas fa-user-md"></i>
                        <span>Консультация</span>
                    </button>
                    <button class="btn-card-action-premium btn-card-history" onclick="event.stopPropagation(); app.viewPatientHistory('${patient.id}')">
                        <i class="fas fa-history"></i>
                        <span>История</span>
                    </button>
                    <button class="btn-card-action-premium btn-card-view" onclick="event.stopPropagation(); app.openPatientFromMyPatients('${patient.id}')">
                        <i class="fas fa-eye"></i>
                        <span>Карта</span>
                    </button>
                </div>
            </div>

            <style>
            /* ПРЕМИУМ: Стили карточек пациентов */
            .patient-card-premium {
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                border: 2px solid #e2e8f0;
                border-radius: 16px;
                padding: 1.5rem;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                border-left: 4px solid var(--primary-color);
            }

            .patient-card-premium:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 32px rgba(0,0,0,0.12);
                border-color: var(--primary-color);
                border-left-width: 6px;
            }

            .patient-card-premium.starred {
                border-left-color: #f59e0b;
                background: linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%);
            }

            .patient-card-premium::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, var(--primary-color), transparent);
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .patient-card-premium:hover::before {
                opacity: 1;
            }

            .patient-card-star-premium {
                position: absolute;
                top: 12px;
                right: 12px;
                width: 36px;
                height: 36px;
                background: rgba(255,255,255,0.9);
                border: 2px solid #e2e8f0;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
                z-index: 2;
            }

            .patient-card-star-premium:hover {
                background: rgba(245, 158, 11, 0.1);
                border-color: #f59e0b;
                transform: scale(1.1);
            }

            .patient-card-star-premium.active {
                background: linear-gradient(135deg, #f59e0b, #d97706);
                border-color: #f59e0b;
                color: white;
                box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
            }

            .patient-card-star-premium i {
                font-size: 0.9rem;
                color: #6c757d;
                transition: all 0.3s ease;
            }

            .patient-card-star-premium.active i {
                color: white;
                transform: scale(1.1);
            }

            .patient-card-header-premium-card {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1.5rem;
                padding-right: 3rem;
            }

            .patient-avatar-premium-card {
                width: 56px;
                height: 56px;
                background: linear-gradient(135deg, var(--primary-color), #246185);
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                box-shadow: 0 6px 18px rgba(46, 134, 171, 0.3);
            }

            .patient-initials-premium-card {
                color: white;
                font-size: 1.1rem;
                font-weight: 700;
            }

            .patient-info-premium-card {
                flex: 1;
                min-width: 0;
            }

            .patient-name-premium-card {
                font-size: 1.1rem;
                font-weight: 700;
                color: #1a202c;
                margin-bottom: 0.25rem;
                line-height: 1.2;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .patient-details-premium-card {
                font-size: 0.85rem;
                color: #6c757d;
                font-weight: 500;
            }

            .consultation-date-premium-card {
                font-size: 0.8rem;
                color: var(--primary-color);
                font-weight: 600;
                background: rgba(46, 134, 171, 0.1);
                padding: 0.25rem 0.5rem;
                border-radius: 6px;
            }

            .patient-card-body-premium {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .patient-card-item-premium {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem;
                background: rgba(248, 250, 252, 0.8);
                border-radius: 10px;
                transition: all 0.2s ease;
            }

            .patient-card-item-premium:hover {
                background: rgba(46, 134, 171, 0.05);
            }

            .item-icon-premium {
                width: 36px;
                height: 36px;
                background: linear-gradient(135deg, var(--primary-color), #246185);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 0.9rem;
                flex-shrink: 0;
            }

            .item-content-premium {
                flex: 1;
                min-width: 0;
            }

            .item-label-premium {
                font-size: 0.75rem;
                color: #6c757d;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 0.25rem;
            }

            .item-value-premium {
                font-size: 0.9rem;
                color: #1a202c;
                font-weight: 600;
                line-height: 1.2;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .patient-card-actions-premium {
                display: flex;
                gap: 0.5rem;
            }

            .btn-card-action-premium {
                flex: 1;
                padding: 0.75rem 0.5rem;
                border: none;
                border-radius: 10px;
                font-weight: 600;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.25rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }

            .btn-card-action-premium:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }

            .btn-card-consultation {
                background: linear-gradient(135deg, var(--primary-color), #246185);
                color: white;
            }

            .btn-card-history {
                background: linear-gradient(135deg, #22c55e, #16a085);
                color: white;
            }

            .btn-card-view {
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white;
            }

            .btn-card-action-premium i {
                font-size: 1rem;
            }

            .btn-card-action-premium span {
                font-size: 0.75rem;
            }

            @media (max-width: 768px) {
                .patient-card-premium {
                    padding: 1rem;
                }

                .patient-card-header-premium-card {
                    padding-right: 2.5rem;
                }

                .patient-avatar-premium-card {
                    width: 48px;
                    height: 48px;
                }

                .btn-card-action-premium {
                    padding: 0.5rem 0.25rem;
                }

                .btn-card-action-premium span {
                    font-size: 0.7rem;
                }
            }
            </style>
        `;
    }

    // HTML когда пациенты не найдены
    getNoPatientFoundHTML() {
        return `
            <div class="no-patients-found-premium">
                <div class="no-patients-icon-premium">
                    <i class="fas fa-user-friends"></i>
                </div>
                <div class="no-patients-content-premium">
                    <h5 class="no-patients-title">Пациенты не найдены</h5>
                    <p class="no-patients-text">Попробуйте изменить параметры поиска или добавьте новых пациентов через консультации.</p>
                    <button class="btn-no-patients-action" onclick="app.switchToTab('schedule')">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Перейти к расписанию</span>
                    </button>
                </div>
            </div>

            <style>
            .no-patients-found-premium {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 4rem 2rem;
                text-align: center;
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                border-radius: 16px;
                border: 2px dashed #cbd5e0;
                margin: 2rem 0;
            }

            .no-patients-icon-premium {
                font-size: 4rem;
                color: #cbd5e0;
                margin-bottom: 1.5rem;
            }

            .no-patients-content-premium {
                max-width: 400px;
            }

            .no-patients-title {
                color: #1a202c;
                font-weight: 700;
                font-size: 1.3rem;
                margin-bottom: 1rem;
            }

            .no-patients-text {
                color: #6c757d;
                font-size: 1rem;
                margin-bottom: 2rem;
                line-height: 1.5;
            }

            .btn-no-patients-action {
                background: linear-gradient(135deg, var(--primary-color), #246185);
                color: white;
                border: none;
                padding: 1rem 2rem;
                border-radius: 12px;
                font-weight: 600;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                box-shadow: 0 4px 15px rgba(46, 134, 171, 0.3);
            }

            .btn-no-patients-action:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 25px rgba(46, 134, 171, 0.4);
            }
            </style>
        `;
    }

    // === ИСПРАВЛЕНО: ЛОГИКА ОТКРЫТИЯ ПАЦИЕНТОВ ===

    // ИСПРАВЛЕНО: Открытие пациента из расписания - показывает карту пациента
    async openPatientFromSchedule(patientId, appointmentId = null) {
        try {
            console.log(`🔓 Открытие карты пациента из расписания: ${patientId}, запись: ${appointmentId}`);
            
            this.showLoading();
            
            // Получаем данные пациента
            let patient = await this.getPatientData(patientId);
            
            if (!patient) {
                this.showErrorMessage('Пациент не найден');
                console.error(`❌ Пациент с ID ${patientId} не найден`);
                return;
            }

            // ИСПРАВЛЕНО: Создаем активную консультацию
            this.createActiveConsultation(patient, appointmentId);

            console.log('📋 Создана активная консультация из расписания:', patient);
        } catch (error) {
            console.error('Ошибка открытия карты пациента:', error);
            this.logError('Open Patient From Schedule Error', error);
            this.showErrorMessage('Ошибка открытия карты пациента');
        } finally {
            this.hideLoading();
        }
    }

    // Получение данных пациента из разных источников
    async getPatientData(patientId) {
        try {
            let patient = null;
            
            // Пытаемся получить из IndexedDB
            if (typeof storageManager !== 'undefined' && storageManager && storageManager.isInitialized) {
                patient = await storageManager.getPatient(patientId);
            }
            
            // Если не нашли в IndexedDB, ищем в других источниках
            if (!patient && typeof patientsManager !== 'undefined' && patientsManager) {
                patient = patientsManager.getPatient(patientId);
            }
            
            if (!patient && typeof testData !== 'undefined' && testData) {
                patient = testData.getPatientById(patientId);
            }

            // Если это демо-пациент из расписания
            if (!patient && typeof scheduleGridManager !== 'undefined' && scheduleGridManager) {
                patient = scheduleGridManager.getPatientById(patientId);
            }
            
            // Если это демо-пациент, создаем временный объект
            if (!patient && patientId.startsWith('demo_patient_')) {
                if (typeof scheduleGridManager !== 'undefined' && scheduleGridManager.appointments) {
                    const appointment = scheduleGridManager.appointments.find(app => app.patientId === patientId);
                    if (appointment) {
                        patient = {
                            id: patientId,
                            personalInfo: {
                                lastName: appointment.patientName.split(' ')[0] || '',
                                firstName: appointment.patientName.split(' ')[1] || '',
                                middleName: appointment.patientName.split(' ')[2] || ''
                            },
                            name: appointment.patientName,
                            birthDate: '1970-01-01',
                            gender: 'М',
                            phone: '+7 (999) 000-00-00',
                            email: 'demo@example.com',
                            consultations: []
                        };
                    }
                }
            }
            
            return patient;
        } catch (error) {
            console.error('Ошибка получения данных пациента:', error);
            this.logError('Get Patient Data Error', error);
            return null;
        }
    }

    // === ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ КОНСУЛЬТАЦИЙ ===

    // Продолжение активной консультации (переход к форме)
    continueActiveConsultation(patientId) {
        try {
            const consultation = this.activeConsultations.get(patientId);
            if (!consultation) {
                this.showErrorMessage('Активная консультация не найдена');
                return;
            }

            // Показываем форму консультации
            this.showActiveConsultationForm(consultation);

        } catch (error) {
            console.error('Ошибка продолжения консультации:', error);
            this.logError('Continue Consultation Error', error);
        }
    }

    // Показ формы активной консультации
    showActiveConsultationForm(consultation) {
        try {
            // Получаем контейнер карты пациента
            const patientCardContainer = document.querySelector('.patient-card-container');
            if (!patientCardContainer) return;

            // Скрываем карту пациента и показываем форму консультации
            patientCardContainer.innerHTML = this.getActiveConsultationFormHTML(consultation);

            // Инициализируем форму консультации
            if (typeof consultationsManager !== 'undefined' && consultationsManager.createNewConsultation) {
                consultationsManager.createNewConsultation(consultation.patient);
            }

            console.log('📋 Показана форма активной консультации');

        } catch (error) {
            console.error('Ошибка показа формы консультации:', error);
            this.logError('Show Consultation Form Error', error);
        }
    }

    // HTML формы активной консультации
    getActiveConsultationFormHTML(consultation) {
        const patient = consultation.patient;
        
        return `
            <div class="consultation-form-wrapper-premium">
                <!-- ПРЕМИУМ: Навигация -->
                <div class="consultation-form-navigation-premium">
                    <button class="btn-nav-premium" onclick="app.backToPatientCard('${patient.id}')">
                        <i class="fas fa-arrow-left"></i>
                        <span>Назад к карте</span>
                    </button>
                    <div class="consultation-form-breadcrumb-premium">
                        <span class="breadcrumb-item-premium" onclick="app.backToSchedule()">
                            <i class="fas fa-calendar-alt"></i>
                            Расписание
                        </span>
                        <i class="fas fa-chevron-right breadcrumb-separator"></i>
                        <span class="breadcrumb-item-premium" onclick="app.backToPatientCard('${patient.id}')">
                            <i class="fas fa-user"></i>
                            Карта пациента
                        </span>
                        <i class="fas fa-chevron-right breadcrumb-separator"></i>
                        <span class="breadcrumb-item-premium active">
                            <i class="fas fa-edit"></i>
                            Консультация
                        </span>
                    </div>
                </div>

                <!-- ПРЕМИУМ: Заголовок с информацией о пациенте -->
                <div class="consultation-patient-header-premium">
                    <div class="patient-info-section-consultation">
                        <div class="patient-avatar-consultation">
                            <span class="patient-initials-consultation">${this.getPatientInitials(patient)}</span>
                        </div>
                        <div class="patient-details-consultation">
                            <h3 class="patient-name-consultation">${this.getPatientDisplayName(patient)}</h3>
                            <div class="patient-meta-consultation">
                                <span class="patient-age-consultation">
                                    <i class="fas fa-birthday-cake"></i>
                                    ${this.getPatientAge(patient)} лет
                                </span>
                                <span class="patient-gender-consultation">
                                    <i class="fas fa-venus-mars"></i>
                                    ${this.getPatientGender(patient)}
                                </span>
                                <span class="consultation-duration-consultation">
                                    <i class="fas fa-clock"></i>
                                    ${this.getTimeElapsed(consultation.startTime)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="consultation-controls-premium">
                        <button class="btn-consultation-control btn-consultation-card" onclick="app.backToPatientCard('${patient.id}')" title="Вернуться к карте">
                            <i class="fas fa-user"></i>
                            <span>К карте</span>
                        </button>
                        <button class="btn-consultation-control btn-consultation-complete" onclick="app.saveAndCompleteConsultation('${patient.id}')" title="Сохранить и завершить">
                            <i class="fas fa-check"></i>
                            <span>Завершить</span>
                        </button>
                        <button class="btn-consultation-control btn-consultation-cancel" onclick="app.promptCloseConsultation('${patient.id}')" title="Отменить консультацию">
                            <i class="fas fa-times"></i>
                            <span>Отменить</span>
                        </button>
                    </div>
                </div>

                <!-- ПРЕМИУМ: Форма консультации -->
                <div class="consultation-form-container-premium">
                    ${consultationsManager ? consultationsManager.getConsultationForm() : '<div class="alert alert-warning">Форма консультации недоступна</div>'}
                </div>

                <!-- ПРЕМИУМ: Дополнительные кнопки управления -->
                <div class="consultation-form-actions-premium">
                    <button type="button" class="btn-form-action btn-form-save" onclick="app.saveConsultationDraft('${patient.id}')">
                        <i class="fas fa-save"></i>
                        <span>Сохранить черновик</span>
                    </button>
                    <button type="button" class="btn-form-action btn-form-preview" onclick="app.previewConsultation('${patient.id}')">
                        <i class="fas fa-eye"></i>
                        <span>Предварительный просмотр</span>
                    </button>
                </div>
            </div>

            <style>
            /* ПРЕМИУМ: Стили формы консультации */
            .consultation-form-wrapper-premium {
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.08);
                overflow: hidden;
                border: 1px solid #e2e8f0;
            }

            .consultation-form-navigation-premium {
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                padding: 1rem 2rem;
                border-bottom: 1px solid #e2e8f0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .consultation-form-breadcrumb-premium {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.9rem;
            }

            .consultation-patient-header-premium {
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                padding: 2rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #e2e8f0;
            }

            .patient-info-section-consultation {
                display: flex;
                align-items: center;
                gap: 1.5rem;
            }

            .patient-avatar-consultation {
                width: 72px;
                height: 72px;
                background: linear-gradient(135deg, var(--primary-color), #246185);
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 8px 24px rgba(46, 134, 171, 0.3);
            }

            .patient-initials-consultation {
                color: white;
                font-size: 1.6rem;
                font-weight: 700;
            }

            .patient-details-consultation {
                flex: 1;
            }

            .patient-name-consultation {
                font-size: 1.6rem;
                font-weight: 700;
                color: #1a202c;
                margin: 0 0 0.75rem 0;
                line-height: 1.2;
            }

            .patient-meta-consultation {
                display: flex;
                gap: 1.5rem;
                flex-wrap: wrap;
            }

            .patient-age-consultation,
            .patient-gender-consultation,
            .consultation-duration-consultation {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: #6c757d;
                font-size: 0.95rem;
                font-weight: 500;
                background: rgba(248, 250, 252, 0.8);
                padding: 0.25rem 0.75rem;
                border-radius: 12px;
            }

            .consultation-duration-consultation {
                color: #f39c12;
                background: rgba(243, 156, 18, 0.1);
                font-weight: 600;
            }

            .patient-age-consultation i,
            .patient-gender-consultation i,
            .consultation-duration-consultation i {
                color: var(--primary-color);
            }

            .consultation-controls-premium {
                display: flex;
                gap: 0.75rem;
            }

            .btn-consultation-control {
                padding: 0.75rem 1.25rem;
                border: none;
                border-radius: 10px;
                font-weight: 600;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }

            .btn-consultation-control:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }

            .btn-consultation-card {
                background: linear-gradient(135deg, #6c757d, #5a6268);
                color: white;
            }

            .btn-consultation-complete {
                background: linear-gradient(135deg, #22c55e, #16a085);
                color: white;
            }

            .btn-consultation-cancel {
                background: linear-gradient(135deg, #e74c3c, #c0392b);
                color: white;
            }

            .consultation-form-container-premium {
                padding: 2rem;
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                min-height: 600px;
            }

            .consultation-form-actions-premium {
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                padding: 1.5rem 2rem;
                border-top: 1px solid #e2e8f0;
                display: flex;
                gap: 1rem;
                justify-content: center;
            }

            .btn-form-action {
                padding: 0.875rem 1.5rem;
                border: none;
                border-radius: 10px;
                font-weight: 600;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }

            .btn-form-action:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }

            .btn-form-save {
                background: linear-gradient(135deg, var(--primary-color), #246185);
                color: white;
            }

            .btn-form-preview {
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white;
            }

            @media (max-width: 768px) {
                .consultation-patient-header-premium {
                    flex-direction: column;
                    gap: 1.5rem;
                    text-align: center;
                }

                .consultation-controls-premium {
                    width: 100%;
                    justify-content: center;
                }

                .btn-consultation-control {
                    min-width: 120px;
                }

                .consultation-form-actions-premium {
                    flex-direction: column;
                    align-items: center;
                }
            }
            </style>
        `;
    }

    // Возврат к карте пациента
    backToPatientCard(patientId) {
        try {
            const patient = this.findPatientById(patientId) || this.currentPatient;
            if (!patient) {
                this.showErrorMessage('Пациент не найден');
                return;
            }

            this.showPatientCardWithActiveConsultation(patient);

        } catch (error) {
            console.error('Ошибка возврата к карте пациента:', error);
            this.logError('Back To Patient Card Error', error);
        }
    }

    // Возврат к расписанию
    backToSchedule() {
        try {
            // Скрываем карту пациента и показываем расписание
            const scheduleContent = document.getElementById('scheduleContent');
            if (!scheduleContent) return;

            const patientCardContainer = scheduleContent.querySelector('.patient-card-container');
            const scheduleGrid = scheduleContent.querySelector('.schedule-grid-container');

            if (patientCardContainer) {
                patientCardContainer.style.display = 'none';
            }

            if (scheduleGrid) {
                scheduleGrid.style.display = 'block';
            }

            // Сбрасываем текущие данные
            this.currentPatient = null;
            this.currentView = 'list';

            console.log('📅 Возврат к расписанию');

        } catch (error) {
            console.error('Ошибка возврата к расписанию:', error);
            this.logError('Back To Schedule Error', error);
        }
    }

    // === ОСТАЛЬНЫЕ МЕТОДЫ УПРАВЛЕНИЯ КОНСУЛЬТАЦИЯМИ ===

    // Завершение активной консультации
    async completeActiveConsultation(patientId) {
        try {
            const consultation = this.activeConsultations.get(patientId);
            if (!consultation) {
                this.showErrorMessage('Активная консультация не найдена');
                return;
            }

            // Проверяем, есть ли данные в консультации
            const hasData = consultation.data && Object.keys(consultation.data).length > 0;
            
            if (!hasData) {
                const confirmComplete = confirm(
                    'Консультация не содержит данных. Завершить без сохранения?'
                );
                
                if (!confirmComplete) {
                    return;
                }
            }

            this.showLoading();

            // Если есть данные, сохраняем консультацию
            if (hasData && typeof consultationsManager !== 'undefined' && consultationsManager.saveConsultation) {
                const success = await consultationsManager.saveConsultation();
                if (!success) {
                    this.showErrorMessage('Ошибка сохранения консультации');
                    return;
                }
            }

            // Обновляем состояние
            consultation.state = this.consultationStates.COMPLETED;
            consultation.endTime = new Date().toISOString();

            // Добавляем пациента в "Мои пациенты"
            await this.addPatientToMyPatients(consultation);

            // Удаляем из активных консультаций
            this.activeConsultations.delete(patientId);

            // Если это была текущая консультация, сбрасываем
            if (patientId === this.currentActivePatientId) {
                this.currentActivePatientId = null;
                this.currentConsultation = null;
            }

            // Обновляем интерфейс
            this.updateActiveConsultationsPanel();
            this.saveActiveConsultations();

            // Обновляем карту пациента
            this.showPatientCardWithActiveConsultation(consultation.patient);

            this.showSuccessMessage(`Консультация "${consultation.patient.name}" завершена`);
            console.log('✅ Консультация завершена:', consultation.patient.name);

        } catch (error) {
            console.error('Ошибка завершения консультации:', error);
            this.logError('Complete Consultation Error', error);
            this.showErrorMessage('Ошибка завершения консультации');
        } finally {
            this.hideLoading();
        }
    }

    // Запрос на закрытие консультации
    promptCloseConsultation(patientId) {
        const consultation = this.activeConsultations.get(patientId);
        if (!consultation) return;

        const patientName = consultation.patient.name;
        
        // Проверяем, есть ли несохраненные изменения
        const hasUnsavedChanges = consultation.isModified || this.checkFormChanges();
        
        let message = `Завершить консультацию пациента "${patientName}"?`;
        if (hasUnsavedChanges) {
            message = `У вас есть несохраненные изменения в консультации "${patientName}".\n\nВыберите действие:`;
        }

        // Создаем кастомное диалоговое окно
        this.showConsultationCloseDialog(patientId, message, hasUnsavedChanges);
    }

    // Диалог закрытия консультации
    showConsultationCloseDialog(patientId, message, hasUnsavedChanges) {
        const consultation = this.activeConsultations.get(patientId);
        const patientName = consultation.patient.name;

        const dialogHTML = `
            <div class="modal fade" id="closeConsultationModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content enhanced-modal-premium">
                        <div class="modal-header enhanced-modal-header-premium">
                            <div class="modal-title-wrapper-premium">
                                <div class="modal-icon-premium">
                                    <i class="fas fa-exclamation-triangle"></i>
                                </div>
                                <div>
                                    <h5 class="modal-title-premium">Завершение консультации</h5>
                                    <p class="modal-subtitle-premium">Выберите действие для консультации</p>
                                </div>
                            </div>
                            <button type="button" class="btn-close-premium" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body enhanced-modal-body-premium">
                            <div class="consultation-close-content">
                                <div class="patient-info-close">
                                    <div class="patient-avatar-close">
                                        <span>${this.getPatientInitials(consultation.patient)}</span>
                                    </div>
                                    <div class="patient-details-close">
                                        <h6>${patientName}</h6>
                                        <small>Время консультации: ${this.getTimeElapsed(consultation.startTime)}</small>
                                    </div>
                                </div>
                                <p class="close-message">${message}</p>
                                ${hasUnsavedChanges ? `
                                    <div class="alert alert-warning">
                                        <i class="fas fa-info-circle"></i>
                                        <strong>Внимание:</strong> При отмене консультации все несохраненные данные будут потеряны.
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <div class="modal-footer enhanced-modal-footer-premium">
                            <button type="button" class="btn-modal-action btn-modal-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-arrow-left"></i>
                                Продолжить работу
                            </button>
                            ${hasUnsavedChanges ? `
                                <button type="button" class="btn-modal-action btn-modal-success" onclick="app.saveAndCompleteConsultation('${patientId}')">
                                    <i class="fas fa-save"></i>
                                    Сохранить и завершить
                                </button>
                            ` : ''}
                            <button type="button" class="btn-modal-action btn-modal-danger" onclick="app.cancelConsultation('${patientId}')">
                                <i class="fas fa-trash"></i>
                                ${hasUnsavedChanges ? 'Отменить без сохранения' : 'Отменить консультацию'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>
            /* ПРЕМИУМ: Стили модального окна */
            .enhanced-modal-premium {
                border: none;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.25);
                backdrop-filter: blur(10px);
                overflow: hidden;
            }

            .enhanced-modal-header-premium {
                background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
                color: white;
                padding: 2rem;
                border-bottom: none;
                position: relative;
                overflow: hidden;
            }

            .enhanced-modal-header-premium::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
                opacity: 0.3;
            }

            .modal-title-wrapper-premium {
                display: flex;
                align-items: center;
                gap: 1.5rem;
                position: relative;
                z-index: 2;
            }

            .modal-icon-premium {
                width: 60px;
                height: 60px;
                background: rgba(255,255,255,0.2);
                border-radius: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.3);
            }

            .modal-title-premium {
                font-size: 1.5rem;
                font-weight: 600;
                margin: 0;
                line-height: 1.2;
            }

            .modal-subtitle-premium {
                font-size: 0.9rem;
                opacity: 0.9;
                margin: 0.5rem 0 0 0;
                font-weight: 400;
            }

            .btn-close-premium {
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                border-radius: 10px;
                width: 40px;
                height: 40px;
                color: white;
                font-size: 18px;
                transition: all 0.3s ease;
                position: relative;
                z-index: 2;
            }

            .btn-close-premium:hover {
                background: rgba(255,255,255,0.3);
                transform: scale(1.1);
            }

            .enhanced-modal-body-premium {
                padding: 2.5rem;
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            }

            .consultation-close-content {
                text-align: center;
            }

            .patient-info-close {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 1rem;
                margin-bottom: 1.5rem;
                padding: 1rem;
                background: rgba(248, 250, 252, 0.5);
                border-radius: 12px;
            }

            .patient-avatar-close {
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, var(--primary-color), #246185);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 1rem;
            }

            .patient-details-close {
                text-align: left;
            }

            .patient-details-close h6 {
                margin: 0;
                font-weight: 600;
                color: #1a202c;
            }

            .patient-details-close small {
                color: #6c757d;
            }

            .close-message {
                font-size: 1.1rem;
                color: #1a202c;
                margin-bottom: 1.5rem;
                line-height: 1.5;
            }

            .enhanced-modal-footer-premium {
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                padding: 1.5rem 2.5rem;
                border-top: 1px solid #e2e8f0;
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
            }

            .btn-modal-action {
                padding: 12px 24px;
                border-radius: 10px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
                border: none;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                cursor: pointer;
            }

            .btn-modal-action:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.2);
            }

            .btn-modal-secondary {
                background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
                color: white;
            }

            .btn-modal-success {
                background: linear-gradient(135deg, #22c55e 0%, #16a085 100%);
                color: white;
            }

            .btn-modal-danger {
                background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                color: white;
            }

            @media (max-width: 768px) {
                .enhanced-modal-footer-premium {
                    flex-direction: column;
                }

                .btn-modal-action {
                    width: 100%;
                    justify-content: center;
                }
            }
            </style>
        `;

        // Удаляем предыдущий модал если есть
        const existingModal = document.getElementById('closeConsultationModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Добавляем новый модал
        document.body.insertAdjacentHTML('beforeend', dialogHTML);

        // Показываем модал
        const modal = new bootstrap.Modal(document.getElementById('closeConsultationModal'));
        modal.show();

        // Удаляем модал после закрытия
        document.getElementById('closeConsultationModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    // Сохранение и завершение консультации
    async saveAndCompleteConsultation(patientId = null) {
        try {
            const targetPatientId = patientId || this.currentActivePatientId;
            const consultation = this.activeConsultations.get(targetPatientId);
            
            if (!consultation) {
                this.showErrorMessage('Активная консультация не найдена');
                return;
            }

            this.showLoading();

            // Сохраняем консультацию
            if (typeof consultationsManager !== 'undefined' && consultationsManager.saveConsultation) {
                const success = await consultationsManager.saveConsultation();
                if (!success) {
                    this.showErrorMessage('Ошибка сохранения консультации');
                    return;
                }
            }

            // Обновляем состояние
            consultation.state = this.consultationStates.COMPLETED;
            consultation.endTime = new Date().toISOString();

            // Добавляем пациента в "Мои пациенты"
            await this.addPatientToMyPatients(consultation);

            // Удаляем из активных консультаций
            this.activeConsultations.delete(targetPatientId);

            // Если это была текущая консультация, сбрасываем
            if (targetPatientId === this.currentActivePatientId) {
                this.currentActivePatientId = null;
                this.currentPatient = null;
                this.currentConsultation = null;
            }

            // Обновляем интерфейс
            this.updateActiveConsultationsPanel();
            this.saveActiveConsultations();

            // Возвращаемся к карте пациента
            this.showPatientCardWithActiveConsultation(consultation.patient);

            // Закрываем модал если открыт
            const modal = document.getElementById('closeConsultationModal');
            if (modal) {
                bootstrap.Modal.getInstance(modal)?.hide();
            }

            this.showSuccessMessage(`Консультация "${consultation.patient.name}" завершена и сохранена`);
            console.log('✅ Консультация завершена и сохранена:', consultation.patient.name);

        } catch (error) {
            console.error('Ошибка завершения консультации:', error);
            this.logError('Complete Consultation Error', error);
            this.showErrorMessage('Ошибка завершения консультации');
        } finally {
            this.hideLoading();
        }
    }

    // Отмена консультации
    cancelConsultation(patientId) {
        try {
            const consultation = this.activeConsultations.get(patientId);
            if (!consultation) return;

            // Удаляем из активных консультаций
            this.activeConsultations.delete(patientId);

            // Если это была текущая консультация, сбрасываем
            if (patientId === this.currentActivePatientId) {
                this.currentActivePatientId = null;
                this.currentPatient = null;
                this.currentConsultation = null;
            }

            // Обновляем интерфейс
            this.updateActiveConsultationsPanel();
            this.saveActiveConsultations();

            // Возвращаемся к расписанию
            this.backToSchedule();

            // Закрываем модал если открыт
            const modal = document.getElementById('closeConsultationModal');
            if (modal) {
                bootstrap.Modal.getInstance(modal)?.hide();
            }

            this.showNotification(`Консультация "${consultation.patient.name}" отменена`, 'warning', 3000);
            console.log('❌ Консультация отменена:', consultation.patient.name);

        } catch (error) {
            console.error('Ошибка отмены консультации:', error);
            this.logError('Cancel Consultation Error', error);
        }
    }

    // Добавление пациента в "Мои пациенты" после завершения консультации
    async addPatientToMyPatients(consultation) {
        try {
            const patient = consultation.patient;
            
            // Ищем существующего пациента в списке
            let existingPatientIndex = this.myPatients.findIndex(p => p.id === patient.id);
            
            if (existingPatientIndex >= 0) {
                // Обновляем существующего пациента
                this.myPatients[existingPatientIndex].lastConsultationDate = consultation.endTime;
                this.myPatients[existingPatientIndex].totalConsultations = (this.myPatients[existingPatientIndex].totalConsultations || 0) + 1;
                
                // Добавляем консультацию в историю
                if (!this.myPatients[existingPatientIndex].consultations) {
                    this.myPatients[existingPatientIndex].consultations = [];
                }
                this.myPatients[existingPatientIndex].consultations.push({
                    id: consultation.id,
                    date: consultation.endTime,
                    appointmentType: 'primary',
                    complaints: 'Консультация завершена',
                    mainDiagnosis: 'В стадии обработки'
                });
            } else {
                // Добавляем нового пациента
                const newPatientEntry = {
                    ...patient,
                    lastConsultationDate: consultation.endTime,
                    totalConsultations: 1,
                    consultations: [{
                        id: consultation.id,
                        date: consultation.endTime,
                        appointmentType: 'primary',
                        complaints: 'Консультация завершена',
                        mainDiagnosis: 'В стадии обработки'
                    }]
                };
                
                this.myPatients.push(newPatientEntry);
            }

            // Сохраняем в IndexedDB если доступно
            if (typeof storageManager !== 'undefined' && storageManager && storageManager.isInitialized) {
                const patientToSave = existingPatientIndex >= 0 
                    ? this.myPatients[existingPatientIndex] 
                    : this.myPatients[this.myPatients.length - 1];
                    
                await storageManager.savePatient(patientToSave);
            }

            // Обновляем кэш
            const cacheKey = `my_patients_${this.doctorId}`;
            this.cache.set(cacheKey, {
                data: this.myPatients,
                timestamp: Date.now()
            });

            console.log('👥 Пациент добавлен/обновлен в "Мои пациенты":', patient.name);

        } catch (error) {
            console.error('Ошибка добавления пациента в "Мои пациенты":', error);
            this.logError('Add Patient To My Patients Error', error);
        }
    }

    // === ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ===

    // Получение инициалов пациента
    getPatientInitials(patient) {
        try {
            if (patient.personalInfo) {
                const lastName = patient.personalInfo.lastName || '';
                const firstName = patient.personalInfo.firstName || '';
                return (lastName.charAt(0) + firstName.charAt(0)).toUpperCase();
            }
            
            if (patient.name) {
                const nameParts = patient.name.split(' ');
                return nameParts.length >= 2 
                    ? (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase()
                    : nameParts[0].charAt(0).toUpperCase();
            }
            
            return 'НП';
        } catch (error) {
            console.error('Ошибка получения инициалов:', error);
            return 'НП';
        }
    }

    // Получение сокращенного имени пациента
    getPatientShortName(patient) {
        try {
            if (patient.personalInfo?.lastName) {
                const lastName = patient.personalInfo.lastName;
                const firstName = patient.personalInfo.firstName;
                return `${lastName} ${firstName.charAt(0)}.`;
            }
            
            if (patient.name) {
                const nameParts = patient.name.split(' ');
                if (nameParts.length >= 2) {
                    return `${nameParts[0]} ${nameParts[1].charAt(0)}.`;
                }
                return nameParts[0];
            }
            
            return 'Неизвестный';
        } catch (error) {
            console.error('Ошибка получения короткого имени:', error);
            return 'Неизвестный';
        }
    }

    // Вычисление времени с начала консультации
    getTimeElapsed(startTime) {
        try {
            const now = new Date();
            const start = new Date(startTime);
            const diff = now - start;
            
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(minutes / 60);
            
            if (hours > 0) {
                return `${hours}ч ${minutes % 60}м`;
            } else {
                return `${minutes}м`;
            }
        } catch (error) {
            console.error('Ошибка вычисления времени:', error);
            return '0м';
        }
    }

    getPatientDisplayName(patient) {
        try {
            if (patient.personalInfo?.lastName) {
                return `${patient.personalInfo.lastName} ${patient.personalInfo.firstName} ${patient.personalInfo.middleName || ''}`.trim();
            }
            return patient.name || 'Неизвестный пациент';
        } catch (error) {
            console.error('Ошибка получения имени пациента:', error);
            this.logError('Get Patient Name Error', error);
            return 'Неизвестный пациент';
        }
    }

    getPatientAge(patient) {
        try {
            if (patient.personalInfo?.birthDate) {
                return this.calculateAge(patient.personalInfo.birthDate);
            }
            if (patient.birthDate) {
                return this.calculateAge(patient.birthDate);
            }
            return patient.age || 'Не указан';
        } catch (error) {
            console.error('Ошибка получения возраста пациента:', error);
            this.logError('Get Patient Age Error', error);
            return 'Не указан';
        }
    }

    getPatientGender(patient) {
        try {
            const gender = patient.personalInfo?.gender || patient.gender;
            if (gender === 'М' || gender === 'male') return 'Мужской';
            if (gender === 'Ж' || gender === 'female') return 'Женский';
            return 'Не указан';
        } catch (error) {
            console.error('Ошибка получения пола пациента:', error);
            this.logError('Get Patient Gender Error', error);
            return 'Не указан';
        }
    }

    calculateAge(birthDate) {
        try {
            const today = new Date();
            const birth = new Date(birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            
            return age;
        } catch (error) {
            console.error('Ошибка расчета возраста:', error);
            this.logError('Calculate Age Error', error);
            return 0;
        }
    }

    formatDate(dateString) {
        try {
            if (!dateString) return 'Не указана';
            
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Ошибка форматирования даты:', error);
            return 'Не указана';
        }
    }

    formatDateTime(dateString) {
        try {
            if (!dateString) return 'Не указана';
            
            const date = new Date(dateString);
            return date.toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Ошибка форматирования даты-времени:', error);
            return 'Не указана';
        }
    }

    getAppointmentTypeText(type) {
        switch (type) {
            case 'primary': return 'Первичный';
            case 'secondary': return 'Повторный';
            default: return 'Консультация';
        }
    }

    // === ОСНОВНЫЕ МЕТОДЫ СИСТЕМЫ ===

    generateConsultationId() {
        return 'cons_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Поиск пациента по ID
    findPatientById(patientId) {
        try {
            // Ищем в активных консультациях
            const activeConsultation = this.activeConsultations.get(patientId);
            if (activeConsultation) {
                return activeConsultation.patient;
            }

            // Ищем в "Мои пациенты"
            const myPatient = this.myPatients.find(p => p.id === patientId);
            if (myPatient) {
                return myPatient;
            }

            // Ищем в демо-пациентах расписания
            if (typeof scheduleGridManager !== 'undefined' && scheduleGridManager) {
                const demoPatient = scheduleGridManager.getPatientById(patientId);
                if (demoPatient) {
                    return demoPatient;
                }
            }

            return null;
        } catch (error) {
            console.error('Ошибка поиска пациента:', error);
            return null;
        }
    }

    // Проверка изменений в форме
    checkFormChanges() {
        try {
            const form = document.getElementById('consultationForm');
            if (!form) return false;

            // Простая проверка: есть ли заполненные поля
            const inputs = form.querySelectorAll('input, textarea, select');
            for (const input of inputs) {
                if (input.value && input.value.trim() !== '') {
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Ошибка проверки изменений формы:', error);
            return false;
        }
    }

    // Сохранение черновика консультации
    saveConsultationDraft(patientId) {
        try {
            const consultation = this.activeConsultations.get(patientId);
            if (!consultation) return;

            consultation.isModified = true;
            consultation.lastSaved = new Date().toISOString();
            
            this.saveActiveConsultations();
            this.updateActiveConsultationsPanel();
            this.showNotification('Черновик сохранен', 'success', 2000);

        } catch (error) {
            console.error('Ошибка сохранения черновика:', error);
            this.logError('Save Draft Error', error);
        }
    }

    // Предварительный просмотр консультации
    previewConsultation(patientId) {
        this.showNotification('Функция предварительного просмотра будет добавлена в следующих версиях', 'info', 3000);
    }

    // Сохранение активных консультаций в localStorage
    saveActiveConsultations() {
        try {
            const data = Array.from(this.activeConsultations.entries()).map(([patientId, consultation]) => ({
                patientId,
                consultation: {
                    ...consultation,
                    patient: { id: consultation.patient.id, name: consultation.patient.name }
                }
            }));

            localStorage.setItem('cardio_active_consultations', JSON.stringify(data));
            console.log('💾 Активные консультации сохранены в localStorage');
        } catch (error) {
            console.error('Ошибка сохранения активных консультаций:', error);
            this.logError('Save Active Consultations Error', error);
        }
    }

    // Загрузка активных консультаций из localStorage
    loadActiveConsultations() {
        try {
            const data = localStorage.getItem('cardio_active_consultations');
            if (!data) return;

            const consultationsData = JSON.parse(data);
            
            consultationsData.forEach(({ patientId, consultation }) => {
                this.activeConsultations.set(patientId, consultation);
            });

            console.log('📂 Активные консультации загружены из localStorage:', this.activeConsultations.size);
            
            this.updateActiveConsultationsPanel();

        } catch (error) {
            console.error('Ошибка загрузки активных консультаций:', error);
            this.logError('Load Active Consultations Error', error);
            localStorage.removeItem('cardio_active_consultations');
        }
    }

    // Добавление новой консультации из панели
    addNewConsultationFromPanel() {
        try {
            this.switchToTab('schedule');
            this.showNotification('Выберите запись из расписания для начала консультации', 'info', 3000);
        } catch (error) {
            console.error('Ошибка добавления консультации:', error);
            this.logError('Add New Consultation Error', error);
        }
    }

    // === СИСТЕМА ИНИЦИАЛИЗАЦИИ ===

    setupGlobalErrorHandling() {
        window.addEventListener('error', this.handleGlobalError);
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
        
        const originalConsoleError = console.error;
        console.error = (...args) => {
            this.logError('Console Error', args);
            originalConsoleError.apply(console, args);
        };
    }

    handleGlobalError(event) {
        this.errorCount++;
        console.error('Глобальная ошибка:', event.error);
        
        if (this.errorCount > this.maxErrors) {
            this.showErrorMessage('Система перегружена ошибками. Перезагрузите страницу.');
            return;
        }
        
        this.logError('Global Error', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
        });
    }

    handleUnhandledRejection(event) {
        this.errorCount++;
        console.error('Необработанное отклонение промиса:', event.reason);
        
        this.logError('Unhandled Promise Rejection', event.reason);
        event.preventDefault();
    }

    logError(type, error) {
        const errorInfo = {
            type: type,
            error: error,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            currentTab: this.currentTab,
            isInitialized: this.isInitialized
        };
        
        try {
            const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
            errors.push(errorInfo);
            
            if (errors.length > 50) {
                errors.splice(0, errors.length - 50);
            }
            
            localStorage.setItem('app_errors', JSON.stringify(errors));
        } catch (e) {
            console.warn('Не удалось сохранить ошибку в localStorage:', e);
        }
    }

    handleCriticalError(message, error) {
        this.criticalErrors.push({ message, error, timestamp: new Date().toISOString() });
        
        const errorMessage = `
            <div class="alert alert-danger">
                <h5><i class="fas fa-exclamation-triangle"></i> Критическая ошибка</h5>
                <p><strong>Описание:</strong> ${message}</p>
                <p><strong>Рекомендации:</strong></p>
                <ul>
                    <li>Перезагрузите страницу (F5)</li>
                    <li>Очистите кэш браузера</li>
                    <li>Если проблема повторяется, обратитесь к администратору</li>
                </ul>
                <button class="btn btn-primary" onclick="window.location.reload()">
                    <i class="fas fa-refresh"></i> Перезагрузить сейчас
                </button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', `
            <div style="position: fixed; top: 20px; left: 20px; right: 20px; z-index: 10000; max-width: 600px; margin: 0 auto;">
                ${errorMessage}
            </div>
        `);
    }

    setDefaultActiveTab() {
        try {
            document.querySelectorAll('.nav-tabs .nav-link').forEach(link => {
                link.classList.remove('active');
            });
            
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('show', 'active');
            });
            
            const scheduleTab = document.getElementById('schedule-tab');
            const schedulePane = document.getElementById('schedule');
            
            if (scheduleTab && schedulePane) {
                scheduleTab.classList.add('active');
                schedulePane.classList.add('show', 'active');
                this.currentTab = 'schedule';
                console.log('🎯 Установлена активная вкладка: Расписание');
            } else {
                console.warn('⚠️ Элементы вкладки "Расписание" не найдены');
            }
        } catch (error) {
            console.error('Ошибка установки активной вкладки:', error);
            this.logError('Tab Setup Error', error);
        }
    }

    initializeDateTime() {
        try {
            this.updateDateTime();
            setInterval(() => this.updateDateTime(), 1000);
        } catch (error) {
            console.error('Ошибка инициализации времени:', error);
            this.logError('DateTime Init Error', error);
        }
    }

    updateDateTime() {
        try {
            const now = new Date();
            const options = { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            };
            const element = document.getElementById('currentDateTime');
            if (element) {
                element.textContent = now.toLocaleDateString('ru-RU', options);
            }
        } catch (error) {
            if (Math.random() < 0.01) {
                console.error('Ошибка обновления времени:', error);
            }
        }
    }

    async initializeManagers() {
        const managers = [
            { name: 'storageManager', action: async (mgr) => await mgr.init() },
            { name: 'patientsManager', action: async (mgr) => await mgr.init() },
            { name: 'consultationsManager', action: async (mgr) => await mgr.init() },
            { name: 'researchManager', action: async (mgr) => await mgr.init() },
            { name: 'scheduleGridManager', action: async (mgr) => await mgr.init() },
            { name: 'autofillManager', action: (mgr) => mgr.init() },
            { name: 'mkb10Manager', action: (mgr) => mgr.init() },
            { name: 'calculatorManager', action: (mgr) => mgr.init() }
        ];

        for (const { name, action } of managers) {
            try {
                if (typeof window[name] !== 'undefined' && window[name]) {
                    await action(window[name]);
                    console.log(`✅ ${name} инициализирован`);
                } else {
                    console.warn(`⚠️ ${name} не найден`);
                }
            } catch (error) {
                console.error(`❌ Ошибка инициализации ${name}:`, error);
                this.logError(`Manager Init Error: ${name}`, error);
                
                if (['storageManager', 'patientsManager'].includes(name)) {
                    this.showNotification(`Ошибка инициализации ${name}`, 'warning', 5000);
                }
            }
        }
    }

    async loadTabContents() {
        try {
            await this.loadScheduleTab();
            await this.loadResearchTab();
            await this.loadMyPatientsTab();
        } catch (error) {
            console.error('Ошибка загрузки контента вкладок:', error);
            this.logError('Tab Content Load Error', error);
        }
    }

    async loadScheduleTab() {
        try {
            const content = document.getElementById('scheduleContent');
            if (content && typeof scheduleGridManager !== 'undefined' && scheduleGridManager) {
                content.innerHTML = scheduleGridManager.getScheduleGridHTML();
                scheduleGridManager.onTabActivate();
            }
        } catch (error) {
            console.error('Ошибка загрузки вкладки расписания:', error);
            this.logError('Schedule Tab Load Error', error);
        }
    }

    async loadResearchTab() {
        try {
            const content = document.getElementById('researchContent');
            if (content && typeof researchManager !== 'undefined' && researchManager) {
                content.innerHTML = researchManager.getResearchInterface();
            }
        } catch (error) {
            console.error('Ошибка загрузки вкладки исследований:', error);
            this.logError('Research Tab Load Error', error);
        }
    }

    async loadMyPatientsTab() {
        try {
            const content = document.getElementById('myPatientsContent');
            if (!content) {
                console.warn('⚠️ Контейнер myPatientsContent не найден');
                return;
            }
            
            content.innerHTML = this.getMyPatientsInterface();
            
            requestAnimationFrame(async () => {
                try {
                    await this.updateMyPatientsList();
                } catch (error) {
                    console.error('Ошибка обновления списка пациентов:', error);
                    this.logError('Patients List Update Error', error);
                }
            });
            
        } catch (error) {
            console.error('Ошибка загрузки вкладки "Мои пациенты":', error);
            this.logError('My Patients Tab Load Error', error);
        }
    }

    setupEventListeners() {
        try {
            // Обработчики переключения вкладок
            document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
                tab.addEventListener('shown.bs.tab', (event) => {
                    try {
                        const targetTab = event.target.getAttribute('data-bs-target').substring(1);
                        this.currentTab = targetTab;
                        this.onTabChange(targetTab);
                    } catch (error) {
                        console.error('Ошибка обработки переключения вкладки:', error);
                        this.logError('Tab Switch Error', error);
                    }
                });
            });

            // Глобальные обработчики клавиш
            document.addEventListener('keydown', (e) => {
                try {
                    if (e.key === 'Escape') {
                        if (this.currentTab === 'myPatients' && this.currentView !== 'list') {
                            this.backToPatientsList();
                        }
                        
                        if (this.currentActivePatientId) {
                            this.backToSchedule();
                        }
                    }
                    
                    if (e.ctrlKey) {
                        switch (e.key) {
                            case '1':
                                e.preventDefault();
                                this.switchToTab('schedule');
                                break;
                            case '2':
                                e.preventDefault();
                                this.switchToTab('research');
                                break;
                            case '3':
                                e.preventDefault();
                                this.switchToTab('myPatients');
                                break;
                        }
                    }
                } catch (error) {
                    console.error('Ошибка обработки клавиш:', error);
                    this.logError('Keyboard Handler Error', error);
                }
            });

            // Обработчик перед закрытием страницы
            window.addEventListener('beforeunload', () => {
                try {
                    this.saveApplicationState();
                    this.saveActiveConsultations();
                } catch (error) {
                    console.error('Ошибка сохранения состояния:', error);
                    this.logError('Save State Error', error);
                }
            });

            // Обновление панели активных консультаций каждую минуту
            setInterval(() => {
                if (this.activeConsultations.size > 0) {
                    this.updateActiveConsultationsPanel();
                }
            }, 60000);

        } catch (error) {
            console.error('Ошибка настройки обработчиков событий:', error);
            this.logError('Setup Event Listeners Error', error);
        }
    }

    onTabChange(tabId) {
        try {
            console.log(`Переключение на вкладку: ${tabId}`);
            
            if (this.currentTab === 'myPatients' && this.currentView !== 'list') {
                this.backToPatientsList();
            }
            
            switch (tabId) {
                case 'schedule':
                    if (typeof scheduleGridManager !== 'undefined' && scheduleGridManager) {
                        scheduleGridManager.onTabActivate();
                    }
                    break;
                case 'myPatients':
                    this.onMyPatientsTabActivate();
                    break;
            }
        } catch (error) {
            console.error('Ошибка смены вкладки:', error);
            this.logError('Tab Change Error', error);
        }
    }

    initializeInterface() {
        try {
            this.initializeCalculators();
            this.initializeTooltips();
            this.setupQuickNavigation();
        } catch (error) {
            console.error('Ошибка инициализации интерфейса:', error);
            this.logError('Initialize Interface Error', error);
        }
    }

    initializeCalculators() {
        try {
            if (typeof calculatorManager !== 'undefined' && calculatorManager) {
                calculatorManager.loadCalculators();
            }
        } catch (error) {
            console.error('Ошибка инициализации калькуляторов:', error);
            this.logError('Initialize Calculators Error', error);
        }
    }

    initializeTooltips() {
        try {
            if (typeof bootstrap !== 'undefined') {
                const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
                tooltips.forEach(tooltip => {
                    new bootstrap.Tooltip(tooltip);
                });
            }
        } catch (error) {
            console.error('Ошибка инициализации подсказок:', error);
            this.logError('Initialize Tooltips Error', error);
        }
    }

    setupQuickNavigation() {
        console.log('🎯 Горячие клавиши: Ctrl+1 (Расписание), Ctrl+2 (Исследования), Ctrl+3 (Мои пациенты), ESC (Свернуть/назад)');
    }

    async preloadCriticalData() {
        try {
            if (typeof calculatorManager !== 'undefined' && calculatorManager) {
                calculatorManager.preloadCalculators();
            }
            
            if (typeof mkb10Manager !== 'undefined' && mkb10Manager) {
                mkb10Manager.preloadCommonDiagnoses();
            }
        } catch (error) {
            console.warn('Ошибка предварительной загрузки:', error);
            this.logError('Preload Error', error);
        }
    }

    // === МЕТОДЫ ИНТЕРФЕЙСА ===

    showLoading() {
        try {
            if (typeof utils !== 'undefined' && utils.showLoading) {
                utils.showLoading();
            } else {
                console.log('⏳ Загрузка...');
            }
        } catch (error) {
            console.log('⏳ Загрузка...');
        }
    }

    hideLoading() {
        try {
            if (typeof utils !== 'undefined' && utils.hideLoading) {
                utils.hideLoading();
            }
        } catch (error) {
            // Игнорируем ошибки скрытия загрузки
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        try {
            if (typeof utils !== 'undefined' && utils.showNotification) {
                utils.showNotification(message, type, duration);
            } else {
                console.log(`${type.toUpperCase()}: ${message}`);
            }
        } catch (error) {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    showErrorMessage(message) {
        try {
            if (typeof utils !== 'undefined' && utils.showErrorMessage) {
                utils.showErrorMessage(message);
            } else {
                console.error('ERROR:', message);
                alert('Ошибка: ' + message);
            }
        } catch (error) {
            console.error('ERROR:', message);
            alert('Ошибка: ' + message);
        }
    }

    showSuccessMessage(message) {
        try {
            if (typeof utils !== 'undefined' && utils.showSuccessMessage) {
                utils.showSuccessMessage(message);
            } else {
                console.log('SUCCESS:', message);
            }
        } catch (error) {
            console.log('SUCCESS:', message);
        }
    }

    switchToTab(tabId) {
        try {
            const tabButton = document.querySelector(`[data-bs-target="#${tabId}"]`);
            if (tabButton && typeof bootstrap !== 'undefined') {
                const tab = new bootstrap.Tab(tabButton);
                tab.show();
            }
        } catch (error) {
            console.error('Ошибка переключения вкладки:', error);
            this.logError('Switch Tab Error', error);
        }
    }

    saveApplicationState() {
        try {
            const state = {
                currentPatientId: this.currentPatient?.id,
                currentTab: this.currentTab,
                currentView: this.currentView,
                navigationHistory: this.navigationHistory,
                appVersion: this.appVersion,
                starredPatients: [...this.starredPatients],
                currentActivePatientId: this.currentActivePatientId,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('docassistant_state', JSON.stringify(state));
        } catch (error) {
            console.error('Ошибка сохранения состояния:', error);
            this.logError('Save Application State Error', error);
        }
    }

    loadApplicationState() {
        try {
            const savedState = localStorage.getItem('docassistant_state');
            if (savedState) {
                const state = JSON.parse(savedState);
                
                this.navigationHistory = state.navigationHistory || [];
                
                if (state.starredPatients) {
                    this.starredPatients = new Set(state.starredPatients);
                }
                
                this.currentActivePatientId = state.currentActivePatientId || null;
            }
        } catch (error) {
            console.error('Ошибка загрузки состояния:', error);
            this.logError('Load Application State Error', error);
        }
    }

    // === ЗАГЛУШКИ ДЛЯ ДОПОЛНИТЕЛЬНЫХ МЕТОДОВ ===

    // Методы для работы с пациентами
    showPatientCard(patient) {
        console.log('Показ карты пациента:', patient.name);
        // Реализация будет добавлена при необходимости
    }

    viewPatientHistory(patientId) {
        console.log('Просмотр истории пациента:', patientId);
        this.showNotification('Функция просмотра истории будет добавлена в следующих версиях', 'info', 3000);
    }

    exportPatientData(patientId) {
        console.log('Экспорт данных пациента:', patientId);
        this.showNotification('Функция экспорта данных будет добавлена в следующих версиях', 'info', 3000);
    }

    exportAllPatientsData() {
        console.log('Экспорт всех данных пациентов');
        this.showNotification('Функция экспорта всех данных будет добавлена в следующих версиях', 'info', 3000);
    }

    importPatientsData() {
        console.log('Импорт данных пациентов');
        this.showNotification('Функция импорта данных будет добавлена в следующих версиях', 'info', 3000);
    }

    showStorageStats() {
        console.log('Показ статистики хранилища');
        this.showNotification('Статистика хранилища будет добавлена в следующих версиях', 'info', 3000);
    }

    viewConsultationDetails(consultationId) {
        console.log('Просмотр деталей консультации:', consultationId);
        this.showNotification('Функция просмотра деталей консультации будет добавлена в следующих версиях', 'info', 3000);
    }

    copyConsultation(consultationId) {
        console.log('Копирование консультации:', consultationId);
        this.showNotification('Функция копирования консультации будет добавлена в следующих версиях', 'info', 3000);
    }

    startNewConsultation(patientId) {
        try {
            let patient = this.currentPatient;
            
            if (!patient) {
                patient = this.findPatientById(patientId);
            }

            if (!patient) {
                this.showErrorMessage('Пациент не найден');
                return;
            }

            this.createActiveConsultation(patient);

        } catch (error) {
            console.error('Ошибка начала новой консультации:', error);
            this.logError('Start New Consultation Error', error);
        }
    }
}

// Глобальный экземпляр приложения
const app = new DocAssistantApp();

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    app.init().then(() => {
        app.loadApplicationState();
    }).catch(error => {
        console.error('Критическая ошибка инициализации:', error);
    });
});

// Экспорт для использования в других модулях
window.app = app;