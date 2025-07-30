/**
 * CardioAssistant Pro - Research Module (ПЕРЕРАБОТАННЫЙ)
 * Модуль исследований с подразделами: Лабораторные + Инструментальные
 */

class ResearchManager {
    constructor() {
        this.researches = [];
        this.storageKey = 'cardio_researches';
        this.templates = {};
        this.isInitialized = false;
        this.currentSection = 'laboratory'; // laboratory | instrumental
    }

    async init() {
        console.log('🔄 Инициализация модуля исследований...');
        await this.loadResearches();
        this.loadTemplates();
        console.log('✅ Модуль исследований инициализирован');
        this.isInitialized = true;
    }

    async loadResearches() {
        try {
            this.researches = utils.loadFromStorage(this.storageKey, []);
            console.log(`Загружено исследований: ${this.researches.length}`);
        } catch (error) {
            console.error('Ошибка загрузки исследований:', error);
            this.researches = [];
        }
    }

    saveResearches() {
        return utils.saveToStorage(this.storageKey, this.researches);
    }

    loadTemplates() {
        this.templates = {
            // ЛАБОРАТОРНЫЕ ИССЛЕДОВАНИЯ
            laboratory: {
                biochemistry: {
                    name: 'Биохимический анализ крови',
                    icon: 'fas fa-vial',
                    category: 'laboratory',
                    fields: {
                        glucose: 'Глюкоза',
                        urea: 'Мочевина',
                        creatinine: 'Креатинин',
                        totalProtein: 'Общий белок',
                        albumin: 'Альбумин',
                        alt: 'АЛТ',
                        ast: 'АСТ',
                        totalBilirubin: 'Общий билирубин',
                        conclusion: 'Заключение'
                    },
                    normalValues: {
                        glucose: '3.3-5.5 ммоль/л',
                        urea: '2.5-6.4 ммоль/л',
                        creatinine: '62-115 мкмоль/л (м), 53-97 мкмоль/л (ж)',
                        totalProtein: '64-84 г/л',
                        albumin: '35-52 г/л',
                        alt: '<40 Ед/л (м), <32 Ед/л (ж)',
                        ast: '<40 Ед/л (м), <32 Ед/л (ж)',
                        totalBilirubin: '5-21 мкмоль/л'
                    }
                },
                lipidProfile: {
                    name: 'Липидограмма',
                    icon: 'fas fa-chart-pie',
                    category: 'laboratory',
                    fields: {
                        totalCholesterol: 'Общий холестерин',
                        ldl: 'ЛНП',
                        hdl: 'ЛВП',
                        triglycerides: 'Триглицериды',
                        atherogenicIndex: 'Индекс атерогенности',
                        conclusion: 'Заключение'
                    },
                    normalValues: {
                        totalCholesterol: '<5.2 ммоль/л',
                        ldl: '<3.0 ммоль/л',
                        hdl: '>1.0 ммоль/л (м), >1.2 ммоль/л (ж)',
                        triglycerides: '<1.7 ммоль/л',
                        atherogenicIndex: '<3.0'
                    }
                },
                coagulation: {
                    name: 'Коагулограмма',
                    icon: 'fas fa-tint',
                    category: 'laboratory',
                    fields: {
                        pti: 'ПТИ',
                        inr: 'МНО',
                        aptt: 'АЧТВ',
                        fibrinogen: 'Фибриноген',
                        dDimer: 'D-димер',
                        conclusion: 'Заключение'
                    },
                    normalValues: {
                        pti: '80-120%',
                        inr: '0.9-1.2',
                        aptt: '24-35 сек',
                        fibrinogen: '2.0-4.0 г/л',
                        dDimer: '<500 нг/мл'
                    }
                },
                cardioMarkers: {
                    name: 'Кардиомаркеры',
                    icon: 'fas fa-heartbeat',
                    category: 'laboratory',
                    fields: {
                        troponinI: 'Тропонин I',
                        troponinT: 'Тропонин T',
                        ckMb: 'КФК-МВ',
                        bnp: 'BNP',
                        ntProBnp: 'NT-proBNP',
                        conclusion: 'Заключение'
                    },
                    normalValues: {
                        troponinI: '<0.04 нг/мл',
                        troponinT: '<0.014 нг/мл',
                        ckMb: '<25 Ед/л',
                        bnp: '<100 пг/мл',
                        ntProBnp: '<125 пг/мл (<75 лет)'
                    }
                },
                hormones: {
                    name: 'Гормоны щитовидной железы',
                    icon: 'fas fa-lungs',
                    category: 'laboratory',
                    fields: {
                        tsh: 'ТТГ',
                        t3: 'Т3 свободный',
                        t4: 'Т4 свободный',
                        conclusion: 'Заключение'
                    },
                    normalValues: {
                        tsh: '0.4-4.0 мЕд/л',
                        t3: '3.1-6.8 пмоль/л',
                        t4: '12-22 пмоль/л'
                    }
                }
            },
            
            // ИНСТРУМЕНТАЛЬНЫЕ ИССЛЕДОВАНИЯ
            instrumental: {
                ecg: {
                    name: 'ЭКГ',
                    icon: 'fas fa-heartbeat',
                    category: 'instrumental',
                    fields: {
                        rhythm: 'Ритм',
                        rate: 'ЧСС',
                        axis: 'Электрическая ось сердца',
                        pq: 'Интервал PQ',
                        qrs: 'Комплекс QRS',
                        qt: 'Интервал QT',
                        stSegment: 'Сегмент ST',
                        tWave: 'Зубец T',
                        conclusion: 'Заключение'
                    },
                    normalValues: {
                        rate: '60-100 уд/мин',
                        pq: '120-200 мс',
                        qrs: '<120 мс',
                        qt: 'зависит от ЧСС'
                    }
                },
                echo: {
                    name: 'ЭХО-КГ',
                    icon: 'fas fa-wave-square',
                    category: 'instrumental',
                    fields: {
                        aorta: 'Аорта',
                        leftAtrium: 'Левое предсердие',
                        leftVentricle: 'Левый желудочек',
                        rightVentricle: 'Правый желудочек',
                        ejectionFraction: 'Фракция выброса',
                        mitralValve: 'Митральный клапан',
                        aorticValve: 'Аортальный клапан',
                        conclusion: 'Заключение'
                    },
                    normalValues: {
                        ejectionFraction: '≥50%',
                        aorta: '<40 мм',
                        leftAtrium: '<40 мм'
                    }
                },
                holter: {
                    name: 'Холтеровское мониторирование ЭКГ',
                    icon: 'fas fa-chart-line',
                    category: 'instrumental',
                    fields: {
                        duration: 'Длительность мониторирования',
                        avgHR: 'Средняя ЧСС',
                        minHR: 'Минимальная ЧСС',
                        maxHR: 'Максимальная ЧСС',
                        arrhythmias: 'Нарушения ритма',
                        pauses: 'Паузы',
                        stChanges: 'Изменения ST',
                        conclusion: 'Заключение'
                    }
                },
                smad: {
                    name: 'СМАД',
                    icon: 'fas fa-tachometer-alt',
                    category: 'instrumental',
                    fields: {
                        avgDayBP: 'Среднее АД день',
                        avgNightBP: 'Среднее АД ночь',
                        avgTotalBP: 'Среднее АД сутки',
                        dipping: 'Степень снижения (%)',
                        loadIndex: 'Индекс нагрузки',
                        variability: 'Вариабельность',
                        conclusion: 'Заключение'
                    },
                    normalValues: {
                        avgDayBP: '<135/85 мм рт.ст.',
                        avgNightBP: '<120/70 мм рт.ст.',
                        dipping: '10-20%'
                    }
                },
                stress: {
                    name: 'Нагрузочный тест',
                    icon: 'fas fa-running',
                    category: 'instrumental',
                    fields: {
                        testType: 'Тип теста',
                        protocol: 'Протокол',
                        maxLoad: 'Максимальная нагрузка',
                        maxHR: 'Максимальная ЧСС',
                        bpResponse: 'Реакция АД',
                        symptoms: 'Симптомы',
                        ecgChanges: 'Изменения ЭКГ',
                        conclusion: 'Заключение'
                    }
                },
                xray: {
                    name: 'Рентгенография ОГК',
                    icon: 'fas fa-x-ray',
                    category: 'instrumental',
                    fields: {
                        heartSize: 'Размеры сердца',
                        lungFields: 'Легочные поля',
                        costophrenicAngles: 'Костно-диафрагмальные синусы',
                        skeleton: 'Костно-суставная система',
                        conclusion: 'Заключение'
                    }
                }
            }
        };
    }

    getResearchInterface() {
        return `
            <div class="research-header">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h3><i class="fas fa-microscope"></i> Исследования</h3>
                    <div>
                        <button class="btn btn-primary" onclick="researchManager.showCreateModal()">
                            <i class="fas fa-plus"></i> Создать исследование
                        </button>
                        <button class="btn btn-secondary" onclick="researchManager.exportResearches()">
                            <i class="fas fa-download"></i> Экспорт
                        </button>
                    </div>
                </div>
                
                <!-- Переключатель разделов -->
                <div class="research-section-switcher mb-4">
                    <div class="btn-group w-100" role="group">
                        <button type="button" class="btn btn-outline-primary active" 
                                id="laboratory-tab" 
                                onclick="researchManager.switchSection('laboratory')">
                            <i class="fas fa-vial"></i> Лабораторные исследования
                        </button>
                        <button type="button" class="btn btn-outline-primary" 
                                id="instrumental-tab"
                                onclick="researchManager.switchSection('instrumental')">
                            <i class="fas fa-stethoscope"></i> Инструментальные исследования
                        </button>
                    </div>
                </div>
            </div>

            <!-- Контент разделов -->
            <div id="laboratory-section" class="research-section">
                <div class="research-grid" id="laboratoryGrid">
                    ${this.generateSectionContent('laboratory')}
                </div>
            </div>

            <div id="instrumental-section" class="research-section" style="display: none;">
                <div class="research-grid" id="instrumentalGrid">
                    ${this.generateSectionContent('instrumental')}
                </div>
            </div>

            <!-- Модал создания исследования -->
            <div class="modal fade" id="createResearchModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Новое исследование</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="createResearchForm">
                                <div class="row">
                                    <div class="col-md-6">
                                        <label for="researchCategory" class="form-label">Категория</label>
                                        <select class="form-select" id="researchCategory" onchange="researchManager.onCategoryChange()">
                                            <option value="">Выберите категорию...</option>
                                            <option value="laboratory">Лабораторные</option>
                                            <option value="instrumental">Инструментальные</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="researchType" class="form-label">Тип исследования</label>
                                        <select class="form-select" id="researchType" onchange="researchManager.onTypeChange()">
                                            <option value="">Сначала выберите категорию...</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="row mt-3">
                                    <div class="col-md-6">
                                        <label for="researchDate" class="form-label">Дата исследования</label>
                                        <input type="date" class="form-control" id="researchDate" value="${new Date().toISOString().split('T')[0]}">
                                    </div>
                                    <div class="col-md-6">
                                        <label for="researchDoctor" class="form-label">Врач</label>
                                        <input type="text" class="form-control" id="researchDoctor" placeholder="ФИО врача" value="Текущий врач">
                                    </div>
                                </div>
                                
                                <div id="researchFields" class="mt-4">
                                    <!-- Поля будут добавляться динамически -->
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                            <button type="button" class="btn btn-primary" onclick="researchManager.saveResearch()">Сохранить</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Модал просмотра исследования -->
            <div class="modal fade" id="viewResearchModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="viewResearchTitle">Просмотр исследования</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="viewResearchBody">
                            <!-- Содержимое будет добавляться динамически -->
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                            <button type="button" class="btn btn-danger" onclick="researchManager.deleteCurrentResearch()">Удалить</button>
                        </div>
                    </div>
                </div>
            </div>

            <style>
            .research-section-switcher .btn-group .btn {
                flex: 1;
                padding: 12px;
                font-weight: 500;
            }
            
            .research-section-switcher .btn.active {
                background-color: var(--primary-color);
                border-color: var(--primary-color);
                color: white;
            }
            
            .research-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }
            
            .research-card {
                background: white;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 1.5rem;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .research-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                border-color: var(--primary-color);
            }
            
            .research-card-header {
                display: flex;
                align-items: center;
                margin-bottom: 1rem;
            }
            
            .research-card-icon {
                width: 40px;
                height: 40px;
                border-radius: 8px;
                background: var(--primary-color);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 1rem;
                font-size: 1.2rem;
            }
            
            .research-card-title {
                font-weight: 600;
                color: var(--dark-color);
                margin: 0;
                font-size: 1.1rem;
            }
            
            .research-card-body {
                color: #6c757d;
                font-size: 0.9rem;
                line-height: 1.4;
            }
            
            .research-empty {
                text-align: center;
                padding: 3rem;
                color: #6c757d;
            }
            
            .research-empty i {
                font-size: 3rem;
                margin-bottom: 1rem;
                opacity: 0.5;
            }
            </style>
        `;
    }

    generateSectionContent(section) {
        const templates = this.templates[section];
        if (!templates) return '<div class="research-empty"><i class="fas fa-flask"></i><h5>Нет шаблонов</h5></div>';

        const cards = Object.entries(templates).map(([key, template]) => `
            <div class="research-card" onclick="researchManager.createFromTemplate('${section}', '${key}')">
                <div class="research-card-header">
                    <div class="research-card-icon">
                        <i class="${template.icon}"></i>
                    </div>
                    <h5 class="research-card-title">${template.name}</h5>
                </div>
                <div class="research-card-body">
                    <div class="mb-2">
                        <strong>Поля:</strong> ${Object.keys(template.fields).length}
                    </div>
                    ${template.normalValues ? '<small class="text-success">✓ Нормальные значения</small>' : ''}
                </div>
            </div>
        `).join('');

        return cards || '<div class="research-empty"><i class="fas fa-flask"></i><h5>Нет исследований</h5><p>Создайте первое исследование</p></div>';
    }

    switchSection(section) {
        this.currentSection = section;
        
        // Обновляем активные кнопки
        document.getElementById('laboratory-tab').classList.toggle('active', section === 'laboratory');
        document.getElementById('instrumental-tab').classList.toggle('active', section === 'instrumental');
        
        // Показываем/скрываем разделы
        document.getElementById('laboratory-section').style.display = section === 'laboratory' ? 'block' : 'none';
        document.getElementById('instrumental-section').style.display = section === 'instrumental' ? 'block' : 'none';
        
        console.log(`🔬 Переключение на раздел: ${section}`);
        utils.log('Переключение раздела исследований', 'info', { section });
    }

    showCreateModal() {
        const modal = new bootstrap.Modal(document.getElementById('createResearchModal'));
        
        // Сбрасываем форму
        document.getElementById('createResearchForm').reset();
        document.getElementById('researchDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('researchDoctor').value = 'Текущий врач';
        document.getElementById('researchFields').innerHTML = '';
        
        // Устанавливаем текущую категорию
        document.getElementById('researchCategory').value = this.currentSection;
        this.onCategoryChange();
        
        modal.show();
    }

    createFromTemplate(section, templateKey) {
        this.showCreateModal();
        
        // Устанавливаем категорию и тип
        document.getElementById('researchCategory').value = section;
        this.onCategoryChange();
        document.getElementById('researchType').value = templateKey;
        this.onTypeChange();
    }

    onCategoryChange() {
        const category = document.getElementById('researchCategory').value;
        const typeSelect = document.getElementById('researchType');
        
        if (!category) {
            typeSelect.innerHTML = '<option value="">Сначала выберите категорию...</option>';
            document.getElementById('researchFields').innerHTML = '';
            return;
        }
        
        const templates = this.templates[category];
        typeSelect.innerHTML = '<option value="">Выберите тип...</option>' +
            Object.entries(templates).map(([key, template]) => 
                `<option value="${key}">${template.name}</option>`
            ).join('');
    }

    onTypeChange() {
        const category = document.getElementById('researchCategory').value;
        const type = document.getElementById('researchType').value;
        const fieldsContainer = document.getElementById('researchFields');
        
        if (!category || !type) {
            fieldsContainer.innerHTML = '';
            return;
        }
        
        const template = this.templates[category][type];
        if (!template) return;
        
        let fieldsHTML = `<h6 class="mb-3">${template.name} - Поля исследования</h6>`;
        
        Object.entries(template.fields).forEach(([key, label]) => {
            const normalValue = template.normalValues?.[key];
            
            fieldsHTML += `
                <div class="mb-3">
                    <label for="field_${key}" class="form-label">
                        ${label}
                        ${normalValue ? `<span class="text-muted small">(Норма: ${normalValue})</span>` : ''}
                    </label>
                    ${key === 'conclusion' ? 
                        `<textarea class="form-control" id="field_${key}" rows="3" placeholder="Введите ${label.toLowerCase()}..."></textarea>` :
                        `<input type="text" class="form-control" id="field_${key}" placeholder="Введите ${label.toLowerCase()}...">`
                    }
                </div>
            `;
        });
        
        fieldsContainer.innerHTML = fieldsHTML;
    }

    saveResearch() {
        const form = document.getElementById('createResearchForm');
        const category = document.getElementById('researchCategory').value;
        const type = document.getElementById('researchType').value;
        const date = document.getElementById('researchDate').value;
        const doctor = document.getElementById('researchDoctor').value;
        
        if (!category || !type || !date) {
            utils.showErrorMessage('Заполните все обязательные поля');
            return;
        }
        
        const template = this.templates[category][type];
        const data = {};
        
        // Собираем данные из полей
        Object.keys(template.fields).forEach(key => {
            const field = document.getElementById(`field_${key}`);
            if (field) {
                data[key] = field.value;
            }
        });
        
        const research = {
            id: this.generateResearchId(),
            category: category,
            type: type,
            name: template.name,
            date: date,
            doctor: doctor,
            data: data,
            createdAt: new Date().toISOString(),
            patientId: app.currentPatient?.id || null
        };
        
        this.researches.push(research);
        this.saveResearches();
        
        // Закрываем модал
        bootstrap.Modal.getInstance(document.getElementById('createResearchModal')).hide();
        
        // Обновляем интерфейс
        this.refreshInterface();
        
        utils.showSuccessMessage(`Исследование "${template.name}" сохранено`);
        console.log('🔬 Исследование сохранено:', research);
    }

    viewResearch(researchId) {
        const research = this.researches.find(r => r.id === researchId);
        if (!research) return;
        
        const modal = document.getElementById('viewResearchModal');
        const title = document.getElementById('viewResearchTitle');
        const body = document.getElementById('viewResearchBody');
        
        title.textContent = `${research.name} - ${new Date(research.date).toLocaleDateString('ru-RU')}`;
        
        const template = this.templates[research.category][research.type];
        
        let bodyHTML = `
            <div class="row mb-3">
                <div class="col-md-6"><strong>Категория:</strong> ${research.category === 'laboratory' ? 'Лабораторные' : 'Инструментальные'}</div>
                <div class="col-md-6"><strong>Дата:</strong> ${new Date(research.date).toLocaleDateString('ru-RU')}</div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6"><strong>Врач:</strong> ${research.doctor}</div>
                <div class="col-md-6"><strong>Создано:</strong> ${new Date(research.createdAt).toLocaleDateString('ru-RU')}</div>
            </div>
            <hr>
            <h6>Результаты:</h6>
        `;
        
        Object.entries(template.fields).forEach(([key, label]) => {
            const value = research.data[key] || 'Не указано';
            const normalValue = template.normalValues?.[key];
            
            bodyHTML += `
                <div class="mb-2">
                    <strong>${label}:</strong> ${value}
                    ${normalValue ? `<small class="text-muted ms-2">(Норма: ${normalValue})</small>` : ''}
                </div>
            `;
        });
        
        body.innerHTML = bodyHTML;
        
        // Сохраняем ID для возможного удаления
        modal.setAttribute('data-research-id', researchId);
        
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    }

    deleteCurrentResearch() {
        const modal = document.getElementById('viewResearchModal');
        const researchId = modal.getAttribute('data-research-id');
        
        if (confirm('Вы уверены, что хотите удалить это исследование?')) {
            const index = this.researches.findIndex(r => r.id === researchId);
            if (index >= 0) {
                this.researches.splice(index, 1);
                this.saveResearches();
                
                // Закрываем модал
                bootstrap.Modal.getInstance(modal).hide();
                
                // Обновляем интерфейс
                this.refreshInterface();
                
                utils.showSuccessMessage('Исследование удалено');
            }
        }
    }

    refreshInterface() {
        // Обновляем текущий раздел
        const grid = document.getElementById(this.currentSection + 'Grid');
        if (grid) {
            const sectionResearches = this.researches.filter(r => r.category === this.currentSection);
            
            if (sectionResearches.length === 0) {
                grid.innerHTML = this.generateSectionContent(this.currentSection);
            } else {
                // Добавляем карточки сохраненных исследований
                const savedCards = sectionResearches.map(research => `
                    <div class="research-card" onclick="researchManager.viewResearch('${research.id}')">
                        <div class="research-card-header">
                            <div class="research-card-icon">
                                <i class="fas fa-file-medical"></i>
                            </div>
                            <div>
                                <h5 class="research-card-title">${research.name}</h5>
                                <small class="text-muted">${new Date(research.date).toLocaleDateString('ru-RU')}</small>
                            </div>
                        </div>
                        <div class="research-card-body">
                            <div class="mb-1"><strong>Врач:</strong> ${research.doctor}</div>
                            ${research.data.conclusion ? 
                                `<div class="mt-2"><small>${research.data.conclusion.substring(0, 80)}${research.data.conclusion.length > 80 ? '...' : ''}</small></div>` : 
                                ''
                            }
                        </div>
                    </div>
                `).join('');
                
                grid.innerHTML = this.generateSectionContent(this.currentSection) + savedCards;
            }
        }
    }

    onTabActivate() {
        if (!this.isInitialized) {
            this.init();
        }
        this.refreshInterface();
    }

    generateResearchId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Экспорт исследований
    exportResearches() {
        if (this.researches.length === 0) {
            utils.showWarningMessage('Нет исследований для экспорта');
            return;
        }
        
        const exportData = {
            exportDate: new Date().toISOString(),
            version: '2.0',
            patientId: app.currentPatient?.id || null,
            researches: this.researches
        };
        
        const jsonString = JSON.stringify(exportData, null, 2);
        utils.downloadFile(
            jsonString, 
            `researches_export_${Date.now()}.json`, 
            'application/json'
        );
        
        utils.showSuccessMessage('Исследования экспортированы');
    }

    // Получение исследований пациента
    getPatientResearches(patientId) {
        return this.researches.filter(r => r.patientId === patientId);
    }

    // Получение статистики
    getStatistics() {
        const stats = {
            total: this.researches.length,
            byCategory: {
                laboratory: this.researches.filter(r => r.category === 'laboratory').length,
                instrumental: this.researches.filter(r => r.category === 'instrumental').length
            },
            byType: {}
        };
        
        this.researches.forEach(research => {
            stats.byType[research.type] = (stats.byType[research.type] || 0) + 1;
        });
        
        return stats;
    }
}

// Создаем глобальный экземпляр
const researchManager = new ResearchManager();

// Экспорт для использования в других модулях
window.researchManager = researchManager;