/**
 * CardioAssistant Pro – My Patients Module
 * Вкладка «Мои пациенты» (только пациенты, которых консультировал текущий врач)
 * ─────────────────────────────────────────────────────────────────────────────
 * ‑ Берёт данные из patientsManager и consultationsManager
 * ‑ Показывает поиск по ФИО / телефону / №‑карты / жалобам / диагнозам / назначениям
 * ‑ Фильтр по дате последней консультации
 * ‑ Открывает карту пациента одним кликом
 */

class MyPatientsManager {
    constructor () {
        this.doctorId      = null;   // текущий врач
        this.allPatients   = [];     // все пациенты врача
        this.filtered      = [];     // результат фильтров
        this.searchTerm    = '';
        this.dateFrom      = '';
        this.dateTo        = '';
        this.containerId   = 'myPatientsTab'; // div в разметке app.js
    }

    /* ---------- ИНИЦИАЛИЗАЦИЯ ---------- */
    async init (doctorId) {
        this.doctorId = doctorId;
        this.refresh();
    }

    /* ---------- ОСНОВНОЕ ОБНОВЛЕНИЕ СПИСКА ---------- */
    refresh () {
        if (!window.consultationsManager || !window.patientsManager) {
            console.error('❌ managers not ready');
            return;
        }

        const cons   = consultationsManager.getConsultationsByDoctor(this.doctorId);
        const ids    = [...new Set(cons.map(c => c.patientId))];

        this.allPatients = patientsManager.getAllPatients()
            .filter(p => ids.includes(p.id));

        // Последняя консультация пациента (для фильтра дат)
        this.allPatients.forEach(p => {
            const pc = cons.filter(c => c.patientId === p.id)
                           .sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
            p._lastConsultDate = pc ? pc.date : '';
        });

        this.filtered = [...this.allPatients];
        this.render();
    }

    /* ---------- РЕНДЕР ---------- */
    render () {
        const el = document.getElementById(this.containerId);
        if (!el) return;

        el.innerHTML = this.getTabHTML();
    }

    /* ---------- HTML ---------- */
    getTabHTML () {
        return `
        <div class="my-patients-header mb-4">
            <div class="row g-3">
                <div class="col-md-4">
                    <input type="search" id="myPatientsSearch" class="form-control"
                           placeholder="Поиск (ФИО, телефон, карта, ключевое слово)…"
                           oninput="myPatientsManager.onSearch(this.value)">
                </div>
                <div class="col-md-3">
                    <input type="date" id="myPatientsDateFrom" class="form-control"
                           onchange="myPatientsManager.onDateChange()">
                </div>
                <div class="col-md-3">
                    <input type="date" id="myPatientsDateTo" class="form-control"
                           onchange="myPatientsManager.onDateChange()">
                </div>
                <div class="col-md-2 d-grid">
                    <button class="btn btn-outline-secondary"
                            onclick="myPatientsManager.clearFilters()">Сбросить</button>
                </div>
            </div>
        </div>

        <div class="table-responsive my-patients-table">
            <table class="table table-hover align-middle">
                <thead class="table-light">
                    <tr>
                        <th>ФИО</th>
                        <th>Возраст</th>
                        <th>Пол</th>
                        <th>Телефон</th>
                        <th>E‑mail</th>
                        <th>№ карты</th>
                        <th>Последняя консультация</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.filtered.map(p => this.getPatientRowHTML(p)).join('') ||
                        `<tr><td colspan="7" class="text-center text-muted">Нет пациентов</td></tr>`}
                </tbody>
            </table>
        </div>

        <style>
        /* ——— стили только для этой вкладки ——— */
        .my-patients-table tr { cursor:pointer; transition:background .15s; }
        .my-patients-table tr:hover { background:#f1f5f9; }
        .my-patients-header input { font-size: .9rem; }
        </style>
        `;
    }

    getPatientRowHTML (p) {
        const gender = p.gender === 'male' ? 'М' : 'Ж';
        return `
        <tr onclick="myPatientsManager.openPatient('${p.id}')">
            <td>${p.name}</td>
            <td>${p.age ?? utils.calculateAge(p.birthDate)}</td>
            <td>${gender}</td>
            <td>${p.phone || ''}</td>
            <td>${p.email || ''}</td>
            <td>${p.cardNumber}</td>
            <td>${p._lastConsultDate ? utils.formatDate(p._lastConsultDate) : '—'}</td>
        </tr>
        `;
    }

    /* ---------- ОБРАБОТЧИКИ ПОИСКА / ФИЛЬТРОВ ---------- */
    onSearch (value) {
        this.searchTerm = value.toLowerCase().trim();
        this.applyFilters();
    }

    onDateChange () {
        this.dateFrom = document.getElementById('myPatientsDateFrom').value;
        this.dateTo   = document.getElementById('myPatientsDateTo').value;
        this.applyFilters();
    }

    clearFilters () {
        this.searchTerm = '';
        this.dateFrom   = '';
        this.dateTo     = '';
        document.getElementById('myPatientsSearch').value      = '';
        document.getElementById('myPatientsDateFrom').value    = '';
        document.getElementById('myPatientsDateTo').value      = '';
        this.applyFilters();
    }

    applyFilters () {
        this.filtered = this.allPatients.filter(p => this.passTextFilter(p) && this.passDateFilter(p));
        this.render(); // перерисовываем
    }

    passTextFilter (p) {
        if (!this.searchTerm) return true;

        const fields = [
            p.name, p.cardNumber, p.phone, p.email
        ].join(' ').toLowerCase();

        // поиск ещё и по содержимому консультаций
        const cons = consultationsManager.getPatientConsultations(p.id)
            .map(c => [c.complaints, c.mainDiagnosis, c.medications, c.examPlan].join(' '))
            .join(' ')
            .toLowerCase();

        return fields.includes(this.searchTerm) || cons.includes(this.searchTerm);
    }

    passDateFilter (p) {
        if (!this.dateFrom && !this.dateTo) return true;
        if (!p._lastConsultDate) return false;

        const d = new Date(p._lastConsultDate);
        if (this.dateFrom && d < new Date(this.dateFrom)) return false;
        if (this.dateTo   && d > new Date(this.dateTo))   return false;
        return true;
    }

    /* ---------- ОТКРЫТИЕ КАРТЫ ПАЦИЕНТА ---------- */
    openPatient (patientId) {
        if (window.app && typeof app.openPatientFromMyPatients === 'function') {
            app.openPatientFromMyPatients(patientId);
        } else {
            utils.showInfoMessage('Главное приложение не готово');
            console.warn('⚠️ app.openPatientFromMyPatients() not found');
        }
    }
}

/* ─── Глобальный экземпляр ─── */
window.myPatientsManager = new MyPatientsManager();
