/**
 * CardioAssistant Pro - Enhanced Schedule Grid Module
 * Модуль сетки расписания с интеграцией overlay карты пациентов
 * ОБНОВЛЕНО: улучшена интеграция с overlay картой пациента и добавлены реалистичные демо-данные
 * ИСПРАВЛЕНО: убрана кнопка "+ Новая запись", улучшены стили модального окна, добавлены кастомные календари
 */

class ScheduleGridManager {
    constructor() {
        this.doctors = [];
        this.appointments = [];
        this.demoPatients = []; // Новый массив для демо-пациентов
        this.specialties = [
            { id: 'cardiology', name: 'Кардиология', color: '#e74c3c' },
            { id: 'therapy', name: 'Терапия', color: '#3498db' },
            { id: 'endocrinology', name: 'Эндокринология', color: '#9b59b6' },
            { id: 'gastroenterology', name: 'Гастроэнтерология-гепатология', color: '#e67e22' },
            { id: 'neurology', name: 'Неврология', color: '#2ecc71' },
            { id: 'urology', name: 'Урология-андрология', color: '#34495e' },
            { id: 'endoscopy', name: 'Эндоскопия', color: '#f39c12' },
            { id: 'ultrasound', name: 'УЗИ', color: '#1abc9c' }
        ];
        this.currentView = 'day'; // day | week
        this.currentDate = new Date();
        this.selectedSpecialty = 'all';
        this.selectedDoctor = 'all';
        this.timeSlots = this.generateTimeSlots();
        this.isInitialized = false;
        this.weekStartDate = null;
    }

    async init() {
        console.log('🔄 Инициализация модуля расписания сетки...');
        await this.loadDoctors();
        await this.createDemoPatients(); // Создаем демо-пациентов
        await this.loadAppointments();
        await this.loadPatientsData();
        this.initWeekView();
        console.log('✅ Модуль расписания сетки инициализирован');
        this.isInitialized = true;
    }

    generateTimeSlots() {
        const slots = [];
        for (let hour = 8; hour <= 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(timeString);
            }
        }
        return slots;
    }

    async loadDoctors() {
        this.doctors = [
            {
                id: 'doc1',
                name: 'Петров Иван Иванович',
                specialty: 'cardiology',
                avatar: null,
                workingHours: { start: '09:00', end: '17:00' },
                room: '101'
            },
            {
                id: 'doc2', 
                name: 'Сидоров Петр Петрович',
                specialty: 'cardiology',
                avatar: null,
                workingHours: { start: '08:00', end: '16:00' },
                room: '102'
            },
            {
                id: 'doc3',
                name: 'Иванова Людмила Николаевна',
                specialty: 'therapy',
                avatar: null,
                workingHours: { start: '09:00', end: '18:00' },
                room: '201'
            },
            {
                id: 'doc4',
                name: 'Смирнов Алексей Викторович',
                specialty: 'endocrinology',
                avatar: null,
                workingHours: { start: '10:00', end: '17:00' },
                room: '301'
            }
        ];
    }

    // НОВЫЙ МЕТОД: Создание реалистичных демо-пациентов с консультациями
    async createDemoPatients() {
        this.demoPatients = [
            {
                id: 'demo_patient_001',
                personalInfo: {
                    lastName: 'Иванов',
                    firstName: 'Сергей',
                    middleName: 'Александрович',
                    birthDate: '1975-03-15',
                    gender: 'М',
                    phone: '+7 (925) 123-45-67',
                    email: 'ivanov.sa@email.com'
                },
                name: 'Иванов С.А.',
                birthDate: '1975-03-15',
                gender: 'М',
                phone: '+7 (925) 123-45-67',
                email: 'ivanov.sa@email.com',
                consultations: [
                    {
                        id: 'cons_001_1',
                        date: '2025-01-20',
                        appointmentType: 'primary',
                        type: 'Первичная консультация',
                        complaints: 'Периодические боли в области сердца, одышка при физических нагрузках',
                        anamnesisDisease: 'Боли беспокоят в течение 2 месяцев, усиливаются при нагрузке',
                        objectiveExam: 'Общее состояние удовлетворительное. АД 140/90 мм рт.ст. ЧСС 82 уд/мин.',
                        mainDiagnosis: 'Артериальная гипертензия 1 степени',
                        examPlan: 'ЭКГ, ЭхоКГ, биохимический анализ крови',
                        medications: 'Лизиноприл 5 мг 1 раз в день',
                        regime: 'Ограничить физические нагрузки',
                        diet: 'Диета с ограничением соли'
                    }
                ]
            },
            {
                id: 'demo_patient_002',
                personalInfo: {
                    lastName: 'Петрова',
                    firstName: 'Марина',
                    middleName: 'Ивановна',
                    birthDate: '1968-07-22',
                    gender: 'Ж',
                    phone: '+7 (916) 234-56-78',
                    email: 'petrova.mi@email.com'
                },
                name: 'Петрова М.И.',
                birthDate: '1968-07-22',
                gender: 'Ж',
                phone: '+7 (916) 234-56-78',
                email: 'petrova.mi@email.com',
                consultations: [
                    {
                        id: 'cons_002_1',
                        date: '2025-01-15',
                        appointmentType: 'secondary',
                        type: 'Повторная консультация',
                        complaints: 'Контроль артериального давления на фоне терапии',
                        anamnesisDisease: 'Принимает назначенную терапию регулярно, самочувствие улучшилось',
                        objectiveExam: 'Общее состояние хорошее. АД 130/80 мм рт.ст. ЧСС 76 уд/мин.',
                        mainDiagnosis: 'Артериальная гипертензия 1 степени, контролируемая',
                        examPlan: 'Продолжить наблюдение',
                        medications: 'Лизиноприл 5 мг 1 раз в день - продолжить',
                        regime: 'Умеренные физические нагрузки',
                        diet: 'Продолжить диету с ограничением соли'
                    }
                ]
            },
            {
                id: 'demo_patient_003',
                personalInfo: {
                    lastName: 'Сидоров',
                    firstName: 'Константин',
                    middleName: 'Викторович',
                    birthDate: '1982-11-08',
                    gender: 'М',
                    phone: '+7 (903) 345-67-89',
                    email: 'sidorov.kv@email.com'
                },
                name: 'Сидоров К.В.',
                birthDate: '1982-11-08',
                gender: 'М',
                phone: '+7 (903) 345-67-89',
                email: 'sidorov.kv@email.com',
                consultations: []
            },
            {
                id: 'demo_patient_004',
                personalInfo: {
                    lastName: 'Козлова',
                    firstName: 'Елена',
                    middleName: 'Петровна',
                    birthDate: '1979-05-14',
                    gender: 'Ж',
                    phone: '+7 (985) 456-78-90',
                    email: 'kozlova.ep@email.com'
                },
                name: 'Козлова Е.П.',
                birthDate: '1979-05-14',
                gender: 'Ж',
                phone: '+7 (985) 456-78-90',
                email: 'kozlova.ep@email.com',
                consultations: []
            },
            {
                id: 'demo_patient_005',
                personalInfo: {
                    lastName: 'Морозов',
                    firstName: 'Андрей',
                    middleName: 'Алексеевич',
                    birthDate: '1965-12-30',
                    gender: 'М',
                    phone: '+7 (964) 567-89-01',
                    email: 'morozov.aa@email.com'
                },
                name: 'Морозов А.А.',
                birthDate: '1965-12-30',
                gender: 'М',
                phone: '+7 (964) 567-89-01',
                email: 'morozov.aa@email.com',
                consultations: []
            }
        ];

        console.log('👥 Создано демо-пациентов:', this.demoPatients.length);
    }

    async loadPatientsData() {
        if (window.patientsManager && window.patientsManager.isInitialized) {
            this.patientsData = patientsManager.getAllPatients();
        }
        
        if (window.testData && window.testData.patients) {
            this.testPatientsData = window.testData.patients;
        }
        
        console.log('📋 Данные пациентов синхронизированы с расписанием');
    }

    async loadAppointments() {
        this.appointments = [];
        
        // Генерируем тестовые записи на неделю
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Понедельник текущей недели
        
        // ОБНОВЛЕННЫЕ базовые записи с привязкой к демо-пациентам
        const baseAppointments = [
            // Понедельник
            { doctorId: 'doc1', time: '09:00', demoPatientIndex: 0, type: 'primary', reason: 'Первичная консультация' },
            { doctorId: 'doc1', time: '10:00', demoPatientIndex: 1, type: 'secondary', reason: 'Контроль АД' },
            { doctorId: 'doc2', time: '09:30', demoPatientIndex: 2, type: 'primary', reason: 'Боли в грудной клетке' },
            { doctorId: 'doc3', time: '11:00', demoPatientIndex: 3, type: 'secondary', reason: 'Повторный прием' },
            
            // Вторник
            { doctorId: 'doc1', time: '11:30', demoPatientIndex: 4, type: 'primary', reason: 'Одышка при нагрузке' },
            { doctorId: 'doc2', time: '14:00', demoPatientIndex: 1, type: 'secondary', reason: 'Результаты анализов' },
            { doctorId: 'doc4', time: '10:00', demoPatientIndex: 0, type: 'primary', reason: 'Эндокринология' },
            
            // Среда
            { doctorId: 'doc1', time: '09:00', demoPatientIndex: 2, type: 'secondary', reason: 'ЭКГ контроль' },
            { doctorId: 'doc3', time: '15:00', demoPatientIndex: 3, type: 'primary', reason: 'Профосмотр' },
            { doctorId: 'doc4', time: '13:00', demoPatientIndex: 4, type: 'secondary', reason: 'Коррекция терапии' },
            
            // Четверг
            { doctorId: 'doc2', time: '10:30', demoPatientIndex: 1, type: 'primary', reason: 'Аритмия' },
            { doctorId: 'doc1', time: '14:30', demoPatientIndex: 0, type: 'secondary', reason: 'После стационара' },
            
            // Пятница
            { doctorId: 'doc1', time: '09:30', demoPatientIndex: 3, type: 'primary', reason: 'Гипертония' },
            { doctorId: 'doc3', time: '12:00', demoPatientIndex: 2, type: 'secondary', reason: 'Диспансеризация' },
            { doctorId: 'doc2', time: '16:00', demoPatientIndex: 4, type: 'primary', reason: 'Консультация' }
        ];
        
        // Генерируем записи на неделю с использованием демо-пациентов
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + dayOffset);
            const dateString = currentDate.toISOString().split('T')[0];
            
            // Добавляем записи для каждого дня
            baseAppointments
                .filter(() => Math.random() > 0.3) // Случайно выбираем записи
                .forEach((appointment, index) => {
                    const demoPatient = this.demoPatients[appointment.demoPatientIndex % this.demoPatients.length];
                    
                    this.appointments.push({
                        id: `app_${dateString}_${index}`,
                        doctorId: appointment.doctorId,
                        patientId: demoPatient.id,
                        patientName: demoPatient.name,
                        date: dateString,
                        time: appointment.time,
                        duration: 30,
                        type: appointment.type,
                        status: this.getRandomStatus(currentDate),
                        reason: appointment.reason
                    });
                });
        }
        
        console.log(`📅 Загружено записей в расписании: ${this.appointments.length}`);
    }

    getRandomStatus(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        
        if (date < today) {
            return 'completed';
        } else if (date.getTime() === today.getTime()) {
            const random = Math.random();
            if (random < 0.3) return 'completed';
            if (random < 0.6) return 'in_progress';
            return 'scheduled';
        }
        return 'scheduled';
    }

    initWeekView() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        this.weekStartDate = new Date(today);
        this.weekStartDate.setDate(today.getDate() + daysToMonday);
        this.weekStartDate.setHours(0, 0, 0, 0);
    }

    getScheduleGridHTML() {
        return `
            <!-- Заголовок и фильтры -->
            <div class="schedule-grid-header">
                <div class="row align-items-center mb-4">
                    <div class="col-md-8">
                        <h3>
                            <i class="fas fa-calendar-plus"></i> 
                            Расписание приемов
                        </h3>
                        <div class="schedule-date-info">
                            ${this.currentView === 'day' ? this.getFormattedCurrentDate() : this.getFormattedWeekRange()}
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="d-flex gap-2 justify-content-end">
                            <div class="btn-group" role="group">
                                <button type="button" class="btn btn-outline-primary ${this.currentView === 'day' ? 'active' : ''}" 
                                        onclick="scheduleGridManager.switchView('day')">
                                    <i class="fas fa-calendar-day"></i> День
                                </button>
                                <button type="button" class="btn btn-outline-primary ${this.currentView === 'week' ? 'active' : ''}" 
                                        onclick="scheduleGridManager.switchView('week')">
                                    <i class="fas fa-calendar-week"></i> Неделя
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Фильтры -->
                <div class="schedule-filters">
                    <div class="row g-3">
                        <div class="col-md-3">
                            <label class="form-label">Специальность</label>
                            <div class="custom-dropdown">
                                <div class="custom-dropdown-trigger" onclick="scheduleGridManager.toggleDropdown('specialtyDropdown')">
                                    <span class="dropdown-value" id="specialtyValue">Все специальности</span>
                                    <i class="fas fa-chevron-down dropdown-arrow"></i>
                                </div>
                                <div class="custom-dropdown-menu" id="specialtyDropdown">
                                    <div class="dropdown-item" onclick="scheduleGridManager.selectSpecialty('all')">
                                        <span class="color-marker" style="background: #6c757d;"></span>
                                        <span>Все специальности</span>
                                    </div>
                                    ${this.specialties.map(spec => `
                                        <div class="dropdown-item" onclick="scheduleGridManager.selectSpecialty('${spec.id}')">
                                            <span class="color-marker" style="background: ${spec.color};"></span>
                                            <span>${spec.name}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Врач</label>
                            <div class="custom-dropdown">
                                <div class="custom-dropdown-trigger" onclick="scheduleGridManager.toggleDropdown('doctorDropdown')">
                                    <span class="dropdown-value" id="doctorValue">Все врачи</span>
                                    <i class="fas fa-chevron-down dropdown-arrow"></i>
                                </div>
                                <div class="custom-dropdown-menu" id="doctorDropdown">
                                    <div class="dropdown-item" onclick="scheduleGridManager.selectDoctor('all')">
                                        <span>Все врачи</span>
                                    </div>
                                    ${this.getFilteredDoctors().map(doc => {
                                        const specialty = this.specialties.find(s => s.id === doc.specialty);
                                        return `
                                            <div class="dropdown-item" onclick="scheduleGridManager.selectDoctor('${doc.id}')">
                                                <span class="color-marker" style="background: ${specialty.color};"></span>
                                                <span>${doc.name}</span>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Дата</label>
                            <div class="custom-date-picker-wrapper">
                                <input type="date" class="form-control custom-date-picker" id="dateFilter" 
                                       value="${this.currentDate.toISOString().split('T')[0]}"
                                       onchange="scheduleGridManager.changeDate(this.value)"
                                       ${this.currentView === 'week' ? 'disabled' : ''}>
                                <i class="fas fa-calendar-alt custom-date-icon"></i>
                            </div>
                        </div>
                        <div class="col-md-3 d-flex align-items-end">
                            <div class="btn-group w-100">
                                <button class="btn btn-outline-secondary" onclick="scheduleGridManager.${this.currentView === 'day' ? 'previousDay' : 'previousWeek'}()">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <button class="btn btn-outline-primary" onclick="scheduleGridManager.goToToday()">
                                    Сегодня
                                </button>
                                <button class="btn btn-outline-secondary" onclick="scheduleGridManager.${this.currentView === 'day' ? 'nextDay' : 'nextWeek'}()">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ОБНОВЛЕННАЯ инструкция -->
                <div class="schedule-usage-hint">
                    <div class="alert alert-info alert-dismissible fade show" role="alert">
                        <div class="d-flex align-items-center">
                            <i class="fas fa-info-circle me-2"></i>
                            <strong>Как работать:</strong> Кликните на любую запись в расписании, чтобы открыть карту пациента. В карте можно просматривать прошлые консультации и создавать новые. Для добавления новой записи нажмите на пустой слот времени.
                        </div>
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                </div>
            </div>

            <!-- Сетка расписания -->
            <div class="schedule-grid-container">
                ${this.currentView === 'day' ? this.getDayViewHTML() : this.getWeekViewHTML()}
            </div>

            <!-- ИСПРАВЛЕНО: Улучшенный модал добавления записи -->
            <div class="modal fade" id="addAppointmentModal" tabindex="-1">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content enhanced-modal">
                        <div class="modal-header enhanced-modal-header">
                            <div class="modal-title-wrapper">
                                <div class="modal-icon">
                                    <i class="fas fa-plus-circle"></i>
                                </div>
                                <div>
                                    <h5 class="modal-title">Новая запись на прием</h5>
                                    <p class="modal-subtitle">Создание записи в расписании врача</p>
                                </div>
                            </div>
                            <button type="button" class="btn-close enhanced-btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body enhanced-modal-body">
                            ${this.getAddAppointmentFormHTML()}
                        </div>
                        <div class="modal-footer enhanced-modal-footer">
                            <button type="button" class="btn btn-secondary enhanced-btn" data-bs-dismiss="modal">
                                <i class="fas fa-times"></i> Отмена
                            </button>
                            <button type="button" class="btn btn-primary enhanced-btn" onclick="scheduleGridManager.saveAppointment()">
                                <i class="fas fa-save"></i> Сохранить запись
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>
            .schedule-grid-header {
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                padding: 2rem;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                margin-bottom: 2rem;
                border: 1px solid #e2e8f0;
            }

            .schedule-date-info {
                color: #6c757d;
                font-size: 1rem;
                margin-top: 0.5rem;
                font-weight: 500;
            }

            .schedule-filters {
                background: #f8f9fa;
                padding: 1.5rem;
                border-radius: 8px;
                margin-top: 1.5rem;
                border: 1px solid #e9ecef;
            }

            /* ИСПРАВЛЕНО: Кастомные стили для input[type="date"] */
            .custom-date-picker-wrapper {
                position: relative;
            }

            .custom-date-picker {
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                border: 2px solid #e2e8f0;
                border-radius: 10px;
                padding: 12px 45px 12px 15px;
                font-size: 14px;
                font-weight: 500;
                color: #495057;
                transition: all 0.3s ease;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                appearance: none;
                -webkit-appearance: none;
                -moz-appearance: none;
            }

            .custom-date-picker::-webkit-calendar-picker-indicator {
                opacity: 0;
                position: absolute;
                right: 15px;
                top: 50%;
                transform: translateY(-50%);
                cursor: pointer;
                width: 20px;
                height: 20px;
            }

            .custom-date-picker:focus {
                border-color: var(--primary-color);
                box-shadow: 0 0 0 3px rgba(46, 134, 171, 0.15);
                outline: none;
                transform: translateY(-1px);
            }

            .custom-date-icon {
                position: absolute;
                right: 15px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--primary-color);
                font-size: 16px;
                pointer-events: none;
                z-index: 1;
            }

            .custom-date-picker:disabled {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                color: #6c757d;
                cursor: not-allowed;
                opacity: 0.7;
            }

            .custom-date-picker:disabled + .custom-date-icon {
                color: #6c757d;
                opacity: 0.5;
            }

            /* Кастомные выпадающие списки */
            .custom-dropdown {
                position: relative;
                width: 100%;
            }

            .custom-dropdown-trigger {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0.75rem 1rem;
                background: white;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                user-select: none;
            }

            .custom-dropdown-trigger:hover {
                border-color: var(--primary-color);
                background: #f8fafc;
            }

            .dropdown-value {
                font-weight: 500;
                color: #333;
            }

            .dropdown-arrow {
                color: #6c757d;
                transition: transform 0.3s ease;
            }

            .custom-dropdown.active .dropdown-arrow {
                transform: rotate(180deg);
            }

            .custom-dropdown-menu {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                margin-top: 4px;
                max-height: 250px;
                overflow-y: auto;
                z-index: 100;
                display: none;
                box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            }

            .custom-dropdown.active .custom-dropdown-menu {
                display: block;
                animation: dropdownOpen 0.3s ease;
            }

            @keyframes dropdownOpen {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .dropdown-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 0.75rem 1rem;
                cursor: pointer;
                transition: all 0.2s ease;
                border-bottom: 1px solid #f0f0f0;
            }

            .dropdown-item:last-child {
                border-bottom: none;
            }

            .dropdown-item:hover {
                background: #f8fafc;
                padding-left: 1.25rem;
            }

            .color-marker {
                width: 16px;
                height: 16px;
                border-radius: 4px;
                flex-shrink: 0;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .schedule-usage-hint {
                margin-top: 1rem;
            }

            .schedule-grid-container {
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                overflow: hidden;
                border: 1px solid #e2e8f0;
            }

            /* ИСПРАВЛЕНО: Улучшенные стили модального окна */
            .enhanced-modal {
                border: none;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.2);
                backdrop-filter: blur(10px);
                overflow: hidden;
            }

            .enhanced-modal-header {
                background: linear-gradient(135deg, var(--primary-color) 0%, #246185 100%);
                color: white;
                padding: 2rem;
                border-bottom: none;
                position: relative;
                overflow: hidden;
            }

            .enhanced-modal-header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
                opacity: 0.3;
            }

            .modal-title-wrapper {
                display: flex;
                align-items: center;
                gap: 1.5rem;
                position: relative;
                z-index: 2;
            }

            .modal-icon {
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

            .modal-title {
                font-size: 1.5rem;
                font-weight: 600;
                margin: 0;
                line-height: 1.2;
            }

            .modal-subtitle {
                font-size: 0.9rem;
                opacity: 0.9;
                margin: 0.5rem 0 0 0;
                font-weight: 400;
            }

            .enhanced-btn-close {
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

            .enhanced-btn-close:hover {
                background: rgba(255,255,255,0.3);
                transform: scale(1.1);
            }

            .enhanced-modal-body {
                padding: 2.5rem;
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            }

            .enhanced-modal-footer {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                padding: 1.5rem 2.5rem;
                border-top: 1px solid #e2e8f0;
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
            }

            .enhanced-btn {
                padding: 12px 24px;
                border-radius: 10px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
                border: none;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }

            .enhanced-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.2);
            }

            .enhanced-btn.btn-primary {
                background: linear-gradient(135deg, var(--primary-color) 0%, #246185 100%);
                color: white;
            }

            .enhanced-btn.btn-secondary {
                background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
                color: white;
            }

            /* Улучшенные стили для формы в модальном окне */
            .enhanced-modal-body .form-label {
                font-weight: 600;
                color: var(--dark-color);
                margin-bottom: 0.75rem;
                font-size: 0.95rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .enhanced-modal-body .form-label i {
                color: var(--primary-color);
                width: 16px;
            }

            .enhanced-modal-body .form-control,
            .enhanced-modal-body .form-select {
                border: 2px solid #e2e8f0;
                border-radius: 10px;
                padding: 12px 16px;
                transition: all 0.3s ease;
                background: white;
                font-size: 0.95rem;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }

            .enhanced-modal-body .form-control:focus,
            .enhanced-modal-body .form-select:focus {
                border-color: var(--primary-color);
                box-shadow: 0 0 0 3px rgba(46, 134, 171, 0.15);
                outline: none;
                transform: translateY(-1px);
            }

            .enhanced-modal-body .row {
                margin-bottom: 1.5rem;
            }

            .enhanced-modal-body .row:last-child {
                margin-bottom: 0;
            }

            /* Стили для дневного вида */
            .schedule-grid {
                display: grid;
                grid-template-columns: 150px repeat(auto-fit, minmax(200px, 1fr));
                min-height: 600px;
            }

            /* Стили для недельного вида */
            .week-schedule-container {
                overflow-x: auto;
                overflow-y: visible;
                position: relative;
            }

            .week-schedule-grid {
                display: grid;
                grid-template-columns: 150px repeat(7, minmax(150px, 1fr));
                min-width: 1200px;
                position: relative;
            }

            .week-day-header {
                background: linear-gradient(135deg, var(--primary-color) 0%, #246185 100%);
                color: white;
                padding: 1rem;
                font-weight: 600;
                text-align: center;
                border-right: 1px solid rgba(255,255,255,0.2);
                position: sticky;
                top: 0;
                z-index: 10;
            }

            .week-day-header.today {
                background: linear-gradient(135deg, var(--success-color) 0%, #45a049 100%);
                box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
            }

            .week-day-name {
                font-size: 0.9rem;
                margin-bottom: 0.25rem;
            }

            .week-day-date {
                font-size: 0.8rem;
                opacity: 0.9;
            }

            .week-doctor-row {
                display: contents;
            }

            .week-doctor-header {
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                padding: 0.75rem;
                font-weight: 500;
                font-size: 0.85rem;
                border-bottom: 1px solid #e9ecef;
                border-right: 1px solid #e9ecef;
                display: flex;
                align-items: center;
                position: sticky;
                left: 0;
                background: white;
                z-index: 5;
            }

            .week-doctor-cell {
                border-right: 1px solid #e9ecef;
                border-bottom: 1px solid #e9ecef;
                min-height: 80px;
                padding: 0.5rem;
                position: relative;
            }

            .week-appointment-count {
                background: rgba(46, 134, 171, 0.1);
                border: 1px solid rgba(46, 134, 171, 0.3);
                border-radius: 6px;
                padding: 0.5rem;
                text-align: center;
                font-size: 0.85rem;
                margin-bottom: 0.5rem;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .week-appointment-count:hover {
                background: rgba(46, 134, 171, 0.2);
                transform: translateY(-1px);
            }

            .week-appointment-count .count {
                font-weight: 600;
                color: var(--primary-color);
                font-size: 1.1rem;
            }

            .week-appointment-mini {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 4px;
                padding: 0.25rem 0.5rem;
                margin-bottom: 0.25rem;
                font-size: 0.75rem;
                cursor: pointer;
                transition: all 0.2s ease;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .week-appointment-mini:hover {
                background: #e9ecef;
                transform: translateX(2px);
            }

            .week-appointment-mini.primary {
                border-left: 3px solid #3498db;
            }

            .week-appointment-mini.secondary {
                border-left: 3px solid #9b59b6;
            }

            .week-appointment-mini.completed {
                opacity: 0.7;
                border-left: 3px solid #2ecc71;
            }

            .week-empty-message {
                color: #bdc3c7;
                font-size: 0.8rem;
                text-align: center;
                padding: 1rem;
            }

            .time-column {
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                border-right: 2px solid #dee2e6;
            }

            .time-slot {
                padding: 0.75rem;
                border-bottom: 1px solid #e9ecef;
                font-weight: 500;
                color: #495057;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                min-height: 60px;
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            }

            .doctor-column {
                border-right: 1px solid #e9ecef;
                position: relative;
            }

            .doctor-header {
                background: linear-gradient(135deg, var(--primary-color) 0%, #246185 100%);
                color: white;
                padding: 1rem;
                font-weight: 600;
                text-align: center;
                border-bottom: 2px solid #dee2e6;
                position: sticky;
                top: 0;
                z-index: 10;
            }

            .doctor-name {
                font-size: 0.95rem;
                margin-bottom: 0.25rem;
            }

            .doctor-specialty {
                font-size: 0.8rem;
                opacity: 0.9;
                font-weight: 400;
            }

            .doctor-room {
                font-size: 0.75rem;
                margin-top: 0.25rem;
                opacity: 0.8;
            }

            .appointment-slot {
                min-height: 60px;
                border-bottom: 1px solid #e9ecef;
                position: relative;
                padding: 0.25rem;
                transition: all 0.2s ease;
            }

            .appointment-slot:hover {
                background: #f8f9fa;
            }

            /* УЛУЧШЕННЫЕ стили для карточек записей */
            .appointment-card {
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 0.75rem;
                margin: 0.25rem;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                border-left: 4px solid var(--primary-color);
                position: relative;
                overflow: hidden;
            }

            .appointment-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                border-left-width: 5px;
            }

            .appointment-card.primary {
                border-left-color: #3498db;
                background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%);
            }

            .appointment-card.secondary {
                border-left-color: #9b59b6;
                background: linear-gradient(135deg, #f3e5f5 0%, #faf5ff 100%);
            }

            .appointment-card.completed {
                border-left-color: #2ecc71;
                background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
                opacity: 0.9;
            }

            .appointment-card.in_progress {
                border-left-color: #f39c12;
                background: linear-gradient(135deg, #fff3e0 0%, #fffaf0 100%);
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.02); }
                100% { transform: scale(1); }
            }

            .appointment-patient {
                font-weight: 600;
                color: #2c3e50;
                font-size: 0.85rem;
                margin-bottom: 0.25rem;
                line-height: 1.2;
            }

            /* ИСПРАВЛЕНО: улучшенная видимость времени приема */
            .appointment-time {
                background: rgba(255, 255, 255, 0.95);
                color: #333;
                padding: 0.2rem 0.5rem;
                border-radius: 12px;
                font-size: 0.7rem;
                font-weight: 600;
                display: inline-block;
                margin-bottom: 0.25rem;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }

            .appointment-reason {
                font-size: 0.75rem;
                color: #6c757d;
                line-height: 1.2;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            .appointment-status {
                position: absolute;
                top: 0.25rem;
                right: 0.25rem;
                width: 8px;
                height: 8px;
                border-radius: 50%;
            }

            .appointment-status.scheduled { background: #3498db; }
            .appointment-status.in_progress { background: #f39c12; }
            .appointment-status.completed { background: #2ecc71; }
            .appointment-status.cancelled { background: #e74c3c; }

            .empty-slot {
                display: flex;
                align-items: center;
                justify-content: center;
                color: #bdc3c7;
                font-size: 0.8rem;
                min-height: 60px;
                cursor: pointer;
                transition: all 0.2s ease;
                border: 2px dashed transparent;
                border-radius: 4px;
                margin: 0.25rem;
            }

            .empty-slot:hover {
                border-color: var(--primary-color);
                background: rgba(46, 134, 171, 0.05);
                color: var(--primary-color);
            }

            .btn-group .btn.active {
                background-color: var(--primary-color);
                border-color: var(--primary-color);
                color: white;
                box-shadow: 0 2px 4px rgba(46, 134, 171, 0.3);
            }

            /* Стили для скроллбара недельного вида */
            .week-schedule-container::-webkit-scrollbar {
                height: 10px;
            }

            .week-schedule-container::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 5px;
            }

            .week-schedule-container::-webkit-scrollbar-thumb {
                background: #888;
                border-radius: 5px;
            }

            .week-schedule-container::-webkit-scrollbar-thumb:hover {
                background: #555;
            }

            @media (max-width: 768px) {
                .schedule-grid {
                    grid-template-columns: 100px 1fr;
                }
                
                .week-schedule-grid {
                    grid-template-columns: 100px repeat(7, minmax(120px, 1fr));
                    min-width: 900px;
                }
                
                .doctor-header {
                    padding: 0.75rem 0.5rem;
                }
                
                .doctor-name {
                    font-size: 0.8rem;
                }
                
                .appointment-card {
                    padding: 0.5rem;
                    margin: 0.125rem;
                }
                
                .custom-dropdown-menu {
                    max-height: 200px;
                }

                .enhanced-modal-body {
                    padding: 1.5rem;
                }

                .enhanced-modal-footer {
                    padding: 1rem 1.5rem;
                }

                .enhanced-btn {
                    padding: 10px 20px;
                    font-size: 0.9rem;
                }
            }
            </style>
        `;
    }

    getDayViewHTML() {
        const filteredDoctors = this.getFilteredDoctors();
        const filteredAppointments = this.getFilteredAppointments();

        return `
            <div class="schedule-grid">
                <div class="time-column">
                    <div class="doctor-header" style="background: linear-gradient(135deg, #6c757d 0%, #495057 100%);">
                        Время
                    </div>
                    ${this.timeSlots.map(time => `
                        <div class="time-slot">${time}</div>
                    `).join('')}
                </div>
                
                ${filteredDoctors.map(doctor => {
                    const specialty = this.specialties.find(s => s.id === doctor.specialty);
                    return `
                        <div class="doctor-column">
                            <div class="doctor-header" style="background: linear-gradient(135deg, ${specialty.color} 0%, ${this.darkenColor(specialty.color, 20)} 100%);">
                                <div class="doctor-name">${doctor.name}</div>
                                <div class="doctor-specialty">${specialty.name}</div>
                                <div class="doctor-room">Каб. ${doctor.room}</div>
                            </div>
                            ${this.timeSlots.map(time => {
                                const appointment = filteredAppointments.find(app => 
                                    app.doctorId === doctor.id && 
                                    app.time === time &&
                                    app.date === this.currentDate.toISOString().split('T')[0]
                                );
                                
                                if (appointment) {
                                    return `
                                        <div class="appointment-slot">
                                            <div class="appointment-card ${appointment.type} ${appointment.status}" 
                                                 onclick="scheduleGridManager.openPatientCard('${appointment.patientId}', '${appointment.id}')"
                                                 title="${appointment.patientName} - ${appointment.reason}">
                                                <div class="appointment-status ${appointment.status}"></div>
                                                <div class="appointment-patient">${appointment.patientName}</div>
                                                <div class="appointment-time">${appointment.time} (${appointment.duration} мин)</div>
                                                <div class="appointment-reason">${appointment.reason}</div>
                                            </div>
                                        </div>
                                    `;
                                } else {
                                    return `
                                        <div class="appointment-slot">
                                            <div class="empty-slot" onclick="scheduleGridManager.createAppointment('${doctor.id}', '${time}')">
                                                <i class="fas fa-plus"></i>
                                            </div>
                                        </div>
                                    `;
                                }
                            }).join('')}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    getWeekViewHTML() {
        const weekDays = this.getWeekDays();
        const filteredDoctors = this.getFilteredDoctors();
        const today = new Date().toISOString().split('T')[0];

        return `
            <div class="week-schedule-container">
                <div class="week-schedule-grid">
                    <!-- Заголовок с днями недели -->
                    <div class="doctor-header" style="background: linear-gradient(135deg, #6c757d 0%, #495057 100%);">
                        Врачи
                    </div>
                    ${weekDays.map(day => `
                        <div class="week-day-header ${day.dateString === today ? 'today' : ''}">
                            <div class="week-day-name">${day.dayName}</div>
                            <div class="week-day-date">${day.displayDate}</div>
                        </div>
                    `).join('')}
                    
                    <!-- Строки врачей -->
                    ${filteredDoctors.map(doctor => {
                        const specialty = this.specialties.find(s => s.id === doctor.specialty);
                        return `
                            <div class="week-doctor-row">
                                <div class="week-doctor-header">
                                    <div>
                                        <div style="font-weight: 600; color: ${specialty.color};">${doctor.name}</div>
                                        <div style="font-size: 0.75rem; color: #6c757d;">${specialty.name} • Каб. ${doctor.room}</div>
                                    </div>
                                </div>
                                ${weekDays.map(day => {
                                    const dayAppointments = this.getFilteredAppointments().filter(app => 
                                        app.doctorId === doctor.id && 
                                        app.date === day.dateString
                                    );
                                    
                                    return `
                                        <div class="week-doctor-cell">
                                            ${dayAppointments.length > 0 ? `
                                                <div class="week-appointment-count" onclick="scheduleGridManager.showDayDetails('${doctor.id}', '${day.dateString}')">
                                                    <div class="count">${dayAppointments.length}</div>
                                                    <div style="font-size: 0.7rem;">записей</div>
                                                </div>
                                                ${dayAppointments.slice(0, 3).map(app => `
                                                    <div class="week-appointment-mini ${app.type} ${app.status}" 
                                                         onclick="scheduleGridManager.openPatientCard('${app.patientId}', '${app.id}')"
                                                         title="${app.patientName} - ${app.reason}">
                                                        <strong>${app.time}</strong> ${app.patientName.split(' ')[0]}
                                                    </div>
                                                `).join('')}
                                                ${dayAppointments.length > 3 ? `
                                                    <div style="text-align: center; font-size: 0.7rem; color: #6c757d; margin-top: 0.25rem;">
                                                        +${dayAppointments.length - 3} еще...
                                                    </div>
                                                ` : ''}
                                            ` : `
                                                <div class="week-empty-message">
                                                    <i class="fas fa-calendar-times"></i><br>
                                                    Нет записей
                                                </div>
                                            `}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    getWeekDays() {
        const days = [];
        const dayNames = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(this.weekStartDate);
            date.setDate(this.weekStartDate.getDate() + i);
            
            days.push({
                dayName: dayNames[i],
                displayDate: date.getDate() + '.' + (date.getMonth() + 1).toString().padStart(2, '0'),
                dateString: date.toISOString().split('T')[0],
                isWeekend: i >= 5
            });
        }
        
        return days;
    }

    getFormattedWeekRange() {
        const startDate = new Date(this.weekStartDate);
        const endDate = new Date(this.weekStartDate);
        endDate.setDate(endDate.getDate() + 6);
        
        const options = { day: 'numeric', month: 'long' };
        const startStr = startDate.toLocaleDateString('ru-RU', options);
        const endStr = endDate.toLocaleDateString('ru-RU', { ...options, year: 'numeric' });
        
        return `${startStr} — ${endStr}`;
    }

    showDayDetails(doctorId, dateString) {
        this.currentDate = new Date(dateString);
        this.selectedDoctor = doctorId;
        this.switchView('day');
    }

    getAddAppointmentFormHTML() {
        return `
            <form id="addAppointmentForm">
                <div class="row">
                    <div class="col-md-6">
                        <label class="form-label">
                            <i class="fas fa-user-md"></i>
                            Врач
                        </label>
                        <select class="form-select" id="appointmentDoctor" required>
                            <option value="">Выберите врача...</option>
                            ${this.doctors.map(doc => {
                                const specialty = this.specialties.find(s => s.id === doc.specialty);
                                return `<option value="${doc.id}">${doc.name} (${specialty.name})</option>`;
                            }).join('')}
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">
                            <i class="fas fa-user"></i>
                            Пациент
                        </label>
                        <select class="form-select" id="appointmentPatient" required>
                            <option value="">Выберите пациента...</option>
                            ${this.demoPatients.map(patient => `
                                <option value="${patient.id}">${patient.name}</option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-4">
                        <label class="form-label">
                            <i class="fas fa-calendar"></i>
                            Дата
                        </label>
                        <div class="custom-date-picker-wrapper">
                            <input type="date" class="form-control custom-date-picker" id="appointmentDate" 
                                   value="${this.currentDate.toISOString().split('T')[0]}" required>
                            <i class="fas fa-calendar-alt custom-date-icon"></i>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">
                            <i class="fas fa-clock"></i>
                            Время
                        </label>
                        <select class="form-select" id="appointmentTime" required>
                            <option value="">Выберите время...</option>
                            ${this.timeSlots.map(time => `
                                <option value="${time}">${time}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">
                            <i class="fas fa-hourglass-half"></i>
                            Длительность
                        </label>
                        <select class="form-select" id="appointmentDuration">
                            <option value="30">30 минут</option>
                            <option value="60">60 минут</option>
                            <option value="90">90 минут</option>
                        </select>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <label class="form-label">
                            <i class="fas fa-stethoscope"></i>
                            Тип приема
                        </label>
                        <select class="form-select" id="appointmentType">
                            <option value="primary">Первичный</option>
                            <option value="secondary">Повторный</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">
                            <i class="fas fa-info-circle"></i>
                            Статус
                        </label>
                        <select class="form-select" id="appointmentStatus">
                            <option value="scheduled">Запланирован</option>
                            <option value="confirmed">Подтвержден</option>
                        </select>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-12">
                        <label class="form-label">
                            <i class="fas fa-comment-medical"></i>
                            Причина обращения
                        </label>
                        <textarea class="form-control" id="appointmentReason" rows="4" 
                                  placeholder="Краткое описание жалоб и причины обращения..."></textarea>
                    </div>
                </div>
            </form>
        `;
    }

    // ГЛАВНЫЙ МЕТОД: Открытие карты пациента (ОБНОВЛЕН для работы с overlay)
    openPatientCard(patientId, appointmentId) {
        console.log(`🎯 Клик по записи - открытие карты пациента: ${patientId}, запись: ${appointmentId}`);
        
        // Ищем пациента в демо-данных
        let patient = this.demoPatients.find(p => p.id === patientId);
        
        if (!patient && window.patientsManager) {
            patient = patientsManager.getPatient(patientId);
        }
        
        if (!patient && window.testData) {
            patient = window.testData.getPatientById(patientId);
        }
        
        if (!patient) {
            // Создаем временного пациента из записи
            const appointment = this.appointments.find(app => app.patientId === patientId);
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
        
        if (!patient) {
            utils.showErrorMessage('Пациент не найден');
            console.error(`❌ Пациент с ID ${patientId} не найден`);
            return;
        }

        // Показываем уведомление о переходе
        utils.showNotification(`Открытие карты пациента: ${patient.name}`, 'info', 2000);
        
        // Проверяем готовность главного приложения
        if (window.app && typeof window.app.openPatientFromSchedule === 'function') {
            window.app.openPatientFromSchedule(patientId, appointmentId);
        } else {
            console.warn('⚠️ Главное приложение не готово, попытка через 500мс...');
            setTimeout(() => {
                if (window.app && typeof window.app.openPatientFromSchedule === 'function') {
                    window.app.openPatientFromSchedule(patientId, appointmentId);
                } else {
                    utils.showErrorMessage('Ошибка: главное приложение не готово');
                }
            }, 500);
        }

        console.log('📋 Запрос на открытие карты пациента отправлен:', { patientId, appointmentId, patient });
    }

    // НОВЫЙ МЕТОД: Получение пациента по ID
    getPatientById(patientId) {
        return this.demoPatients.find(p => p.id === patientId) || null;
    }

    // Новые методы для кастомных выпадающих списков
    toggleDropdown(dropdownId) {
        const dropdown = document.getElementById(dropdownId).parentElement;
        const isActive = dropdown.classList.contains('active');
        
        // Закрываем все открытые выпадающие списки
        document.querySelectorAll('.custom-dropdown').forEach(d => {
            d.classList.remove('active');
        });
        
        // Открываем/закрываем текущий
        if (!isActive) {
            dropdown.classList.add('active');
        }
        
        // Закрываем при клике вне элемента
        setTimeout(() => {
            document.addEventListener('click', this.closeAllDropdowns, { once: true });
        }, 10);
    }

    closeAllDropdowns(e) {
        if (!e.target.closest('.custom-dropdown')) {
            document.querySelectorAll('.custom-dropdown').forEach(d => {
                d.classList.remove('active');
            });
        }
    }

    selectSpecialty(specialtyId) {
        this.selectedSpecialty = specialtyId;
        
        // Обновляем текст в выпадающем списке
        const valueElement = document.getElementById('specialtyValue');
        if (specialtyId === 'all') {
            valueElement.textContent = 'Все специальности';
        } else {
            const specialty = this.specialties.find(s => s.id === specialtyId);
            valueElement.textContent = specialty.name;
        }
        
        // Закрываем выпадающий список
        document.getElementById('specialtyDropdown').parentElement.classList.remove('active');
        
        // Обновляем список врачей
        this.updateDoctorDropdown();
        
        // Обновляем сетку
        this.refreshGrid();
    }

    selectDoctor(doctorId) {
        this.selectedDoctor = doctorId;
        
        // Обновляем текст в выпадающем списке
        const valueElement = document.getElementById('doctorValue');
        if (doctorId === 'all') {
            valueElement.textContent = 'Все врачи';
        } else {
            const doctor = this.doctors.find(d => d.id === doctorId);
            valueElement.textContent = doctor.name;
        }
        
        // Закрываем выпадающий список
        document.getElementById('doctorDropdown').parentElement.classList.remove('active');
        
        // Обновляем сетку
        this.refreshGrid();
    }

    updateDoctorDropdown() {
        const filteredDoctors = this.getFilteredDoctors();
        const doctorDropdown = document.getElementById('doctorDropdown');
        
        doctorDropdown.innerHTML = `
            <div class="dropdown-item" onclick="scheduleGridManager.selectDoctor('all')">
                <span>Все врачи</span>
            </div>
            ${filteredDoctors.map(doc => {
                const specialty = this.specialties.find(s => s.id === doc.specialty);
                return `
                    <div class="dropdown-item" onclick="scheduleGridManager.selectDoctor('${doc.id}')">
                        <span class="color-marker" style="background: ${specialty.color};"></span>
                        <span>${doc.name}</span>
                    </div>
                `;
            }).join('')}
        `;
        
        // Сброс выбранного врача если он не входит в отфильтрованный список
        if (this.selectedDoctor !== 'all' && !filteredDoctors.find(d => d.id === this.selectedDoctor)) {
            this.selectedDoctor = 'all';
            document.getElementById('doctorValue').textContent = 'Все врачи';
        }
    }

    switchView(view) {
        this.currentView = view;
        
        const dateFilter = document.getElementById('dateFilter');
        if (dateFilter) {
            dateFilter.disabled = view === 'week';
        }
        
        if (view === 'week') {
            this.initWeekView();
        }
        
        this.refreshGrid();
        utils.log('Переключение вида расписания', 'info', { view });
    }

    applyFilters() {
        // Этот метод больше не используется, так как фильтрация происходит через кастомные выпадающие списки
        this.refreshGrid();
    }

    filterBySpecialty(specialtyId) {
        this.selectSpecialty(specialtyId);
    }

    changeDate(dateString) {
        this.currentDate = new Date(dateString);
        this.refreshGrid();
    }

    previousDay() {
        this.currentDate.setDate(this.currentDate.getDate() - 1);
        document.getElementById('dateFilter').value = this.currentDate.toISOString().split('T')[0];
        this.refreshGrid();
    }

    nextDay() {
        this.currentDate.setDate(this.currentDate.getDate() + 1);
        document.getElementById('dateFilter').value = this.currentDate.toISOString().split('T')[0];
        this.refreshGrid();
    }

    previousWeek() {
        this.weekStartDate.setDate(this.weekStartDate.getDate() - 7);
        this.currentDate = new Date(this.weekStartDate);
        this.refreshGrid();
    }

    nextWeek() {
        this.weekStartDate.setDate(this.weekStartDate.getDate() + 7);
        this.currentDate = new Date(this.weekStartDate);
        this.refreshGrid();
    }

    goToToday() {
        this.currentDate = new Date();
        
        if (this.currentView === 'week') {
            this.initWeekView();
        } else {
            document.getElementById('dateFilter').value = this.currentDate.toISOString().split('T')[0];
        }
        
        this.refreshGrid();
    }

    getFilteredDoctors() {
        if (this.selectedSpecialty === 'all') {
            return this.doctors;
        }
        return this.doctors.filter(doc => doc.specialty === this.selectedSpecialty);
    }

    getFilteredAppointments() {
        let filtered = this.appointments;
        
        if (this.selectedSpecialty !== 'all') {
            const doctorIds = this.getFilteredDoctors().map(doc => doc.id);
            filtered = filtered.filter(app => doctorIds.includes(app.doctorId));
        }
        
        if (this.selectedDoctor !== 'all') {
            filtered = filtered.filter(app => app.doctorId === this.selectedDoctor);
        }
        
        return filtered;
    }

    getFormattedCurrentDate() {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return this.currentDate.toLocaleDateString('ru-RU', options);
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    showAddAppointmentModal() {
        const modal = new bootstrap.Modal(document.getElementById('addAppointmentModal'));
        modal.show();
    }

    createAppointment(doctorId, time) {
        document.getElementById('appointmentDoctor').value = doctorId;
        document.getElementById('appointmentTime').value = time;
        this.showAddAppointmentModal();
    }

    saveAppointment() {
        const form = document.getElementById('addAppointmentForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const selectedPatientId = document.getElementById('appointmentPatient').value;
        const selectedPatient = this.demoPatients.find(p => p.id === selectedPatientId);

        const newAppointment = {
            id: 'app_' + Date.now(),
            doctorId: document.getElementById('appointmentDoctor').value,
            patientId: selectedPatientId,
            patientName: selectedPatient ? selectedPatient.name : 'Новый пациент',
            date: document.getElementById('appointmentDate').value,
            time: document.getElementById('appointmentTime').value,
            duration: parseInt(document.getElementById('appointmentDuration').value),
            type: document.getElementById('appointmentType').value,
            status: document.getElementById('appointmentStatus').value,
            reason: document.getElementById('appointmentReason').value
        };

        this.appointments.push(newAppointment);
        
        bootstrap.Modal.getInstance(document.getElementById('addAppointmentModal')).hide();
        
        this.refreshGrid();
        
        utils.showSuccessMessage('Запись создана успешно');
        console.log('✅ Новая запись создана:', newAppointment);
    }

    refreshGrid() {
        const container = document.querySelector('.schedule-grid-container');
        if (container) {
            container.innerHTML = this.currentView === 'day' ? this.getDayViewHTML() : this.getWeekViewHTML();
        }
    }

    onTabActivate() {
        if (!this.isInitialized) {
            this.init();
        }
        this.refreshGrid();
        console.log('📅 Активация вкладки расписания');
    }
}

// Создаем глобальный экземпляр
const scheduleGridManager = new ScheduleGridManager();

// Экспорт для использования в других модулях
window.scheduleGridManager = scheduleGridManager;