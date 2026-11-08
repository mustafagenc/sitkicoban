/** Semerkand Dergisi'nde yayımlanan 5 tefsir yazısı (Sıtkı Çoban). */

import { BOLD, block, h2, p, root, text, ul } from './lexical'

export const SEED_YAZI_KATEGORILERI = ['Tefsir', 'Sanat', 'Edebiyat'] as const

export type SeedYazi = {
  baslik: string
  kategori: (typeof SEED_YAZI_KATEGORILERI)[number]
  ozet: string
  /** "Mart 2025" → 2025-03-01 */
  tarih: string
  /** Tasarımdaki dakika; gövdesi olmayan taslaklarda listede görünmesi için elle tutulur. */
  dakika?: number
  kapak?: { file: string; alt: string }
  govde?: unknown
  kaynaklar?: string[]
  yayinda: boolean
}

/** 1. Zikir, Fikir, Dua — https://semerkanddergisi.com/zikir-fikir-dua/ */
const ZIKIR_FIKIR_DUA_GOVDE = root(
  p(
    text(
      'Bu mübarek ayet-i kerime sâlih, seçkin kulların hayat tarzını, ibadet ve taate nasıl devam ettiklerini, ne şekilde zikir, dua ve niyazda bulunduklarını bizlere bir örnek olmak üzere beyan buyurur. Bu zâtlar her halleriyle zikir, fikir, ibadet ve taatle meşguldür.',
    ),
  ),
  block('6730a1000000000000000101', {
    blockType: 'ayet',
    arapca:
      'الَّذِينَ يَذْكُرُونَ اللّٰهَ قِيَامًا وَقُعُودًا وَعَلٰى جُنُوبِهِمْ وَيَتَفَكَّرُونَ فِي خَلْقِ السَّمٰوَاتِ وَالْأَرْضِ رَبَّنَا مَا خَلَقْتَ هٰذَا بَاطِلًا سُبْحَانَكَ فَقِنَا عَذَابَ النَّارِ',
    meal: 'Onlar ayakta dururken, otururken, yanları üzerine yatarken (her vakit) Allah’ı anarlar, göklerin ve yerin yaratılışı hakkında derin derin düşünürler (ve şöyle derler:) Rabbimiz! Sen bunu boşuna yaratmadın. Seni tesbih ederiz. Bizi cehennem azabından koru!',
    kaynak: 'Âl-i İmrân Sûresi · 191',
  }),
  p(
    text('Bir hadis-i şerifte şöyle buyurulur: '),
    text('“Kim cennet bahçelerinde nimetlere kavuşup sefa sürmek istiyorsa, Allah’ı çokça zikretsin.”', BOLD),
    text(' (Taberânî, el-Kebîr, 20/157; Heysemî, ez-Zevâid, 10/75)'),
  ),
  p(text('Ayet-i kerimenin iniş sebebi hakkında şu rivayet nakledilir:')),
  p(
    text(
      'Atâ b. Ebî Rabah r.a. şöyle anlatır: Abdullah b. Ömer ve Ubeydullah b. Ömer r.anhüma ile birlikte Hz. Aişe r.anha’nın huzuruna çıkıp selam verdim. Aişe: “Bunlar kim?” diye sorunca, “Abdullah b. Ömer ve Ubeydullah b. Ömer” dedim. Hz. Aişe:',
    ),
  ),
  p(text('– Hoş geldin Ubeydullah, niçin hiç ziyaretimize gelmezsin, diye serzenişte bulundu. Ubeydullah da cevaben:')),
  p(
    text(
      '– Ziyaret uzun aralıklarla yapılmalı ki, ziyaret edilenin seni daha fazla özlemesini ve sevmesini sağlasın, dedi. Abdullah ise:',
    ),
  ),
  p(
    text(
      '– Ey müminlerin annesi, bize Allah Rasulü s.a.v.’in en hoşuna giden yönünü anlatıver, dedi. Bu söz üzerine Hz. Aişe r.anha uzun süre ağladıktan sonra şöyle dedi:',
    ),
  ),
  p(
    text(
      '– Onun her şeyi hoştu. Benim sırama rastlayan gece yanıma geldi. Yatağıma geldi, vücudu vücuduma değdiği sırada:',
    ),
  ),
  p(text('– “Aişe, Rabbime ibadet etmeme müsaade eder misin?” dedi. Ben de:')),
  p(
    text(
      '– “Vallahi seninle birlikte olmayı istediğimden daha çok, senin kendi istediğin şeyleri yapmandan hoşlanırım. Sana izin verdim.” dedim.',
    ),
  ),
  p(
    text(
      'Bu cevap üzerine kalktı, ibriği aldı ve abdest tazeledi. Sonra namaza durdu. Ayakta iken gözyaşları vücudunun iki yanına akıncaya kadar ağladı. Namazını bitirdikten sonra, sağ elini sağ yanağına koymuş bir vaziyette sağ tarafı üzerine yattı. Yine gözyaşları birer inci gibi dökülüp yere damlayıncaya kadar ağladı. Nihayet sabah ezanını okuduktan sonra Bilâl geldi. Allah Rasulü s.a.v.’in ağladığını görünce:',
    ),
  ),
  p(
    text(
      '– “Ey Allah’ın Rasulü, gelmiş geçmiş bütün günahların bağışlandığı halde niçin ağlıyorsun?” dedi. Allah Rasulü s.a.v. dedi ki:',
    ),
  ),
  p(
    text(
      '– “Bilâl, şükreden bir kul olmayayım mı? Ayrıca nasıl ağlamayayım ki bu gece bana şu ayet-i kerimeler nâzil oldu: ‘Göklerin ve yerin yaratılışında, gece ile gündüzün birbiri ardınca gelip gidişinde aklıselim sahipleri için gerçekten açık ibretler vardır. Onlar, ayakta dururken, otururken, yanları üzerine yatarken (her vakit) Allah’ı anarlar, göklerin ve yerin yaratılışı hakkında derin derin düşünürler (ve şöyle derler:) Rabbimiz! Sen bunu boşuna yaratmadın. Seni tesbih ederiz. Bizi cehennem azabından koru.’ Bu ayetleri okuduğu halde tefekkür etmeyene yazıklar olsun.” (Buhârî, Teheccüd 6; Müslim, Münâfikûn 79-81)',
    ),
  ),
  h2('Aklın ışığı'),
  p(
    text(
      'Gözün görebilmesi için güneş ışığına ihtiyacı olduğu gibi, aklın da hakikati kavrayabilmek için vahye ihtiyacı vardır. Râgıb el-İsfahânî akıl ile vahyin bu önemini şöyle ifade eder:',
    ),
  ),
  p(
    text(
      '“Azîz ve Celîl olan Allah’ın insanlara iki elçisi vardır; ilki bâtınî elçi olan akıl, ikincisi de zâhirî elçi olan peygamberdir. Öncelikle bâtınî elçiyi (aklı) kullanmadan zâhirî elçiden (peygamberden) yararlanmak mümkün değildir. Çünkü peygamberin öğretisinin sahih olduğu akılla bilinir…”',
    ),
  ),
  block('6730a1000000000000000102', {
    blockType: 'oneCikanSoz',
    metin: 'Akıl olmasaydı din yaşayamazdı, din olmasaydı akıl yolunu şaşırırdı.',
  }),
  p(
    text(
      'İşte bu ayet-i kerimede akılla vahyin bu uyumuna işaret edilmekte; kâinat üzerinde selim akılla gözlemde bulunan insanların onu yaratıp düzenleyen yüce kudreti bilip tanıyacağı haber verilir. Ayrıca imana davet eden elçinin çağrısına uyarak Rabbine imanını içtenlikle ikrar edeceği ve nihayet O’na niyazda bulunup cehennem ateşinden kurtulma isteğini O’na arz edeceği bildirilir.',
    ),
  ),
  p(
    text(
      'İlahî bir ihsan olan akıl doğru kullanıldığında, kendisinin bir yetki ve sorumluluğunun olması gerektiğini, bu dünyada yaptıklarının ceza veya mükâfat olarak karşılığını alacağı bir hesap gününün bulunması lazım geldiğini düşünmeye sevk eder. İnsan böyle bir düşünce düzeyine ulaştığında sorumluluk hissi daha da artar ve dünyada günah işlemekten sakınır; ahirette cehennem azabından koruması için Allah Tealâ’ya sığınır, O’na dua etmeye yönelir.',
    ),
  ),
  p(
    text(
      'Ayet-i kerimenin son kısmı ve onu takip eden ayetler bu durumu açıkça gösterir. Allah’ın birliğini, yüceliğini ve sonsuz kudretini fark etmek için insanı gökler ve yer hakkında düşünmeye sevk eden bu ayet-i kerime, Allah’ın kitabında yazılı olan delilleri okuyup düşündükten sonra bir de kevnî ayetler olan bu uçsuz bucaksız kâinat kitabını okumaya davet eder.',
    ),
  ),
  h2('Kulluğun mertebeleri'),
  p(
    text(
      'Allah Tealâ’ya kulluk üç şekilde olur: Kalp ile tasdik, dil ile ikrar, azalarla amel ve ibadet. Ayet-i kerimedeki “Allah’ı anarlar” ifadesi dil ile yapılan kulluğa; “ayakta iken, otururken, yanları üstüne yatarken” ifadesi azalarla yapılan kulluğa; “gökler ile yerin yaratılışı hakkında derin derin, inceden inceye düşünürler” ifadesi de kalbin, aklın ve fikrin kulluğuna bir işarettir. Dil zikre, azalar şükre, kalp de tefekküre daldığında, bu halde olan kul her şeyi ile kulluğa gark olmuştur.',
    ),
  ),
  p(
    text(
      'Müfessirlerin ekserisine göre bu ayet-i kerimedeki zikirden murad, insanın devamlı olarak Rabbini zikretmesidir. Çünkü insan ya ayaktadır ya oturur ya da yatar. Yani bütün durumları bu üç şekilden ibarettir.',
    ),
  ),
  p(
    text(
      'Allah Tealâ’nın bu üç hali bir arada ifade buyurması, insanın devamlı zikredip kesinlikle zikirden ayrılmamasının gerektiğine delil olur. Yani gerek çalışırken gerekse istirahat halinde bulunurken her hallerinde Allah’ı zikrederler.',
    ),
  ),
  p(
    text(
      'Bir başka kavle göre bu ayet-i kerimede bahsedilen zikir, namazdır. Buna göre ayetin manası şöyle olur: “Onlar ayakta, eğer buna güçleri yetmiyorsa oturarak, buna da güçleri yetmiyorsa yanları üstü uzanarak namaz kılarlar.” Yani hangi halde olurlarsa olsunlar, namazı terk etmezler.',
    ),
  ),
  p(
    text(
      'Namaz zikir ise de bütün zikir çeşitlerini kapsamadığından ayete birinci görüşe göre mana vermek daha evlâdır. Yani Allah Tealâ’yı hatırlamak ve anmak, O’nunla kalben ve lisanen daima irtibat halinde olmak…',
    ),
  ),
  p(
    text(
      'Allah Tealâ, o sâlih kulların zikrettiğini bildirdikten ve zikrin de ancak tefekkürle tamamlanacağı sabit olduğundan bundan sonra mealen şöyle buyurmuştur: “Ve göklerle yerin yaratılışı hakkında derinden derine düşünürler.”',
    ),
  ),
  h2('O’nu düşünmek'),
  p(
    text(
      'Tefekkür, aklın belli hedefe yönelik olarak arayış içinde olması, inceleme yapmasıdır. Kişi Yaratıcı’yı bilirse, yaratılanları düşünüp tefekkür ettiğinde O’na olan tazimi artar.',
    ),
  ),
  p(
    text(
      'Ayet-i kerimede Allah Tealâ insanları kendisini zikretmeye teşvik etmiştir. Ama tefekküre gelince; zâtını değil, göklerin ve yerin hallerini tefekküre sevk etmektedir. Peygamber Efendimiz s.a.v. de şöyle buyurmuştur: ',
    ),
    text('“Yaratılmışlar üzerinde tefekkür edin, fakat Yaratan üzerinde tefekkür etmeyin.”', BOLD),
  ),
  p(
    text(
      'Aklımızın ve duyu organlarımızın ufku sınırlıdır. Yaşadığımız fizik dünyanın kaidelerine göre işler. Allah Tealâ ise bütün mevcudâtın, aklımızın ve duyu organlarımızın yaratıcısıdır. Yaratılmış, sınırları belli, zaman ve mekânla kayıtlı akıl ve duyuların, varlığı kendinden olan, ezelî ve ebedî, sonsuz ve sınırsız Yaratıcı’nın zâtını kavraması, anlaması mümkün değildir. Aksine, O’nun zâtına dair her düşünme işlemi, yaratılmış bir şey üzerinden yürüyeceği için yanlış ve bâtıl olmaya mahkûmdur.',
    ),
  ),
  p(
    text(
      'Hususi hakikati ile kendisini bilmek mümkün olmayan bir varlığı ancak eserleri ve fiilleri ile bilmek mümkün olur. Bu sebeple Allah Tealâ’nın zâtı hakkında değil, işleri ve eserleri hakkında tefekkür emredilmiştir.',
    ),
  ),
  p(
    text(
      'Tefekkür gafleti giderir ve su ekini yetiştirdiği gibi, kalbe Allah korkusu kazandırır. Tefekkür bütün yaratılmışlardan hareketle Yaratıcı’yı tanımaktır. Yani bütün işleri teke indirmektir. Her işin aslının, sebeplerin müsebbibi olan Âlemlerin Rabbi’ne dayandığını anlamaktır. Buradan hareketle ne yaparsa O’nun adına yapmaktır. Bunun adı da ‘tevhid’dir.',
    ),
  ),
  h2('Zerreden kürreye'),
  p(text('Tevhidin delilleri iki kısma ayrılır:')),
  ul('İnsanın dışındaki deliller (âfâkî deliller),', 'İnsanın kendisindeki deliller (enfüsî deliller).'),
  p(
    text(
      'Âfâkî delillerin daha yüce olduğunda şüphe yoktur. Nitekim Allah Tealâ mealen; “Göklerin ve yerin yaratılışı, insanların yaratılışından elbette daha büyüktür fakat insanların çoğu bilmezler.” (Mü’min 57) buyurmuştur. Durum böyle olunca Cenab-ı Hak bu ayet-i kerimede göklerin ve yerin yaratılması hususunda tefekkürü emretmiştir. Çünkü onlardaki deliller daha dikkate değer ve daha büyüktür.',
    ),
  ),
  p(
    text(
      'İnsan eğer bir ağacın ufacık bir yaprağına baksa ortasında uzanan bir damar görür. Daha sonra o ana damardan her iki tarafa doğru damarcıkların ayrıldığını, onlardan da daha nice nice damarcıkların ayrıldığını görür. Bu durumda insan, Yaratıcı’nın bu yaprağı böyle yaratmış olmasında şaşırtıcı sırlar bulunduğunu; mesela O’nun bu yaprakta, yerin derinliklerinden gıdasını çekebilecek bir kuvvet yarattığını, sonra bu gıdanın parçalarının yaprağın her damarında eşit dağıldığını görür, anlar. İnsan o yaprağın nasıl yaratıldığını, icat edildiğini, gıda alma ve büyüme kabiliyetinin ona nasıl verildiğini anlamak istese, bundan aciz kalır.',
    ),
  ),
  p(
    text(
      'Küçük bir yaprakta dahi bunca kudret ve sanat varken, içinde güneşin, ayın ve yıldızların yer aldığı gökler; denizlerin, dağların, madenlerin, bitkilerin ve canlıların yer aldığı yeryüzü ne büyük bir kudret ve sanatın eseridir, akıl bunu idrak edemez. Göklerin ve yerin yaratılışındaki hayranlık uyandıran ilahî hikmetlere tam manasıyla vakıf olmanın kendisi için mümkün olmadığını anlar.',
    ),
  ),
  p(
    text(
      'Bütün bu aklî deliller sonucunda akl-ı selim sahibi kişi, hiçbir anlatımın, hiçbir ilmin Âlemlerin Rabbi’ni tam tarif ve ifade edemeyeceğini fark eder. İşte bu noktada “Sübhânek: Ya Rabbi sen münezzeh ve yücesin” der.',
    ),
  ),
  p(
    text(
      '“Sübhânallâh: Allah münezzehtir” demekten murad, göklerin ve yerin yaratılışındaki, işlerin oluş ve bitişindeki Allah Tealâ’nın hikmet ve sırlarını aklın tam olarak kavramaktan aciz olduğunu ikrar ve tasdiktir. Yani insanlar kâinattaki cisimlerin ve mesafelerin büyüklüğü üzerine düşündükleri zaman ancak şu kadarını anlayabilirler: Bunları yaratan, onları bâtıl ve boş yere yaratmamış, her ne kadar akıllar tam olarak anlayamasa da büyük bir hikmete ve engin sırlara binaen yaratmıştır.',
    ),
  ),
  h2('‘Bizi ateşin azabından koru’'),
  p(
    text(
      'Allah Tealâ, ihlâs sahibi kullarının lisanlarının zikre, bedenlerinin ibadete, kalplerinin de O’nun azametinin delillerini tefekküre dalmış olduğunu anlattıktan sonra, bir de Allah Tealâ’nın onları ateşin azabından kurtarmasını istemelerini zikrediyor.',
    ),
  ),
  p(
    text(
      'Dua ancak ihlâs ile yapıldığı zaman kabule şayan olur. Bunun için Cenab-ı Mevlâ bu ayet-i kerimede lütuf ve keremiyle kullarına karşılık bulmuş duanın usul ve adabını bildiriyor.',
    ),
  ),
  p(
    text(
      'Allah Tealâ’ya dua etmek isteyen kişi evvelâ O’na hamd ve senâda bulunmalıdır. Ayet-i kerimedeki “sübhâneke” lafzı buna delalet eder. Ayrıca duanın zikir ve tefekkürden sonra zikredilmesi, duanın ancak kulluk vazifelerini yerine getirmek gibi bir vesile takdim edildikten sonra kabule şayan olacağını ifade eder.',
    ),
  ),
  p(
    text(
      'Ayrıca da bu ayet-i kerimede, zikrin tefekküre, tefekkürün de dua ve yakarışa vesile olduğu anlaşılır.',
    ),
  ),
  p(
    text(
      'Allah Tealâ’nın övdüğü halis akıl sahibi dostları her hal ve durumda zikrullaha devam ederek kalben ve ruhen dirilirler. Sonra bu manevi hayat neticesinde Allah Tealâ’nın mahlukatını, özellikle gökleri, yerleri ve üzerlerinde bulunanları inceden inceye düşünerek, bütün bunların bir Rabbi ve yaratıcısı olduğunu; her yaratılmışın bir hikmete dayalı olarak var edildiğini tam manasıyla anlarlar. Ve sonra, bu yaratılmışlar da gözlerinden uzaklaşarak kendilerini o Yaratıcı’nın huzurunda bulurlar ve O’na “Ey Rabbimiz” diye hitap ederler. Yaratılmışların hallerini yaratıcısına kıyas ettikten sonra da Yaratıcı’nın bunlardan hiçbirine hiçbir bakımdan benzemediğini anlayarak “sübhânek” sözüyle O’nu şanına yakışmayan her şeyden tenzih ederler.',
    ),
  ),
  p(
    text(
      'Böyle kişiler, bu vazifelerini ihmal eden ve tefekkürü ihlal eden kişilere isabet edecek belalardan kurtulmak için de “bizi cehennem azabından koru” diye dua ederek, Allah Tealâ’nın ayetlerinden anladıklarıyla amel etmeye muvaffakiyet dilerler.',
    ),
  ),
  p(text('Hak Sübhânehû ve Teâlâ en iyi bilendir.')),
)

/** 2. İhlâs'ın İlk Âyeti ve Üç Mertebe — https://semerkanddergisi.com/ihlasin-ilk-ayeti-ve-uc-mertebe/ */
const IHLAS_GOVDE = root(
  p(
    text(
      'İhlâs suresi Mekke’de Nâs suresinden sonra inmiştir. Dört ayettir. İhlâs, dini hurafe ve bid’atlerden temizleyerek saf hale getirmek demektir. Bu sure dinin temelinin temeli olan tevhidi en saf ve en güzel şekilde ifade ettiği için İhlâs suresi diye adlandırıldığı gibi, tevhidi birkaç kelime ile çok kapsamlı ifade ettiği için “Esas”, “Tevhid”, “Tefrid”, “Tecrid”, “Necât” isimleri de verilmiştir. Arap dilinde bir şeyin isimlerinin çokluğu, o şeyin faziletinin çokluğuna işarettir. Surenin diğer isimleri ve manaları şöyledir:',
    ),
  ),
  block('6730a1000000000000000201', {
    blockType: 'ayet',
    arapca: 'قُلْ هُوَ اللّٰهُ أَحَدٌ',
    meal: 'De ki: O, Allah birdir.',
    kaynak: 'İhlâs Sûresi · 1',
  }),
  p(
    text('Mukaşkışa: ', BOLD),
    text('Tedavi eden. Bir şeye yönelten. Kim bu sureyi idrak halinde bulunursa şirk ve nifak hastalığından şifa bulur.'),
  ),
  p(
    text('El-Muavvize: ', BOLD),
    text(
      'Rivayet edildiğine göre Hz. Peygamber s.a.v., Osman b. Maz’un r.a.’ın yanına girdi, bu sureyi ve bundan sonraki iki sureyi okuyarak onu Allah’ın korumasına havale etti. Sonra buyurdu ki: “Bu surelerle Allah’a sığın. Çünkü bunlardan daha hayırlısı ile sığınamazsın.” (Nesâî, İstiâze 1) İhlâs, Felâk ve Nâs surelerinin üçüne birden “Muavvizât: Kendileriyle Allah’a sığınılan” denir.',
    ),
  ),
  p(
    text(
      'Bu sayılan isimlerin dışında, Allah Tealâ’yı anlattığı için “Nisbet”; kabir azabına ve cehennem ateşine engel olması sebebiyle “Mânia”; bu sure okunurken meleklerin hazır bulunması sebebiyle “Muhdar”; şeytanı korkutup kaçırdığı için “Müneffire”; insanı şirkten arındırıp uzaklaştırdığı için “Berâe”; tevhidin özünü ve Allah Tealâ’yı hatırlattığı için “Müzekkire”; insanın içini aydınlattığı ve Kur’an-ı Kerim’in nuru kabul edildiği için “Nûr”; tevhid akidesini kabul edenlerin Allah tarafından güvende kabul edilmeleri müjdesine ulaştırdığı için “Eman” isimleri de verilmiştir.',
    ),
  ),
  h2('Surenin faziletleri'),
  p(
    text(
      'Allah Tealâ bir önceki surede (Tebbet) Ebu Leheb’i kınamış ve inkârından dolayı ona azap vaadetmişti. Bu surede de bizi cehennem ateşinden kurtaracak tevhid inancını öğretir. Surenin özellikleri arasında Allah Tealâ’yı şirkten uzak tutması, saf tevhid inancını işlemesi, sadece Allah Tealâ’dan bahsetmesi ve dünya ya da ahiretle alakalı hiçbir muhtevası olmaması, kalbi nifak, şirk ve günah kirlerinden temizlemesi, okuyanı şeytandan, dünyanın hastalık ve dertlerinden, ölüm anındaki sıkıntılardan, ahiretin dehşetinden ve cehennemin ateşinden kurtarması sayılabilir.',
    ),
  ),
  p(
    text('Allah Rasulü s.a.v. bir hadis-i şerifinde şöyle buyurmuştur: '),
    text('“Kul Hüvellâhu Ehad suresi, Kur’an’ın üçte birine denktir.”', BOLD),
    text(' (Buhârî, Fezâilü’l-Kur’an 13; Müslim, Müsâfirîn 251, 259; Tirmizî, Fezâilü’l-Kur’an 11)'),
  ),
  p(
    text('Bir başka hadis-i şeriflerinde de şöyle buyurmuşlardır: '),
    text('“Yedi kat gökler ve yedi kat yer, Kul Hüvellâhu Ehad suresindeki tevhidi ispat için yaratıldı.”', BOLD),
    text(' (Ali el-Müttakî, Kenzü’l-Ummâl, nr. 2265; Suyûtî, es-Sagîr, nr. 1020)'),
  ),
  p(
    text(
      'Yani bütün kâinat bu surede anlatıldığı gibi Yüce Allah’ın birliğini ispat etmek ve yüce zatını tanıtmak için yaratılmıştır.',
    ),
  ),
  p(text('Rasulullah s.a.v. bir adamın İhlâs suresini okuduğunu işitince:')),
  p(text('– Ona vacip oldu, buyurdu. Oradakiler:')),
  p(text('– Ona ne vacip oldu, diye sorduklarında:')),
  p(text('– Cennet vacip oldu, buyurdu. (Tirmizî, Fezâilü’l-Kur’an 11; Hâkim, Müstedrek, 1/566)')),
  p(text('Bir adam Efendimiz s.a.v.’e gelerek fakirlikten ve geçim darlığından şikâyette bulundu. O da:')),
  p(
    text(
      '– Evine girdiğin zaman içeride biri varsa selam ver. Eğer kimse yoksa bana selam ver (salâvat getir) ve Kul Hüvellâhu Ehad suresini oku, buyurdu.',
    ),
  ),
  p(
    text(
      'Adam söylendiği gibi yaptı, Allah Tealâ ona bol rızık ihsan etti. Öyle ki gelen rızık kendisine yettiği gibi komşularına da ikramda bulundu. (Taberânî, el-Kebîr, 2/340; Kurtubî, el-Câmiu li-Ahkâmi’l-Kur’an, 20/224)',
    ),
  ),
  p(text('Hz. Aişe r.anhâ validemizin şöyle dediği nakledilmiştir:')),
  p(
    text(
      '“Allah Rasulü s.a.v. her gece yatağına girince avuçlarını birleştirir, içine üfler ve avuçlarına Kul Hüvellâhü Ehad, Kul Eûzü bi-Rabbi’l-Felâk ve Kul Eûzü bi-Rabbi’n-Nâs’ı okur, sonra avuçlarını yüzüne ve elinin erdiği yere kadar vücudunun her yanına sürerdi. Bunu üç kez yapardı.” (Buhârî, Fezâilü’l-Kur’an 14; Tirmizî, Duâ 21)',
    ),
  ),
  h2('Nüzul sebebi'),
  p(
    text(
      'Bütün bu faziletleri ve sayılamayacak kadar hikmetleri kendisinde toplayan İhlâs suresinin iniş sebebi olarak şu rivayetler nakledilmiştir:',
    ),
  ),
  p(
    text(
      'Müşrikler Hz. Peygamber s.a.v.’e gelerek; “Bize, kendisine davet ettiğin Rabbini tanıt, O’nun sıfatlarından bahset; altından mıdır, gümüşten midir, nasıldır?” dediler. Allah Rasulü s.a.v. sükût buyurdu. O anda bir cevap vermedi. Sonra bu sure indi. (Tirmizî, Tefsîru Sûre 1-2; Ahmed, el-Müsned, 5/134)',
    ),
  ),
  p(text('Başka bir rivayete göre yahudilerden bir grup toplanıp Allah Rasulü s.a.v.’e geldiler ve dediler ki:')),
  p(
    text(
      '– Ya Muhammed! Senin mabudunun sıfatı nedir? Bize bildir de biz O’na inanalım. Çünkü senin rabbin gökleri dumandan, iblisi ateşten yarattı. Peki kendini neyden yarattı? Altından mı, gümüşten mi? Yoksa başka madenden mi?',
    ),
  ),
  p(
    text(
      'Bunları işiten Allah Rasulü s.a.v. öfkelendi, rengi değişti. Tam o esnada Cebrail a.s. bu sure-i celileyi getirdi. Demiş oldu ki: “Ya Muhammed! Sana sual eden kâfirlere de ki: Benim Rabbim ki, biz O’na taparız. O Allah’tır. Birdir. O’nun eşi ve benzeri yoktur. Ortağı yoktur. Mülkünde tektir. Her işe kâdirdir. Yardımcısı yoktur. Kendisiyle kâim olandır.” (Suyûtî, ed-Dürrü’l-Mensûr, 8/670-671)',
    ),
  ),
  p(
    text(
      'Sure-i celilede Allah Tealâ’nın tek olduğu ve bütün varlıkların O’na muhtaç olup hepsinin ihtiyacını gördüğü belirtilmektedir. Allah Tealâ, Ayetü’l-Kürsî ve İhlâs suresinde olduğu gibi hiçbir kitapta ve dinde böyle güzel tarif edilmemiştir.',
    ),
  ),
  h2('De ki...'),
  p(text('Cenab-ı Hak, sure-i celilenin başında mealen buyuruyor ki: '), text('“De ki: O, Allah tektir.”', BOLD)),
  p(
    text(
      'Surenin başındaki bu “De ki” hitabı, Allah Rasulü s.a.v.’e ve hitap edilme değeri taşıyan herkesedir. Söyleme, bildirme emrinin açıkça zikredilmesinde, ilahî bir açıklama yapıldığının bilinmesine, aynen söylenmesi ve tebliğ edilmesinin istendiğine işaret vardır. Yani Allah Tealâ’nın bildirdiği hak sözü şeksiz şüphesiz kalbinle doğrulayarak ve dilinle söyleyerek kendi vicdanında söylediğin gibi başkalarına da tebliğ et, söyle; herkes de böyle söylesin anlamı vardır. Peki, söylenecek olan nedir? “O, Allah tektir.”',
    ),
  ),
  p(
    text(
      '“Hüve: O” zamiri Arapçada söylenecek olan bir cümlenin önemini, muhtevanın büyüklüğünü vurgulamak için kapalı olarak cümlenin başına getirilir. Sonra mesaj, “gerçek şudur” vurgusuyla önündeki cümle ile açıklanır. Çünkü bir şeyi önce kapalı bırakıp sonra açıklamak, bir mesajın verilişindeki tesiri artırır. Bu ayet-i kerimeden anlaşılıyor ki, o büyük mesaj, dava Allah Tealâ’nın bir ve tek olmasından ibarettir. Bu da imanın esasını meydana getirir. Allah Tealâ, celâl ve cemâl, bütün kemâl sıfatları ile varlığı kendisinden olmakla tek ilahlık vasfına sahiptir. Yani gerçek mabud olan Hak Tealâ tektir, birdir.',
    ),
  ),
  h2('Hüve: O'),
  p(
    text(
      'Bir başka izaha göre surenin başındaki “O” zamiri, Allah Rasulü s.a.v.’e sorulan şeye aittir. Yani “Sizin o sorduğunuz, Allah’tır.” demektir. Çünkü rivayete göre müşriklerin Rasulullah s.a.v.’e; “Kendisine davet ettiğin Rabbini bize tarif et, onun nesebini bize bildir, onu bize anlat.” demeleri üzerine bu sure nazil olmuştur. (Tirmizî, Tefsir 112/1)',
    ),
  ),
  p(
    text(
      'Ayet-i celilede “O” zamirinden sonra “Allah” lafza-i celâli kullanılmıştır. “Allah” lafzı bütün esmâ-i hüsnânın manasına birden işaret eder. Kâşânî rh.a. der ki: “Kanaatimize göre Allah lafzı zât-ı ilahiyenin bizzat kendisinin ismidir.”',
    ),
  ),
  block('6730a1000000000000000202', {
    blockType: 'oneCikanSoz',
    metin: '“Allah” ismi, O’nu zikreden dilin aziz olduğu en aziz kelimedir. O dilden daha aziz olan ise bu ismin sahibini tanıyan kalptir. Bundan da aziz olan, O’nu seven ruhtur. Bundan da aziz olan, O’nu gören bir sırdır.',
  }),
  p(
    text(
      'Bir kişi iman ettiği Allah Tealâ’nın zatını değil, ama sıfatlarını bilebilir. Bilmelidir de. Bilsin ki Rabbine olan imanı kemâl basamaklarında ilerleyebilsin.',
    ),
  ),
  p(
    text(
      'Allah Tealâ’nın sıfatları ya “zâtî” ya “sübûtî”dir. Zâtî sıfatlar yalnızca Cenab-ı Hakk’a mahsustur, başka hiçbir varlıkla müşterekliği söz konusu değildir. Mesela “kıdem” ve “beka” sıfatları tamamen ve yalnızca Allah Tealâ’ya mahsustur. Başka hiçbir varlıkta bulunmaz. Sübûtî sıfatlar ise mahiyet farkıyla birlikte insanlarda da bulunur. Mesela Allah Tealâ irade sahibidir, insanın da iradesi vardır. Fakat Allah Tealâ’nın iradesi sonsuz ve mutlaktır; insanın iradesi ise sınırlı ve kayıtlıdır. O’nun iradesi sonucu var olmuştur.',
    ),
  ),
  h2('Allah Tealâ’nın tekliği'),
  p(
    text(
      'Kendisine ibadet edilmeyi hak eden, varlığı zorunlu olan, bütün kemâl sıfatlarına sahip bulunan Allah tektir (ehad). O’nun zatında, sıfatlarında ve fiillerinde ortağı yoktur. O’nun zatına bir sınır çizilemez ve yüceliği herhangi bir sayı veya kıyas ile anlatılamaz. O evveldir; bir başlangıcı yoktur. Âhirdir, bir sonu yoktur.',
    ),
  ),
  p(text('Yüce Allah’ın tek olmasının üç manası vardır:')),
  ul(
    'Allah Tealâ ilah olarak tektir; âlemin içinde dışında ikinci bir ilah yoktur. Bu, sayıyı ortadan kaldırır.',
    'Allah Tealâ, zatı ve sıfatlarıyla da tektir. O’nun bir eşi, ortağı, benzeri ve dengi yoktur.',
    'Allah Tealâ varlığı itibarıyla da tektir. Zatında bir bölünme, parçalanma olmaz.',
  ),
  p(
    text(
      '“Ehad” kelimesi Arapça “bir” demek olan “vâhid” anlamında da kullanılmakla birlikte iki ifade arasında önemli farklar vardır. “Vâhid” kelimesi sayısal birlikle ilgili iken, “ehad” kelimesi hiçbir sayı kabul etmeyen, hiçbir şekilde iki olma ihtimali bulunmayan hakiki teklik manasındadır. Allah Tealâ’ya özgüdür, O’nun tekliğini ve eşsizliğini ifade eder. O’ndan başkası için kullanılmaz. Aynı kökten gelen “vâhid” kelimesi ise bir, tek, yegâne varlık anlamında Allah Tealâ’nın sıfatı olmakla birlikte, O’ndan başka varlıkların sayısal anlamda birliğini ifade etmek için de kullanılır.',
    ),
  ),
  p(
    text(
      'Fahreddin Râzî’nin, ondan da Elmalılı Hamdi Yazır rh.aleyhimâ’nın aktardığına göre “ehadiyyet” ile Allah Tealâ’dan başka hiçbir şey nitelendirilemez. Türkçede de “bir” ile “tek” arasında fark vardır. Bir, genellikle “aynı türden birçok varlığın biri” anlamında kullanılır. “Tek” ise “türdeşi olmayan, eşi benzeri olmayan” manasına gelir.',
    ),
  ),
  h2('Üç isim, üç mertebe'),
  p(
    text(
      'Bu açıklamadan sonra ayet-i kerimeye bütünlüklü bakacak olursak: Bu ayet-i celiledeki “Hüvallâhu ehad” ifadesi üç isimden ibarettir ve bu cümledeki her bir isim Allah Tealâ’ya “seyr-i ilallah” edenlerin, manevi yolculuklarının makamlarından bir makamdır. Burada Cenab-ı Hakk’ın insanların üç sınıfına ve o sınıfların mertebelerine işaret ettiği de söylenmiştir.',
    ),
  ),
  p(
    text('Birinci makam: ', BOLD),
    text(
      'Allah Tealâ’yı işaret eden “Hüve: O” zamirinin idrak seviyesi âriflerin mertebesidir. Ârifler, “Bunlar nedir?” sorusuyla şeylerin mahiyetine ve hakikatine bakmışlar ve Allah Teâlâ’dan başka varlık görmemişlerdir. Ehadiyyet denizi onları çepeçevre sardığından ve hakiki var oluş gözlerinin önüne açıldığından “O” denilince sadece Allah Tealâ’yı hatırlarlar. Başka kimse, başka varlık akıllarına gelmez. Onların idrakinde Allah Tealâ aşikâr olup, asla ispata muhtaç değildir. Bütün varlıklar, bütün oluşlar O’na muhtaçtır, O’nunla kâimdir. Dolayısıyla varlıklara özü ve mahiyeti itibarıyla bakıldığı zaman yok hükmündedir. Varlığı kendisinden olmayan varlıklar, var olabilmek için bir sebebe, bir var ediciye muhtaçtır. Bu sebeple ârifler Allah Tealâ dışında hakiki mevcut görmemişlerdir.',
    ),
  ),
  p(
    text(
      'Bir konuşma sırasında “Hüve: O” ifadesi kullanıldığında, neyin kastedildiğini belirlemek için, konuşan ile dinleyen arasında daha önce bir şeyin zikrolunmasına ya da işaret edilen şeyi belirleyen bir açıklamanın bulunmasına ihtiyaç vardır. Fakat ârifler “O” ifadesiyle doğrudan Cenab-ı Hakk’a işaret ederler. Çünkü onlar Allah Tealâ’yı tanımak için işarete, delile muhtaç değildir. O’ndan başka bir şey görmedikleri için “Hüve: O” onlar için kâfidir. Bu izahlardan da anlaşılacağı üzere sûfîlerin “Hû” ismi ile zikretmeleri sahihtir.',
    ),
  ),
  p(
    text('İkinci makam: ', BOLD),
    text(
      'Ârifler mertebesinden sonra “ashâb-ı yemîn: Allah ve Kur’an yolunda çalışanlar”ın mertebeleri zikrolunmuştur ki birinci makamın bir alt derecesidir. Çünkü onlar Hakk’ı mevcut görmüşler, aynı zamanda halkı da mevcut görmüşlerdir. Dolayısıyla da mevcutlarda çokluk hâsıl olmuştur. Biri varlığı zorunlu olup yok olması imkân dışı Hakk’ın zatı, diğeri de yok iken var, var iken yok olabilen yaratılmışların çokluğudur. Bu durumda “Hüve” lafzı Allah Tealâ’yı işarette yeterli olmamıştır. Bunun için kendisiyle Hakk’ın halktan ayrıldığı bir ayırt ediciye ihtiyaç vardır. Bunlar “Hüve: O” zamirinden Hakk’ın zatını anlamak için yanında Allah ismine de muhtaçtır. Bunlar Allah Tealâ’yı varlığının delilleriyle bildiklerinden ya da O’nun yarattığı mahlukatın yaratılışında gördükleri sır ve hikmetlerden Allah Tealâ’nın kemâl sıfatlarına sahip olduğuna intikal ettiklerinden, “Hüve” lafzının yanında bütün manaları kendisinde toplayan Allah ismi zikredilmiştir. “Hüvallah” onlar içindir.',
    ),
  ),
  p(
    text('Üçüncü makam: ', BOLD),
    text(
      'Bu mertebe “ashâb-ı şimal: Allah’ı ve ahiret gününü inkâr eden, zevk ve sefalarına düşkünlüklerinden Âlemlerin Rabbi’nin hükümranlığını reddeden kimseler”in makamıdır. Bu, makamların en düşüğüdür. Bunlar, varlığı mutlak olan zatın birden çok olabileceğini söylemiş; şirk sapkınlığına düşmüşlerdir. Bunlara bir reddiye ve iddialarını boşa çıkarmak için önceki lafızlara “Ehad” ilave edilmiştir.',
    ),
  ),
  p(text('Böylece ayet-i kerimenin meali şöyle tamamlanır: “De ki: O, Allah birdir.”')),
  p(text('Hakikate hidayet edecek olan ancak O’dur. Ve en doğrusunu ancak O bilir.')),
)

/** 3. Herkes O'na Muhtaç — https://semerkanddergisi.com/herkes-ona-muhtac/ */
const HERKES_ONA_MUHTAC_GOVDE = root(
  p(
    text(
      'İhlâs suresinin başında mealen; “De ki: O Allah tektir.” ayetiyle, Allah Tealâ’nın zatında hiçbir şekilde bölünme, çoğalma gibi beşerî hallerin bulunmadığı, O’nun varlığı kendinden olan tek ve biricik ilah olduğu beyan edilmişti. Zatında ve sahip olduğu özelliklerde kimsenin O’na denk olması mümkün değildir.',
    ),
  ),
  block('6730a1000000000000000301', {
    blockType: 'ayet',
    arapca: 'اَللّٰهُ الصَّمَدُ',
    meal: 'Allah Samed’dir.',
    kaynak: 'İhlâs Sûresi · 2',
  }),
  p(
    text(
      '“Allah Samed’dir.” (İhlâs 2) ayet-i kerimesiyle de hiçbir varlığa ihtiyaç duymadığı; tam tersine bütün varlıkların meydana gelme, varlığını devam ettirme ve diğer bütün hallerinde sürekli O’na muhtaç olduğu ortaya konulmaktadır. Böylece ayet-i kerimede Cenâb-ı Hakk’ın “Samed” ismine bağlı olarak sahip olduğu özelliklere işaret buyrulmuştur. Bu işaretleri kısaca izah etmeye çalışalım:',
    ),
  ),
  h2('Samed’in anlamı'),
  p(
    text(
      'Allah Tealâ Samed’dir; bütün mevcudatın tamamının kendisine yöneldiği ve sığındığı tek zattır. Bütün yaratılmışlar, ihtiyaçlarından dolayı o kerim Yaratıcı’dan dua ve niyazda bulunur.',
    ),
  ),
  p(
    text(
      'Samed, arzu edilen işler ve neticeler hususunda kendisine yönelinen zat olmakla beraber, musibetlerde de kendisinden yardım istenilendir.',
    ),
  ),
  p(
    text(
      'Samed, aynı zamanda dilediğini yapan, istediği hükmü veren, verdiği hüküm konusunda kendisine hesap soracak hiç kimse ve hükmünü reddedecek hiçbir kuvvet bulunmayandır. O’nun üstünde bir zat yoktur. Tüm varlıklar O’na muhtaç iken O hiç kimseye veya herhangi bir şeye muhtaç değildir.',
    ),
  ),
  p(
    text(
      'Allah Tealâ’nın zatında ve sıfatlarında kendisine hiçbir ihtiyaç ârız olmaz. O öyle bir Zât-ı Latîf’tir ki bütün her şeyi bilir. Bütün yarattıklarının varlığının devamı için ihtiyacını gidermek ilim ve kudret gerektirdiğinden, Samed ismi Allah Tealâ’nın Âlim ve Kâdir olduğunun da delilidir. Cenâb-ı Hakk’ın bütün ihtiyaçların karşılanması için başvurulan merci ve melce olması ancak bu özelliklerle tam olur.',
    ),
  ),
  p(
    text(
      '“Bir şeye yönelmek” anlamındaki “samd” kökünden gelen “samed”, “ihtiyaçların giderilmesi için kendisine başvurulan kimse” demektir. Mesela bir topluluğun ulusuna, yani yönetim ve ihtiyaçlarda kendisine başvurulan ve daha üstünü bulunmayan en büyüğüne “kavmin samedi” adı verilir.',
    ),
  ),
  p(
    text(
      'Ayrıca, içi boş olmayan kütle halindeki şeyler için de “samed” ifadesi kullanılır. Yani eksiği gediği bulunmayan, nüfuz edilemeyen şeye denir. Buna dilimizde “som” adı verilir. Nitekim dilimizde, “som, yekpare, tam, bütün, içi dolu” anlamına som altın, som gümüş gibi tabirler kullanılır ki, karışık olmayan, saf ve halis anlamları ifade edilmek istenir.',
    ),
  ),
  p(
    text(
      'Bu iki manadan birincisi Allah Tealâ’ya nisbet edildiğinde “ihtiyaçlarını gidermesi için herkesin başvurduğu, yaratılmışlara mahsus acizlik ve muhtaçlıktan münezzeh, ebedî ve bâki yüce varlık” manasına gelir.',
    ),
  ),
  p(
    text(
      'İkinci manada Allah Tealâ’nın Samed oluşu ise, O’nun tam ve eksiksiz olarak bütün kemal sıfatlara sahip bulunduğu ve yaratılmışlardaki acizlik ve eksiklik içeren niteliklerden münezzeh olduğu manasına gelir.',
    ),
  ),
  p(text('İmam Mâtürîdî rh.a. yaratılmışların Allah Tealâ’ya olan ihtiyaçlarını şöyle özetlemiştir:')),
  ul(
    'Varlık âlemine gelme,',
    'Varlığını esenlik içinde sürdürebilme,',
    'Öldükten sonra ikinci ve ebedî hayata dönüş yapma.',
  ),
  h2('İhtiyaçları karşılayan'),
  p(
    text(
      'Buradan hareketle, bütün ihtiyaçlar için kendisine yönelinen zatın sığınılabilir ve güvenilir olması ve sonrasında da sonsuz hazinelere sahip bulunması gerekir. Nitekim Allah Tealâ Kur’an-ı Kerim’de mealen; “Hazineleri yanımızda olmayan hiçbir şey yoktur…” buyurmaktadır. (Hicr 21) O, hem her şeyin tek sahibi hem de sahip olduğu her şeyin sonsuz hazinelerinin sahibidir.',
    ),
  ),
  p(
    text(
      'Bazen insanlar dünya hayatında bir yönüyle de olsa kısmî bir “samediyyet”e mazhar olur. Kulun, Samed ism-i şerifinden alabileceği nasipler vardır. Bu nasip, Cenâb-ı Hakk’ın onu din ve dünya işlerinde başvurulan bir konuma getirmesidir. Allah Tealâ kullarının çeşitli sorunlarının çözümünü kimin eline bağlı kılmışsa, onu Samed isminden mecazen de olsa nasiplendirmiş demektir. Fakat bu insanlar diğer insanların bütün ihtiyaçlarını değil, sınırlı ihtiyaçları sınırlı bir şekilde karşılayabilirler.',
    ),
  ),
  p(
    text(
      'Allah Tealâ’nın Samediyet vasfı ise, O’nun yalnızca bazı ihtiyaçlarda maksat ve hedef olması demek değildir. Bütün ihtiyaçlarda hedef ve nihaî merci olmaktır. Bu bakımdan, meselâ “ilim sıfatı” gibi diğer isim ve sıfatlarda olduğu gibi Samediyet, Cenâb-ı Hak için tam, eksiksiz, mutlak, kendi zatından ve kesintisizdir. Kul için ise bunun zıddıdır, yani mecazîdir.',
    ),
  ),
  p(
    text(
      'Bu önemli noktayı biraz daha açalım: Yukarıda belirtildiği şekliyle insanlar, dünya hayatında zâhiren başkalarının ihtiyaçlarını giderebilirler. Bu durum hakikatte Allah Tealâ’nın Samed isminin tezahüründen başka bir şey değildir. O’nun Samed ismi ihtiyacı gideren o kimsede tecelli etmiştir, ihtiyacı gideren kişi bir vesiledir. Hakikatte insan, bırakın bir güce ya da imkâna sahip olmayı, kendisinin dahi sahibi değildir. Sahiplik, söyleyiş kolaylığı bakımından ve mecazî bir ifadedir.',
    ),
  ),
  p(
    text(
      'Zengin birinin, ihtiyacı olan insanlara bazı aracılarla para veya mal gönderdiğini düşünelim. Nimetlerin ulaştığı kimselerin bu nimetleri aracılardan bilmesi, ihtiyaçlarını onların giderdiğini sanmaları ne akılla ne hakikatle bağdaşır. Aynı şekilde bütün maddi manevi nimetlerin sahibinin ve gönderenin Allah Tealâ olduğunun bilinmesi gerekir. O, hikmeti gereği kullarına nimetlerini genellikle melekler, hüner sahibi insanlar gibi vasıtalarla gönderir. Nimetleri ulaştıran vesilelere teşekkür etmek şükrün gereklerinden iken, nimeti gönderen ve asıl sahibi olan Âlemlerin Rabbi asla unutulmamalıdır.',
    ),
  ),
  p(
    text(
      'Ayrıca bir nimet gönderene nasıl minnet duyuluyor ve koyduğu kurallara riayet ediliyorsa, o gönderenin ve bütün mahlukatın asıl sahibi Mâlikü’l-Mülk olan Allah’ın emir ve yasaklarına uymak şükrün gereğidir. O’na şükretmek ise ayrıca nimeti artırır, O’nun rahmetini celbeder.',
    ),
  ),
  p(
    text(
      'Bütün âlemlerin sahibi ve bütün ihtiyaçların biricik gidericisi Allah Tealâ’dır. Yerin ve göğün bütün hazineleri O’nundur. O’nun vermesiyle bu hazinelerden hiçbir şey eksilmez. Kulların vazifesi, O’na sağlam bir imanla inanıp, emir ve yasaklarına uyma hususunda tam bir bağlılık ile arz-ı şükran etmeleridir. Her an O’nun gözetiminde ve denetiminde olmanın şuuru ile niyetleri ve işleri sürekli düzeltmeli; nimetlere şükür ile kulluk vazifesini ifa etmeye gayret etmelidir.',
    ),
  ),
  h2('Sebepler ve vasıtalar'),
  p(
    text(
      'Nimeti vereni göz ardı edip, nimetleri aradaki vesilelerden bilmek nimete küfürdür. Ticaret erbabı kazancını ticaretinden, meslek sahibi de geçimini mesleğinden sağladığı gelirden bilmemeli; sebeplere takılıp kalarak asıl nimet vereni ve sebeplerin yaratıcısını unutmamalıdır. Bir ihtiyaç varsa, bir istekte bulunulacaksa, bunu karşılayacak olanın sadece ve sadece Samed olan Allah Tealâ olduğu tam bir iman ile kabullenilmelidir.',
    ),
  ),
  p(
    text(
      'Allah Tealâ’dan bir şey istemede vesilelere, birtakım sebeplere başvururken kalp daima O’na yönelmeli, verenin O olduğu bilinmelidir. Doktor ya da ilaç bir vesiledir, şifa ise Cenâb-ı Hakk’ın ihsanıdır. O tek sığınak ve dönülecek nihaî menzildir. O’nun sadece bu ism-i şerifinden zâhir olan ihsan ve ikramlarla bütün sıkıntılar ve acılardan kurtulmak, bütün ihtiyaçları temin etmek mümkündür. “es-Samed” ile bitmez tükenmez hazinelerin kapıları açılır; bütün mahlûkata ihtiyacına göre dağıtılır. Fakat insan peşinci ve acelecidir.',
    ),
  ),
  p(
    text(
      'Dünyada dertlerimize derman, ihtiyaçlarımıza karşılık için Allah Tealâ’nın hizmet gören kulları vardır. Herkesin ihtiyacı farklı olduğundan, karşılama kaynakları da farklıdır. Bir kişi ilim irfan talep ediyorsa irfan ehli bir âlim arar. Paraya ihtiyacı varsa zengin birine gider, hastaysa doktora… Fakat bu ilim irfan sahibinin talebi karşılayıp karşılayamayacağı, zenginin para verip vermeyeceği ya da doktorun şifaya kavuşturup kavuşturamayacağı kesin değildir. Bu insanlara müracaat edilir, zaman ve imkân ayırmaları beklenir. Bütün bunlar “es-Samed” isminin alametleri ve tezahürüdür.',
    ),
  ),
  p(
    text(
      'Bütün bu ihtiyaçlar insanın kendisini ve Yaratıcısı’nı tanıması için birer fırsat ve imkândır. İnsan eğer kendisine bahşedilen donanımı fark eder, kullanırsa bir ihtiyacın ya da ihtiyaç gidericinin nesnesi olmaz; Samed olana bağlılığı ile hakiki hürriyeti elde eder. Bu bilinç hâli ile ihtiyacını giderme ne güzel haldir! Sadece ihtiyaçların tatmini ile yetinmek, ihtiyaç sahibine ne dünyada ne ahirette mutluluk verir. Elde edilen fayda dalga üzerindeki köpük gibidir; biri gider diğeri gelir.',
    ),
  ),
  p(
    text(
      'Cenâb-ı Hak, hakikati idrak eden kullarını gafillerden; şükreden ve nimetin kadr ü kıymetini bilen kullarını da nankörlerden elbette çok sever.',
    ),
  ),
  h2('Zenginlik fakirlik'),
  p(text('Allah Tealâ Kur’an-ı Kerim’de mealen şöyle buyurur:')),
  block('6730a1000000000000000302', {
    blockType: 'ayet',
    arapca: 'يَا أَيُّهَا النَّاسُ أَنْتُمُ الْفُقَرَاءُ إِلَى اللّٰهِ وَاللّٰهُ هُوَ الْغَنِيُّ الْحَمِيدُ',
    meal: 'Ey insanlar! Sizler Allah’a muhtaç fakirlersiniz. Zengin ve övülmeye layık olan ise ancak O’dur.',
    kaynak: 'Fâtır Sûresi · 15',
  }),
  p(
    text(
      'Hakiki fakirliği ve zenginliği parayla, mal mülkle anlamak büyük bir yanlıştır. Zenginlik ve fakirlik parayla değil, ihtiyaç sahibi olup olmamakla ölçülür. Bir kimse, ne kadar malı mülkü olursa olsun nefes almaya, nefes vermeye, yemeye, yediğini hazmetmeye, pek çok hususta başka bir insana muhtaçtır. İnsan fakirdir; çünkü ihtiyaç sahibidir.',
    ),
  ),
  block('6730a1000000000000000303', {
    blockType: 'oneCikanSoz',
    metin: 'Zenginlik ve fakirlik parayla değil, ihtiyaç sahibi olup olmamakla ölçülür.',
  }),
  p(
    text(
      'Oysa zamandan ve mekândan münezzeh, Samed olan Âlemlerin Rabbi herkesin ve her şeyin ihtiyacını giderendir. Bütün mahlukat var olurken, varlığını devam ettirirken O’na muhtaçtır. Ama O hiç kimseye ve hiçbir şeye muhtaç değildir. Hakiki zenginlik budur.',
    ),
  ),
  p(
    text(
      'Özünde fakir olanın kendisini zengin zannetmesi, gurura kibre kapılması, başkalarına üstünlük taslaması bu açıdan ilahî gazabı celbeder. Çünkü kişi böylece kendisinde bir bakıma —hâşâ— ilahlığa benzer bir büyüklük görmektedir.',
    ),
  ),
  p(
    text(
      'Özetleyecek olursak: Allah Tealâ hakkındaki bilgilerimiz, ancak O’nun bize kendisini tanıttığı ölçüdedir. İhlâs suresinde O kendisini “ehad” olarak tanıttıktan hemen sonra “samed” olarak vasfetmiştir. Ulûhiyet söz konusu olduğunda Allah Tealâ’dan başkasının taşıyamayacağı vasıf olan Samediyet, O’nun zâtî sıfatlarındandır.',
    ),
  ),
  p(
    text(
      'İhlâs suresinin bütünlüğünü göz önünde bulundurduğumuzda Samed isminin birlik ve teklik kavramları ile çok yakın irtibatının olduğunu, hatta bu kavramların başka bir ifadesi olduğunu söyleyebiliriz. Surenin, özellikle “Doğmamış ve doğurmamıştır.” mealindeki üçüncü ayeti, Samed kelimesinin Allah’ın bir ve tek oluşuyla irtibatını daha da kuvvetlendirmektedir.',
    ),
  ),
  p(text('Hak Sübhânehû ve Tealâ en iyi bilendir.')),
)

/** 4. Söyleyip de Yapmayanlar — https://semerkanddergisi.com/soyleyip-de-yapmayanlar/ */
const SOYLEYIP_DE_YAPMAYANLAR_GOVDE = root(
  p(
    text(
      'Ayet-i celile, başkalarına nasihat edip kendi nefsini nasihat ettiği hükümlerden muaf gibi tutanların kınanması, yerilmesi içindir. Çünkü insanın, başkalarına yaptığı nasihati öncelikle kendi nefsine yapması esastır. Nasihat eden kişi başkalarına vaaz ederken her daim kendi nefsini hedef bilerek konuşmayı niyet etmelidir.',
    ),
  ),
  block('6730a1000000000000000401', {
    blockType: 'ayet',
    arapca: 'أَتَأْمُرُونَ النَّاسَ بِالْبِرِّ وَتَنْسَوْنَ أَنْفُسَكُمْ وَأَنْتُمْ تَتْلُونَ الْكِتَابَ أَفَلَا تَعْقِلُونَ',
    meal: 'İnsanlara iyiliği emreder de kendinizi unutur musunuz? Halbuki kitabı okuyorsunuz. Hâlâ aklınızı başınıza almayacak mısınız?',
    kaynak: 'Bakara Sûresi · 44',
  }),
  p(
    text(
      'Bu ayet-i celiledeki kınamanın birinci muhatabı yahudi âlimlerdir. Fakat ayet-i celile onlar hakkında gelmiş olmakla birlikte hüküm sadece onlarla sınırlı değildir. İslâm şeriatinde de ayette kınanan husus aynen geçerlidir. Dolayısıyla “sebebin özel oluşu hükmün genel oluşuna” engel değildir.',
    ),
  ),
  h2('Söyleyip, kendisi yapmayan âlimler'),
  p(
    text(
      'Ayet-i kerimedeki kınama şudur: “Siz insanlara her türlü hayır ve taatle emreder de nefsinizi unutur, başkalarına emrettiğinizi kendinize kondurmaz mısınız? Siz bütün emir ve yasakları içinde barındıran kitabı yani Tevrat’ı okuduğunuz ve hükümlerini bildiğiniz halde yaptıklarınız cahillerin davranışlarından daha aşağıdır. Bu yaptığınızın yanlış, kötü bir iş olduğunu hâlâ akletmez misiniz?”',
    ),
  ),
  p(
    text(
      'Rivayet olunduğuna göre Saadet Asrı’nda Medine’deki yahudi bilginlerinden bazılarına insanlar gizlice gelip “Muhammed hakkında ne dersiniz?” diye soruyorlardı. Onlar da; “Doğrudur, gerçektir.” diyor, Allah Rasulü s.a.v.’e uymalarını tembihliyorlardı. Fakat kendileri, emirleri altında bulunanlardan aldıkları hediye ve vergilerden mahrum kalmamak için Efendimiz s.a.v.’e tâbi olma isteklerini açıklamıyorlardı.',
    ),
  ),
  p(
    text(
      'Yine bu bilginlerin bazıları “sadaka verin” diye emrediyor, fakat dağıtmaları için kendilerine sadaka getirildiğinde hainlik ederek kendileri yiyordu. Halbuki sadaka kime verilmesi istenmişse ona verilmelidir.',
    ),
  ),
  p(
    text(
      'Bazıları da “Allah’a itaat edin, âsi olmayın” deyip kendileri bu sözleriyle amel etmiyor, diğer bazıları da “namaz kılın, zekât verin” diyor, fakat kendileri hiçbirini yapmıyordu.',
    ),
  ),
  p(text('İşte yahudi âlimlerinin bu halleri dolayısıyla bu ayet-i kerime nazil olmuştur.')),
  h2('‘Sen neden buradasın?’'),
  p(text('Buhârî ve Müslim’de bu ayet-i kerimeye matuf şu hadis-i şerifler rivayet edilmiştir:')),
  p(
    text(
      '“Kıyamet gününde bir adam getirilir, ateşe atılır, bağırsakları dışa dökülmüş olduğu halde ateş içinde değirmen taşı gibi dönmeye başlar. Cehennem ehli onun etrafını çevirir:',
    ),
  ),
  p(text('– Ey falan! Sen bize iyilikleri emrediyor, fenalıkları yasaklıyor değil miydin, derler. Adam:')),
  p(
    text(
      '– Evet öyle, ama ben size emreder, kendim yapmazdım. Sizi alıkoyar, kendim yapardım, der.” (Buhârî, Bed’ü’l-Halk 10; Müslim, Zühd 7)',
    ),
  ),
  p(
    text(
      '“Miraç gecesi, dudakları ateşten makaslarla kesilen bir grup insana rastladım. Bunun üzerine; ‘Ey kardeşim Cibril, bunlar kimler?’ dedim. Dedi ki: ‘Bunlar, dünya ahalisinden hatip olan kimselerdir. Onlar insanlara iyiliği emrediyorlardı, fakat kendilerini unutuyorlardı.’” (Ahmed b. Hanbel, Müsned, 3/120, 231, 239; İbn Hıbbân, Sahîh, 1/135)',
    ),
  ),
  p(text('Tâbiîn neslinin meşhur âlimlerinden Şa’bî rh.a.’den rivayet edildiğine göre:')),
  p(text('“Cennetliklerden bir grup, cehennemliklerden bir grubun halini görür ve onlara:')),
  p(text('– Niçin cehenneme girdiniz? Halbuki biz sizin öğrettiklerinizle cennete girdik, derler. Onlar da:')),
  p(text('– Biz iyiliği emrediyorduk ama kendimiz yapmıyorduk, derler.')),
  p(
    text(
      'Kim sadece dil ile vaaz ve nasihat ederse sözü boşa gitmiştir. Kim de hal ve hareketi ile vaaz ve nasihat ederse onun söz okları hedefini bulmuş olur.” (Fahreddin er-Râzî, Tefsîr-i Kebîr)',
    ),
  ),
  block('6730a1000000000000000402', {
    blockType: 'oneCikanSoz',
    metin: 'Söz vardır, ağızdan çıkar kulaktan döner; söz vardır, kalpten çıkar kalbe girer. Söz manaya giydirilen bir elbisedir. Elbiseyi kıymetli kılan içindekidir.',
  }),
  p(
    text(
      'Manadan yoksun olan ya da söyleyenin kalbinde bir karşılığı olmayan sözler dinleyene tesir etmez. Söz zarf, mana içindeki mesajdır. Zarf içindekinden dolayı kıymetlidir.',
    ),
  ),
  h2('Emredilip yapılmayan “iyilik”'),
  p(
    text(
      'Ayet-i kerimede, insanlara emredildiği halde yapılmadığı beyan edilen ve “iyilik” kelimesiyle meali verilen “birr” nedir?',
    ),
  ),
  p(
    text(
      '“Birr” sözlükte “ihsan, geniş kapsamlı hayır, tam hayır, iyilik, doğruluk” anlamlarına gelir. Dinî ve ahlâkî bir kavram olarak, “iman ve ibadetten başlamak üzere her türlü iyilik, ihsan, itaat, doğruluk, günahsızlık” gibi manalarda kullanıldığı görülür. Yani birr, her türlü iyiliği, her türlü hayrı kapsar.',
    ),
  ),
  p(text('Kadı Beydâvî rh.a. birr üçtür, der:')),
  ul('Allah Tealâ’ya ibadette birr,', 'Akraba hakkına riayette birr,', 'Dostlarına muamelede birr.'),
  p(text('İman dinin temeli, birr ise gayesi demektir. Din bu iki esasın toplamıdır.')),
  p(
    text(
      '“el-Birr” Allah Tealâ’nın güzel isimlerinden (Esmâ-i Hüsnâ’dan) biridir. Allah Tealâ’nın iyiliğinin, ihsanının genelliğinden, rahmetinin kapsayıcılığından bütün varlıklar yokluktan varlık âlemine çıkartılmıştır. Bütün hayır, iyilik ve ihsan O’ndandır. O, kulları için sadece hayır ve kolaylık diler. Kendisi zorluk dilemediği gibi zorluğa sebebiyet verenleri de sevmez. Hataya düşen kul, bu hatasını fark eder, onu hayırlı bir işle düzeltir diye cezalandırmasını erteler. Sonra da tevbe edilen günahı sevaba çevirir.',
    ),
  ),
  p(
    text(
      'Eğer Cenab-ı Hakk’ın bu sıfatı bütün varlıklara sirayet etmiş olmasaydı, baba oğluna merhamet etmez, anne çocuğuna koşmazdı. Yaratılmışların en merhametlisi, Allah Tealâ’ya en yakın olandır. Bu çok yüce bir lütuftur, “el-Birr” olan Cenab-ı Rabbülâlemîn’in ihsanıdır.',
    ),
  ),
  h2('İyiliği emredip kötülükten sakındırmak'),
  p(
    text(
      'İyiliği emredip kötülükten sakındırmak (emr-i bi’l-ma’ruf nehy-i ani’l-münker) şu üç yönden değerlendirilmelidir:',
    ),
  ),
  ul(
    'Evvela, iyiliği emretmek ve kötülükten sakındırmaktan maksat, başkalarına doğruyu göstermek suretiyle istifade ettirmektir. Halbuki başkasını irşad edip kendisini iyilikten mahrum etmek, başkasını selamete çıkarıp kendini ateşe atmak demektir ki, akıl kârı değildir.',
    'İkinci olarak, insanlara vaaz ve ders vererek ilmini ortaya koyup nasihatini kendisi dinlememek, kişinin kendisini ve ilmini fiilen yalanlamak demektir. Bu, özünde bir çelişki olduğu gibi, bir taraftan insanları irşad etmek isterken diğer taraftan saptırmaktır ki, bu da bir çelişkidir. Aklı olan kişi ise çelişkiye düşmez. İnsanın sözüyle özü bir olmalıdır, edep bunu gerektirir. Kişi başkalarına emrettiklerini, kendisine emretmeyi unutmamalıdır.',
    'Üçüncüsü, söylenen sözün, verilen nasihatin bir kıymeti, kalplerde bir tesirinin olması istenir. Boşuna gevezelik de akıl kârı değildir. Kişinin verdiği tavsiyenin tersini kendisinin yapması, o tavsiyenin kıymetini yok etmek ve belki herkesi ondan nefret ettirmek demektir. Yani bindiği dalı kesmek, oturduğu evi yıkmaktır ki bundan büyük akılsızlık olmaz.',
  ),
  h2('İşi doğru, kendisi sorunlu'),
  p(
    text(
      'Hâsılı, insanları iyiliğe yöneltmek iyidir ve bir görevdir. Fakat bunu yaparken kendini unutmak; işte yanlışlık buradadır. Bu ayet-i kerimedeki azarlama, yasaklama da budur. Emr-i bi’l-ma’ruf yaptıkları için değil, emrettikleriyle kendileri amel etmedikleri içindir.',
    ),
  ),
  p(
    text(
      'Bundan dolayı bu ayet-i kerime, fâsığın (büyük ve küçük günahı açıktan işleyen ve bunda ısrar eden kişinin) doğru söylemek, sözünde ciddi olarak iyiyi söylemek şartıyla öğüt vermesini, iyiliği emretmesini yasaklamıyor. Fakat bu gibiler hakkında gayet büyük bir korkutmayı içeriyor ve onların kötü halini anlatıyor. Vaaz edenin, emir verenin, kendi hakkında ciddi olmasının ve öğüt verirken herkesten önce kendi nefsini düşünmesinin gereği anlatılıyor.',
    ),
  ),
  p(
    text('Enes b. Mâlik r.a.’tan rivayet edilen bir hadis-i şerifte Efendimiz s.a.v. şöyle buyurmuştur: '),
    text('“Kendiniz yapmıyor olsanız da iyiliği emredin. Kendiniz hepsinden kaçınmıyor olsanız da kötülükten nehyedin.”', BOLD),
    text(' (Heysemî, Mecmâu’z-Zevâid, 7/277)'),
  ),
  p(
    text(
      'Burada kulun niyeti çok önemlidir. Niyet samimi olmalıdır. Söylediği şeyleri kişi kendisi de yapmak niyetinde olursa, yapmaya gayret ederse, Cenab-ı Hak lütfuyla onu muvaffak kılar. Elbette insan kul olması hasebiyle hata yapar, günah işleyebilir. Ama niyet, o günahları terk, hayır amelleri işlemek olmalıdır.',
    ),
  ),
  p(
    text(
      'Kadı Beydâvî rh.a. ve bazı müfessirler bu ayet-i kerime ile ilgili şöyle der: Bu ayette, halka vaazla meşgul olan kimseleri kendi nefslerini kötü ahlâktan temizlemeye, güzel kulluk yapmaya ve başkasının da güzel kulluk yapmasına vesile olmasına teşvik vardır. Yoksa günah işleyen bir kimseyi vaaz ve tebliğ işinden men etme manası yoktur.',
    ),
  ),
  p(text('Sorumlu yani mükellef olan kul iki hususla emredilmiştir:')),
  ul(
    'Kişi, amel etmediği şeyi emredince bir vacibi, yani amel etmeyi terk etmiş olur. Ama emri de terk ederse iki vacibi terk etmiş olur. O iki vacibin ilki amel etmek diğeri de ameli emretmektir. Bir vacibi terk etmek iki vacibi terk etmekten hafiftir.',
    'Daha önce de değinildiği üzere, vaazı kendisine işlemeyenin vaaz ve nasihati başkalarına pek tesir etmez. Hayrı emreden kişinin emrettiği hayra uymakta azami titizlik göstermesi gerekir. Bir şeyden alıkoyan da alıkoyduğu şeyden sakınma hususunda herkesten çok dikkat etmelidir. Davranışla yapılan vaaz ve nasihat, sözle yapılandan çok daha etkili olur.',
  ),
  p(
    text(
      'Şu halde insan başkasına öğüt verirken kendisini unutmamalı, ele telkin verip de, kendisi salkımı yutmamalıdır.',
    ),
  ),
  h2('“İyiliği emredip kendinizi unutuyor musunuz?”'),
  p(
    text(
      'Bu ilahî fermanda ‘unutmak’ anlamına gelen “nisyan” kelimesinde “terk etmek” anlamı vardır. Şu halde ayet-i kerimede, insanın kendisini unutup ihmal etmesinin mutlak olarak yasaklanması söz konusudur. Vurgulanan husus, insanın kendisini hiç gündemine almaksızın bu hal ile insanları iyiliğe, hayra teşvik etmekten men etmektir.',
    ),
  ),
  p(
    text(
      'Yani ayet-i kerime şunu söylüyor: “Siz hak karşısında kendinizi unutuyor, sorumlu görmüyor ve onda kendiniz için olan faydalardan vazgeçiyorsunuz. Bu çok kötü bir davranıştır, yasaklanmıştır.”',
    ),
  ),
  p(
    text('Efendimiz s.a.v. şöyle buyurur: '),
    text(
      '“İnsanlara hayrı öğretip de kendini unutan âlimin hali, insanları aydınlatıp da kendini yakan kandilin hali gibidir.”',
      BOLD,
    ),
    text(' (Kenzü’l-Ummâl, 10/187)'),
  ),
  p(
    text('Şâh-ı Nakşibend k.s. Hazretleri de '),
    text('“Mum gibi ol, mum gibi olma.”', BOLD),
    text(' demiştir. Yani insanları aydınlatmada mum gibi ol, fakat kendini yakıp bitirmekte mum gibi olma.'),
  ),
  h2('‘Aklınızı başınıza almayacak mısınız?’'),
  p(
    text(
      'Ayet-i celilenin sonunda Cenab-ı Hak, iyiliği tavsiye edip kendini göz ardı edenlerin hayret verici durumunu şu ifadeyle ortaya koymaktadır: “Aklınızı başınıza almayacak mısınız?”',
    ),
  ),
  p(
    text(
      'Akıl, Allah Tealâ’nın insanın kalbine yerleştirdiği basiret nurudur. Aklın işi hakkı bâtıldan, doğruyu yanlıştan, iyiyi kötüden, faydalıyı zararlıdan ayırmak, insanı iyiye yöneltmektir. Aklın kök anlamında olan “hapsetme ve bağlama” anlamı üzerinden söylersek, insan akılla kendisini haram olan şeye karşı hapseder, hayır olana ise bağlar. Kim kendisine zarar veren şeylere dalarsa onun aklı yok demektir.',
    ),
  ),
  p(
    text(
      '“Aklınızı başınıza almayacak mısınız?” ifadesi, yahudi âlimlerinin ve onlar gibi davrananların yaptıklarına hayret etmeye bir davettir. Çünkü insanları nasihatle doğru yola sevk edip kendini yanlışta bırakmak akıllı insanın yapacağı bir şey değildir. Bu ifadeyle Allah Tealâ, bu halin şaşılacak bir hal olduğunu beyan buyurmuştur.',
    ),
  ),
  p(
    text(
      'Bu ifade, ayet-i kerimede beyan buyurulan çelişkili tutumun yalnızca dinin hükümlerine değil, akla da aykırı olduğuna işaret eder.',
    ),
  ),
  p(
    text(
      'Kur’an-ı Kerim’in geçmiş ümmetlere dair verdiği bilgilerde sonraki nesiller için mesajlar ve dersler vardır. Bu bakımdan, “söylem-eylem uyumu” şeklinde özetlenebilecek ahlâk kurallarından birini ihlâl etmeleri sebebiyle yahudileri eleştiren bu ayet-i kerime:',
    ),
  ),
  ul(
    'Bir taraftan yahudi din bilginlerinin çelişkili tutumları ve samimiyetsizlikleri hakkında bilgi verir.',
    'Bir taraftan da genel olarak İslâm ümmeti, özellikle müslüman din önderleri ve âlimleri için bir uyarı anlamı taşır.',
  ),
  p(
    text(
      'Şu halde kendilerini din âlimi, din adamı ya da din önderi konumunda görenlerin, çocuklarını hakka ve hayra sevk etmek isteyen ebeveynlerin bu uyarıyı hiçbir zaman hatırdan çıkarmamaları gerekir. Çünkü başkalarına iyiliği öğütleyenlerin kendi yaşayışlarında bunun aksine davranmaları Kur’an-ı Kerim’in kesinlikle reddettiği bir tutumdur. Nitekim Sâf suresinde mealen şöyle buyurulur:',
    ),
  ),
  block('6730a1000000000000000403', {
    blockType: 'ayet',
    arapca: 'يَا أَيُّهَا الَّذِينَ آمَنُوا لِمَ تَقُولُونَ مَا لَا تَفْعَلُونَ ۝ كَبُرَ مَقْتًا عِنْدَ اللّٰهِ أَنْ تَقُولُوا مَا لَا تَفْعَلُونَ',
    meal: 'Ey iman edenler! Yapmayacağınız şeyi niçin söylüyorsunuz? Yapmayacağınız şeyleri söylemeniz Allah katında büyük nefretle karşılanır.',
    kaynak: 'Sâf Sûresi · 2-3',
  }),
  p(text('Hak Sübhânehû ve Tealâ en iyi bilendir.')),
)

/** 5. İnciten Kırıp Döken Var ya! — https://semerkanddergisi.com/inciten-kirip-doken-var-ya/ */
const INCITEN_KIRIP_DOKEN_GOVDE = root(
  p(
    text(
      'Hümeze suresi dokuz ayettir ve Mekkî’dir. Bu mübarek sure, kendi kusurlarını görmeyip başkalarını çekiştiren; onunla bununla alay eden, servetine güvenerek dünyada ebedî yaşayacağını zanneden kimselerin ne kadar dehşetli ve şiddetli bir azaba maruz kalacağını haber verir.',
    ),
  ),
  block('6730a1000000000000000501', {
    blockType: 'ayet',
    arapca: 'وَيْلٌ لِكُلِّ هُمَزَةٍ لُمَزَةٍ ۝ الَّذِي جَمَعَ مَالًا وَعَدَّدَهُ',
    meal: 'Arkadan çekiştirmeyi, yüze karşı ayıplamayı âdet edinen her kişinin vay haline! Ki o, malı yığıp onu tekrar tekrar sayandır.',
    kaynak: 'Hümeze Sûresi · 1-2',
  }),
  p(
    text(
      'Cenâb-ı Mevlâ, bir insanın şahsiyet ve şerefinin korunmasının büyük önemini Kur’an-ı Kerim’de bildirmekte, bu türden hallere düçar olanların ahirette çok şiddetli bir ateşle cezalandırılacağını ihtar etmektedir. Bu tür davranışlar, toplum nezdinde de insanlar arası ilişkileri bozduğundan, kınanan davranışlardır.',
    ),
  ),
  p(
    text(
      'Sure-i celilenin nüzûl sebebi hakkında muhtelif rivayetler olmakla beraber, müfessirlerin büyük çoğunluğunun tercih ettiği görüş, insanlar hakkında çok kötü konuşan Ahnes b. Şüreyk isimli putperest hakkında nazil olduğudur.',
    ),
  ),
  p(
    text(
      'Fakat bilindiği üzere ayet-i kerimelerin iniş sebebinin özel oluşu, hükmün genel oluşuna mani değildir. Hüküm, ayet-i kerimede kınanan kötü sıfatları haiz, bu fiilleri işleyen herkes içindir. Yani “hümeze” ve “lümeze” sıfatları kimde bulunursa, büyük bir cehennem azabı o kimse içindir.',
    ),
  ),
  p(
    text(
      'Nitekim sure-i celilenin devam ayetinde gelecek olan; “O (ateşin kapıları), onların üzerine kapatılıp kilitlenecektir.” ilahî fermanında, hümeze ve lümeze yapanların ahirette görecekleri azap ifade edilirken çoğul zamiri kullanılmıştır. Yani “o” denilmemiş, “onlar” denilmiştir. Bu da hükmün umuma yönelik olacağına, sadece ayet-i kerimenin gelmesine sebep olan kişiyle sınırlı olmadığına işaret eder.',
    ),
  ),
  h2('‘Hümeze’ ne demek?'),
  p(
    text(
      'Sure-i celilenin ismi olması münasebetiyle mealde aynen muhafazasını uygun gördüğümüz “hümeze” kelimesi “hemz’i âdet edinenler” demektir. “Hemz” ise “çimdiklemek, dürtmek, kakmak, vurmak, dar bir yere sıkıştırmak, ısırmak, kırmak, yere çalmak” manalarına gelir. Nitekim Türkçede kullandığımız “mahmuz” da “hemz” kelimesinin vurmak, dürtmek anlamlarıyla ilişkilidir.',
    ),
  ),
  p(
    text(
      '“Hümeze” kelimesinin ayet-i kerimedeki anlamı, kelimenin kök anlamının çirkin bir ahlâkî duruma uyarlanmış halidir. Buna göre hümeze, “inceden inceye veya geriden geriye hafifseyerek ve alay ederek şunun bunun namusu ve şerefi ile oynayıp incitmeyi, kötülemeyi, arkadan konuşarak ayıplayıp kınamayı, çekiştirerek öteye beriye laf taşımayı, insanları sevmedikleri lakaplarla çağırmayı âdet edinme hali, gammazlık” demektir. Kısaca hümeze, “gammazlığı yani insanların ayıplarını arayıp gizlice başkalarına taşımayı, fitneciliği âdet ve sanat edinmiş kimseler” için söylenmiştir.',
    ),
  ),
  p(
    text(
      'Ayet-i kerimede geçen “külli hümeze”de yukarıda sıralanan her mana vardır. Yani gerek el ile fizikî olarak, gerek dil ile; madden ve manen onu bunu itip kakmayı, kırıp incitmeyi âdet edinmiş dedikoducu insanların hepsinin vay hallerine ki, hüsran içinde kahrolmaya mahkûmdurlar.',
    ),
  ),
  h2('Ayıplamak ya da ‘lümeze’ yapmak'),
  p(
    text(
      '“Lümeze” de “hümeze” gibidir. Mızrak saplar gibi kötülemek, yüze karşı eğlenmek, ayıplamak, kaş göz kırparak, işaretle alay ederek birini diğerine göstermek manalarına gelen “lemz” kökündendir. Dolayısıyla “lümeze”, “herkesi ayıplamayı ve şuna buna kusur ve eksiklik isnat ederek eğlenmeyi âdet edinmiş, kendini beğenmiş” demektir.',
    ),
  ),
  p(
    text(
      'Zemahşerî’ye göre hümeze’nin aslı “kırıcı” manasından, lümeze’nin aslı da “ayıplayıcı” manasındandır. Bu manaya mutabık olarak İbn Abbas r.a. “hümeze gıybetçi, lümeze ayıpçıdır” demiştir.',
    ),
  ),
  p(
    text(
      'Fahreddin Râzî rh.a. bu hususta der ki: “Hümeze ve lümeze’nin hepsi neticede manada buluşur. O da kusur bulmak ve kusuru açıklamaktır. Bu da iki sebeple ortaya çıkar: Ya haset ve kinlenme sırasında olur ve ciddiyetle yapılır. Ya da alay edip güldürme kabilinden şaka olarak yapılır. Bunların her biri ya dinle alakalı olur ki, bu da iman ve taatla ilgili şeylerdir. Ya da dünya ile ilgili hususlarda olur ki, bu da insanın görünüşü, yürümesi, oturması, kalkması gibi şeyleriyle ilgili olur. Çeşitleri saymakla bitmez. Kusuru ortaya döküp saçma durumu, ya kişinin yüzüne karşı, ya arkasından ya sözle veya baş göz işaretleriyle olur. Bunların hepsi ayet-i kerime çerçevesinde yasaklanmış işlerdir.”',
    ),
  ),
  p(
    text(
      'İmam Kâşânî rh.a. ise der ki: “Hümeze ve lümeze cehaletten, gazap ve kibirden meydana gelen bir ahlâksızlıktır. İkisi de insanlara eziyet etmeyi, onlara karşı büyüklük taslamayı içerir. Bu huylara sahip olan, diğer insanlardan üstün olmak ister. Fakat kendisinde onu üstün kılacak bir fazilet ve fayda bulunmadığı için insanlara ayıp ve ahlâksızlık isnat ederek onlardan daha faziletli ve üstün olduğunu ispat etmeye çalışır. Halbuki bilmez mi ki yaptığı şey ahlâksızlığın ta kendisidir!”',
    ),
  ),
  p(
    text('Efendimiz s.a.v. bir hadis-i şeriflerinde şöyle buyuruyorlar: '),
    text(
      '“Mümin akıllı, anlayışlı ve tedbirli olur. Ağırbaşlıdır; önünü arkasını araştırır, aceleci değildir. Âlimdir; şüpheli şeylerden kaçar. Münafık ise hümeze ve lümeze olur. Arkadan çekiştirir, yüze karşı ayıplar. Katı ve şiddetlidir. Gece odun toplayan gibidir, nereden kazandığını ve nereye harcadığını bilmez.”',
      BOLD,
    ),
    text(' (Aclûnî, Keşfü’l-Hafâ, II, 353)'),
  ),
  h2('‘Vay haline onların!’'),
  p(
    text(
      'Ayet-i kerimenin mealinde “vay haline” diye ifade ettiğimiz “veyl” kelimesi; Fahreddin Râzî ve Ebussuûd Efendi rh.a.’in beyanına göre “çetin azap, büyük helak, yok olma, rezil rüsvâ olma, cehennemde bir vadi, beddua” anlamlarını içermektedir. Bu manalardan hangisi murad olunursa olsun, gazap manasından uzak değildir. Bu ifade kınanan bir şeyin kötülüğünü şiddetle anlatmak için de kullanılır.',
    ),
  ),
  p(
    text(
      'Ayet-i kerimede “veyl” kelimesinin “nekre: belirsiz” kullanılmış olması, kelimenin manasını tam olarak idrak etmenin muhal olduğuna işaret eder. Bu durumda “veyl”in tam manası, kapsamı, sonuçları yalnızca Allah Tealâ’nın ilmindedir. Dolayısıyla hümeze ve lümeze yapanların uğrayacakları azabın azametini ve azgınlığını Hak Tealâ’dan başkasının bilemeyeceğine işaret edilmiş olur. “Veyl” kelimesi bu haliyle şöyle ifade edilebilir: “Çok büyük ve acı bir azap. Öyle ki siz onun şiddetini ve azametini hayal dahi edemezsiniz.”',
    ),
  ),
  h2('Zenginlik ve üstünlük'),
  p(
    text(
      'Ayet-i celilenin devamında Cenab-ı Mevlâ mealen buyuruyor ki: “Ki o, malı yığıp onu tekrar tekrar sayandır.”',
    ),
  ),
  p(
    text(
      'Fahreddin Râzî rh.a.’in beyanına göre burada, kişinin biriktirdiği malın hümeze ve lümeze’ye sebep olma durumu vardır. İnsan biriktirdiği mal sebebiyle kendisini beğenir; malı, serveti dolayısıyla kendisinde üstünlük olduğunu sanır. Sahip olduklarını sadece kendisine mal ederek insanlardan saklar, cimrilik eder. Hayır yolunda harcamaktan kaçınır, fakirin hakkını vermez. Malı, başa gelecek afet ve musibetlere karşı bir güvence ve teminat olarak görür. İnsanda fıtraten güvenme ihtiyacı olduğundan, sırtını Allah Tealâ’ya değil, malına yaslar. Gelebilecek bütün belayı malıyla savacağını zanneder. Dünyaya karşı büyük emeller taşır, ebediyen kalacakmış gibi dünyaya sımsıkı sarılır.',
    ),
  ),
  p(
    text(
      'Düşünmez ki insanı dünyada ve ahirette ebediyen yaşatacak tek şey amel-i sâlihtir. Çünkü amel-i sâlih yapan kişi dünyada güzel bir isim bıraktığı ölçüde, ölmüş olsa da, manen hayatta gibidir. Rahmetle yâd olunur. Ahirette ise ameli vesilesiyle yüksek derecelere nail olur. Ebediyen nimetler içinde yaşar. Akıllı insanın sermayesi amel-i sâlihtir. Ömrünü bir gün bırakıp gideceği dünya uğruna değil, Cenab-ı Mevlâ’nın rızasını celbedecek şeylere sarf eder.',
    ),
  ),
  block('6730a1000000000000000502', {
    blockType: 'oneCikanSoz',
    metin: 'İnsanoğlunun taşıdığı bir nefes, yaşadığı da bir ândır; o kadar. Hal böyleyken nasıl başkalarını eksik ve kusurlu görebilir?',
  }),
  h2('Kötülenen mal mülk'),
  p(
    text(
      'Ayet-i celilede “mal” kelimesi genel anlamıyla kullanılmıştır. Mal, insanın talep ettiği bütün dünyalıklara verilen bir addır. Servet biriktirmek, dünya malından faydalanmak, insan fıtratında var olan bir durumdur. Kur’an-ı Kerim bunu mealen; “Ve o (insan) mal sevgisine aşırı derecede düşkündür.” (Âdiyât 8) şeklinde ifade etmiştir. Allah Rasulü s.a.v. de buyurur ki:',
    ),
  ),
  p(
    text(
      '“Âdemoğlunun iki vadi dolusu malı olsa üçüncüsünü ister. Âdemoğlunun karnını ancak toprak doldurur. Tevbe edenin tevbesini Allah kabul eder.”',
      BOLD,
    ),
    text(' (Buhârî, Rikâk 10)'),
  ),
  p(
    text(
      'Burada şu husus iyi anlaşılmalıdır: İslâm, iyiliği ve kötülüğü mal ve servetin kendisinde değil, insanın servetle olan ilişkisinde görür. Kişiyi Allah Tealâ’nın zikrinden gaflete düşürmesi, O’nunla bağlarını zayıflatması veya koparması halinde zenginliğin ve servetin büyük zararlara sebep olacağını bildirir.',
    ),
  ),
  p(
    text(
      'Mal ve mal biriktirmekle ilişki iki tür niyetle olur. Birincisi, nefsin keyfi konforu gibi dinin kötü saydığı bozuk niyetler için ve bir de helal haram demeden biriktirmektir ki, bu tamamıyla zemmedilmiştir, yasaklanmıştır. İkincisi, İslâm’ın meşru gördüğü güzel bir niyet ve usulle elde edilen, hayır hasenata vesile olan maldır. Böyle bir niyet ve çaba övülmüştür. Bu şekilde edinilen servet cennet için ne güzel binektir!',
    ),
  ),
  p(
    text(
      'Malının nereden gelip nereye gitmesi gerektiğini düşünmeyen, işi gücü servetini öne sürüp kibirlenmek olanlar, bir zaman sonra ölümü unutur, düşünmek bile istemezler. O malın kendisini kurtarmak şöyle dursun, felaketine sebep olacağını düşünmez; her tehlikeden kurtaracağını ve böylece dünyada ebedî yaşatacağını zannederler. Servet sahiplerinin kendi halini murakabe etmesi gerekir: Malına emanet gözüyle mi bakıyor, yoksa bunların hepsi benim malım mı diyor? Hiç ölmeyecek bir insan gibi mi malıyla münasebet kuruyor? Burada önemli olan tavır, elindeki malın sahibinin Cenab-ı Mevlâ olduğu, kendisinin ise o malın sadece emanetçisi ve bekçisi olduğu fikrini sürekli muhafaza etmektir. Çünkü “Mâlikü’l-Mülk” olan O’dur. Yani bütün varlık O’na aittir.',
    ),
  ),
  h2('Hangi cehennem?'),
  p(
    text(
      'Cenâb-ı Mevlâ, gelen ayet-i kerimede hümeze ve lümeze yapanların, mal biriktirip mallarını sayanların akıbetlerinin “Hutame” olduğunu mealen şöyle beyan ediyor: ',
    ),
    text('“Hayır! Andolsun ki o Hutame’ye atılacaktır.”', BOLD),
  ),
  p(
    text(
      'Yani: Malına güvenip, daima malını öne sürüp insanları kırıp inciten, alay eden, herkesin hukuk ve haysiyetiyle oynayan o kendini beğenmiş, başkalarını küçük gören hümeze ve lümeze yapanları, Allahu Zülcelâl hakaret ve sefalet içerisinde ateşe atacaktır. O öyle bir ateştir ki içine atılanı kırıp geçirir, yakar bitirir.',
    ),
  ),
  p(
    text(
      'Bu ayet-i kerimede Allah Tealâ niçin “Kâria”, “Hâviye”, “Nâr-ı Hâmiye”, “Cahîm” gibi cehennem isimleri varken “Hutame” ismini zikretmiştir?',
    ),
  ),
  p(
    text(
      '“Hutame” kelimesinin aslı, “kırıp geçirmek” demek olan “hatm” kelimesinden gelir. Hutame, aynı hümeze ve lümeze ifadelerinde olduğu gibi “bir şeyi âdet edinme” anlamı taşır. Buna göre Hutame’nin anlamı, âdeti ve tabiatı kırmak olmuş yani kırıp geçiren demektir. Burada cehennemin Hutame ismiyle söylenmesi hümezeye karşılık içindir. Çünkü hümezede başkalarının gönlünü, haysiyetini, onurunu kırmak manası bulunduğu gibi, Hutame’de de kırıp geçirmek manası vardır.',
    ),
  ),
  p(
    text(
      'Cenab-ı Hak, gıybetin ne ağır bir cürüm olduğunu açıklama sadedinde buyurur ki: “Biriniz, ölmüş kardeşinin etini yemekten hoşlanır mı?” (Hucurât 12)',
    ),
  ),
  p(
    text(
      'Hümeze ve lümezede de insanları gıybet ederek etlerini yemek manası vardır. Aynı şekilde ateş de deriyi, eti bir anlamda yer. Bundan dolayı hümeze ve lümezeye ilahî adalet gereği Hutame karşılık gelir.',
    ),
  ),
  p(text('Hak Sübhânehû ve Tealâ en iyi bilendir.')),
)

export const SEED_YAZILAR: SeedYazi[] = [
  {
    baslik: 'Zikir, Fikir, Dua',
    kategori: 'Tefsir',
    ozet: '“Onlar ayakta dururken, otururken ve yanları üzerine yatarken Allah’ı anarlar; göklerin ve yerin yaratılışı hakkında derin derin düşünürler.” Âl-i İmrân Sûresi’nin 191. âyeti ışığında kulun Rabbiyle irtibatının üç rüknü: dilin zikri, aklın tefekkürü ve kalbin duası.',
    tarih: '2025-03-01',
    kapak: { file: 'yazi-zikir-fikir-dua.jpg', alt: 'Zikir, Fikir, Dua' },
    govde: ZIKIR_FIKIR_DUA_GOVDE,
    kaynaklar: [
      'Fahruddîn er-Râzî, Tefsîr-i Kebîr',
      'Abdülkerîm el-Kuşeyrî, Letâifu’l-İşârât',
      'Ebü’l-Hasan el-Eş’arî, el-İbâne',
      'Râgıb el-İsfahânî, ez-Zerîa ilâ Mekârimi’ş-Şerîa',
      'Ebü’l-Leys es-Semerkandî, Tefsîru’l-Kur’ân',
      'İbn Acîbe el-Hasenî, Bahru’l-Medîd',
      'İsmail Hakkı Bursevî, Rûhu’l-Beyân',
      'Mehmed Vehbî Efendi, Hülâsatü’l-Beyân',
      'Abdürrezzak Kâşânî, Letâifu’l-A’lâm fî İşârâti Ehli’l-İlhâm',
      'Seyyid Mustafa Râsim Efendi, Istılâhât-ı İnsan-ı Kâmil',
      'Elmalılı Hamdi Yazır, Hak Dini Kur’an Dili',
      'Ömer Nasuhi Bilmen, Kur’an-ı Kerim’in Türkçe Meal-i Âlîsi ve Tefsiri',
    ],
    yayinda: true,
  },
  {
    baslik: "İhlâs'ın İlk Âyeti ve Üç Mertebe",
    kategori: 'Tefsir',
    ozet: '“De ki: O, Allah birdir.” Dinin temelinin temeli olan tevhidi en saf hâliyle beyan eden İhlâs Sûresi’nin faziletleri ve ilk âyetteki “Hüve”, “Allah” ve “Ehad” lafızlarının işaret ettiği üç manevi makam.',
    tarih: '2025-02-01',
    kapak: { file: 'yazi-ihlasin-ilk-ayeti.jpg', alt: "İhlâs'ın İlk Âyeti ve Üç Mertebe" },
    govde: IHLAS_GOVDE,
    kaynaklar: [
      'Fahruddîn er-Râzî, Tefsîr-i Kebîr',
      'İsmail Hakkı Bursevî, Rûhu’l-Beyân',
      'İbn Acîbe el-Hasenî, Bahru’l-Medîd',
      'Râgıb el-İsfahânî, el-Müfredât',
      'Abdülkerîm el-Kuşeyrî, Letâifu’l-İşârât',
      'Ebü’l-Leys es-Semerkandî, Tefsîru’l-Kur’ân',
      'Ebü’l-Berekât en-Nesefî, Medârikü’t-Tenzîl ve Hakâiku’t-Te’vîl',
      'Celâleddîn es-Suyûtî, Esbâbu’n-Nüzûl',
      'Mehmed Vehbî Efendi, Hülâsatü’l-Beyân',
      'Elmalılı Hamdi Yazır, Hak Dini Kur’an Dili',
    ],
    yayinda: true,
  },
  {
    baslik: "Herkes O'na Muhtaç",
    kategori: 'Tefsir',
    ozet: '“Allah Samed’dir.” Hiçbir varlığa ihtiyaç duymayan, bilakis bütün mevcudatın var olmak ve varlığını sürdürmek için her an kendisine muhtaç olduğu Cenâb-ı Hakk’ın Samediyet sırrı.',
    tarih: '2025-01-01',
    kapak: { file: 'yazi-herkes-ona-muhtac.jpg', alt: "Herkes O'na Muhtaç" },
    govde: HERKES_ONA_MUHTAC_GOVDE,
    kaynaklar: [
      'Ebû Mansûr Muhammed el-Mâtürîdî, Te’vîlâtü’l-Kur’ân',
      'Abdülkerîm el-Kuşeyrî, Letâifu’l-İşârât',
      'Râgıb el-İsfahânî, el-Müfredât',
      'Fahruddîn er-Râzî, Tefsîr-i Kebîr',
      'Ebû Hâmid Muhammed el-Gazâlî, el-Maksadü’l-Esnâ',
      'Ebü’l-Berekât en-Nesefî, Medârikü’t-Tenzîl ve Hakâiku’t-Te’vîl',
      'Ebü’l-Leys es-Semerkandî, Tefsîru’l-Kur’ân',
      'İbn Acîbe el-Hasenî, Bahru’l-Medîd',
      'İsmail Hakkı Bursevî, Rûhu’l-Beyân',
      'Elmalılı Hamdi Yazır, Hak Dini Kur’an Dili',
    ],
    yayinda: true,
  },
  {
    baslik: 'Söyleyip de Yapmayanlar',
    kategori: 'Tefsir',
    ozet: '“İnsanlara iyiliği emreder de kendinizi unutur musunuz?” Başkalarına nasihat ederken kendi nefsini unutanların durumu, birr kavramı ve söz ile amel birliği üzerine.',
    tarih: '2024-12-01',
    kapak: { file: 'yazi-soyleyip-de-yapmayanlar.jpg', alt: 'Söyleyip de Yapmayanlar' },
    govde: SOYLEYIP_DE_YAPMAYANLAR_GOVDE,
    kaynaklar: [
      'Fahruddîn er-Râzî, Tefsîr-i Kebîr',
      'Abdülkerîm el-Kuşeyrî, Letâifu’l-İşârât',
      'Ebü’l-Berekât en-Nesefî, Medârikü’t-Tenzîl ve Hakâiku’t-Te’vîl',
      'Kadı Beydâvî, Envâru’t-Tenzîl ve Esrârü’t-Te’vîl',
      'Râgıb el-İsfahânî, el-Müfredât',
      'Sadreddîn Konevî, Şerhu Esmâillâhi’l-Hüsnâ',
      'İsmail Hakkı Bursevî, Rûhu’l-Beyân',
      'İbn Acîbe el-Hasenî, Bahru’l-Medîd',
      'Elmalılı Hamdi Yazır, Hak Dini Kur’an Dili',
    ],
    yayinda: true,
  },
  {
    baslik: 'İnciten Kırıp Döken Var ya!',
    kategori: 'Tefsir',
    ozet: 'Hümeze Sûresi ışığında insan onurunu zedeleyen gıybet, alay ve ayıplama hastalığı ile mal biriktirip servetine güvenerek kibirlenmenin ahiretteki ağır karşılığı.',
    tarih: '2024-11-01',
    kapak: { file: 'yazi-inciten-kirip-doken.jpg', alt: 'İnciten Kırıp Döken Var ya!' },
    govde: INCITEN_KIRIP_DOKEN_GOVDE,
    kaynaklar: [
      'Fahruddîn er-Râzî, Tefsîr-i Kebîr',
      'Mahmûd b. Ömer ez-Zemahşerî, el-Keşşâf',
      'Râgıb el-İsfahânî, el-Müfredât',
      'Celâleddîn es-Suyûtî, Esbâbu’n-Nüzûl',
      'Ebussuûd Efendi, İrşâdü’l-Akli’s-Selîm ilâ Mezâya’l-Kitâbi’l-Kerîm',
      'İsmail Hakkı Bursevî, Rûhu’l-Beyân',
      'Mehmed Vehbî Efendi, Hülâsatü’l-Beyân',
      'Elmalılı Muhammed Hamdi Yazır, Hak Dini Kur’an Dili',
      'Ömer Nasuhi Bilmen, Kur’an-ı Kerim’in Türkçe Meal-i Âlîsi ve Tefsiri',
    ],
    yayinda: true,
  },
]
