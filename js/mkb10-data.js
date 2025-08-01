/**
 * CardioAssistant Pro - МКБ-10 Data
 * Данные классификатора МКБ-10 для кардиологии
 */

window.ICD10_DATA = [
    // === БОЛЕЗНИ СИСТЕМЫ КРОВООБРАЩЕНИЯ (I00-I99) ===
    
    // Острая ревматическая лихорадка (I00-I02)
    { code: "I00", name: "Ревматическая лихорадка без упоминания о поражении сердца" },
    { code: "I01", name: "Ревматическая лихорадка с поражением сердца" },
    { code: "I01.0", name: "Острый ревматический перикардит" },
    { code: "I01.1", name: "Острый ревматический эндокардит" },
    { code: "I01.2", name: "Острый ревматический миокардит" },
    { code: "I01.8", name: "Другие острые ревматические поражения сердца" },
    { code: "I01.9", name: "Острое ревматическое поражение сердца неуточненное" },
    { code: "I02", name: "Ревматическая хорея" },

    // Хронические ревматические болезни сердца (I05-I09)
    { code: "I05", name: "Ревматические болезни митрального клапана" },
    { code: "I05.0", name: "Митральный стеноз" },
    { code: "I05.1", name: "Ревматическая недостаточность митрального клапана" },
    { code: "I05.2", name: "Митральный стеноз с недостаточностью" },
    { code: "I05.8", name: "Другие болезни митрального клапана" },
    { code: "I05.9", name: "Болезнь митрального клапана неуточненная" },
    
    { code: "I06", name: "Ревматические болезни аортального клапана" },
    { code: "I06.0", name: "Ревматический аортальный стеноз" },
    { code: "I06.1", name: "Ревматическая недостаточность аортального клапана" },
    { code: "I06.2", name: "Ревматический аортальный стеноз с недостаточностью" },
    { code: "I06.8", name: "Другие ревматические болезни аортального клапана" },
    { code: "I06.9", name: "Ревматическая болезнь аортального клапана неуточненная" },

    // Болезни, характеризующиеся повышенным кровяным давлением (I10-I15)
    { code: "I10", name: "Эссенциальная (первичная) гипертензия" },
    { code: "I11", name: "Гипертензивная болезнь сердца [гипертоническая болезнь сердца с преимущественным поражением сердца]" },
    { code: "I11.0", name: "Гипертензивная болезнь сердца с (застойной) сердечной недостаточностью" },
    { code: "I11.9", name: "Гипертензивная болезнь сердца без (застойной) сердечной недостаточности" },
    { code: "I12", name: "Гипертензивная [гипертоническая] болезнь с преимущественным поражением почек" },
    { code: "I12.0", name: "Гипертензивная болезнь с преимущественным поражением почек с почечной недостаточностью" },
    { code: "I12.9", name: "Гипертензивная болезнь с преимущественным поражением почек без почечной недостаточности" },
    { code: "I13", name: "Гипертензивная [гипертоническая] болезнь с преимущественным поражением сердца и почек" },
    { code: "I13.0", name: "Гипертензивная болезнь с преимущественным поражением сердца и почек с (застойной) сердечной недостаточностью" },
    { code: "I13.1", name: "Гипертензивная болезнь с преимущественным поражением сердца и почек с почечной недостаточностью" },
    { code: "I13.2", name: "Гипертензивная болезнь с преимущественным поражением сердца и почек с (застойной) сердечной недостаточностью и почечной недостаточностью" },
    { code: "I13.9", name: "Гипертензивная болезнь с преимущественным поражением сердца и почек неуточненная" },
    { code: "I15", name: "Вторичная гипертензия" },
    { code: "I15.0", name: "Реноваскулярная гипертензия" },
    { code: "I15.1", name: "Гипертензия вторичная по отношению к другим поражениям почек" },
    { code: "I15.2", name: "Гипертензия вторичная по отношению к эндокринным нарушениям" },
    { code: "I15.8", name: "Другая вторичная гипертензия" },
    { code: "I15.9", name: "Вторичная гипертензия неуточненная" },

    // Ишемическая болезнь сердца (I20-I25)
    { code: "I20", name: "Стенокардия [грудная жаба]" },
    { code: "I20.0", name: "Нестабильная стенокардия" },
    { code: "I20.1", name: "Стенокардия с документированным спазмом" },
    { code: "I20.8", name: "Другие формы стенокардии" },
    { code: "I20.9", name: "Стенокардия неуточненная" },
    
    { code: "I21", name: "Острый инфаркт миокарда" },
    { code: "I21.0", name: "Острый трансмуральный инфаркт передней стенки миокарда" },
    { code: "I21.1", name: "Острый трансмуральный инфаркт нижней стенки миокарда" },
    { code: "I21.2", name: "Острый трансмуральный инфаркт миокарда других уточненных локализаций" },
    { code: "I21.3", name: "Острый трансмуральный инфаркт миокарда неуточненной локализации" },
    { code: "I21.4", name: "Острый субэндокардиальный инфаркт миокарда" },
    { code: "I21.9", name: "Острый инфаркт миокарда неуточненный" },
    
    { code: "I22", name: "Повторный инфаркт миокарда" },
    { code: "I22.0", name: "Повторный инфаркт передней стенки миокарда" },
    { code: "I22.1", name: "Повторный инфаркт нижней стенки миокарда" },
    { code: "I22.8", name: "Повторный инфаркт миокарда другой уточненной локализации" },
    { code: "I22.9", name: "Повторный инфаркт миокарда неуточненной локализации" },
    
    { code: "I23", name: "Некоторые текущие осложнения острого инфаркта миокарда" },
    { code: "I23.0", name: "Гемоперикард как ближайшее осложнение острого инфаркта миокарда" },
    { code: "I23.1", name: "Дефект межпредсердной перегородки как ближайшее осложнение острого инфаркта миокарда" },
    { code: "I23.2", name: "Дефект межжелудочковой перегородки как ближайшее осложнение острого инфаркта миокарда" },
    { code: "I23.3", name: "Разрыв стенки сердца без гемоперикарда как ближайшее осложнение острого инфаркта миокарда" },
    { code: "I23.4", name: "Разрыв сухожильной хорды как ближайшее осложнение острого инфаркта миокарда" },
    { code: "I23.5", name: "Разрыв сосочковой мышцы как ближайшее осложнение острого инфаркта миокарда" },
    { code: "I23.6", name: "Тромбоз предсердия, ушка предсердия и желудочка сердца как ближайшее осложнение острого инфаркта миокарда" },
    { code: "I23.8", name: "Другие ближайшие осложнения острого инфаркта миокарда" },
    
    { code: "I24", name: "Другие формы острой ишемической болезни сердца" },
    { code: "I24.0", name: "Коронарный тромбоз, не приводящий к инфаркту миокарда" },
    { code: "I24.1", name: "Синдром Дресслера" },
    { code: "I24.8", name: "Другие формы острой ишемической болезни сердца" },
    { code: "I24.9", name: "Острая ишемическая болезнь сердца неуточненная" },
    
    { code: "I25", name: "Хроническая ишемическая болезнь сердца" },
    { code: "I25.0", name: "Атеросклеротическая сердечно-сосудистая болезнь, описанная таким образом" },
    { code: "I25.1", name: "Атеросклеротическая болезнь сердца" },
    { code: "I25.2", name: "Перенесенный в прошлом инфаркт миокарда" },
    { code: "I25.3", name: "Аневризма сердца" },
    { code: "I25.4", name: "Коронарная аневризма и расслоение" },
    { code: "I25.5", name: "Ишемическая кардиомиопатия" },
    { code: "I25.6", name: "Бессимптомная ишемия миокарда" },
    { code: "I25.8", name: "Другие формы хронической ишемической болезни сердца" },
    { code: "I25.9", name: "Хроническая ишемическая болезнь сердца неуточненная" },

    // Легочное сердце и нарушения легочного кровообращения (I26-I28)
    { code: "I26", name: "Легочная эмболия" },
    { code: "I26.0", name: "Легочная эмболия с упоминанием об остром легочном сердце" },
    { code: "I26.9", name: "Легочная эмболия без упоминания об остром легочном сердце" },
    { code: "I27", name: "Другие формы легочно-сердечной недостаточности" },
    { code: "I27.0", name: "Первичная легочная гипертензия" },
    { code: "I27.1", name: "Кифосколиотическая болезнь сердца" },
    { code: "I27.2", name: "Другая вторичная легочная гипертензия" },
    { code: "I27.8", name: "Другие уточненные формы легочно-сердечной недостаточности" },
    { code: "I27.9", name: "Легочно-сердечная недостаточность неуточненная" },
    { code: "I28", name: "Другие болезни легочных сосудов" },
    { code: "I28.0", name: "Артериовенозный свищ легочных сосудов" },
    { code: "I28.1", name: "Аневризма легочной артерии" },
    { code: "I28.8", name: "Другие уточненные болезни легочных сосудов" },
    { code: "I28.9", name: "Болезнь легочных сосудов неуточненная" },

    // Другие болезни сердца (I30-I52)
    { code: "I30", name: "Острый перикардит" },
    { code: "I30.0", name: "Острый неспецифический идиопатический перикардит" },
    { code: "I30.1", name: "Инфекционный перикардит" },
    { code: "I30.8", name: "Другие формы острого перикардита" },
    { code: "I30.9", name: "Острый перикардит неуточненный" },
    
    { code: "I31", name: "Другие болезни перикарда" },
    { code: "I31.0", name: "Хронический адгезивный перикардит" },
    { code: "I31.1", name: "Хронический констриктивный перикардит" },
    { code: "I31.2", name: "Гемоперикард, не классифицированный в других рубриках" },
    { code: "I31.3", name: "Перикардиальный выпот (невоспалительный)" },
    { code: "I31.8", name: "Другие уточненные болезни перикарда" },
    { code: "I31.9", name: "Болезнь перикарда неуточненная" },
    
    { code: "I32", name: "Перикардит при болезнях, классифицированных в других рубриках" },
    
    { code: "I33", name: "Острый и подострый эндокардит" },
    { code: "I33.0", name: "Острый и подострый инфекционный эндокардит" },
    { code: "I33.9", name: "Острый эндокардит неуточненный" },
    
    { code: "I34", name: "Неревматические поражения митрального клапана" },
    { code: "I34.0", name: "Митральная недостаточность" },
    { code: "I34.1", name: "Пролапс митрального клапана" },
    { code: "I34.2", name: "Неревматический стеноз митрального клапана" },
    { code: "I34.8", name: "Другие неревматические поражения митрального клапана" },
    { code: "I34.9", name: "Неревматическое поражение митрального клапана неуточненное" },
    
    { code: "I35", name: "Неревматические поражения аортального клапана" },
    { code: "I35.0", name: "Аортальный стеноз" },
    { code: "I35.1", name: "Аортальная недостаточность" },
    { code: "I35.2", name: "Аортальный стеноз с недостаточностью" },
    { code: "I35.8", name: "Другие поражения аортального клапана" },
    { code: "I35.9", name: "Поражение аортального клапана неуточненное" },
    
    { code: "I36", name: "Неревматические поражения трехстворчатого клапана" },
    { code: "I36.0", name: "Неревматический стеноз трехстворчатого клапана" },
    { code: "I36.1", name: "Неревматическая недостаточность трехстворчатого клапана" },
    { code: "I36.2", name: "Неревматический стеноз трехстворчатого клапана с недостаточностью" },
    { code: "I36.8", name: "Другие неревматические поражения трехстворчатого клапана" },
    { code: "I36.9", name: "Неревматическое поражение трехстворчатого клапана неуточненное" },
    
    { code: "I37", name: "Поражения клапана легочной артерии" },
    { code: "I37.0", name: "Стеноз клапана легочной артерии" },
    { code: "I37.1", name: "Недостаточность клапана легочной артерии" },
    { code: "I37.2", name: "Стеноз клапана легочной артерии с недостаточностью" },
    { code: "I37.8", name: "Другие поражения клапана легочной артерии" },
    { code: "I37.9", name: "Поражение клапана легочной артерии неуточненное" },
    
    { code: "I38", name: "Эндокардит, клапан не уточнен" },
    { code: "I39", name: "Эндокардит и поражения клапанов сердца при болезнях, классифицированных в других рубриках" },
    
    { code: "I40", name: "Острый миокардит" },
    { code: "I40.0", name: "Инфекционный миокардит" },
    { code: "I40.1", name: "Изолированный миокардит" },
    { code: "I40.8", name: "Другие острые миокардиты" },
    { code: "I40.9", name: "Острый миокардит неуточненный" },
    
    { code: "I41", name: "Миокардит при болезнях, классифицированных в других рубриках" },
    
    { code: "I42", name: "Кардиомиопатия" },
    { code: "I42.0", name: "Дилатационная кардиомиопатия" },
    { code: "I42.1", name: "Обструктивная гипертрофическая кардиомиопатия" },
    { code: "I42.2", name: "Другая гипертрофическая кардиомиопатия" },
    { code: "I42.3", name: "Эндомиокардиальная (эозинофильная) болезнь" },
    { code: "I42.4", name: "Эндокардиальный фиброэластоз" },
    { code: "I42.5", name: "Другая рестриктивная кардиомиопатия" },
    { code: "I42.6", name: "Алкогольная кардиомиопатия" },
    { code: "I42.7", name: "Кардиомиопатия, обусловленная воздействием лекарственных средств и других внешних факторов" },
    { code: "I42.8", name: "Другие кардиомиопатии" },
    { code: "I42.9", name: "Кардиомиопатия неуточненная" },
    
    { code: "I43", name: "Кардиомиопатия при болезнях, классифицированных в других рубриках" },
    
    { code: "I44", name: "Предсердно-желудочковая блокада и блокада левой ножки пучка [Гиса]" },
    { code: "I44.0", name: "Предсердно-желудочковая блокада первой степени" },
    { code: "I44.1", name: "Предсердно-желудочковая блокада второй степени" },
    { code: "I44.2", name: "Предсердно-желудочковая блокада полная" },
    { code: "I44.3", name: "Другая и неуточненная предсердно-желудочковая блокада" },
    { code: "I44.4", name: "Блокада передне-левой ветви" },
    { code: "I44.5", name: "Блокада задне-левой ветви" },
    { code: "I44.6", name: "Другие и неуточненные фасцикулярные блокады" },
    { code: "I44.7", name: "Блокада левой ножки пучка неуточненная" },
    
    { code: "I45", name: "Другие нарушения проводимости" },
    { code: "I45.0", name: "Блокада правой ножки пучка" },
    { code: "I45.1", name: "Другая и неуточненная блокада правой ножки пучка" },
    { code: "I45.2", name: "Двухпучковая блокада" },
    { code: "I45.3", name: "Трехпучковая блокада" },
    { code: "I45.4", name: "Неспецифическая внутрижелудочковая блокада" },
    { code: "I45.5", name: "Другая уточненная блокада сердца" },
    { code: "I45.6", name: "Синдром преждевременного возбуждения" },
    { code: "I45.8", name: "Другие уточненные нарушения проводимости" },
    { code: "I45.9", name: "Нарушение проводимости неуточненное" },
    
    { code: "I46", name: "Остановка сердца" },
    { code: "I46.0", name: "Остановка сердца с успешным восстановлением сердечной деятельности" },
    { code: "I46.1", name: "Внезапная сердечная смерть, описанная таким образом" },
    { code: "I46.9", name: "Остановка сердца неуточненная" },
    
    { code: "I47", name: "Пароксизмальная тахикардия" },
    { code: "I47.0", name: "Возвратная желудочковая аритмия" },
    { code: "I47.1", name: "Наджелудочковая тахикардия" },
    { code: "I47.2", name: "Желудочковая тахикардия" },
    { code: "I47.9", name: "Пароксизмальная тахикардия неуточненная" },
    
    { code: "I48", name: "Фибрилляция и трепетание предсердий" },
    { code: "I48.0", name: "Фибрилляция предсердий" },
    { code: "I48.1", name: "Трепетание предсердий" },
    { code: "I48.2", name: "Хроническая фибрилляция предсердий" },
    { code: "I48.3", name: "Типичное трепетание предсердий" },
    { code: "I48.4", name: "Атипичное трепетание предсердий" },
    { code: "I48.9", name: "Фибрилляция и трепетание предсердий неуточненные" },
    
    { code: "I49", name: "Другие нарушения сердечного ритма" },
    { code: "I49.0", name: "Фибрилляция и трепетание желудочков" },
    { code: "I49.1", name: "Преждевременная деполяризация предсердий" },
    { code: "I49.2", name: "Преждевременная деполяризация, исходящая из соединения" },
    { code: "I49.3", name: "Преждевременная деполяризация желудочков" },
    { code: "I49.4", name: "Другая и неуточненная преждевременная деполяризация" },
    { code: "I49.5", name: "Синдром слабости синусового узла" },
    { code: "I49.8", name: "Другие уточненные нарушения сердечного ритма" },
    { code: "I49.9", name: "Нарушение сердечного ритма неуточненное" },
    
    { code: "I50", name: "Сердечная недостаточность" },
    { code: "I50.0", name: "Застойная сердечная недостаточность" },
    { code: "I50.1", name: "Левожелудочковая недостаточность" },
    { code: "I50.9", name: "Сердечная недостаточность неуточненная" },
    
    { code: "I51", name: "Осложнения и неточно обозначенные болезни сердца" },
    { code: "I51.0", name: "Дефект перегородки сердца приобретенный" },
    { code: "I51.1", name: "Разрыв сухожильной хорды, не классифицированный в других рубриках" },
    { code: "I51.2", name: "Разрыв сосочковой мышцы, не классифицированный в других рубриках" },
    { code: "I51.3", name: "Внутрисердечный тромбоз, не классифицированный в других рубриках" },
    { code: "I51.4", name: "Миокардит неуточненный" },
    { code: "I51.5", name: "Дегенерация миокарда" },
    { code: "I51.6", name: "Сердечно-сосудистая болезнь неуточненная" },
    { code: "I51.7", name: "Кардиомегалия" },
    { code: "I51.8", name: "Другие неточно обозначенные болезни сердца" },
    { code: "I51.9", name: "Болезнь сердца неуточненная" },
    
    { code: "I52", name: "Другие поражения сердца при болезнях, классифицированных в других рубриках" },

    // Цереброваскулярные болезни (I60-I69)
    { code: "I60", name: "Субарахноидальное кровоизлияние" },
    { code: "I61", name: "Внутримозговое кровоизлияние" },
    { code: "I62", name: "Другое нетравматическое внутричерепное кровоизлияние" },
    { code: "I63", name: "Инфаркт мозга" },
    { code: "I64", name: "Инсульт, не уточненный как кровоизлияние или инфаркт" },
    { code: "I65", name: "Закупорка и стеноз прецеребральных артерий, не приводящие к инфаркту мозга" },
    { code: "I66", name: "Закупорка и стеноз церебральных артерий, не приводящие к инфаркту мозга" },
    { code: "I67", name: "Другие цереброваскулярные болезни" },
    { code: "I67.1", name: "Церебральная аневризма без разрыва" },
    { code: "I67.2", name: "Церебральный атеросклероз" },
    { code: "I68", name: "Поражения сосудов мозга при болезнях, классифицированных в других рубриках" },
    { code: "I69", name: "Последствия цереброваскулярных болезней" },

    // Болезни артерий, артериол и капилляров (I70-I79)
    { code: "I70", name: "Атеросклероз" },
    { code: "I70.0", name: "Атеросклероз аорты" },
    { code: "I70.1", name: "Атеросклероз почечной артерии" },
    { code: "I70.2", name: "Атеросклероз артерий конечностей" },
    { code: "I70.8", name: "Атеросклероз других артерий" },
    { code: "I70.9", name: "Генерализованный и неуточненный атеросклероз" },
    
    { code: "I71", name: "Аневризма и расслоение аорты" },
    { code: "I71.0", name: "Расслоение аорты [любой части]" },
    { code: "I71.1", name: "Аневризма грудной части аорты разорванная" },
    { code: "I71.2", name: "Аневризма грудной части аорты без упоминания о разрыве" },
    { code: "I71.3", name: "Аневризма брюшной аорты разорванная" },
    { code: "I71.4", name: "Аневризма брюшной аорты без упоминания о разрыве" },
    { code: "I71.5", name: "Аневризма торакоабдоминальной аорты разорванная" },
    { code: "I71.6", name: "Аневризма торакоабдоминальной аорты без упоминания о разрыве" },
    { code: "I71.8", name: "Аневризма аорты других локализаций разорванная" },
    { code: "I71.9", name: "Аневризма аорты неуточненной локализации" },
    
    { code: "I72", name: "Другие аневризмы" },
    { code: "I73", name: "Другие болезни периферических сосудов" },
    { code: "I73.0", name: "Синдром Рейно" },
    { code: "I73.1", name: "Тромбангиит облитерирующий [болезнь Бюргера]" },
    { code: "I73.8", name: "Другие уточненные болезни периферических сосудов" },
    { code: "I73.9", name: "Болезнь периферических сосудов неуточненная" },
    
    { code: "I74", name: "Эмболия и тромбоз артерий" },
    { code: "I74.0", name: "Эмболия и тромбоз брюшной аорты" },
    { code: "I74.1", name: "Эмболия и тромбоз других и неуточненных отделов аорты" },
    { code: "I74.2", name: "Эмболия и тромбоз артерий верхних конечностей" },
    { code: "I74.3", name: "Эмболия и тромбоз артерий нижних конечностей" },
    { code: "I74.4", name: "Эмболия и тромбоз артерий конечностей неуточненных" },
    { code: "I74.5", name: "Эмболия и тромбоз подвздошной артерии" },
    { code: "I74.8", name: "Эмболия и тромбоз других артерий" },
    { code: "I74.9", name: "Эмболия и тромбоз неуточненной артерии" },
    
    { code: "I77", name: "Другие поражения артерий и артериол" },
    { code: "I78", name: "Болезни капилляров" },
    { code: "I79", name: "Поражения артерий, артериол и капилляров при болезнях, классифицированных в других рубриках" },

    // Болезни вен, лимфатических сосудов и лимфатических узлов (I80-I89)
    { code: "I80", name: "Флебит и тромбофлебит" },
    { code: "I81", name: "Тромбоз портальной вены" },
    { code: "I82", name: "Другие венозные эмболии и тромбозы" },
    { code: "I83", name: "Варикозное расширение вен нижних конечностей" },
    { code: "I84", name: "Геморрой" },
    { code: "I85", name: "Варикозное расширение вен пищевода" },
    { code: "I86", name: "Варикозное расширение вен других локализаций" },
    { code: "I87", name: "Другие поражения вен" },
    { code: "I88", name: "Неспецифический лимфаденит" },
    { code: "I89", name: "Другие неинфекционные болезни лимфатических сосудов и лимфатических узлов" },

    // Другие и неуточненные болезни системы кровообращения (I95-I99)
    { code: "I95", name: "Гипотензия" },
    { code: "I95.0", name: "Идиопатическая гипотензия" },
    { code: "I95.1", name: "Ортостатическая гипотензия" },
    { code: "I95.2", name: "Гипотензия, вызванная лекарственными средствами" },
    { code: "I95.8", name: "Другая гипотензия" },
    { code: "I95.9", name: "Гипотензия неуточненная" },
    
    { code: "I96", name: "Гангрена, не классифицированная в других рубриках" },
    { code: "I97", name: "Нарушения системы кровообращения после медицинских процедур, не классифицированные в других рубриках" },
    { code: "I98", name: "Другие нарушения системы кровообращения при болезнях, классифицированных в других рубриках" },
    { code: "I99", name: "Другие и неуточненные нарушения системы кровообращения" },

    // === БОЛЕЗНИ ЭНДОКРИННОЙ СИСТЕМЫ (связанные с кардиологией) ===
    
    // Сахарный диабет
    { code: "E10", name: "Сахарный диабет 1 типа" },
    { code: "E10.7", name: "Сахарный диабет 1 типа с множественными осложнениями" },
    { code: "E10.9", name: "Сахарный диабет 1 типа без осложнений" },
    { code: "E11", name: "Сахарный диабет 2 типа" },
    { code: "E11.7", name: "Сахарный диабет 2 типа с множественными осложнениями" },
    { code: "E11.9", name: "Сахарный диабет 2 типа без осложнений" },
    { code: "E14", name: "Сахарный диабет неуточненный" },

    // Нарушения обмена липопротеинов и другие липидемии
    { code: "E78", name: "Нарушения обмена липопротеинов и другие липидемии" },
    { code: "E78.0", name: "Чистая гиперхолестеринемия" },
    { code: "E78.1", name: "Чистая гиперглицеридемия" },
    { code: "E78.2", name: "Смешанная гиперлипидемия" },
    { code: "E78.3", name: "Гиперхилимикронемия" },
    { code: "E78.4", name: "Другие гиперлипидемии" },
    { code: "E78.5", name: "Гиперлипидемия неуточненная" },
    { code: "E78.6", name: "Недостаточность липопротеинов" },
    { code: "E78.8", name: "Другие нарушения обмена липопротеинов" },
    { code: "E78.9", name: "Нарушение обмена липопротеинов неуточненное" },

    // === СИМПТОМЫ И ПРИЗНАКИ (связанные с кардиологией) ===
    
    { code: "R00", name: "Нарушения сердечного ритма" },
    { code: "R00.0", name: "Тахикардия неуточненная" },
    { code: "R00.1", name: "Брадикардия неуточненная" },
    { code: "R00.2", name: "Сердцебиение" },
    { code: "R00.8", name: "Другие и неуточненные нарушения сердечного ритма" },
    
    { code: "R01", name: "Шумы сердца и другие звуки сердца" },
    { code: "R01.0", name: "Доброкачественный и невинный шумы сердца" },
    { code: "R01.1", name: "Шум сердца неуточненный" },
    { code: "R01.2", name: "Другие шумы сердца" },
    
    { code: "R03", name: "Отклонение от нормы показателей кровяного давления при отсутствии установленного диагноза" },
    { code: "R03.0", name: "Повышенное кровяное давление при отсутствии диагноза гипертензии" },
    { code: "R03.1", name: "Неспецифическое низкое кровяное давление" },
    
    { code: "R06", name: "Нарушения дыхания" },
    { code: "R06.0", name: "Одышка" },
    { code: "R06.2", name: "Свистящее дыхание" },
    
    { code: "R50", name: "Лихорадка неуточненная" },
    { code: "R57", name: "Шок, не классифицированный в других рубриках" },
    { code: "R57.0", name: "Кардиогенный шок" },
    
    // === ФАКТОРЫ, ВЛИЯЮЩИЕ НА СОСТОЯНИЕ ЗДОРОВЬЯ ===
    
    { code: "Z95", name: "Наличие имплантатов и трансплантатов сердечно-сосудистой системы" },
    { code: "Z95.0", name: "Наличие электронного устройства сердца" },
    { code: "Z95.1", name: "Наличие аортокоронарного шунта" },
    { code: "Z95.2", name: "Наличие протеза сердечного клапана" },
    { code: "Z95.3", name: "Наличие ксеногенного сердечного клапана" },
    { code: "Z95.4", name: "Наличие других замещений сердечного клапана" },
    { code: "Z95.5", name: "Наличие имплантата и трансплантата сердечного клапана" },
    { code: "Z95.8", name: "Наличие других имплантатов и трансплантатов сердечно-сосудистой системы" },
    { code: "Z95.9", name: "Наличие имплантата и трансплантата сердечно-сосудистой системы неуточненного" }
];

console.log('✅ МКБ-10 данные загружены: ' + window.ICD10_DATA.length + ' диагнозов');