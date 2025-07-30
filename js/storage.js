/**
 * Storage Manager - Система хранения данных пациентов
 * Использует IndexedDB для больших объемов данных
 * Поддерживает экспорт/импорт в файлы
 */

class StorageManager {
    constructor() {
        this.dbName = 'DocAssistantProDB';
        this.dbVersion = 1;
        this.db = null;
        this.isInitialized = false;
        
        // Хранилища
        this.stores = {
            patients: 'patients',
            consultations: 'consultations',
            myPatients: 'myPatients',
            research: 'research',
            documents: 'documents',
            settings: 'settings'
        };
    }

    /**
     * Инициализация IndexedDB
     */
    async init() {
        try {
            console.log('🔄 Инициализация системы хранения данных...');
            
            // Проверка поддержки IndexedDB
            if (!window.indexedDB) {
                throw new Error('Ваш браузер не поддерживает IndexedDB');
            }

            // Открытие базы данных
            await this.openDatabase();
            
            this.isInitialized = true;
            console.log('✅ Система хранения данных инициализирована');
            
            return true;
        } catch (error) {
            console.error('❌ Ошибка инициализации хранилища:', error);
            throw error;
        }
    }

    /**
     * Открытие базы данных IndexedDB
     */
    async openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                reject(new Error('Не удалось открыть базу данных'));
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('База данных открыта успешно');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                console.log('Обновление структуры базы данных...');
                this.db = event.target.result;
                this.createObjectStores();
            };
        });
    }

    /**
     * Создание хранилищ объектов
     */
    createObjectStores() {
        // Хранилище пациентов
        if (!this.db.objectStoreNames.contains(this.stores.patients)) {
            const patientsStore = this.db.createObjectStore(this.stores.patients, { 
                keyPath: 'id',
                autoIncrement: true 
            });
            patientsStore.createIndex('name', 'name', { unique: false });
            patientsStore.createIndex('cardNumber', 'cardNumber', { unique: true });
            patientsStore.createIndex('phone', 'phone', { unique: false });
            patientsStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Хранилище консультаций
        if (!this.db.objectStoreNames.contains(this.stores.consultations)) {
            const consultationsStore = this.db.createObjectStore(this.stores.consultations, { 
                keyPath: 'id',
                autoIncrement: true 
            });
            consultationsStore.createIndex('patientId', 'patientId', { unique: false });
            consultationsStore.createIndex('date', 'date', { unique: false });
            consultationsStore.createIndex('doctorId', 'doctorId', { unique: false });
            consultationsStore.createIndex('diagnosis', 'mainDiagnosis', { unique: false });
        }

        // Хранилище "Мои пациенты" для конкретного доктора
        if (!this.db.objectStoreNames.contains(this.stores.myPatients)) {
            const myPatientsStore = this.db.createObjectStore(this.stores.myPatients, { 
                keyPath: 'id',
                autoIncrement: true 
            });
            myPatientsStore.createIndex('doctorId', 'doctorId', { unique: false });
            myPatientsStore.createIndex('patientId', 'patientId', { unique: false });
            myPatientsStore.createIndex('lastConsultationDate', 'lastConsultationDate', { unique: false });
            myPatientsStore.createIndex('composite', ['doctorId', 'patientId'], { unique: true });
        }

        // Хранилище исследований
        if (!this.db.objectStoreNames.contains(this.stores.research)) {
            const researchStore = this.db.createObjectStore(this.stores.research, { 
                keyPath: 'id',
                autoIncrement: true 
            });
            researchStore.createIndex('patientId', 'patientId', { unique: false });
            researchStore.createIndex('date', 'date', { unique: false });
            researchStore.createIndex('type', 'type', { unique: false });
        }

        // Хранилище документов и файлов
        if (!this.db.objectStoreNames.contains(this.stores.documents)) {
            const documentsStore = this.db.createObjectStore(this.stores.documents, { 
                keyPath: 'id',
                autoIncrement: true 
            });
            documentsStore.createIndex('patientId', 'patientId', { unique: false });
            documentsStore.createIndex('consultationId', 'consultationId', { unique: false });
            documentsStore.createIndex('type', 'type', { unique: false });
            documentsStore.createIndex('uploadDate', 'uploadDate', { unique: false });
        }

        // Хранилище настроек
        if (!this.db.objectStoreNames.contains(this.stores.settings)) {
            this.db.createObjectStore(this.stores.settings, { keyPath: 'key' });
        }
    }

    /**
     * === МЕТОДЫ РАБОТЫ С ПАЦИЕНТАМИ ===
     */

    /**
     * Сохранение пациента
     */
    async savePatient(patientData) {
        try {
            const transaction = this.db.transaction([this.stores.patients], 'readwrite');
            const store = transaction.objectStore(this.stores.patients);
            
            // Добавляем временные метки
            if (!patientData.createdAt) {
                patientData.createdAt = new Date().toISOString();
            }
            patientData.updatedAt = new Date().toISOString();
            
            const request = patientData.id 
                ? store.put(patientData) 
                : store.add(patientData);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    console.log('✅ Пациент сохранен:', request.result);
                    resolve(request.result);
                };
                request.onerror = () => {
                    reject(new Error('Ошибка сохранения пациента'));
                };
            });
        } catch (error) {
            console.error('Ошибка сохранения пациента:', error);
            throw error;
        }
    }

    /**
     * Получение пациента по ID
     */
    async getPatient(patientId) {
        try {
            const transaction = this.db.transaction([this.stores.patients], 'readonly');
            const store = transaction.objectStore(this.stores.patients);
            const request = store.get(patientId);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    resolve(request.result);
                };
                request.onerror = () => {
                    reject(new Error('Ошибка получения пациента'));
                };
            });
        } catch (error) {
            console.error('Ошибка получения пациента:', error);
            throw error;
        }
    }

    /**
     * Получение всех пациентов
     */
    async getAllPatients() {
        try {
            const transaction = this.db.transaction([this.stores.patients], 'readonly');
            const store = transaction.objectStore(this.stores.patients);
            const request = store.getAll();
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    resolve(request.result || []);
                };
                request.onerror = () => {
                    reject(new Error('Ошибка получения списка пациентов'));
                };
            });
        } catch (error) {
            console.error('Ошибка получения пациентов:', error);
            throw error;
        }
    }

    /**
     * Поиск пациентов
     */
    async searchPatients(query) {
        try {
            const allPatients = await this.getAllPatients();
            const searchTerm = query.toLowerCase().trim();
            
            return allPatients.filter(patient => {
                const name = (patient.name || '').toLowerCase();
                const phone = (patient.phone || '').toLowerCase();
                const cardNumber = (patient.cardNumber || '').toLowerCase();
                const email = (patient.email || '').toLowerCase();
                
                return name.includes(searchTerm) ||
                       phone.includes(searchTerm) ||
                       cardNumber.includes(searchTerm) ||
                       email.includes(searchTerm);
            });
        } catch (error) {
            console.error('Ошибка поиска пациентов:', error);
            throw error;
        }
    }

    /**
     * === МЕТОДЫ РАБОТЫ С КОНСУЛЬТАЦИЯМИ ===
     */

    /**
     * Сохранение консультации
     */
    async saveConsultation(consultationData) {
        try {
            const transaction = this.db.transaction(
                [this.stores.consultations, this.stores.myPatients], 
                'readwrite'
            );
            const consultationsStore = transaction.objectStore(this.stores.consultations);
            const myPatientsStore = transaction.objectStore(this.stores.myPatients);
            
            // Добавляем временные метки
            if (!consultationData.createdAt) {
                consultationData.createdAt = new Date().toISOString();
            }
            consultationData.updatedAt = new Date().toISOString();
            
            // Сохраняем консультацию
            const request = consultationData.id 
                ? consultationsStore.put(consultationData) 
                : consultationsStore.add(consultationData);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = async () => {
                    const consultationId = request.result;
                    
                    // Обновляем запись в "Мои пациенты"
                    await this.updateMyPatient(
                        consultationData.doctorId || 'default', 
                        consultationData.patientId,
                        consultationData.date
                    );
                    
                    console.log('✅ Консультация сохранена:', consultationId);
                    resolve(consultationId);
                };
                request.onerror = () => {
                    reject(new Error('Ошибка сохранения консультации'));
                };
            });
        } catch (error) {
            console.error('Ошибка сохранения консультации:', error);
            throw error;
        }
    }

    /**
     * Получение консультаций пациента
     */
    async getPatientConsultations(patientId) {
        try {
            const transaction = this.db.transaction([this.stores.consultations], 'readonly');
            const store = transaction.objectStore(this.stores.consultations);
            const index = store.index('patientId');
            const request = index.getAll(patientId);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    const consultations = request.result || [];
                    // Сортируем по дате (новые сверху)
                    consultations.sort((a, b) => new Date(b.date) - new Date(a.date));
                    resolve(consultations);
                };
                request.onerror = () => {
                    reject(new Error('Ошибка получения консультаций'));
                };
            });
        } catch (error) {
            console.error('Ошибка получения консультаций:', error);
            throw error;
        }
    }

    /**
     * === МЕТОДЫ РАБОТЫ С "МОИ ПАЦИЕНТЫ" ===
     */

    /**
     * Обновление записи в "Мои пациенты"
     */
    async updateMyPatient(doctorId, patientId, lastConsultationDate) {
        try {
            const transaction = this.db.transaction([this.stores.myPatients], 'readwrite');
            const store = transaction.objectStore(this.stores.myPatients);
            const index = store.index('composite');
            
            // Ищем существующую запись
            const request = index.get([doctorId, patientId]);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    const existingRecord = request.result;
                    
                    const myPatientData = {
                        doctorId,
                        patientId,
                        lastConsultationDate,
                        updatedAt: new Date().toISOString()
                    };
                    
                    if (existingRecord) {
                        myPatientData.id = existingRecord.id;
                        myPatientData.firstConsultationDate = existingRecord.firstConsultationDate;
                        myPatientData.totalConsultations = (existingRecord.totalConsultations || 0) + 1;
                    } else {
                        myPatientData.firstConsultationDate = lastConsultationDate;
                        myPatientData.totalConsultations = 1;
                    }
                    
                    const saveRequest = existingRecord 
                        ? store.put(myPatientData) 
                        : store.add(myPatientData);
                    
                    saveRequest.onsuccess = () => {
                        resolve(saveRequest.result);
                    };
                    saveRequest.onerror = () => {
                        reject(new Error('Ошибка обновления записи в "Мои пациенты"'));
                    };
                };
                request.onerror = () => {
                    reject(new Error('Ошибка поиска записи в "Мои пациенты"'));
                };
            });
        } catch (error) {
            console.error('Ошибка обновления "Мои пациенты":', error);
            throw error;
        }
    }

    /**
     * Получение пациентов доктора
     */
    async getMyPatients(doctorId = 'default') {
        try {
            const transaction = this.db.transaction(
                [this.stores.myPatients, this.stores.patients, this.stores.consultations], 
                'readonly'
            );
            const myPatientsStore = transaction.objectStore(this.stores.myPatients);
            const patientsStore = transaction.objectStore(this.stores.patients);
            const consultationsStore = transaction.objectStore(this.stores.consultations);
            
            const index = myPatientsStore.index('doctorId');
            const request = index.getAll(doctorId);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = async () => {
                    const myPatientRecords = request.result || [];
                    const enrichedPatients = [];
                    
                    // Обогащаем данные информацией о пациентах и консультациях
                    for (const record of myPatientRecords) {
                        try {
                            // Получаем данные пациента
                            const patientRequest = patientsStore.get(record.patientId);
                            const patient = await new Promise((res) => {
                                patientRequest.onsuccess = () => res(patientRequest.result);
                            });
                            
                            if (patient) {
                                // Получаем консультации пациента
                                const consultationsIndex = consultationsStore.index('patientId');
                                const consultationsRequest = consultationsIndex.getAll(record.patientId);
                                const consultations = await new Promise((res) => {
                                    consultationsRequest.onsuccess = () => res(consultationsRequest.result || []);
                                });
                                
                                enrichedPatients.push({
                                    ...patient,
                                    lastConsultationDate: record.lastConsultationDate,
                                    firstConsultationDate: record.firstConsultationDate,
                                    totalConsultations: record.totalConsultations,
                                    consultations: consultations.sort((a, b) => new Date(b.date) - new Date(a.date))
                                });
                            }
                        } catch (err) {
                            console.error('Ошибка обогащения данных пациента:', err);
                        }
                    }
                    
                    // Сортируем по дате последней консультации
                    enrichedPatients.sort((a, b) => 
                        new Date(b.lastConsultationDate) - new Date(a.lastConsultationDate)
                    );
                    
                    resolve(enrichedPatients);
                };
                request.onerror = () => {
                    reject(new Error('Ошибка получения пациентов доктора'));
                };
            });
        } catch (error) {
            console.error('Ошибка получения "Мои пациенты":', error);
            throw error;
        }
    }

    /**
     * === МЕТОДЫ ЭКСПОРТА/ИМПОРТА ===
     */

    /**
     * Экспорт всех данных
     */
    async exportAllData() {
        try {
            const exportData = {
                version: '2.0',
                exportDate: new Date().toISOString(),
                data: {
                    patients: await this.getAllPatients(),
                    consultations: await this.getAllConsultations(),
                    myPatients: await this.getAllMyPatients(),
                    research: await this.getAllResearch()
                }
            };
            
            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `docassistant_export_${new Date().getTime()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('✅ Данные экспортированы');
            return true;
        } catch (error) {
            console.error('Ошибка экспорта:', error);
            throw error;
        }
    }

    /**
     * Экспорт данных пациента
     */
    async exportPatientData(patientId) {
        try {
            const patient = await this.getPatient(patientId);
            const consultations = await this.getPatientConsultations(patientId);
            const research = await this.getPatientResearch(patientId);
            
            const exportData = {
                version: '2.0',
                exportDate: new Date().toISOString(),
                patient,
                consultations,
                research
            };
            
            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `patient_${patientId}_export_${new Date().getTime()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('✅ Данные пациента экспортированы');
            return true;
        } catch (error) {
            console.error('Ошибка экспорта данных пациента:', error);
            throw error;
        }
    }

    /**
     * Импорт данных из файла
     */
    async importData(file) {
        try {
            const text = await file.text();
            const importData = JSON.parse(text);
            
            // Проверка версии
            if (!importData.version || !importData.data) {
                throw new Error('Неверный формат файла импорта');
            }
            
            let imported = {
                patients: 0,
                consultations: 0,
                research: 0
            };
            
            // Импорт пациентов
            if (importData.data.patients) {
                for (const patient of importData.data.patients) {
                    delete patient.id; // Удаляем ID для создания нового
                    await this.savePatient(patient);
                    imported.patients++;
                }
            }
            
            // Импорт консультаций
            if (importData.data.consultations) {
                for (const consultation of importData.data.consultations) {
                    delete consultation.id;
                    await this.saveConsultation(consultation);
                    imported.consultations++;
                }
            }
            
            // Импорт исследований
            if (importData.data.research) {
                for (const research of importData.data.research) {
                    delete research.id;
                    await this.saveResearch(research);
                    imported.research++;
                }
            }
            
            console.log('✅ Данные импортированы:', imported);
            return imported;
        } catch (error) {
            console.error('Ошибка импорта:', error);
            throw error;
        }
    }

    /**
     * === ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ===
     */

    /**
     * Получение всех консультаций
     */
    async getAllConsultations() {
        try {
            const transaction = this.db.transaction([this.stores.consultations], 'readonly');
            const store = transaction.objectStore(this.stores.consultations);
            const request = store.getAll();
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    resolve(request.result || []);
                };
                request.onerror = () => {
                    reject(new Error('Ошибка получения консультаций'));
                };
            });
        } catch (error) {
            console.error('Ошибка получения всех консультаций:', error);
            throw error;
        }
    }

    /**
     * Получение всех записей "Мои пациенты"
     */
    async getAllMyPatients() {
        try {
            const transaction = this.db.transaction([this.stores.myPatients], 'readonly');
            const store = transaction.objectStore(this.stores.myPatients);
            const request = store.getAll();
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    resolve(request.result || []);
                };
                request.onerror = () => {
                    reject(new Error('Ошибка получения записей "Мои пациенты"'));
                };
            });
        } catch (error) {
            console.error('Ошибка получения всех записей "Мои пациенты":', error);
            throw error;
        }
    }

    /**
     * Получение всех исследований
     */
    async getAllResearch() {
        try {
            const transaction = this.db.transaction([this.stores.research], 'readonly');
            const store = transaction.objectStore(this.stores.research);
            const request = store.getAll();
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    resolve(request.result || []);
                };
                request.onerror = () => {
                    reject(new Error('Ошибка получения исследований'));
                };
            });
        } catch (error) {
            console.error('Ошибка получения всех исследований:', error);
            throw error;
        }
    }

    /**
     * Сохранение исследования
     */
    async saveResearch(researchData) {
        try {
            const transaction = this.db.transaction([this.stores.research], 'readwrite');
            const store = transaction.objectStore(this.stores.research);
            
            if (!researchData.createdAt) {
                researchData.createdAt = new Date().toISOString();
            }
            researchData.updatedAt = new Date().toISOString();
            
            const request = researchData.id 
                ? store.put(researchData) 
                : store.add(researchData);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    console.log('✅ Исследование сохранено:', request.result);
                    resolve(request.result);
                };
                request.onerror = () => {
                    reject(new Error('Ошибка сохранения исследования'));
                };
            });
        } catch (error) {
            console.error('Ошибка сохранения исследования:', error);
            throw error;
        }
    }

    /**
     * Получение исследований пациента
     */
    async getPatientResearch(patientId) {
        try {
            const transaction = this.db.transaction([this.stores.research], 'readonly');
            const store = transaction.objectStore(this.stores.research);
            const index = store.index('patientId');
            const request = index.getAll(patientId);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    const research = request.result || [];
                    research.sort((a, b) => new Date(b.date) - new Date(a.date));
                    resolve(research);
                };
                request.onerror = () => {
                    reject(new Error('Ошибка получения исследований'));
                };
            });
        } catch (error) {
            console.error('Ошибка получения исследований пациента:', error);
            throw error;
        }
    }

    /**
     * Очистка всех данных (для отладки)
     */
    async clearAllData() {
        if (!confirm('Вы уверены, что хотите удалить ВСЕ данные? Это действие необратимо!')) {
            return false;
        }
        
        try {
            const transaction = this.db.transaction(
                Object.values(this.stores), 
                'readwrite'
            );
            
            for (const storeName of Object.values(this.stores)) {
                const store = transaction.objectStore(storeName);
                store.clear();
            }
            
            return new Promise((resolve, reject) => {
                transaction.oncomplete = () => {
                    console.log('✅ Все данные очищены');
                    resolve(true);
                };
                transaction.onerror = () => {
                    reject(new Error('Ошибка очистки данных'));
                };
            });
        } catch (error) {
            console.error('Ошибка очистки данных:', error);
            throw error;
        }
    }

    /**
     * Получение статистики хранилища
     */
    async getStorageStats() {
        try {
            const stats = {
                patients: 0,
                consultations: 0,
                myPatients: 0,
                research: 0,
                documents: 0,
                totalSize: 0
            };
            
            const transaction = this.db.transaction(Object.values(this.stores), 'readonly');
            
            for (const storeName of Object.keys(this.stores)) {
                const store = transaction.objectStore(this.stores[storeName]);
                const countRequest = store.count();
                
                await new Promise((resolve) => {
                    countRequest.onsuccess = () => {
                        stats[storeName] = countRequest.result;
                        resolve();
                    };
                });
            }
            
            // Приблизительный расчет размера
            if (navigator.storage && navigator.storage.estimate) {
                const estimate = await navigator.storage.estimate();
                stats.totalSize = estimate.usage || 0;
                stats.quotaSize = estimate.quota || 0;
                stats.percentUsed = ((stats.totalSize / stats.quotaSize) * 100).toFixed(2);
            }
            
            console.log('📊 Статистика хранилища:', stats);
            return stats;
        } catch (error) {
            console.error('Ошибка получения статистики:', error);
            throw error;
        }
    }
}

// Создаем глобальный экземпляр
const storageManager = new StorageManager();

// Экспорт для использования в других модулях
window.storageManager = storageManager;