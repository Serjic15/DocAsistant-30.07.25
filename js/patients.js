/**
 * CardioAssistant Pro - Patients Management Module
 * Модуль управления пациентами
 */

class PatientsManager {
    constructor() {
        this.patients = [];
        this.storageKey = 'cardio_patients';
        this.currentPatient = null;
    }

    async init() {
        console.log('🔄 Инициализация менеджера пациентов...');
        await this.loadPatients();
        this.createTestPatients();
        console.log('✅ Менеджер пациентов инициализирован');
    }

    async loadPatients() {
        try {
            this.patients = utils.loadFromStorage(this.storageKey, []);
            console.log(`Загружено пациентов: ${this.patients.length}`);
        } catch (error) {
            console.error('Ошибка загрузки пациентов:', error);
            this.patients = [];
        }
    }

    savePatients() {
        return utils.saveToStorage(this.storageKey, this.patients);
    }

    // Создание тестовых пациентов для демонстрации
    createTestPatients() {
        if (this.patients.length === 0) {
            const testPatients = [
                {
                    id: 1,
                    name: 'Иванов Петр Сергеевич',
                    birthDate: '1965-03-15',
                    gender: 'male',
                    phone: '+7 (495) 123-45-67',
                    email: 'ivanov@example.com',
                    cardNumber: utils.generatePatientCardNumber(),
                    address: 'г. Москва, ул. Ленина, д. 10, кв. 25',
                    weight: 85,
                    height: 178,
                    createdAt: new Date().toISOString(),
                    // Рассчитываемые поля
                    age: utils.calculateAge('1965-03-15'),
                    bmi: utils.calculateBMI(85, 178),
                    bsa: utils.calculateBSA(85, 178)
                },
                {
                    id: 2,
                    name: 'Смирнова Елена Александровна',
                    birthDate: '1978-11-22',
                    gender: 'female',
                    phone: '+7 (926) 987-65-43',
                    email: 'smirnova@example.com',
                    cardNumber: utils.generatePatientCardNumber(),
                    address: 'г. Москва, ул. Пушкина, д. 5, кв. 12',
                    weight: 62,
                    height: 165,
                    createdAt: new Date().toISOString(),
                    age: utils.calculateAge('1978-11-22'),
                    bmi: utils.calculateBMI(62, 165),
                    bsa: utils.calculateBSA(62, 165)
                },
                {
                    id: 3,
                    name: 'Козлов Андрей Викторович',
                    birthDate: '1955-07-08',
                    gender: 'male',
                    phone: '+7 (903) 555-33-22',
                    email: 'kozlov@example.com',
                    cardNumber: utils.generatePatientCardNumber(),
                    address: 'г. Москва, пр-т Мира, д. 25, кв. 8',
                    weight: 92,
                    height: 180,
                    createdAt: new Date().toISOString(),
                    age: utils.calculateAge('1955-07-08'),
                    bmi: utils.calculateBMI(92, 180),
                    bsa: utils.calculateBSA(92, 180)
                }
            ];

            testPatients.forEach(patient => this.addPatient(patient));
            utils.showInfoMessage('Созданы тестовые пациенты для демонстрации');
        }
    }

    // CRUD операции
    addPatient(patientData) {
        // Проверяем, есть ли уже пациент с таким ID
        const existingIndex = this.patients.findIndex(p => p.id === patientData.id);
        
        if (existingIndex >= 0) {
            // Обновляем существующего пациента
            this.patients[existingIndex] = {
                ...this.patients[existingIndex],
                ...patientData,
                updatedAt: new Date().toISOString()
            };
        } else {
            // Добавляем нового пациента
            const newPatient = {
                id: patientData.id || this.generatePatientId(),
                ...patientData,
                createdAt: patientData.createdAt || new Date().toISOString(),
                cardNumber: patientData.cardNumber || utils.generatePatientCardNumber()
            };
            
            // Рассчитываем дополнительные поля
            this.calculatePatientMetrics(newPatient);
            
            this.patients.push(newPatient);
        }
        
        this.savePatients();
        return this.patients[this.patients.length - 1];
    }

    addTestPatient(patientData) {
        // Специальный метод для добавления тестовых пациентов без сохранения в localStorage
        const existingIndex = this.patients.findIndex(p => p.id === patientData.id);
        
        if (existingIndex === -1) {
            const newPatient = {
                ...patientData,
                createdAt: new Date().toISOString(),
                cardNumber: utils.generatePatientCardNumber()
            };
            
            this.calculatePatientMetrics(newPatient);
            this.patients.push(newPatient);
        }
        
        return this.patients.find(p => p.id === patientData.id);
    }

    updatePatient(patientId, updateData) {
        const index = this.patients.findIndex(p => p.id === patientId);
        
        if (index === -1) {
            console.error(`Пациент с ID ${patientId} не найден`);
            return null;
        }
        
        this.patients[index] = {
            ...this.patients[index],
            ...updateData,
            updatedAt: new Date().toISOString()
        };
        
        // Пересчитываем метрики
        this.calculatePatientMetrics(this.patients[index]);
        
        this.savePatients();
        return this.patients[index];
    }

    deletePatient(patientId) {
        const index = this.patients.findIndex(p => p.id === patientId);
        
        if (index === -1) {
            console.error(`Пациент с ID ${patientId} не найден`);
            return false;
        }
        
        this.patients.splice(index, 1);
        this.savePatients();
        return true;
    }

    getPatient(patientId) {
        return this.patients.find(p => p.id === patientId) || null;
    }

    getAllPatients() {
        return [...this.patients];
    }

    // Поиск и фильтрация
    searchPatients(query) {
        if (!query || query.trim() === '') {
            return this.getAllPatients();
        }
        
        const searchTerm = query.toLowerCase().trim();
        
        return this.patients.filter(patient => {
            return (
                patient.name.toLowerCase().includes(searchTerm) ||
                patient.cardNumber.toLowerCase().includes(searchTerm) ||
                (patient.phone && patient.phone.includes(searchTerm)) ||
                (patient.email && patient.email.toLowerCase().includes(searchTerm))
            );
        });
    }

    filterPatients(filters) {
        let filtered = [...this.patients];
        
        if (filters.gender) {
            filtered = filtered.filter(p => p.gender === filters.gender);
        }
        
        if (filters.ageFrom || filters.ageTo) {
            filtered = filtered.filter(p => {
                const age = p.age || utils.calculateAge(p.birthDate);
                return (!filters.ageFrom || age >= filters.ageFrom) &&
                       (!filters.ageTo || age <= filters.ageTo);
            });
        }
        
        if (filters.dateFrom || filters.dateTo) {
            filtered = filtered.filter(p => {
                const date = new Date(p.createdAt);
                return (!filters.dateFrom || date >= new Date(filters.dateFrom)) &&
                       (!filters.dateTo || date <= new Date(filters.dateTo));
            });
        }
        
        return filtered;
    }

    // Расчет медицинских метрик
    calculatePatientMetrics(patient) {
        if (patient.birthDate) {
            patient.age = utils.calculateAge(patient.birthDate);
        }
        
        if (patient.weight && patient.height) {
            patient.bmi = utils.calculateBMI(patient.weight, patient.height);
            patient.bmiCategory = utils.getBMICategory(patient.bmi);
            patient.bsa = utils.calculateBSA(patient.weight, patient.height);
        }
        
        return patient;
    }

    // Валидация данных пациента
    validatePatientData(patientData) {
        const errors = [];
        
        if (!patientData.name || patientData.name.trim().length < 2) {
            errors.push('ФИО должно содержать минимум 2 символа');
        }
        
        if (!patientData.birthDate) {
            errors.push('Дата рождения обязательна');
        } else {
            const birthDate = new Date(patientData.birthDate);
            const today = new Date();
            const age = utils.calculateAge(patientData.birthDate);
            
            if (birthDate > today) {
                errors.push('Дата рождения не может быть в будущем');
            }
            
            if (age > 150) {
                errors.push('Возраст не может превышать 150 лет');
            }
        }
        
        if (!patientData.gender || !['male', 'female'].includes(patientData.gender)) {
            errors.push('Пол должен быть указан');
        }
        
        if (patientData.phone && !this.validatePhone(patientData.phone)) {
            errors.push('Некорректный формат телефона');
        }
        
        if (patientData.email && !this.validateEmail(patientData.email)) {
            errors.push('Некорректный формат email');
        }
        
        if (patientData.weight && (patientData.weight < 1 || patientData.weight > 300)) {
            errors.push('Вес должен быть от 1 до 300 кг');
        }
        
        if (patientData.height && (patientData.height < 50 || patientData.height > 250)) {
            errors.push('Рост должен быть от 50 до 250 см');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validatePhone(phone) {
        const phoneRegex = /^(\+7|7|8)?[\s\-\(\)]?(\d{3})[\s\-\(\)]?(\d{3})[\s\-]?(\d{2})[\s\-]?(\d{2})$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Генерация ID для новых пациентов
    generatePatientId() {
        const maxId = this.patients.reduce((max, patient) => 
            Math.max(max, patient.id || 0), 0);
        return maxId + 1;
    }

    // Статистика
    getStatistics() {
        const total = this.patients.length;
        const male = this.patients.filter(p => p.gender === 'male').length;
        const female = this.patients.filter(p => p.gender === 'female').length;
        
        const ages = this.patients
            .map(p => p.age || utils.calculateAge(p.birthDate))
            .filter(age => age !== null);
        
        const averageAge = ages.length > 0 ? 
            Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) : 0;
        
        const ageGroups = {
            young: ages.filter(age => age < 30).length,
            adult: ages.filter(age => age >= 30 && age < 60).length,
            senior: ages.filter(age => age >= 60).length
        };
        
        return {
            total,
            male,
            female,
            averageAge,
            ageGroups
        };
    }

    // Экспорт и импорт данных
    exportPatients(format = 'json') {
        switch (format) {
            case 'json':
                return this.exportToJSON();
            case 'csv':
                return this.exportToCSV();
            default:
                throw new Error(`Неподдерживаемый формат: ${format}`);
        }
    }

    exportToJSON() {
        const data = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            patients: this.patients
        };
        
        const jsonString = JSON.stringify(data, null, 2);
        utils.downloadFile(jsonString, `patients_export_${Date.now()}.json`, 'application/json');
        
        return jsonString;
    }

    exportToCSV() {
        const headers = [
            'ID', 'ФИО', 'Дата рождения', 'Возраст', 'Пол', 
            'Телефон', 'Email', 'Номер карты', 'Адрес', 
            'Вес', 'Рост', 'ИМТ', 'ППТ', 'Дата создания'
        ];
        
        const csvContent = [
            headers.join(','),
            ...this.patients.map(patient => [
                patient.id,
                `"${patient.name}"`,
                patient.birthDate,
                patient.age || '',
                patient.gender === 'male' ? 'М' : 'Ж',
                `"${patient.phone || ''}"`,
                `"${patient.email || ''}"`,
                patient.cardNumber,
                `"${patient.address || ''}"`,
                patient.weight || '',
                patient.height || '',
                patient.bmi || '',
                patient.bsa || '',
                patient.createdAt
            ].join(','))
        ].join('\n');
        
        utils.downloadFile(csvContent, `patients_export_${Date.now()}.csv`, 'text/csv');
        
        return csvContent;
    }

    async importPatients(file) {
        try {
            const content = await utils.readFileAsText(file);
            
            if (file.name.endsWith('.json')) {
                return this.importFromJSON(content);
            } else if (file.name.endsWith('.csv')) {
                return this.importFromCSV(content);
            } else {
                throw new Error('Неподдерживаемый формат файла');
            }
        } catch (error) {
            console.error('Ошибка импорта:', error);
            utils.showErrorMessage('Ошибка импорта данных: ' + error.message);
            return false;
        }
    }

    importFromJSON(jsonContent) {
        const data = JSON.parse(jsonContent);
        
        if (!data.patients || !Array.isArray(data.patients)) {
            throw new Error('Некорректный формат JSON файла');
        }
        
        let imported = 0;
        let skipped = 0;
        
        data.patients.forEach(patientData => {
            const validation = this.validatePatientData(patientData);
            
            if (validation.isValid) {
                this.addPatient(patientData);
                imported++;
            } else {
                console.warn('Пропущен пациент:', patientData.name, validation.errors);
                skipped++;
            }
        });
        
        utils.showSuccessMessage(`Импортировано: ${imported}, пропущено: ${skipped}`);
        return true;
    }

    importFromCSV(csvContent) {
        const lines = csvContent.trim().split('\n');
        const headers = lines[0].split(',');
        
        let imported = 0;
        let skipped = 0;
        
        for (let i = 1; i < lines.length; i++) {
            try {
                const values = lines[i].split(',');
                const patientData = {
                    id: parseInt(values[0]) || this.generatePatientId(),
                    name: values[1].replace(/"/g, ''),
                    birthDate: values[2],
                    gender: values[4] === 'М' ? 'male' : 'female',
                    phone: values[5].replace(/"/g, ''),
                    email: values[6].replace(/"/g, ''),
                    cardNumber: values[7],
                    address: values[8].replace(/"/g, ''),
                    weight: parseFloat(values[9]) || null,
                    height: parseFloat(values[10]) || null
                };
                
                const validation = this.validatePatientData(patientData);
                
                if (validation.isValid) {
                    this.addPatient(patientData);
                    imported++;
                } else {
                    skipped++;
                }
            } catch (error) {
                skipped++;
            }
        }
        
        utils.showSuccessMessage(`Импортировано: ${imported}, пропущено: ${skipped}`);
        return true;
    }

    // Очистка данных
    clearAllPatients() {
        if (confirm('Вы уверены, что хотите удалить всех пациентов? Это действие нельзя отменить.')) {
            this.patients = [];
            this.savePatients();
            utils.showSuccessMessage('Все пациенты удалены');
            return true;
        }
        return false;
    }

    // Резервное копирование
    createBackup() {
        const backup = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            patients: this.patients,
            statistics: this.getStatistics()
        };
        
        const backupString = JSON.stringify(backup, null, 2);
        utils.downloadFile(
            backupString, 
            `cardio_backup_${new Date().toISOString().split('T')[0]}.json`,
            'application/json'
        );
        
        utils.showSuccessMessage('Резервная копия создана');
        return backup;
    }

    async restoreFromBackup(file) {
        try {
            const content = await utils.readFileAsText(file);
            const backup = JSON.parse(content);
            
            if (!backup.patients || !Array.isArray(backup.patients)) {
                throw new Error('Некорректный формат файла резервной копии');
            }
            
            if (confirm('Восстановление заменит все текущие данные. Продолжить?')) {
                this.patients = backup.patients;
                this.savePatients();
                utils.showSuccessMessage('Данные восстановлены из резервной копии');
                return true;
            }
        } catch (error) {
            console.error('Ошибка восстановления:', error);
            utils.showErrorMessage('Ошибка восстановления: ' + error.message);
        }
        
        return false;
    }
}

// Создаем глобальный экземпляр
const patientsManager = new PatientsManager();

// Экспорт для использования в других модулях
window.patientsManager = patientsManager;