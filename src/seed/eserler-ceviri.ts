export type CeviriDili = 'en' | 'ar'

export type EserCevirisi = {
  baslik: string
  anlam?: string
  kaynak?: string
  aciklama?: string
}

/** Yazı türlerinin İngilizce ve Arapça adları (Türkçe ada göre). */
export const YAZI_TURU_CEVIRILERI: Record<string, Record<CeviriDili, string>> = {
  Sülüs: { en: 'Thuluth', ar: 'الثلث' },
  Nesih: { en: 'Naskh', ar: 'النسخ' },
  'Celî Sülüs': { en: 'Jali Thuluth', ar: 'الثلث الجلي' },
  "Ta'lik": { en: "Ta'liq", ar: 'التعليق' },
  "Rik'a": { en: "Riq'a", ar: 'الرقعة' },
}

/** Eser türlerinin İngilizce ve Arapça adları (Türkçe ada göre). */
export const ESER_TURU_CEVIRILERI: Record<string, Record<CeviriDili, string>> = {
  Hilye: { en: 'Hilye', ar: 'حلية شريفة' },
  Levha: { en: 'Panel', ar: 'لوحة' },
  Âyet: { en: "Qur'anic Verse", ar: 'آية كريمة' },
  Beyit: { en: 'Couplet', ar: 'بيت شعري' },
  "Kıt'a": { en: "Qit'a", ar: 'قطعة' },
}

/** 22 eserin görsel dosya adına (`e.f`) göre İngilizce ve Arapça çevirileri. */
export const ESER_CEVIRILERI: Record<string, Record<CeviriDili, EserCevirisi>> = {
  'e-hilye.jpg': {
    en: {
      baslik: 'Hilye-i Şerif',
      anlam: 'And We have not sent you except as a mercy to the worlds.',
      kaynak: 'Surah al-Anbiya, verse 107 (the verse band of the hilye)',
      aciklama:
        'A classical hilye composition describing the noble appearance and character of the Prophet Muhammad (peace be upon him), with the Basmala at the head, the hilye text in the central medallion, and the names of the four Rightly Guided Caliphs in the corners.',
    },
    ar: {
      baslik: 'الحلية الشريفة',
      anlam: 'وما أرسلناك إلا رحمة للعالمين.',
      kaynak: 'سورة الأنبياء، الآية ١٠٧ (حزام الآية في الحلية)',
      aciklama:
        'تشكيل كلاسيكي للحلية الشريفة يصف شمائل النبي محمد ﷺ وأخلاقه الكريمة؛ تتصدّرها البسملة، وفي السرة متن الحلية، وفي الزوايا أسماء الخلفاء الراشدين الأربعة.',
    },
  },
  'e-subhanallah.jpg': {
    en: {
      baslik: 'Subhanallah',
      anlam: 'Glory be to God, exalted above every imperfection.',
    },
    ar: {
      baslik: 'سبحان الله',
      anlam: 'تنزيهٌ لله تعالى عن كل نقص.',
    },
  },
  'e-fussilet.jpg': {
    en: {
      baslik: 'Surah Fussilat, Verse 53',
      anlam: 'We will show them Our signs upon the horizons and within themselves…',
      kaynak: 'Surah Fussilat, verse 53',
    },
    ar: {
      baslik: 'سورة فصّلت، الآية ٥٣',
      kaynak: 'سورة فصّلت، الآية ٥٣',
    },
  },
  'e-seyen-lillah.jpg': {
    en: {
      baslik: "Shay'an Lillah",
      anlam: 'Something for the sake of God…',
      aciklama:
        'A classical Sufi invocation spoken by dervishes when asking solely for the sake of God, frequently inscribed on calligraphy panels.',
    },
    ar: {
      baslik: 'شيئًا لله',
      anlam: 'ابتغاء مرضاة الله…',
      aciklama: 'عبارة مأثورة في التراث الصوفي تُكتَب كثيرًا في اللوحات الخطية طلبًا لوجه الله تعالى.',
    },
  },
  'e-tovbe.jpg': {
    en: {
      baslik: 'Repentance, O Lord (Tövbe Yâ Rabbi)',
      aciklama: 'Classical devotional couplet of repentance written in Naskh script.',
    },
    ar: {
      baslik: 'توبةً يا ربّي',
      aciklama: 'بيت شعري مناجاةٍ وتوبة مكتوب بخط النسخ.',
    },
  },
  'e-sulus-2.jpg': {
    en: {
      baslik: "Kun Ma'allahi bi's-Sidq",
      anlam:
        'Be with God in truthfulness, and with people in fairness… (continuing with counsel on how to comport oneself toward the self, scholars, elders, the poor, children, friends, adversaries, and the ignorant).',
    },
    ar: {
      baslik: 'كن مع الله بالصدق',
      aciklama:
        'قطعة بخط الثلث تتضمّن وصايا في الصدق مع الله والإنصاف مع الخلق ومعاملة النفس والعلماء والمشايخ والفقراء والأطفال والأصدقاء.',
    },
  },
  'e-emrolundugun.jpg': {
    en: {
      baslik: 'Stand Firm as You Are Commanded',
      anlam: 'So remain steadfast, just as you have been commanded.',
      kaynak: 'Surah Hud, verse 112',
    },
    ar: {
      baslik: 'فاستقم كما أُمرت',
      kaynak: 'سورة هود، الآية ١١٢',
    },
  },
  'e-rika-gazel.jpg': {
    en: {
      baslik: 'Ghazal of Yunus Emre',
      kaynak: 'Yunus Emre',
      aciklama: "Yunus Emre's metaphorical poem (şathiyye) written in Riq'a script with a Thuluth heading.",
    },
    ar: {
      baslik: 'غزل يونس إمره',
      kaynak: 'يونس إمره',
      aciklama: 'قطعة شعرية ليونس إمره مكتوبة بخط الرقعة مع عنوان بخط الثلث.',
    },
  },
  'e-besmele.jpg': {
    en: {
      baslik: 'Basmala (Besmele-i Şerif)',
      anlam: 'In the name of God, the Most Compassionate, the Most Merciful.',
    },
    ar: {
      baslik: 'البسملة الشريفة',
    },
  },
  'e-hilye-saadet.png': {
    en: {
      baslik: 'Hilye-i Saâdet',
      aciklama: 'Classical hilye panel written in Thuluth and Naskh scripts.',
    },
    ar: {
      baslik: 'حلية السعادة',
      aciklama: 'حلية شريفة مكتوبة بخطَّي الثلث والنسخ.',
    },
  },
  'e-rika-1.jpg': {
    en: {
      baslik: "Couplet in Riq'a",
      aciklama: "Ottoman Turkish couplet written in Riq'a script.",
    },
    ar: {
      baslik: 'بيت شعري بخط الرقعة',
      aciklama: 'بيت شعري عثماني مكتوب بخط الرقعة.',
    },
  },
  'e-sulus-1.jpg': {
    en: {
      baslik: 'Couplet in Thuluth',
      aciklama: 'Classical couplet written in Thuluth script.',
    },
    ar: {
      baslik: 'بيت شعري بخط الثلث',
      aciklama: 'بيت شعري كلاسيكي مكتوب بخط الثلث.',
    },
  },
  'e-besmele-levha.png': {
    en: {
      baslik: 'Basmala Panel',
      anlam: 'In the name of God, the Most Compassionate, the Most Merciful.',
    },
    ar: {
      baslik: 'لوحة البسملة',
    },
  },
  'e-besmele-talik.png': {
    en: {
      baslik: "Basmala in Ta'liq",
      anlam: 'In the name of God, the Most Compassionate, the Most Merciful.',
    },
    ar: {
      baslik: 'البسملة بخط التعليق',
    },
  },
  'e-kisi-sevdigiyle-beraberdir.jpg': {
    en: {
      baslik: 'A Person Is with Those Whom They Love',
      anlam: 'A person is with the one they love.',
      kaynak: 'Hadith (al-Bukhari, Adab, 96; Muslim, Birr, 165)',
    },
    ar: {
      baslik: 'المرء مع من أحبّ',
      kaynak: 'حديث شريف (صحيح البخاري، الأدب ٩٦؛ صحيح مسلم، البر ١٦٥)',
    },
  },
  'e-ikra.jpg': {
    en: {
      baslik: 'Iqra (Read!)',
      anlam: 'Read!',
      kaynak: 'Surah al-Alaq, verse 1',
      aciklama: 'Mirrored (muthanna) Jali Thuluth composition in the form of a tulip.',
    },
    ar: {
      baslik: 'اقرأ',
      kaynak: 'سورة العلق، الآية ١',
      aciklama: 'تركيب مثنّى (متناظر) بخط الثلث الجلي على هيئة زهرة التوليب.',
    },
  },
  'e-beni-anin.jpg': {
    en: {
      baslik: 'Remember Me, and I Will Remember You',
      anlam: 'So remember Me; I will remember you. And be grateful to Me and do not deny Me.',
      kaynak: 'Surah al-Baqarah, verse 152',
    },
    ar: {
      baslik: 'فاذكروني أذكركم',
      kaynak: 'سورة البقرة، الآية ١٥٢',
    },
  },
  'e-adaletle-hukmedin.jpg': {
    en: {
      baslik: 'Judge Between People with Justice',
      anlam: 'And when you judge between people, judge with justice.',
      kaynak: 'Surah an-Nisa, verse 58',
    },
    ar: {
      baslik: 'وإذا حكمتم بين الناس أن تحكموا بالعدل',
      kaynak: 'سورة النساء، الآية ٥٨',
    },
  },
  'e-cifte-vav.jpg': {
    en: {
      baslik: 'Mirrored Waw — Jalla Jalaluhu',
      anlam: 'Exalted is His Majesty.',
      aciklama: 'Mirrored (muthanna) waw letters framing a central Thuluth composition of “Jalla Jalaluhu”.',
    },
    ar: {
      baslik: 'واو مثنّاة — جلّ جلاله',
      aciklama: 'واوان متناظرتان (مثنّى) يتوسّطهما تركيب بخط الثلث لعبارة «جلّ جلاله».',
    },
  },
  'e-tevekkeltu-alallah.jpg': {
    en: {
      baslik: "Tawakkaltu 'ala Allah",
      anlam: 'I have placed my trust in God.',
      kaynak: 'Surah Hud, verse 56; Surah ash-Shura, verse 10',
    },
    ar: {
      baslik: 'توكّلت على الله',
      kaynak: 'سورة هود، الآية ٥٦؛ سورة الشورى، الآية ١٠',
    },
  },
  'e-gazel-niyazi-misri.jpg': {
    en: {
      baslik: 'Ghazal of Niyâzî-i Mısrî',
      kaynak: 'Niyâzî-i Mısrî',
      aciklama:
        "Complete eight-couplet Sufi ghazal beginning “Within creation I am a mirror; whoever looks sees for a moment…” written in Riq'a script with a Thuluth title.",
    },
    ar: {
      baslik: 'غزل نيازي المصري',
      kaynak: 'نيازي المصري',
      aciklama: 'غزل صوفي كامل من ثمانية أبيات لنيازي المصري مكتوب بخط الرقعة ويتصدّره عنوان بخط الثلث.',
    },
  },
  'e-su-kasidesi.jpg': {
    en: {
      baslik: 'Su Kasîdesi (Ode to Water)',
      kaynak: 'Fuzûlî',
      aciklama:
        "Fuzûlî's celebrated thirty-two-couplet eulogy (na't) in praise of the Prophet Muhammad (peace be upon him), written in full in Riq'a script with a Thuluth heading.",
    },
    ar: {
      baslik: 'قصيدة الماء (صو قصيده‌سي)',
      kaynak: 'فضولي البغدادي',
      aciklama:
        'النعت النبوي الشهير للشاعر فضولي في مدح النبي محمد ﷺ كاملًا في اثنين وثلاثين بيتًا بخط الرقعة مع عنوان بخط الثلث.',
    },
  },
}
