// Тестовые данные пациентов для демонстрации функционала

const testPatients = [
  {
    id: "patient_001",
    personalInfo: {
      lastName: "Иванов",
      firstName: "Сергей",
      middleName: "Александрович", 
      birthDate: "1965-03-15",
      gender: "М",
      email: "s.ivanov@example.com",
      phone: "+7 (901) 234-56-78",
      address: "г. Москва, ул. Лесная, д. 12, кв. 45"
    },
    schedule: {
      appointmentDate: "2025-07-15",
      appointmentTime: "09:00",
      doctor: "Петров И.И.",
      status: "scheduled"
    },
    consultations: [
      {
        id: "cons_001_001",
        date: "2025-07-15",
        time: "09:00",
        doctor: "Петров И.И.",
        specialty: "Кардиолог",
        type: "Первичная консультация",
        complaints: "Боли в области сердца при физической нагрузке, одышка при подъеме на 2 этаж",
        anamnesis: {
          disease: "Считает себя больным в течение 3 месяцев. Заболевание началось постепенно. Боли в сердце появились после физической нагрузки. Ухудшение состояния отмечает в течение последнего месяца.",
          life: "Наследственность: у отца ИБС, инфаркт миокарда в 58 лет. Аллергических реакций не отмечает.",
          harmfulHabits: [
            {
              habit: "smoking",
              details: "Курит 20 сигарет в день в течение 30 лет"
            },
            {
              habit: "alcohol", 
              details: "Употребляет алкоголь 2-3 раза в неделю, пиво 1-2 литра"
            }
          ]
        },
        examination: {
          general: "Состояние удовлетворительное. Сознание ясное. Телосложение нормостеническое. Кожные покровы обычной окраски. Отеков нет.",
          vitals: {
            height: "175",
            weight: "85",
            bmi: "27.8",
            bsa: "2.0",
            bloodPressure: {
              systolic: "145",
              diastolic: "90"
            },
            heartRate: "78",
            temperature: "36.6"
          },
          cardiovascular: "Границы сердца в пределах нормы. Тоны сердца ясные, ритмичные. Шумов нет. АД 145/90 мм рт.ст.",
          respiratory: "Дыхание везикулярное. Хрипов нет. ЧДД 16 в мин.",
          other: "Живот мягкий, безболезненный. Печень не увеличена."
        },
        diagnosis: {
          main: {
            code: "I25.9",
            name: "Хроническая ишемическая болезнь сердца неуточненная"
          },
          concomitant: [
            {
              code: "I10", 
              name: "Эссенциальная (первичная) гипертензия"
            },
            {
              code: "E78.5",
              name: "Гиперлипидемия неуточненная"
            }
          ]
        },
        investigations: [
          {
            name: "ЭКГ",
            result: "Синусовый ритм, ЧСС 78 в мин. Нормальное положение ЭОС. Без очаговых изменений.",
            date: "2025-07-15"
          },
          {
            name: "Общий анализ крови",
            result: "В пределах нормы",
            date: "2025-07-14"
          },
          {
            name: "Липидограмма", 
            result: "Общий холестерин 6.2 ммоль/л, ЛПНП 4.1 ммоль/л",
            date: "2025-07-14"
          }
        ],
        treatment: {
          medications: [
            {
              name: "Бисопролол",
              dosage: "5 мг",
              frequency: "1 раз в день утром",
              duration: "постоянно"
            },
            {
              name: "Аторвастатин",
              dosage: "20 мг",
              frequency: "1 раз в день вечером",
              duration: "постоянно"
            },
            {
              name: "Ацетилсалициловая кислота",
              dosage: "75 мг",
              frequency: "1 раз в день после еды",
              duration: "постоянно"
            }
          ],
          recommendations: [
            "Диета с ограничением соли до 5г в сутки",
            "Контроль веса",
            "Отказ от курения",
            "Дозированная физическая нагрузка",
            "Контроль АД ежедневно",
            "Явка на контрольный осмотр через 2 недели"
          ]
        }
      }
    ]
  },
  {
    id: "patient_002", 
    personalInfo: {
      lastName: "Смирнова",
      firstName: "Елена",
      middleName: "Владимирovna",
      birthDate: "1978-11-22",
      gender: "Ж",
      email: "e.smirnova@example.com",
      phone: "+7 (905) 123-45-67",
      address: "г. Москва, ул. Садовая, д. 8, кв. 12"
    },
    schedule: {
      appointmentDate: "2025-07-15",
      appointmentTime: "10:30",
      doctor: "Петров И.И.",
      status: "scheduled"
    },
    consultations: [
      {
        id: "cons_002_001",
        date: "2025-07-10",
        time: "15:30",
        doctor: "Сидоров П.П.",
        specialty: "Кардиолог",
        type: "Повторная консультация",
        complaints: "Сердцебиение, особенно в вечернее время. Периодические перебои в работе сердца.",
        anamnesis: {
          disease: "Впервые подобные симптомы появились 6 месяцев назад. Связывает со стрессом на работе. Ранее к кардиологу не обращалась.",
          life: "Наследственность: у матери фибрилляция предсердий. Аллергия на пенициллин.",
          harmfulHabits: [
            {
              habit: "stress",
              details: "Высокий уровень стресса на работе, работает по 10-12 часов в день"
            }
          ]
        },
        examination: {
          general: "Состояние удовлетворительное. Эмоционально лабильна. Телосложение астеническое.",
          vitals: {
            height: "165",
            weight: "58",
            bmi: "21.3",
            bsa: "1.6",
            bloodPressure: {
              systolic: "125",
              diastolic: "80"
            },
            heartRate: "92",
            temperature: "36.4"
          },
          cardiovascular: "Тоны сердца ясные. Аритмичный ритм, экстрасистолы. АД 125/80 мм рт.ст.",
          respiratory: "Дыхание везикулярное, хрипов нет.",
          other: "Щитовидная железа не увеличена. Живот безболезненный."
        },
        diagnosis: {
          main: {
            code: "I49.1",
            name: "Преждевременная деполяризация предсердий"
          },
          concomitant: []
        },
        investigations: [
          {
            name: "ЭКГ",
            result: "Синусовый ритм с частыми наджелудочковыми экстрасистолами. ЧСС 92 в мин.",
            date: "2025-07-10"
          },
          {
            name: "ЭхоКГ",
            result: "Размеры камер сердца в норме. ФВ ЛЖ 62%. Клапаны без патологии.",
            date: "2025-07-08"
          }
        ],
        treatment: {
          medications: [
            {
              name: "Магний B6",
              dosage: "2 таблетки",
              frequency: "2 раза в день",
              duration: "1 месяц"
            }
          ],
          recommendations: [
            "Нормализация режима труда и отдыха",
            "Ограничение кофеина",
            "Дыхательная гимнастика",
            "Холтеровское мониторирование ЭКГ через 2 недели",
            "Повторная консультация через 1 месяц"
          ]
        }
      },
      {
        id: "cons_002_002",
        date: "2025-07-15",
        time: "10:30", 
        doctor: "Петров И.И.",
        specialty: "Кардиолог",
        type: "Повторная консультация",
        complaints: "Состояние улучшилось. Сердцебиение беспокоит реже.",
        anamnesis: {
          disease: "На фоне лечения отмечает улучшение самочувствия. Перебои в сердце стали реже.",
          life: "Изменила режим работы, стала больше отдыхать.",
          harmfulHabits: []
        },
        examination: {
          general: "Состояние удовлетворительное. Эмоционально спокойна.",
          vitals: {
            height: "165",
            weight: "58", 
            bmi: "21.3",
            bsa: "1.6",
            bloodPressure: {
              systolic: "120",
              diastolic: "75"
            },
            heartRate: "72",
            temperature: "36.6"
          },
          cardiovascular: "Тоны сердца ясные, ритмичные. Редкие экстрасистолы. АД 120/75 мм рт.ст.",
          respiratory: "Без особенностей.",
          other: "Без особенностей."
        },
        diagnosis: {
          main: {
            code: "I49.1",
            name: "Преждевременная деполяризация предсердий"
          },
          concomitant: []
        },
        investigations: [
          {
            name: "Холтеровское мониторирование ЭКГ",
            result: "Синусовый ритм. Редкие одиночные наджелудочковые экстрасистолы (менее 100 в сутки).",
            date: "2025-07-13"
          }
        ],
        treatment: {
          medications: [
            {
              name: "Магний B6",
              dosage: "1 таблетка",
              frequency: "2 раза в день",
              duration: "продолжить еще 1 месяц"
            }
          ],
          recommendations: [
            "Продолжить нормализованный режим",
            "Регулярные прогулки на свежем воздухе",
            "Контрольная консультация через 3 месяца"
          ]
        }
      }
    ]
  }
];

// Функции для работы с тестовыми данными
function getPatientById(id) {
  return testPatients.find(patient => patient.id === id);
}

function getPatientByName(lastName, firstName) {
  return testPatients.find(patient => 
    patient.personalInfo.lastName === lastName && 
    patient.personalInfo.firstName === firstName
  );
}

function getTodaysSchedule() {
  const today = new Date().toISOString().split('T')[0];
  return testPatients.filter(patient => 
    patient.schedule.appointmentDate === today
  );
}

function getConsultationById(patientId, consultationId) {
  const patient = getPatientById(patientId);
  if (!patient) return null;
  
  return patient.consultations.find(consultation => 
    consultation.id === consultationId
  );
}

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testPatients,
    getPatientById,
    getPatientByName,
    getTodaysSchedule,
    getConsultationById
  };
}

// Глобальная доступность для браузера
if (typeof window !== 'undefined') {
  window.testData = {
    patients: testPatients,
    getPatientById,
    getPatientByName,
    getTodaysSchedule,
    getConsultationById
  };
}