import { useMemo, useState } from "react";
import "./athara-illustrated-map.css";
import {
  Clock3,
  MapPinned,
  GitCompareArrows,
  NotebookPen,
  SearchCheck,
  X,
  ChevronLeft,
  Trash2,
  Landmark,
  ScrollText,
} from "lucide-react";
import { useLanguage } from "@/i18n/language";
import { heritageExperienceCopy } from "@/i18n/translations";

const researcherLocaleCopy = {
  ar: heritageExperienceCopy.ar,
  en: heritageExperienceCopy.en,
  fr: {
    toolsEyebrow: "ESPACE DU CHERCHEUR", toolsTitle: "Explorez le patrimoine autrement", toolsText: "Cinq expériences interactives pour rechercher, explorer, comparer et consigner vos découvertes.",
    timeline: "Voyage dans le temps", timelineDesc: "Découvrez les grandes étapes de l’histoire des sites archéologiques.", map: "Carte de l’Égypte ancienne", mapDesc: "Explorez les sites archéologiques liés aux époques et aux souverains.",
    compare: "Comparer deux objets", compareDesc: "Découvrez les ressemblances et les différences entre des objets égyptiens.", notebook: "Carnet de l’archéologue", notebookDesc: "Enregistrez vos notes et découvertes sur cet appareil.", detective: "Enquête archéologique", detectiveDesc: "Résolvez des énigmes historiques et rassemblez vous-même les indices.",
    close: "Fermer", chooseSite: "Choisir un site historique", timelineNote: "Les dates sont approximatives et peuvent varier selon les références.", mapNote: "Carte schématique d’exploration, sans échelle ni fonction de navigation.",
    allPeriods: "Toutes les périodes", oldKingdom: "Ancien Empire", middleKingdom: "Moyen Empire", newKingdom: "Nouvel Empire", latePeriods: "Basse époque",
    site: "Site", period: "Période", function: "Fonction", material: "Matériau", significance: "Importance", firstArtifact: "Premier objet", secondArtifact: "Deuxième objet", chooseArtifact: "Choisir un objet", compareHint: "Choisissez deux objets pour les comparer.",
    noteTitle: "Titre de la note", notePlaceholder: "Écrivez une note ou un détail à retenir sur un objet…", saveNote: "Enregistrer la note", savedNotes: "Notes enregistrées", noNotes: "Aucune note enregistrée pour le moment.", deleteNote: "Supprimer", localStorageNote: "Vos notes sont enregistrées uniquement dans ce navigateur sur cet appareil.",
    startQuiz: "Commencer le défi", nextQuestion: "Question suivante", showResult: "Voir le résultat", restartQuiz: "Recommencer", correct: "Bonne réponse !", incorrect: "Ce n’est pas la bonne réponse.", score: "Votre score", question: "Question", of: "sur", timelineEvents: "Étapes chronologiques", explore: "Explorer", yearsAgo: "av. J.-C.", answerExplanation: "Explication"
  },
  es: {
    toolsEyebrow: "ESPACIO DEL INVESTIGADOR", toolsTitle: "Explora el patrimonio de otra manera", toolsText: "Cinco experiencias interactivas para investigar, explorar, comparar y registrar descubrimientos.",
    timeline: "Viaje a través del tiempo", timelineDesc: "Descubre momentos clave en la historia de los sitios arqueológicos.", map: "Mapa del Antiguo Egipto", mapDesc: "Explora sitios arqueológicos vinculados a épocas y gobernantes.",
    compare: "Comparar dos piezas", compareDesc: "Descubre similitudes y diferencias entre piezas egipcias.", notebook: "Cuaderno del arqueólogo", notebookDesc: "Guarda tus notas y descubrimientos en este dispositivo.", detective: "Detective arqueológico", detectiveDesc: "Resuelve enigmas históricos y reúne las pruebas por tu cuenta.",
    close: "Cerrar", chooseSite: "Elige un sitio histórico", timelineNote: "Las fechas son aproximadas y los detalles pueden variar según las fuentes.", mapNote: "Mapa esquemático de exploración; no está a escala ni sirve para navegación.",
    allPeriods: "Todos los períodos", oldKingdom: "Reino Antiguo", middleKingdom: "Reino Medio", newKingdom: "Reino Nuevo", latePeriods: "Períodos tardíos",
    site: "Sitio", period: "Período", function: "Función", material: "Material", significance: "Importancia", firstArtifact: "Primera pieza", secondArtifact: "Segunda pieza", chooseArtifact: "Elige una pieza", compareHint: "Elige dos piezas para compararlas.",
    noteTitle: "Título de la nota", notePlaceholder: "Escribe una nota o algo que quieras recordar sobre una pieza…", saveNote: "Guardar nota", savedNotes: "Notas guardadas", noNotes: "Todavía no hay notas guardadas.", deleteNote: "Eliminar", localStorageNote: "Tus notas se guardan solo en este navegador y dispositivo.",
    startQuiz: "Comenzar el reto", nextQuestion: "Siguiente pregunta", showResult: "Ver resultado", restartQuiz: "Volver a intentarlo", correct: "¡Respuesta correcta!", incorrect: "Esa no es la respuesta correcta.", score: "Tu puntuación", question: "Pregunta", of: "de", timelineEvents: "Hitos cronológicos", explore: "Explorar", yearsAgo: "a. C.", answerExplanation: "Explicación"
  },
  it: {
    toolsEyebrow: "SPAZIO DEL RICERCATORE", toolsTitle: "Esplora il patrimonio in modo diverso", toolsText: "Cinque esperienze interattive per ricercare, esplorare, confrontare e registrare le tue scoperte.",
    timeline: "Viaggio nel tempo", timelineDesc: "Scopri le tappe della storia dei siti archeologici.", map: "Mappa dell’antico Egitto", mapDesc: "Esplora i siti archeologici legati alle epoche e ai sovrani.",
    compare: "Confronta due reperti", compareDesc: "Scopri somiglianze e differenze tra reperti egizi.", notebook: "Taccuino dell’archeologo", notebookDesc: "Salva appunti e scoperte su questo dispositivo.", detective: "Investigatore archeologico", detectiveDesc: "Risolvi enigmi storici e raccogli personalmente gli indizi.",
    close: "Chiudi", chooseSite: "Scegli un sito storico", timelineNote: "Le date sono approssimative e possono variare secondo le fonti.", mapNote: "Mappa schematica esplorativa, non in scala e non adatta alla navigazione.",
    allPeriods: "Tutti i periodi", oldKingdom: "Antico Regno", middleKingdom: "Medio Regno", newKingdom: "Nuovo Regno", latePeriods: "Epoche tarde",
    site: "Sito", period: "Periodo", function: "Funzione", material: "Materiale", significance: "Importanza", firstArtifact: "Primo reperto", secondArtifact: "Secondo reperto", chooseArtifact: "Scegli un reperto", compareHint: "Scegli due reperti da confrontare.",
    noteTitle: "Titolo della nota", notePlaceholder: "Scrivi una nota o ciò che vuoi ricordare su un reperto…", saveNote: "Salva nota", savedNotes: "Note salvate", noNotes: "Non ci sono ancora note salvate.", deleteNote: "Elimina", localStorageNote: "Le note vengono salvate solo in questo browser su questo dispositivo.",
    startQuiz: "Inizia la sfida", nextQuestion: "Domanda successiva", showResult: "Mostra risultato", restartQuiz: "Riprova", correct: "Risposta corretta!", incorrect: "La risposta non è corretta.", score: "Il tuo punteggio", question: "Domanda", of: "di", timelineEvents: "Tappe cronologiche", explore: "Esplora", yearsAgo: "a.C.", answerExplanation: "Spiegazione"
  },
  de: {
    toolsEyebrow: "ARBEITSBEREICH FÜR FORSCHENDE", toolsTitle: "Kulturerbe auf neue Weise entdecken", toolsText: "Fünf interaktive Erlebnisse zum Recherchieren, Erkunden, Vergleichen und Festhalten von Entdeckungen.",
    timeline: "Reise durch die Zeit", timelineDesc: "Entdecke wichtige Stationen in der Geschichte archäologischer Stätten.", map: "Karte des alten Ägypten", mapDesc: "Erkunde archäologische Stätten aus verschiedenen Epochen und Herrscherzeiten.",
    compare: "Zwei Artefakte vergleichen", compareDesc: "Entdecke Gemeinsamkeiten und Unterschiede ägyptischer Artefakte.", notebook: "Archäologisches Notizbuch", notebookDesc: "Speichere deine Notizen und Entdeckungen auf diesem Gerät.", detective: "Archäologie-Detektiv", detectiveDesc: "Löse historische Rätsel und sammle selbst die Hinweise.",
    close: "Schließen", chooseSite: "Historische Stätte auswählen", timelineNote: "Die Daten sind ungefähre Angaben und können je nach Quelle abweichen.", mapNote: "Schematische Erkundungskarte, nicht maßstabsgetreu und nicht zur Navigation geeignet.",
    allPeriods: "Alle Epochen", oldKingdom: "Altes Reich", middleKingdom: "Mittleres Reich", newKingdom: "Neues Reich", latePeriods: "Spätzeit",
    site: "Stätte", period: "Epoche", function: "Funktion", material: "Material", significance: "Bedeutung", firstArtifact: "Erstes Artefakt", secondArtifact: "Zweites Artefakt", chooseArtifact: "Artefakt auswählen", compareHint: "Wähle zwei Artefakte zum Vergleichen aus.",
    noteTitle: "Notiztitel", notePlaceholder: "Schreibe eine Notiz oder etwas, das du zu einem Artefakt behalten möchtest …", saveNote: "Notiz speichern", savedNotes: "Gespeicherte Notizen", noNotes: "Noch keine Notizen gespeichert.", deleteNote: "Löschen", localStorageNote: "Deine Notizen werden nur in diesem Browser auf diesem Gerät gespeichert.",
    startQuiz: "Herausforderung starten", nextQuestion: "Nächste Frage", showResult: "Ergebnis anzeigen", restartQuiz: "Erneut versuchen", correct: "Richtige Antwort!", incorrect: "Das ist leider nicht richtig.", score: "Dein Ergebnis", question: "Frage", of: "von", timelineEvents: "Zeitliche Stationen", explore: "Erkunden", yearsAgo: "v. Chr.", answerExplanation: "Erklärung"
  },
  ru: {
    toolsEyebrow: "РАБОЧЕЕ ПРОСТРАНСТВО ИССЛЕДОВАТЕЛЯ", toolsTitle: "Откройте наследие по-новому", toolsText: "Пять интерактивных возможностей для исследования, сравнения и записи открытий.",
    timeline: "Путешествие во времени", timelineDesc: "Узнайте об основных этапах истории археологических памятников.", map: "Карта Древнего Египта", mapDesc: "Исследуйте археологические памятники разных эпох и правителей.",
    compare: "Сравнить два артефакта", compareDesc: "Найдите сходства и различия между египетскими артефактами.", notebook: "Записная книжка археолога", notebookDesc: "Сохраняйте заметки и открытия на этом устройстве.", detective: "Археологический детектив", detectiveDesc: "Решайте исторические загадки и самостоятельно собирайте улики.",
    close: "Закрыть", chooseSite: "Выберите историческое место", timelineNote: "Даты приблизительные; сведения могут различаться в источниках.", mapNote: "Схематическая карта для изучения, не в масштабе и не для навигации.",
    allPeriods: "Все периоды", oldKingdom: "Древнее царство", middleKingdom: "Среднее царство", newKingdom: "Новое царство", latePeriods: "Поздний период",
    site: "Место", period: "Период", function: "Назначение", material: "Материал", significance: "Значение", firstArtifact: "Первый артефакт", secondArtifact: "Второй артефакт", chooseArtifact: "Выберите артефакт", compareHint: "Выберите два артефакта для сравнения.",
    noteTitle: "Название заметки", notePlaceholder: "Запишите заметку или то, что хотите запомнить об артефакте…", saveNote: "Сохранить заметку", savedNotes: "Сохранённые заметки", noNotes: "Пока нет сохранённых заметок.", deleteNote: "Удалить", localStorageNote: "Заметки сохраняются только в этом браузере на этом устройстве.",
    startQuiz: "Начать испытание", nextQuestion: "Следующий вопрос", showResult: "Показать результат", restartQuiz: "Повторить", correct: "Правильный ответ!", incorrect: "Это неверный ответ.", score: "Ваш результат", question: "Вопрос", of: "из", timelineEvents: "Хронологические этапы", explore: "Изучить", yearsAgo: "до н. э.", answerExplanation: "Объяснение"
  },
  ja: {
    toolsEyebrow: "研究者ワークスペース", toolsTitle: "新しい視点でエジプトの遺産を探る", toolsText: "調査、探索、比較、発見の記録ができる5つのインタラクティブ体験。",
    timeline: "時をたどる旅", timelineDesc: "遺跡の歴史における主な出来事をたどります。", map: "古代エジプト地図", mapDesc: "時代や王に関連する遺跡を探索します。",
    compare: "2つの遺物を比較", compareDesc: "エジプトの遺物の共通点と違いを見つけます。", notebook: "考古学者のノート", notebookDesc: "メモや発見をこの端末に保存します。", detective: "考古学ミステリー", detectiveDesc: "歴史の謎を解き、自分で証拠を集めます。",
    close: "閉じる", chooseSite: "史跡を選択", timelineNote: "年代は概算で、資料によって異なる場合があります。", mapNote: "探索用の概略図です。縮尺やナビゲーションには対応していません。",
    allPeriods: "すべての時代", oldKingdom: "古王国", middleKingdom: "中王国", newKingdom: "新王国", latePeriods: "末期王朝時代",
    site: "遺跡", period: "時代", function: "用途", material: "素材", significance: "重要性", firstArtifact: "1つ目の遺物", secondArtifact: "2つ目の遺物", chooseArtifact: "遺物を選択", compareHint: "比較する2つの遺物を選んでください。",
    noteTitle: "メモのタイトル", notePlaceholder: "遺物についてのメモや覚えておきたいことを入力…", saveNote: "メモを保存", savedNotes: "保存したメモ", noNotes: "保存されたメモはありません。", deleteNote: "削除", localStorageNote: "メモはこの端末のこのブラウザーにのみ保存されます。",
    startQuiz: "チャレンジ開始", nextQuestion: "次の質問", showResult: "結果を見る", restartQuiz: "もう一度挑戦", correct: "正解です！", incorrect: "正解ではありません。", score: "スコア", question: "質問", of: "/", timelineEvents: "年表の出来事", explore: "探索", yearsAgo: "紀元前", answerExplanation: "解説"
  },
  zh: {
    toolsEyebrow: "研究者工作区", toolsTitle: "以不同方式探索埃及遗产", toolsText: "五种互动体验，帮助你研究、探索、比较并记录发现。",
    timeline: "穿越时光", timelineDesc: "了解考古遗址历史上的重要阶段。", map: "古埃及地图", mapDesc: "探索与不同时代和统治者相关的考古遗址。",
    compare: "比较两件文物", compareDesc: "发现埃及文物之间的相似之处和差异。", notebook: "考古学家笔记本", notebookDesc: "在此设备上保存笔记和发现。", detective: "考古侦探", detectiveDesc: "破解历史谜题并亲自收集线索。",
    close: "关闭", chooseSite: "选择历史遗址", timelineNote: "年代为约数，不同资料中的具体年代可能有所差异。", mapNote: "此为探索示意图，并非比例地图或导航地图。",
    allPeriods: "所有时期", oldKingdom: "古王国时期", middleKingdom: "中王国时期", newKingdom: "新王国时期", latePeriods: "后期王朝时期",
    site: "遗址", period: "时期", function: "用途", material: "材料", significance: "重要性", firstArtifact: "第一件文物", secondArtifact: "第二件文物", chooseArtifact: "选择文物", compareHint: "选择两件文物进行比较。",
    noteTitle: "笔记标题", notePlaceholder: "写下关于文物的笔记或想记住的内容……", saveNote: "保存笔记", savedNotes: "已保存的笔记", noNotes: "暂时没有保存的笔记。", deleteNote: "删除", localStorageNote: "笔记仅保存在此设备的此浏览器中。",
    startQuiz: "开始挑战", nextQuestion: "下一题", showResult: "查看结果", restartQuiz: "重新挑战", correct: "回答正确！", incorrect: "答案不正确。", score: "你的得分", question: "问题", of: "/", timelineEvents: "时间节点", explore: "探索", yearsAgo: "公元前", answerExplanation: "解析"
  }
} as const;


const researcherOptionNames = {
  en: {
    sites: { giza: "Giza Plateau", karnak: "Karnak Temple Complex", "abu-simbel": "Abu Simbel", saqqara: "Saqqara", hawara: "Pyramid of Lahun", tanis: "Tanis (San el-Hagar)", "luxor-west-bank": "West Bank of Luxor", "deir-el-medina": "Deir el-Medina", edfu: "Temple of Edfu", philae: "Philae Island", dahshur: "Dahshur", abydos: "Abydos", amarna: "Tell el-Amarna", memphis: "Memphis" },
    artifacts: { djoser: "Step Pyramid of Djoser", khufu: "Pyramid of Khufu", bent: "Bent Pyramid", "abu-simbel": "Temples of Abu Simbel", red: "Red Pyramid", sphinx: "Great Sphinx of Giza", narmer: "Narmer Palette", rosetta: "Rosetta Stone", "tut-mask": "Golden Mask of Tutankhamun", senusret: "Standing Statue of Senusret I", "hat-shepsut": "Statues of Hatshepsut", canopic: "Canopic Jars", shabti: "Shabti Figures", merneptah: "Merneptah Stele", senet: "Senet Game", palette: "Predynastic Hunters Palette" }
  },

  fr: {
    sites: { giza: "Plateau de Gizeh", karnak: "Complexe de Karnak", "abu-simbel": "Abou Simbel", saqqara: "Saqqarah", hawara: "Pyramide de Lahun", tanis: "Tanis (San el-Hagar)", "luxor-west-bank": "Rive ouest de Louxor", "deir-el-medina": "Deir el-Médineh", edfu: "Temple d’Edfou", philae: "Île de Philae", dahshur: "Dahchour", abydos: "Abydos", amarna: "Tell el-Amarna", memphis: "Memphis" },
    artifacts: { djoser: "Pyramide à degrés de Djéser", khufu: "Pyramide de Khéops", bent: "Pyramide rhomboïdale", "abu-simbel": "Temples d’Abou Simbel", red: "Pyramide rouge", sphinx: "Grand Sphinx de Gizeh", narmer: "Palette de Narmer", rosetta: "Pierre de Rosette", "tut-mask": "Masque d’or de Toutânkhamon", senusret: "Statue de Sésostris Ier", "hat-shepsut": "Statues d’Hatchepsout", canopic: "Vases canopes", shabti: "Ouch virtuels", merneptah: "Stèle de Mérenptah", senet: "Jeu de senet", palette: "Palette des chasseurs prédynastiques" }
  },
  es: {
    sites: { giza: "Meseta de Guiza", karnak: "Complejo de Karnak", "abu-simbel": "Abu Simbel", saqqara: "Saqqara", hawara: "Pirámide de Lahun", tanis: "Tanis (San el-Hagar)", "luxor-west-bank": "Orilla occidental de Luxor", "deir-el-medina": "Deir el-Medina", edfu: "Templo de Edfu", philae: "Isla de File", dahshur: "Dahshur", abydos: "Abidos", amarna: "Tell el-Amarna", memphis: "Menfis" },
    artifacts: { djoser: "Pirámide escalonada de Zoser", khufu: "Pirámide de Keops", bent: "Pirámide acodada", "abu-simbel": "Templos de Abu Simbel", red: "Pirámide Roja", sphinx: "Gran Esfinge de Guiza", narmer: "Paleta de Narmer", rosetta: "Piedra de Rosetta", "tut-mask": "Máscara dorada de Tutankamón", senusret: "Estatua de Sesostris I", "hat-shepsut": "Estatuas de Hatshepsut", canopic: "Vasos canopos", shabti: "Ushebtis", merneptah: "Estela de Merenptah", senet: "Juego del senet", palette: "Paleta de los cazadores predinásticos" }
  },
  it: {
    sites: { giza: "Altopiano di Giza", karnak: "Complesso di Karnak", "abu-simbel": "Abu Simbel", saqqara: "Saqqara", hawara: "Piramide di Lahun", tanis: "Tanis (San el-Hagar)", "luxor-west-bank": "Riva occidentale di Luxor", "deir-el-medina": "Deir el-Medina", edfu: "Tempio di Edfu", philae: "Isola di File", dahshur: "Dahshur", abydos: "Abido", amarna: "Tell el-Amarna", memphis: "Menfi" },
    artifacts: { djoser: "Piramide a gradoni di Djoser", khufu: "Piramide di Cheope", bent: "Piramide romboidale", "abu-simbel": "Templi di Abu Simbel", red: "Piramide Rossa", sphinx: "Grande Sfinge di Giza", narmer: "Tavolozza di Narmer", rosetta: "Stele di Rosetta", "tut-mask": "Maschera d’oro di Tutankhamon", senusret: "Statua di Sesostri I", "hat-shepsut": "Statue di Hatshepsut", canopic: "Vasi canopi", shabti: "Ushabti", merneptah: "Stele di Merenptah", senet: "Gioco del senet", palette: "Tavolozza dei cacciatori predinastici" }
  },
  de: {
    sites: { giza: "Pyramidenfeld von Gizeh", karnak: "Tempelkomplex von Karnak", "abu-simbel": "Abu Simbel", saqqara: "Sakkara", hawara: "Pyramide von Lahun", tanis: "Tanis (San el-Hagar)", "luxor-west-bank": "Westufer von Luxor", "deir-el-medina": "Deir el-Medina", edfu: "Tempel von Edfu", philae: "Insel Philae", dahshur: "Dahschur", abydos: "Abydos", amarna: "Tell el-Amarna", memphis: "Memphis" },
    artifacts: { djoser: "Stufenpyramide des Djoser", khufu: "Cheops-Pyramide", bent: "Knickpyramide", "abu-simbel": "Tempel von Abu Simbel", red: "Rote Pyramide", sphinx: "Große Sphinx von Gizeh", narmer: "Narmer-Palette", rosetta: "Stein von Rosette", "tut-mask": "Goldmaske des Tutanchamun", senusret: "Statue von Sesostris I.", "hat-shepsut": "Statuen der Hatschepsut", canopic: "Kanopengefäße", shabti: "Uschebtis", merneptah: "Merenptah-Stele", senet: "Senet-Spiel", palette: "Jägerpalette aus vordynastischer Zeit" }
  },
  ru: {
    sites: { giza: "Плато Гиза", karnak: "Храмовый комплекс Карнака", "abu-simbel": "Абу-Симбел", saqqara: "Саккара", hawara: "Пирамида Лахуна", tanis: "Танис (Сан-эль-Хагар)", "luxor-west-bank": "Западный берег Луксора", "deir-el-medina": "Дейр-эль-Медина", edfu: "Храм Эдфу", philae: "Остров Филы", dahshur: "Дахшур", abydos: "Абидос", amarna: "Телль-эль-Амарна", memphis: "Мемфис" },
    artifacts: { djoser: "Ступенчатая пирамида Джосера", khufu: "Пирамида Хеопса", bent: "Ломаная пирамида", "abu-simbel": "Храмы Абу-Симбела", red: "Красная пирамида", sphinx: "Большой сфинкс Гизы", narmer: "Палетка Нармера", rosetta: "Розеттский камень", "tut-mask": "Золотая маска Тутанхамона", senusret: "Статуя Сенусерта I", "hat-shepsut": "Статуи Хатшепсут", canopic: "Канопы", shabti: "Ушебти", merneptah: "Стела Мернептаха", senet: "Игра сенет", palette: "Палетка охотников додинастического периода" }
  },
  ja: {
    sites: { giza: "ギザ台地", karnak: "カルナック神殿複合体", "abu-simbel": "アブ・シンベル", saqqara: "サッカラ", hawara: "ラフーンのピラミッド", tanis: "タニス（サン・エル・ハガル）", "luxor-west-bank": "ルクソール西岸", "deir-el-medina": "デル・エル・メディーナ", edfu: "エドフ神殿", philae: "フィラエ島", dahshur: "ダハシュール", abydos: "アビドス", amarna: "テル・エル・アマルナ", memphis: "メンフィス" },
    artifacts: { djoser: "ジェセル王の階段ピラミッド", khufu: "クフ王のピラミッド", bent: "屈折ピラミッド", "abu-simbel": "アブ・シンベル神殿", red: "赤いピラミッド", sphinx: "ギザの大スフィンクス", narmer: "ナルメルのパレット", rosetta: "ロゼッタ・ストーン", "tut-mask": "ツタンカーメンの黄金マスク", senusret: "センウセレト1世立像", "hat-shepsut": "ハトシェプスト女王像", canopic: "カノプス壺", shabti: "シャブティ像", merneptah: "メルエンプタハ碑", senet: "セネト盤ゲーム", palette: "先王朝時代の狩猟者のパレット" }
  },
  zh: {
    sites: { giza: "吉萨高原", karnak: "卡尔纳克神庙群", "abu-simbel": "阿布辛贝", saqqara: "萨卡拉", hawara: "拉洪金字塔", tanis: "塔尼斯（桑埃尔哈贾尔）", "luxor-west-bank": "卢克索西岸", "deir-el-medina": "代尔麦地那", edfu: "埃德富神庙", philae: "菲莱岛", dahshur: "代赫舒尔", abydos: "阿拜多斯", amarna: "阿玛尔纳遗址", memphis: "孟菲斯" },
    artifacts: { djoser: "左塞尔阶梯金字塔", khufu: "胡夫金字塔", bent: "弯曲金字塔", "abu-simbel": "阿布辛贝神庙", red: "红色金字塔", sphinx: "吉萨大狮身人面像", narmer: "纳尔迈调色板", rosetta: "罗塞塔石碑", "tut-mask": "图坦卡蒙黄金面具", senusret: "辛努塞尔特一世立像", "hat-shepsut": "哈特谢普苏特雕像", canopic: "卡诺卜罐", shabti: "沙布提俑", merneptah: "梅尔内普塔石碑", senet: "塞尼特棋", palette: "前王朝时期猎人调色板" }
  }
} as const;

type FeatureId = "timeline" | "map" | "compare" | "notebook" | "detective";

type Site = {
  id: string;
  name: string;
  period: string;
  region: string;
  x: number;
  y: number;
  events: { date: string; title: string; detail: string }[];
};

const sites: Site[] = [
  {
    id: "giza",
    name: "هضبة الجيزة",
    period: "oldKingdom",
    region: "الجيزة",
    x: 60,
    y: 31,
    events: [
      { date: "نحو 2670 ق.م", title: "بدايات العمارة الهرمية", detail: "شهد عصر الأسرة الثالثة تطورًا مهمًا في بناء المقابر الملكية، وصولًا إلى هرم زوسر المدرج في سقارة." },
      { date: "نحو 2580–2510 ق.م", title: "بناء أهرامات الجيزة", detail: "شُيدت الأهرامات الكبرى في عهد ملوك الأسرة الرابعة، خوفو وخفرع ومنقرع." },
      { date: "العصور اللاحقة", title: "موقع للزيارة والتبجيل", detail: "ظلت الجيزة مقصدًا للزيارة والاهتمام عبر عصور مصرية ويونانية ورومانية وحديثة." },
    ],
  },
  {
    id: "karnak",
    name: "مجمع معابد الكرنك",
    period: "newKingdom",
    region: "الأقصر",
    x: 55,
    y: 78,
    events: [
      { date: "من الدولة الوسطى", title: "بدايات المجمع", detail: "تعود أقدم المنشآت المعروفة في الكرنك إلى الدولة الوسطى، ثم اتسع المجمع عبر قرون." },
      { date: "الدولة الحديثة", title: "توسعات الملوك", detail: "أضاف ملوك من بينهم تحتمس الثالث وأمنحتب الثالث ورمسيس الثاني منشآت وصروحًا ومسلات." },
      { date: "العصور اللاحقة", title: "استمرار الاستخدام", detail: "استمر النشاط الديني والبناء والإضافات في الموقع خلال فترات تاريخية متعددة." },
    ],
  },
  {
    id: "abu-simbel",
    name: "أبو سمبل",
    period: "newKingdom",
    region: "أسوان",
    x: 51,
    y: 96,
    events: [
      { date: "القرن 13 ق.م", title: "النحت في عهد رمسيس الثاني", detail: "نُحت المعبدان في عهد رمسيس الثاني ضمن مشهد ملكي وديني في النوبة." },
      { date: "القرن 19", title: "إعادة التعريف بالموقع", detail: "أصبح الموقع معروفًا على نطاق أوسع للباحثين والرحالة في العصر الحديث." },
      { date: "1964–1968", title: "عملية الإنقاذ والنقل", detail: "نُقلت المعابد إلى موقع أعلى لحمايتها من ارتفاع مياه بحيرة ناصر." },
    ],
  },
  {
    id: "saqqara",
    name: "سقارة",
    period: "oldKingdom",
    region: "الجيزة",
    x: 61,
    y: 35,
    events: [
      { date: "نحو 2670 ق.م", title: "هرم زوسر المدرج", detail: "يمثل مجمع زوسر مرحلة محورية في تطور العمارة الحجرية الملكية." },
      { date: "الدولة القديمة", title: "جبانة ملكية ونخبوية", detail: "احتوت سقارة على أهرامات ومصاطب ومقابر لكبار المسؤولين عبر فترات مختلفة." },
      { date: "عصور متعددة", title: "استمرار الدفن", detail: "استُخدمت أجزاء من الجبانة وأُعيد توظيفها خلال عصور لاحقة." },
    ],
  },
  {
    id: "hawara",
    name: "هرم اللاهون",
    period: "middleKingdom",
    region: "الفيوم",
    x: 58,
    y: 49,
    events: [
      { date: "نحو القرن 19 ق.م", title: "بناء هرم سنوسرت الثاني", detail: "ارتبط الموقع بالملك سنوسرت الثاني من الأسرة الثانية عشرة، ويُعد من مواقع الدولة الوسطى المهمة." },
      { date: "الدولة الوسطى", title: "مجمع هرمي ومقابر", detail: "تضم المنطقة آثارًا مرتبطة بالمجمع الجنائزي والجبانة المحيطة به." },
      { date: "العصر الحديث", title: "أبحاث أثرية", detail: "شهد الموقع أعمال تنقيب ودراسة ساعدت في فهم العمارة الجنائزية في الدولة الوسطى." },
    ],
  },
  {
    id: "tanis",
    name: "تانيس (صان الحجر)",
    period: "latePeriods",
    region: "الشرقية",
    x: 64,
    y: 18,
    events: [
      { date: "العصر الانتقالي الثالث", title: "ازدهار تانيس", detail: "أصبحت تانيس مركزًا ملكيًا مهمًا في شمال شرق الدلتا خلال الأسرة الحادية والعشرين." },
      { date: "العصر المتأخر", title: "استمرار الأهمية", detail: "احتفظت المدينة بأهمية دينية وسياسية في فترات لاحقة من تاريخ مصر القديمة." },
      { date: "العصر الحديث", title: "اكتشاف المقابر الملكية", detail: "كشفت أعمال التنقيب عن مقابر ملكية ومقتنيات مهمة في جبانة تانيس." },
    ],
  },

  {
    id: "luxor-west-bank", name: "البر الغربي بالأقصر", period: "newKingdom", region: "الأقصر", x: 53, y: 78,
    events: [
      { date: "الدولة الحديثة", title: "جبانة الملوك والنبلاء", detail: "اختار ملوك من الأسرات الثامنة عشرة إلى العشرين وادي الملوك لدفنهم، كما انتشرت مقابر كبار المسؤولين في جبانات طيبة." },
      { date: "نحو 1500–1000 ق.م", title: "مقابر ملكية مزخرفة", detail: "حملت جدران مقابر ملكية نصوصًا دينية ومناظر مرتبطة برحلة الشمس والعالم الآخر." },
      { date: "العصر الحديث", title: "أبحاث وحماية مستمرة", detail: "تعمل بعثات مصرية ودولية على توثيق المقابر ودراسة حالتها وحمايتها." }
    ]
  },
  {
    id: "deir-el-medina", name: "دير المدينة", period: "newKingdom", region: "الأقصر", x: 54, y: 81,
    events: [
      { date: "الدولة الحديثة", title: "قرية العمال المهرة", detail: "سكنها حرفيون متخصصون في إعداد وزخرفة المقابر الملكية في وادي الملوك ووادي الملكات." },
      { date: "عصر الرعامسة", title: "وثائق الحياة اليومية", detail: "حفظت البرديات والأوستراكا تفاصيل الأجور والغياب والنزاعات والعلاقات الاجتماعية." },
      { date: "نحو 1150 ق.م", title: "إضراب العمال", detail: "تسجل برديات من عهد رمسيس الثالث احتجاج العمال بسبب تأخر حصص المؤن، وهو من أقدم الإضرابات الموثقة." }
    ]
  },
  {
    id: "edfu", name: "معبد إدفو", period: "latePeriods", region: "أسوان", x: 54, y: 86,
    events: [
      { date: "237 ق.م", title: "بداية البناء البطلمي", detail: "بدأ بناء المعبد في عهد بطليموس الثالث، واستمرت أعماله وإضافاته خلال العصر البطلمي." },
      { date: "العصر البطلمي", title: "معبد حورس", detail: "كرّس المعبد للإله حورس، وتوثق نقوشه الطقوس والأساطير والأعياد." },
      { date: "57 ق.م تقريبًا", title: "اكتمال الزخرفة", detail: "تؤرخ نقوش المعبد مراحل متتابعة من البناء والزخرفة حتى أواخر العصر البطلمي." }
    ]
  },
  {
    id: "philae", name: "جزيرة فيلة", period: "latePeriods", region: "أسوان", x: 52, y: 92,
    events: [
      { date: "العصر البطلمي", title: "ازدهار عبادة إيزيس", detail: "أصبحت فيلة مركزًا مهمًا لعبادة إيزيس، وضم مجمعها معابد ومنشآت من عصور متعددة." },
      { date: "العصر الروماني", title: "استمرار الشعائر", detail: "استمرت بعض الطقوس المرتبطة بإيزيس في فيلة خلال العصر الروماني." },
      { date: "1972–1980", title: "إنقاذ آثار فيلة", detail: "فُككت منشآت الجزيرة ونُقلت إلى جزيرة أجيلكيا ضمن حملة إنقاذ آثار النوبة." }
    ]
  },
  {
    id: "dahshur", name: "دهشور", period: "oldKingdom", region: "الجيزة", x: 60, y: 39,
    events: [
      { date: "نحو 2600 ق.م", title: "الهرم المنحني", detail: "شيد الملك سنفرو الهرم المنحني، ويظهر تغير زاوية الميل في الجزء العلوي." },
      { date: "نحو 2590 ق.م", title: "الهرم الأحمر", detail: "يرتبط الهرم الأحمر بسنفرو ويعد من أقدم الأهرامات ذات الأوجه المستقيمة المكتملة." },
      { date: "الدولة الوسطى", title: "جبانة ملكية جديدة", detail: "شهدت دهشور بناء أهرامات ومقابر ملكية في عهد ملوك من الأسرة الثانية عشرة." }
    ]
  },
  {
    id: "abydos", name: "أبيدوس", period: "middleKingdom", region: "سوهاج", x: 56, y: 70,
    events: [
      { date: "عصور مبكرة", title: "جبانة ملكية مبكرة", detail: "تضم أبيدوس مدافن ملكية من بدايات الأسرات، وأسهمت في فهم نشأة الدولة المصرية." },
      { date: "الدولة الوسطى", title: "مركز عبادة أوزير", detail: "ارتبطت أبيدوس بقوة بعبادة أوزير ورحلات الحج والطقوس الجنائزية." },
      { date: "الدولة الحديثة", title: "معبد سيتي الأول", detail: "يضم الموقع معبد سيتي الأول وقائمة ملوك أبيدوس الشهيرة، مع إضافات من عهد رمسيس الثاني." }
    ]
  },
  {
    id: "amarna", name: "تل العمارنة", period: "newKingdom", region: "المنيا", x: 57, y: 60,
    events: [
      { date: "نحو 1346 ق.م", title: "تأسيس أخت آتون", detail: "أنشأ أخناتون عاصمة جديدة مكرسة لعبادة آتون في منطقة تل العمارنة." },
      { date: "عهد أخناتون", title: "تحول فني وديني", detail: "شهدت المدينة أساليب فنية ومناظر ملكية مختلفة، إلى جانب تغيرات في الخطاب الديني الرسمي." },
      { date: "بعد عهد أخناتون", title: "هجر المدينة", detail: "تراجع استخدام العاصمة بعد نهاية تجربة العمارنة، وأصبحت بقاياها مصدرًا مهمًا للبرديات والرسائل." }
    ]
  },
  {
    id: "memphis", name: "منف", period: "oldKingdom", region: "الجيزة", x: 60, y: 43,
    events: [
      { date: "بدايات الدولة", title: "مركز سياسي مبكر", detail: "كانت منف من أهم المراكز السياسية والإدارية في مصر القديمة، قرب ملتقى الوادي والدلتا." },
      { date: "الدولة القديمة", title: "مركز ديني وحرفي", detail: "ارتبطت منف بعبادة بتاح وبالورش ومؤسسات ملكية وحرفية واسعة." },
      { date: "العصور اللاحقة", title: "استمرار المكانة", detail: "احتفظت منف بأهمية دينية وإدارية عبر عصور مختلفة، وتنتشر آثارها في منطقة ميت رهينة." }
    ]
  },
];

const mapPins = [
  { id: "alexandria", number: 1, name: "الإسكندرية", left: 39, top: 12.7, siteIds: ["tanis"] },
  { id: "mansoura", number: 2, name: "المنصورة", left: 54, top: 13, siteIds: ["hawara"] },
  { id: "giza", number: 3, name: "أهرامات الجيزة", left: 42.7, top: 28.5, siteIds: ["giza", "saqqara", "dahshur", "memphis"] },
  { id: "suez", number: 4, name: "قناة السويس", left: 61.5, top: 22.7, siteIds: ["amarna"] },
  { id: "luxor", number: 5, name: "الأقصر", left: 55.8, top: 45, siteIds: ["karnak", "luxor-west-bank", "deir-el-medina"] },
  { id: "aswan", number: 6, name: "أسوان", left: 60.4, top: 59, siteIds: ["edfu", "philae", "abydos"] },
  { id: "abu-simbel", number: 7, name: "معبد أبو سمبل", left: 40.3, top: 67.4, siteIds: ["abu-simbel"] },
] as const;

const siteMapCategories: Record<string, "temples" | "pyramids" | "tombs" | "museums" | "fortresses" | "other"> = {
  giza: "pyramids", karnak: "temples", "abu-simbel": "temples", saqqara: "tombs",
  hawara: "pyramids", tanis: "tombs", "luxor-west-bank": "tombs", "deir-el-medina": "tombs",
  edfu: "temples", philae: "temples", dahshur: "pyramids", abydos: "temples",
  amarna: "other", memphis: "temples",
};

const mapLegendNames = {
  ar: { all: "الكل", temples: "المعابد", pyramids: "الأهرامات", tombs: "المقابر", museums: "المتاحف", fortresses: "القلاع", other: "الآثار الأخرى" },
  en: { all: "All", temples: "Temples", pyramids: "Pyramids", tombs: "Tombs", museums: "Museums", fortresses: "Fortresses", other: "Other antiquities" },
  de: { all: "Alle", temples: "Tempel", pyramids: "Pyramiden", tombs: "Gräber", museums: "Museen", fortresses: "Festungen", other: "Weitere Altertümer" },
} as const;

const artifacts = [
  { id: "djoser", name: "هرم زوسر المدرج", period: "الدولة القديمة – الأسرة الثالثة", function: "مجمع جنائزي ملكي", material: "الحجر الجيري", significance: "مرحلة مبكرة بارزة في تطور بناء الأهرامات والعمارة الحجرية." },
  { id: "khufu", name: "هرم خوفو", period: "الدولة القديمة – الأسرة الرابعة", function: "هرم جنائزي ملكي", material: "الحجر الجيري والجرانيت", significance: "أكبر أهرامات الجيزة، ويعكس قدرات تنظيمية وهندسية كبيرة." },
  { id: "bent", name: "الهرم المنحني", period: "الدولة القديمة – الأسرة الرابعة", function: "هرم جنائزي ملكي", material: "الحجر الجيري", significance: "يوضح مرحلة تجريبية مهمة في تطوير شكل الهرم الكامل." },
  { id: "abu-simbel", name: "معبدا أبو سمبل", period: "الدولة الحديثة – الأسرة التاسعة عشرة", function: "معبدان منحوتان في الصخر", material: "الصخر الرملي", significance: "يرتبطان ببرنامج رمسيس الثاني الملكي والديني في النوبة." },

  { id: "red", name: "الهرم الأحمر", period: "الدولة القديمة – الأسرة الرابعة", function: "هرم جنائزي ملكي", material: "الحجر الجيري", significance: "يرتبط بسنفرو في دهشور، ويعد من أقدم الأهرامات ذات الأوجه المستقيمة المكتملة." },
  { id: "sphinx", name: "أبو الهول بالجيزة", period: "الدولة القديمة – الأسرة الرابعة", function: "تمثال ملكي ضخم مرتبط بالمجمع الجنائزي", material: "الصخر الجيري الطبيعي", significance: "يجمع هيئة أسد ورأسًا بشريًا، وترتبط هويته غالبًا بخفرع مع استمرار نقاشات علمية حول تفاصيل التأريخ." },
  { id: "narmer", name: "لوحة نارمر", period: "بداية الأسرات – الأسرة الأولى", function: "لوحة احتفالية/ملكية", material: "حجر الشيست", significance: "تعرض مشاهد ملكية ورموزًا مرتبطة بتوحيد القطرين وبدايات الدولة." },
  { id: "rosetta", name: "حجر رشيد", period: "العصر البطلمي – 196 ق.م", function: "مرسوم ملكي مكتوب بثلاثة أنظمة كتابية", material: "حجر جرانوديوريت", significance: "أسهمت نصوصه المتوازية بالهيروغليفية والديموطيقية واليونانية في فك رموز الهيروغليفية." },
  { id: "tut-mask", name: "القناع الذهبي لتوت عنخ آمون", period: "الدولة الحديثة – الأسرة الثامنة عشرة", function: "قناع جنائزي", material: "ذهب ومواد مطعمة متعددة", significance: "جزء من تجهيزات دفن الملك، ويعرض مهارة الصياغة والرمزية الجنائزية." },
  { id: "senusret", name: "التمثال الواقف لسنوسرت الأول", period: "الدولة الوسطى – الأسرة الثانية عشرة", function: "تمثال ملكي", material: "حجر جيري", significance: "يمثل تقاليد تصوير الملك في الدولة الوسطى ويعكس استمرارية الرموز الملكية." },
  { id: "hat-shepsut", name: "تماثيل حتشبسوت", period: "الدولة الحديثة – الأسرة الثامنة عشرة", function: "تماثيل ملكية ودينية", material: "أحجار متنوعة", significance: "تكشف تنوع صور الملكة الرسمية وتحول تمثيلها بين هيئة أوزيرية وهيئة الملك." },
  { id: "canopic", name: "الأواني الكانوبية", period: "عصور مصرية متعددة", function: "حفظ الأحشاء ضمن تجهيزات التحنيط", material: "حجر وألباستر وفخار ومواد أخرى", significance: "ارتبطت بحماية الأحشاء وبأبناء حورس الأربعة، وتنوعت أشكالها عبر الزمن." },
  { id: "shabti", name: "تماثيل الأوشابتي", period: "الدولة الوسطى وما بعدها", function: "تماثيل جنائزية رمزية", material: "خشب وحجر وفخار وخزف", significance: "كان يُعتقد أنها تؤدي أعمالًا نيابة عن المتوفى في العالم الآخر، وتفاوتت أعدادها ونقوشها." },
  { id: "merneptah", name: "لوحة مرنبتاح", period: "الدولة الحديثة – الأسرة التاسعة عشرة", function: "لوحة نصر ملكية", material: "حجر جرانيت", significance: "تتضمن نصًا ملكيًا يذكر جماعة باسم إسرائيل ضمن سياق حملة عسكرية في كنعان." },
  { id: "senet", name: "لعبة السنت", period: "من الدولة القديمة وما بعدها", function: "لعبة لوحية", material: "خشب وعاج وحجر ومواد أخرى", significance: "كانت لعبة شعبية ذات دلالات اجتماعية ورمزية، وظهرت لاحقًا في سياقات جنائزية." },
  { id: "palette", name: "لوحة صيادين ما قبل الأسرات", period: "نقادة الثانية/الثالثة", function: "لوحة احتفالية أو تجميلية", material: "حجر", significance: "تساعد مناظرها على دراسة الرموز والسلطة والصيد والتعبير الفني قبل قيام الدولة." },
];


const localizedArtifactDetails = {
  en: {
    djoser: ["Old Kingdom – Third Dynasty", "Royal funerary complex", "Limestone", "An early landmark in the development of pyramid building and stone architecture."],
    khufu: ["Old Kingdom – Fourth Dynasty", "Royal funerary pyramid", "Limestone and granite", "The largest pyramid at Giza, demonstrating major organizational and engineering capabilities."],
    bent: ["Old Kingdom – Fourth Dynasty", "Royal funerary pyramid", "Limestone", "Illustrates an important experimental stage in the development of the true pyramid."],
    "abu-simbel": ["New Kingdom – Nineteenth Dynasty", "Two rock-cut temples", "Sandstone", "Part of Ramesses II’s royal and religious program in Nubia."],
    red: ["Old Kingdom – Fourth Dynasty", "Royal funerary pyramid", "Limestone", "Associated with Sneferu at Dahshur; one of the earliest completed smooth-sided pyramids."],
    sphinx: ["Old Kingdom – Fourth Dynasty", "Monumental royal statue associated with a funerary complex", "Natural limestone bedrock", "Combines a lion’s body with a human head; commonly associated with Khafre, though dating details remain debated."],
    narmer: ["Early Dynastic Period – First Dynasty", "Ceremonial/royal palette", "Schist", "Depicts royal imagery and symbols associated with the unification of the Two Lands and the beginnings of the state."],
    rosetta: ["Ptolemaic Period – 196 BCE", "Royal decree written in three scripts", "Granodiorite", "Its parallel hieroglyphic, Demotic and Greek texts helped scholars decipher hieroglyphs."],
    "tut-mask": ["New Kingdom – Eighteenth Dynasty", "Funerary mask", "Gold and various inlaid materials", "Part of the king’s burial equipment, displaying advanced goldworking and funerary symbolism."],
    senusret: ["Middle Kingdom – Twelfth Dynasty", "Royal statue", "Limestone", "Represents Middle Kingdom royal portrait traditions and the continuity of kingship symbols."],
    "hat-shepsut": ["New Kingdom – Eighteenth Dynasty", "Royal and religious statues", "Various stones", "Shows the range of Hatshepsut’s official images, from Osirian forms to representations as king."],
    canopic: ["Various periods of ancient Egypt", "Containers for preserving internal organs during mummification", "Stone, alabaster, pottery and other materials", "Associated with the protection of the organs and the four Sons of Horus; forms changed over time."],
    shabti: ["Middle Kingdom and later", "Symbolic funerary figures", "Wood, stone, pottery and faience", "Believed to perform tasks on behalf of the deceased in the afterlife; their numbers and inscriptions varied."],
    merneptah: ["New Kingdom – Nineteenth Dynasty", "Royal victory stele", "Granite", "Contains a royal text mentioning a people called Israel in the context of a military campaign in Canaan."],
    senet: ["Old Kingdom onward", "Board game", "Wood, ivory, stone and other materials", "A popular game with social and symbolic meanings that later also appeared in funerary contexts."],
    palette: ["Naqada II/III", "Ceremonial or cosmetic palette", "Stone", "Its imagery helps researchers study symbolism, authority, hunting and artistic expression before the formation of the state."]
  },
  fr: {
    djoser: ["Ancien Empire – IIIe dynastie", "Complexe funéraire royal", "Calcaire", "Une étape majeure des débuts de la construction des pyramides et de l’architecture en pierre."],
    khufu: ["Ancien Empire – IVe dynastie", "Pyramide funéraire royale", "Calcaire et granite", "La plus grande pyramide de Gizeh, témoignant de grandes capacités d’organisation et d’ingénierie."],
    bent: ["Ancien Empire – IVe dynastie", "Pyramide funéraire royale", "Calcaire", "Illustre une étape expérimentale importante dans l’évolution de la pyramide à faces lisses."],
    "abu-simbel": ["Nouvel Empire – XIXe dynastie", "Deux temples creusés dans la roche", "Grès", "Associés au programme royal et religieux de Ramsès II en Nubie."],
    red: ["Ancien Empire – IVe dynastie", "Pyramide funéraire royale", "Calcaire", "Associée à Snéfrou à Dahchour, c’est l’une des premières pyramides à faces lisses achevées."],
    sphinx: ["Ancien Empire – IVe dynastie", "Statue royale monumentale liée à un complexe funéraire", "Rocher calcaire naturel", "Associe un corps de lion à une tête humaine ; généralement lié à Khéphren, malgré des débats sur sa datation."],
    narmer: ["Époque thinite – Ire dynastie", "Palette cérémonielle/royale", "Schiste", "Présente des images royales et des symboles liés à l’unification des Deux Terres et aux débuts de l’État."],
    rosetta: ["Époque ptolémaïque – 196 av. J.-C.", "Décret royal en trois systèmes d’écriture", "Granodiorite", "Ses textes parallèles en hiéroglyphes, démotique et grec ont aidé au déchiffrement des hiéroglyphes."],
    "tut-mask": ["Nouvel Empire – XVIIIe dynastie", "Masque funéraire", "Or et matériaux incrustés", "Élément du mobilier funéraire du roi, illustrant le savoir-faire de l’orfèvrerie et la symbolique funéraire."],
    senusret: ["Moyen Empire – XIIe dynastie", "Statue royale", "Calcaire", "Représente les traditions du portrait royal au Moyen Empire et la continuité des symboles royaux."],
    "hat-shepsut": ["Nouvel Empire – XVIIIe dynastie", "Statues royales et religieuses", "Pierres variées", "Révèle la diversité des images officielles d’Hatchepsout, de la forme osirienne à celle du roi."],
    canopic: ["Plusieurs périodes de l’Égypte ancienne", "Récipients destinés à conserver les viscères lors de la momification", "Pierre, albâtre, poterie et autres matériaux", "Liés à la protection des viscères et aux quatre fils d’Horus ; leurs formes ont évolué."],
    shabti: ["Moyen Empire et périodes suivantes", "Figurines funéraires symboliques", "Bois, pierre, poterie et faïence", "Censées accomplir des tâches pour le défunt dans l’au-delà ; leur nombre et leurs inscriptions variaient."],
    merneptah: ["Nouvel Empire – XIXe dynastie", "Stèle royale de victoire", "Granite", "Comporte un texte royal mentionnant un groupe appelé Israël lors d’une campagne militaire en Canaan."],
    senet: ["Depuis l’Ancien Empire", "Jeu de plateau", "Bois, ivoire, pierre et autres matériaux", "Jeu populaire aux significations sociales et symboliques, présent plus tard dans des contextes funéraires."],
    palette: ["Naqada II/III", "Palette cérémonielle ou cosmétique", "Pierre", "Ses scènes éclairent les symboles, le pouvoir, la chasse et l’expression artistique avant la formation de l’État."]
  },
  es: {
    djoser: ["Reino Antiguo – III dinastía", "Complejo funerario real", "Piedra caliza", "Un hito temprano en el desarrollo de las pirámides y la arquitectura en piedra."],
    khufu: ["Reino Antiguo – IV dinastía", "Pirámide funeraria real", "Piedra caliza y granito", "La mayor pirámide de Guiza; refleja grandes capacidades de organización e ingeniería."],
    bent: ["Reino Antiguo – IV dinastía", "Pirámide funeraria real", "Piedra caliza", "Muestra una etapa experimental importante en el desarrollo de la pirámide de caras lisas."],
    "abu-simbel": ["Reino Nuevo – XIX dinastía", "Dos templos excavados en la roca", "Arenisca", "Forman parte del programa real y religioso de Ramsés II en Nubia."],
    red: ["Reino Antiguo – IV dinastía", "Pirámide funeraria real", "Piedra caliza", "Vinculada a Esnofru en Dahshur; una de las primeras pirámides de caras lisas completadas."],
    sphinx: ["Reino Antiguo – IV dinastía", "Estatua real monumental asociada a un complejo funerario", "Roca caliza natural", "Combina cuerpo de león y cabeza humana; suele relacionarse con Kefrén, aunque se debate su datación."],
    narmer: ["Época Tinita – I dinastía", "Paleta ceremonial/real", "Esquisto", "Presenta imágenes reales y símbolos relacionados con la unificación de las Dos Tierras y los inicios del Estado."],
    rosetta: ["Época ptolemaica – 196 a. C.", "Decreto real escrito en tres sistemas", "Granodiorita", "Sus textos paralelos en jeroglífico, demótico y griego ayudaron a descifrar los jeroglíficos."],
    "tut-mask": ["Reino Nuevo – XVIII dinastía", "Máscara funeraria", "Oro y diversos materiales incrustados", "Parte del ajuar funerario del rey; muestra la destreza orfebre y el simbolismo funerario."],
    senusret: ["Reino Medio – XII dinastía", "Estatua real", "Piedra caliza", "Representa las tradiciones del retrato real del Reino Medio y la continuidad de los símbolos monárquicos."],
    "hat-shepsut": ["Reino Nuevo – XVIII dinastía", "Estatuas reales y religiosas", "Piedras variadas", "Muestra la diversidad de las imágenes oficiales de Hatshepsut, desde la forma osiríaca hasta la del rey."],
    canopic: ["Diversos períodos del antiguo Egipto", "Recipientes para conservar las vísceras durante la momificación", "Piedra, alabastro, cerámica y otros materiales", "Se relacionan con la protección de las vísceras y los cuatro hijos de Horus; sus formas variaron."],
    shabti: ["Reino Medio y épocas posteriores", "Figuras funerarias simbólicas", "Madera, piedra, cerámica y fayenza", "Se creía que realizaban tareas por el difunto en el más allá; variaban en número e inscripciones."],
    merneptah: ["Reino Nuevo – XIX dinastía", "Estela real de victoria", "Granito", "Incluye un texto real que menciona a un grupo llamado Israel en el contexto de una campaña en Canaán."],
    senet: ["Desde el Reino Antiguo", "Juego de mesa", "Madera, marfil, piedra y otros materiales", "Juego popular con significados sociales y simbólicos, presente después también en contextos funerarios."],
    palette: ["Naqada II/III", "Paleta ceremonial o cosmética", "Piedra", "Sus escenas ayudan a estudiar símbolos, autoridad, caza y expresión artística antes de la formación del Estado."]
  },
  it: {
    djoser: ["Antico Regno – III dinastia", "Complesso funerario reale", "Calcare", "Una tappa iniziale fondamentale nello sviluppo delle piramidi e dell’architettura in pietra."],
    khufu: ["Antico Regno – IV dinastia", "Piramide funeraria reale", "Calcare e granito", "La più grande piramide di Giza, testimonianza di notevoli capacità organizzative e ingegneristiche."],
    bent: ["Antico Regno – IV dinastia", "Piramide funeraria reale", "Calcare", "Mostra un’importante fase sperimentale nello sviluppo della piramide a facce lisce."],
    "abu-simbel": ["Nuovo Regno – XIX dinastia", "Due templi scavati nella roccia", "Arenaria", "Parte del programma reale e religioso di Ramses II in Nubia."],
    red: ["Antico Regno – IV dinastia", "Piramide funeraria reale", "Calcare", "Legata a Snefru a Dahshur, è una delle prime piramidi a facce lisce completate."],
    sphinx: ["Antico Regno – IV dinastia", "Monumentale statua regale legata a un complesso funerario", "Roccia calcarea naturale", "Unisce corpo leonino e testa umana; è spesso associata a Chefren, sebbene la datazione sia discussa."],
    narmer: ["Periodo Protodinastico – I dinastia", "Tavolozza cerimoniale/regale", "Scisto", "Mostra immagini regali e simboli legati all’unificazione delle Due Terre e alla nascita dello Stato."],
    rosetta: ["Periodo tolemaico – 196 a.C.", "Decreto reale in tre sistemi di scrittura", "Granodiorite", "I testi paralleli in geroglifico, demotico e greco contribuirono alla decifrazione dei geroglifici."],
    "tut-mask": ["Nuovo Regno – XVIII dinastia", "Maschera funeraria", "Oro e vari materiali intarsiati", "Parte del corredo funerario del re, mostra abilità orafe e simbolismo funerario."],
    senusret: ["Medio Regno – XII dinastia", "Statua regale", "Calcare", "Rappresenta le tradizioni del ritratto regale del Medio Regno e la continuità dei simboli monarchici."],
    "hat-shepsut": ["Nuovo Regno – XVIII dinastia", "Statue regali e religiose", "Pietre diverse", "Mostra la varietà delle immagini ufficiali di Hatshepsut, dalla forma osiriaca a quella del re."],
    canopic: ["Diverse epoche dell’antico Egitto", "Contenitori per conservare gli organi durante la mummificazione", "Pietra, alabastro, ceramica e altri materiali", "Legati alla protezione degli organi e ai quattro figli di Horus; le forme cambiarono nel tempo."],
    shabti: ["Medio Regno e periodi successivi", "Statuette funerarie simboliche", "Legno, pietra, ceramica e faience", "Si riteneva svolgessero compiti per il defunto nell’aldilà; numero e iscrizioni variavano."],
    merneptah: ["Nuovo Regno – XIX dinastia", "Stele reale della vittoria", "Granito", "Contiene un testo reale che menziona un gruppo chiamato Israele nel contesto di una campagna in Canaan."],
    senet: ["Dal Medio Regno antico in poi", "Gioco da tavolo", "Legno, avorio, pietra e altri materiali", "Gioco popolare con significati sociali e simbolici, presente in seguito anche in contesti funerari."],
    palette: ["Naqada II/III", "Tavolozza cerimoniale o cosmetica", "Pietra", "Le scene aiutano a studiare simboli, autorità, caccia ed espressione artistica prima della formazione dello Stato."]
  },
  de: {
    djoser: ["Altes Reich – 3. Dynastie", "Königlicher Pyramidenkomplex", "Kalkstein", "Ein früher Meilenstein in der Entwicklung des Pyramidenbaus und der Steinarchitektur."],
    khufu: ["Altes Reich – 4. Dynastie", "Königliche Grabpyramide", "Kalkstein und Granit", "Die größte Pyramide von Gizeh; sie bezeugt große organisatorische und technische Fähigkeiten."],
    bent: ["Altes Reich – 4. Dynastie", "Königliche Grabpyramide", "Kalkstein", "Zeigt eine wichtige Experimentierphase bei der Entwicklung der echten Pyramide."],
    "abu-simbel": ["Neues Reich – 19. Dynastie", "Zwei Felsentempel", "Sandstein", "Teil des königlichen und religiösen Programms Ramses’ II. in Nubien."],
    red: ["Altes Reich – 4. Dynastie", "Königliche Grabpyramide", "Kalkstein", "Mit Snofru in Dahschur verbunden; eine der frühesten fertiggestellten glattseitigen Pyramiden."],
    sphinx: ["Altes Reich – 4. Dynastie", "Monumentale Königsstatue im Zusammenhang mit einem Grabkomplex", "Natürlicher Kalksteinfels", "Verbindet einen Löwenkörper mit einem Menschenkopf; meist Chephren zugeordnet, die Datierung bleibt diskutiert."],
    narmer: ["Frühdynastische Zeit – 1. Dynastie", "Zeremonielle/königliche Palette", "Schiefer", "Zeigt königliche Szenen und Symbole zur Vereinigung der beiden Länder und den Anfängen des Staates."],
    rosetta: ["Ptolemäische Zeit – 196 v. Chr.", "Königlicher Erlass in drei Schriftsystemen", "Granodiorit", "Die parallelen Texte in Hieroglyphen, Demotisch und Griechisch ermöglichten die Entzifferung der Hieroglyphen."],
    "tut-mask": ["Neues Reich – 18. Dynastie", "Totenmaske", "Gold und verschiedene Einlagen", "Teil der Grabausstattung des Königs; zeigt Goldschmiedekunst und funeräre Symbolik."],
    senusret: ["Mittleres Reich – 12. Dynastie", "Königsstatue", "Kalkstein", "Veranschaulicht die königliche Bildtradition des Mittleren Reiches und die Kontinuität königlicher Symbole."],
    "hat-shepsut": ["Neues Reich – 18. Dynastie", "Königliche und religiöse Statuen", "Verschiedene Gesteine", "Zeigt die Vielfalt der offiziellen Darstellungen Hatschepsuts, von osirischen Formen bis zur Königsgestalt."],
    canopic: ["Verschiedene Epochen des alten Ägypten", "Gefäße zur Aufbewahrung der inneren Organe bei der Mumifizierung", "Stein, Alabaster, Keramik und weitere Materialien", "Mit dem Schutz der Organe und den vier Horussöhnen verbunden; die Formen veränderten sich im Lauf der Zeit."],
    shabti: ["Mittleres Reich und spätere Zeit", "Symbolische Grabfiguren", "Holz, Stein, Keramik und Fayence", "Sollten Aufgaben für den Verstorbenen im Jenseits übernehmen; Anzahl und Inschriften variierten."],
    merneptah: ["Neues Reich – 19. Dynastie", "Königliche Siegesstele", "Granit", "Enthält einen Königstext, der im Zusammenhang eines Feldzugs in Kanaan eine Gruppe namens Israel erwähnt."],
    senet: ["Seit dem Alten Reich", "Brettspiel", "Holz, Elfenbein, Stein und weitere Materialien", "Ein beliebtes Spiel mit sozialen und symbolischen Bedeutungen, später auch in funerären Zusammenhängen."],
    palette: ["Naqada II/III", "Zeremonielle oder kosmetische Palette", "Stein", "Die Darstellungen helfen, Symbole, Herrschaft, Jagd und Kunst vor der Staatsbildung zu untersuchen."]
  },
  ru: {
    djoser: ["Древнее царство — III династия", "Царский погребальный комплекс", "Известняк", "Ранний важный этап развития строительства пирамид и каменной архитектуры."],
    khufu: ["Древнее царство — IV династия", "Царская погребальная пирамида", "Известняк и гранит", "Крупнейшая пирамида Гизы, свидетельствующая о высоком уровне организации и инженерного мастерства."],
    bent: ["Древнее царство — IV династия", "Царская погребальная пирамида", "Известняк", "Отражает важный экспериментальный этап развития пирамид с гладкими гранями."],
    "abu-simbel": ["Новое царство — XIX династия", "Два высеченных в скале храма", "Песчаник", "Связаны с царской и религиозной программой Рамсеса II в Нубии."],
    red: ["Древнее царство — IV династия", "Царская погребальная пирамида", "Известняк", "Связана с Снофру в Дахшуре; одна из первых завершённых пирамид с гладкими гранями."],
    sphinx: ["Древнее царство — IV династия", "Монументальная царская статуя при погребальном комплексе", "Естественная известняковая скала", "Сочетает тело льва и человеческую голову; обычно связывается с Хефреном, хотя датировка обсуждается."],
    narmer: ["Раннединастический период — I династия", "Церемониальная/царская палетка", "Сланец", "Изображает царские сцены и символы объединения Двух земель и становления государства."],
    rosetta: ["Птолемеевский период — 196 г. до н. э.", "Царский указ в трёх системах письма", "Гранодиорит", "Параллельные тексты на иероглифическом, демотическом и греческом языках помогли расшифровать иероглифы."],
    "tut-mask": ["Новое царство — XVIII династия", "Погребальная маска", "Золото и различные вставки", "Часть погребального убранства царя, демонстрирующая мастерство ювелиров и погребальную символику."],
    senusret: ["Среднее царство — XII династия", "Царская статуя", "Известняк", "Отражает традиции царского изображения Среднего царства и преемственность символов власти."],
    "hat-shepsut": ["Новое царство — XVIII династия", "Царские и религиозные статуи", "Различные породы камня", "Показывает разнообразие официальных образов Хатшепсут — от осирических форм до образа царя."],
    canopic: ["Разные периоды Древнего Египта", "Сосуды для хранения внутренних органов при мумификации", "Камень, алебастр, керамика и другие материалы", "Связаны с защитой органов и четырьмя сыновьями Хора; формы менялись со временем."],
    shabti: ["Среднее царство и позднее", "Символические погребальные фигурки", "Дерево, камень, керамика и фаянс", "Считалось, что они выполняют работу за умершего в загробном мире; число и надписи различались."],
    merneptah: ["Новое царство — XIX династия", "Царская победная стела", "Гранит", "Содержит царский текст с упоминанием группы под названием Израиль в контексте похода в Ханаан."],
    senet: ["Начиная с Древнего царства", "Настольная игра", "Дерево, слоновая кость, камень и другие материалы", "Популярная игра с социальным и символическим значением, позднее встречавшаяся и в погребальном контексте."],
    palette: ["Накада II/III", "Церемониальная или косметическая палетка", "Камень", "Изображения помогают изучать символику, власть, охоту и искусство до образования государства."]
  },
  ja: {
    djoser: ["古王国時代・第3王朝", "王の葬祭複合施設", "石灰岩", "ピラミッド建設と石造建築の発展初期を示す重要な遺構です。"],
    khufu: ["古王国時代・第4王朝", "王の葬祭ピラミッド", "石灰岩と花崗岩", "ギザ最大のピラミッドで、高度な組織力と工学技術を示しています。"],
    bent: ["古王国時代・第4王朝", "王の葬祭ピラミッド", "石灰岩", "真正ピラミッドの形が発展する過程の重要な試行段階を示します。"],
    "abu-simbel": ["新王国時代・第19王朝", "岩を掘って造られた二つの神殿", "砂岩", "ヌビアにおけるラムセス2世の王権・宗教政策に関連しています。"],
    red: ["古王国時代・第4王朝", "王の葬祭ピラミッド", "石灰岩", "ダハシュールのスネフェル王に関連し、完成した滑らかな側面を持つ初期のピラミッドの一つです。"],
    sphinx: ["古王国時代・第4王朝", "葬祭複合施設に関連する巨大な王の像", "自然の石灰岩", "ライオンの胴体と人間の頭部を組み合わせています。一般にカフラー王と関連づけられますが、年代には議論があります。"],
    narmer: ["初期王朝時代・第1王朝", "儀式用・王権を示すパレット", "片岩", "上下エジプトの統一と国家形成の始まりに関係する王の図像や象徴を描いています。"],
    rosetta: ["プトレマイオス朝時代・紀元前196年", "三つの文字体系で記された王の布告", "花崗閃緑岩", "ヒエログリフ、民衆文字、ギリシャ語の対照文がヒエログリフ解読に役立ちました。"],
    "tut-mask": ["新王国時代・第18王朝", "葬祭用マスク", "金と各種象嵌材料", "王の埋葬品の一部で、金工技術と葬祭の象徴性を示しています。"],
    senusret: ["中王国時代・第12王朝", "王の像", "石灰岩", "中王国時代の王の肖像表現と王権の象徴の継続を示します。"],
    "hat-shepsut": ["新王国時代・第18王朝", "王権・宗教に関わる彫像", "さまざまな石材", "オシリス風の姿から王としての表現まで、ハトシェプストの公式な図像の多様性を示します。"],
    canopic: ["古代エジプトのさまざまな時代", "ミイラ作りで内臓を保存する容器", "石、アラバスター、土器など", "内臓の保護とホルスの四人の息子に関連し、形は時代とともに変化しました。"],
    shabti: ["中王国時代以降", "象徴的な葬祭用小像", "木、石、土器、ファイアンス", "死者に代わって来世で労働すると信じられ、数や銘文はさまざまでした。"],
    merneptah: ["新王国時代・第19王朝", "王の戦勝碑", "花崗岩", "カナン遠征の文脈で「イスラエル」と呼ばれる集団に言及する王の碑文を含みます。"],
    senet: ["古王国時代以降", "盤上ゲーム", "木、象牙、石など", "社会的・象徴的な意味を持つ人気の遊戯で、後には葬祭の場面にも登場します。"],
    palette: ["ナカダII・III期", "儀式用または化粧用パレット", "石", "国家成立以前の象徴、権力、狩猟、芸術表現を研究する手がかりになります。"]
  },
  zh: {
    djoser: ["古王国时期—第三王朝", "皇家陵葬建筑群", "石灰岩", "体现了金字塔建造和石建筑发展的早期重要阶段。"],
    khufu: ["古王国时期—第四王朝", "皇家陵墓金字塔", "石灰岩和花岗岩", "吉萨规模最大的金字塔，体现了高水平的组织和工程能力。"],
    bent: ["古王国时期—第四王朝", "皇家陵墓金字塔", "石灰岩", "展示了真正金字塔形制发展过程中的重要试验阶段。"],
    "abu-simbel": ["新王国时期—第十九王朝", "两座岩窟神庙", "砂岩", "与拉美西斯二世在努比亚推行的王权和宗教工程有关。"],
    red: ["古王国时期—第四王朝", "皇家陵墓金字塔", "石灰岩", "与达舒尔的斯尼夫鲁有关，是较早建成的平滑侧面金字塔之一。"],
    sphinx: ["古王国时期—第四王朝", "与陵葬建筑群相关的巨型王室雕像", "天然石灰岩基岩", "结合了狮身和人头，通常与卡夫拉有关，但具体年代仍有学术讨论。"],
    narmer: ["早王朝时期—第一王朝", "礼仪或王权调色板", "片岩", "呈现与上下埃及统一及早期国家形成有关的王室图像和象征。"],
    rosetta: ["托勒密时期—公元前196年", "以三种文字书写的王室诏令", "花岗闪长岩", "其象形文字、世俗体和希腊文对照文本帮助学者释读象形文字。"],
    "tut-mask": ["新王国时期—第十八王朝", "葬礼面具", "黄金及多种镶嵌材料", "属于国王葬具的一部分，体现了金工技艺和葬礼象征意义。"],
    senusret: ["中王国时期—第十二王朝", "王室雕像", "石灰岩", "体现了中王国时期的王室肖像传统及王权象征的延续。"],
    "hat-shepsut": ["新王国时期—第十八王朝", "王室及宗教雕像", "多种石材", "展现了哈特谢普苏特官方形象的多样性，从奥西里斯式形象到国王形象。"],
    canopic: ["古埃及多个时期", "木乃伊制作时保存内脏的容器", "石材、雪花石膏、陶器等", "与保护内脏及荷鲁斯四子有关，器形随时代而变化。"],
    shabti: ["中王国时期及以后", "象征性的葬礼俑", "木材、石材、陶器和彩釉陶", "人们相信它们会在来世代替死者劳动，数量和铭文各不相同。"],
    merneptah: ["新王国时期—第十九王朝", "王室胜利石碑", "花岗岩", "碑文在迦南军事行动的背景下提及一个名为以色列的群体。"],
    senet: ["古王国时期起", "棋盘游戏", "木材、象牙、石材等", "一种具有社会和象征意义的流行游戏，后来也出现在葬礼场景中。"],
    palette: ["纳卡达二期/三期", "礼仪或化妆调色板", "石材", "其图像有助于研究国家形成前的象征、权力、狩猎和艺术表达。"]
  }
} as const;

const quiz = [
  {
    question: "أي موقع يرتبط بهرم زوسر المدرج؟",
    options: ["سقارة", "أبو سمبل", "الكرنك"],
    answer: 0,
    explanation: "يقع هرم زوسر المدرج في جبانة سقارة، ويرتبط بالملك زوسر من الأسرة الثالثة.",
  },
  {
    question: "في عهد أي ملك شُيد معبدا أبو سمبل؟",
    options: ["خوفو", "رمسيس الثاني", "زوسر"],
    answer: 1,
    explanation: "شُيد معبدا أبو سمبل في عهد رمسيس الثاني خلال الأسرة التاسعة عشرة.",
  },
  {
    question: "ما الوظيفة الأساسية للأهرامات الملكية؟",
    options: ["مخازن للحبوب", "مقابر ملكية ضمن مجمعات جنائزية", "أسواق تجارية"],
    answer: 1,
    explanation: "كانت الأهرامات جزءًا من مجمعات جنائزية ملكية مرتبطة بالدفن والعبادة الجنائزية.",
  },

  {
    question: "ما الاسم القديم لقرية الحرفيين الذين عملوا في مقابر الملوك بطيبة؟",
    options: ["دير المدينة", "منف", "تانيس"], answer: 0,
    explanation: "دير المدينة كانت قرية متخصصة للحرفيين والعمال المهرة المرتبطين بمقابر وادي الملوك والملكات."
  },
  {
    question: "أي ملك ارتبط ببناء الهرم الأحمر في دهشور؟",
    options: ["سنفرو", "خفرع", "أمنحتب الثالث"], answer: 0,
    explanation: "الهرم الأحمر أحد مشروعات الملك سنفرو في دهشور."
  },
  {
    question: "ما اللغات أو أنظمة الكتابة الموجودة على حجر رشيد؟",
    options: ["الهيروغليفية والديموطيقية واليونانية", "الهيراطيقية والقبطية واللاتينية", "المسمارية واليونانية والقبطية"], answer: 0,
    explanation: "يحمل حجر رشيد مرسومًا بثلاث نسخ: الهيروغليفية والديموطيقية واليونانية."
  },
  {
    question: "ما الوظيفة الأساسية للأواني الكانوبية؟",
    options: ["حفظ الأحشاء المحنطة", "تخزين الحبوب", "حفظ الحبر"], answer: 0,
    explanation: "استخدمت الأواني الكانوبية لحفظ أحشاء المتوفى ضمن طقوس التحنيط، مع اختلاف الممارسات عبر العصور."
  },
  {
    question: "أي معبد اشتهر بنقوشه عن حورس في إدفو؟",
    options: ["معبد إدفو", "معبد الأقصر", "معبد حتشبسوت"], answer: 0,
    explanation: "معبد إدفو مكرس لحورس ويضم نصوصًا طقسية وأساطير ونقوشًا بطلمية."
  },
  {
    question: "أين نُقلت معابد فيلة بعد مشروع الإنقاذ؟",
    options: ["جزيرة أجيلكيا", "هضبة الجيزة", "جزيرة إلفنتين"], answer: 0,
    explanation: "نُقلت منشآت فيلة إلى جزيرة أجيلكيا لحمايتها من ارتفاع مياه بحيرة ناصر."
  },
  {
    question: "بماذا اشتهرت مدينة أخناتون في تل العمارنة؟",
    options: ["عبادة آتون والعاصمة الجديدة", "بناء الهرم الأكبر", "صناعة حجر رشيد"], answer: 0,
    explanation: "أسس أخناتون أخت آتون عاصمة جديدة ارتبطت بتركيز العبادة الرسمية على آتون."
  },
  {
    question: "ما الذي تسجله برديات دير المدينة عن إضراب العمال؟",
    options: ["احتجاجًا بسبب تأخر حصص المؤن", "اعتراضًا على بناء الأهرامات", "نزاعًا على تجارة البردي"], answer: 0,
    explanation: "تسجل وثائق من عهد رمسيس الثالث احتجاج العمال بسبب تأخر توزيع المؤن والأجور العينية."
  },
  {
    question: "ما اسم الإله الذي ارتبطت به منف ومؤسساتها الدينية؟",
    options: ["بتاح", "حورس", "خنوم"], answer: 0,
    explanation: "كانت منف مركزًا مهمًا لعبادة بتاح، إلى جانب آلهة أخرى."
  },
  {
    question: "ما الذي يميز لوحة مرنبتاح في الدراسات التاريخية؟",
    options: ["ذكر اسم إسرائيل في نص مصري", "أول خريطة لمصر", "قاموس هيروغليفي كامل"], answer: 0,
    explanation: "تتضمن اللوحة أقدم إشارة مصرية معروفة عادةً إلى جماعة باسم إسرائيل."
  },
  {
    question: "ما الوظيفة الرمزية لتماثيل الأوشابتي؟",
    options: ["القيام بأعمال نيابة عن المتوفى", "حراسة مخازن القمح", "تحديد حدود الحقول"], answer: 0,
    explanation: "وُضعت الأوشابتي ضمن التجهيزات الجنائزية لتؤدي أعمالًا نيابة عن المتوفى وفق المعتقدات المصرية."
  },
  {
    question: "ما الغرض من نقل معابد أبو سمبل في القرن العشرين؟",
    options: ["حمايتها من ارتفاع مياه بحيرة ناصر", "توسيع طريق تجاري", "ترميمها بعد حريق"], answer: 0,
    explanation: "نُقلت المعابد ضمن حملة إنقاذ آثار النوبة لحمايتها من مياه بحيرة ناصر بعد إنشاء السد العالي."
  },
];

const features: {
  id: FeatureId;
  icon: typeof Clock3;
  titleKey: keyof typeof heritageExperienceCopy.ar;
  descKey: keyof typeof heritageExperienceCopy.ar;
  art: string;
}[] = [
  { id: "timeline", icon: Clock3, titleKey: "timeline", descKey: "timelineDesc", art: "timeline" },
  { id: "map", icon: MapPinned, titleKey: "map", descKey: "mapDesc", art: "map" },
  { id: "compare", icon: GitCompareArrows, titleKey: "compare", descKey: "compareDesc", art: "compare" },
  { id: "notebook", icon: NotebookPen, titleKey: "notebook", descKey: "notebookDesc", art: "notebook" },
  { id: "detective", icon: SearchCheck, titleKey: "detective", descKey: "detectiveDesc", art: "detective" },
];

export function HeritageExperiences() {
  const { lang } = useLanguage();
  const c = researcherLocaleCopy[lang] ?? researcherLocaleCopy.en;
  const optionNames = researcherOptionNames[lang as keyof typeof researcherOptionNames] ?? null;
  const [active, setActive] = useState<FeatureId | null>(null);
  const [selectedSite, setSelectedSite] = useState(sites[0].id);
  const [selectedMapPin, setSelectedMapPin] = useState("giza");
  const [mapCategory, setMapCategory] = useState<keyof typeof mapLegendNames.en>("all");
  const [period, setPeriod] = useState("all");
  const [firstArtifact, setFirstArtifact] = useState("djoser");
  const [secondArtifact, setSecondArtifact] = useState("khufu");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [notes, setNotes] = useState<{ id: number; title: string; body: string }[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("athara-research-notes") || "[]");
    } catch {
      return [];
    }
  });
  const [questionIndex, setQuestionIndex] = useState(-1);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showScore, setShowScore] = useState(false);
  const currentSite = sites.find((site) => site.id === selectedSite) ?? sites[0];
  const visibleSites = useMemo(
    () => (period === "all" ? sites : sites.filter((site) => site.period === period)),
    [period],
  );
  const first = artifacts.find((item) => item.id === firstArtifact) ?? artifacts[0];
  const second = artifacts.find((item) => item.id === secondArtifact) ?? artifacts[1];
  const saveNotes = (next: typeof notes) => {
    setNotes(next);
    try {
      localStorage.setItem("athara-research-notes", JSON.stringify(next));
    } catch {
      // Keep the current session usable if browser storage is unavailable.
    }
  };
  const startQuiz = () => {
    setQuestionIndex(0);
    setAnswers([]);
    setShowScore(false);
  };

  return (
    <>
      <section className="athara-experiences" aria-labelledby="athara-experiences-title">
        <div className="athara-experiences-heading">
          <span>{c.toolsEyebrow}</span>
          <h2 id="athara-experiences-title">{c.toolsTitle}</h2>
          <p>{c.toolsText}</p>
        </div>
        <div className="athara-experience-grid">
          {features.map(({ id, icon: Icon, titleKey, descKey, art }) => (
            <button key={id} type="button" className={`athara-experience-card athara-art-${art}`} onClick={() => setActive(id)} aria-label={`${c[titleKey]}: ${c[descKey]}`}>
              <span className="athara-experience-icon" aria-hidden="true"><Icon size={24} strokeWidth={1.8} /></span>
              <span className="athara-experience-copy">
                <strong>{c[titleKey]}</strong>
                <small>{c[descKey]}</small>
                <span className="athara-experience-open">{c.explore} <ChevronLeft size={15} /></span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {active && (
        <div className="athara-feature-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setActive(null); }}>
          <section className="athara-feature-panel" role="dialog" aria-modal="true" aria-label={c[features.find((f) => f.id === active)!.titleKey]}>
            <header className="athara-feature-header">
              <div>
                <span>𓂀 ATHARA</span>
                <h2>{c[features.find((f) => f.id === active)!.titleKey]}</h2>
              </div>
              <button type="button" onClick={() => setActive(null)} aria-label={c.close}><X /></button>
            </header>

            {active === "timeline" && (
              <div className="athara-feature-content">
                <label className="athara-field-label">{c.chooseSite}
                  <select value={selectedSite} onChange={(event) => setSelectedSite(event.target.value)}>
                    {sites.map((site) => <option key={site.id} value={site.id}>{optionNames?.sites[site.id as keyof typeof researcherOptionNames.fr.sites] ?? site.name}</option>)}
                  </select>
                </label>
                <div className="athara-timeline-hero">
                  <span>𓊹</span><strong>{currentSite.name}</strong><small>{currentSite.region}</small>
                </div>
                <div className="athara-timeline-list">
                  {currentSite.events.map((event, index) => (
                    <article key={event.title} className="athara-timeline-event">
                      <span className="athara-timeline-dot">{String(index + 1).padStart(2, "0")}</span>
                      <div><small>{event.date}</small><h3>{event.title}</h3><p>{event.detail}</p></div>
                    </article>
                  ))}
                </div>
                <p className="athara-feature-note">{c.timelineNote}</p>
              </div>
            )}

            {active === "map" && (
              <div className="athara-feature-content">
                <div className="athara-map-toolbar">
                  <label className="athara-field-label">{c.period}
                    <select value={period} onChange={(event) => setPeriod(event.target.value)}>
                      <option value="all">{c.allPeriods}</option>
                      <option value="oldKingdom">{c.oldKingdom}</option>
                      <option value="middleKingdom">{c.middleKingdom}</option>
                      <option value="newKingdom">{c.newKingdom}</option>
                      <option value="latePeriods">{c.latePeriods}</option>
                    </select>
                  </label>
                </div>
                <div className="athara-map-legend" role="group" aria-label={c.map}>
                  {(["all", "temples", "pyramids", "tombs", "museums", "fortresses", "other"] as const).map((category) => (
                    <button key={category} type="button" className={mapCategory === category ? "is-active" : ""} aria-pressed={mapCategory === category} onClick={() => setMapCategory(category)}>
                      {mapLegendNames[lang as keyof typeof mapLegendNames]?.[category] ?? mapLegendNames.en[category]}
                    </button>
                  ))}
                </div>
                <div className="athara-illustrated-map" role="group" aria-label={c.map}>
                  <span className="athara-illustrated-map-title" aria-hidden="true">مصر · أرض الحضارة</span>
                  {mapPins.filter((pin) => {
                    const members = pin.siteIds.map((id) => sites.find((site) => site.id === id)).filter(Boolean) as Site[];
                    return members.some((site) => visibleSites.some((visible) => visible.id === site.id) && (mapCategory === "all" || siteMapCategories[site.id] === mapCategory));
                  }).map((pin) => (
                    <button key={pin.id} type="button" className={`athara-illustrated-map-pin ${selectedMapPin === pin.id ? "is-selected" : ""}`} style={{ left: `${pin.left}%`, top: `${pin.top}%` }} onClick={() => {
                      setSelectedMapPin(pin.id);
                      const firstSite = pin.siteIds.map((id) => sites.find((site) => site.id === id)).find((site) => site && visibleSites.some((visible) => visible.id === site.id) && (mapCategory === "all" || siteMapCategories[site.id] === mapCategory));
                      if (firstSite) setSelectedSite(firstSite.id);
                    }} title={pin.name} aria-label={pin.name}>
                      <span>{pin.number}</span><small>{pin.name}</small>
                    </button>
                  ))}
                </div>
                <nav className="athara-map-site-list" aria-label={c.chooseSite}>
                  {mapPins.filter((pin) => pin.id === selectedMapPin).flatMap((pin) => pin.siteIds.map((id) => sites.find((site) => site.id === id)).filter((site): site is Site => Boolean(site))).filter((site) => visibleSites.some((visible) => visible.id === site.id) && (mapCategory === "all" || siteMapCategories[site.id] === mapCategory)).map((site, index) => (
                    <button key={site.id} type="button" className={selectedSite === site.id ? "is-selected" : ""} onClick={() => setSelectedSite(site.id)}>
                      <span>{index + 1}</span>{optionNames?.sites[site.id as keyof typeof researcherOptionNames.fr.sites] ?? site.name}
                    </button>
                  ))}
                </nav>
                <div className="athara-map-detail">
                  <Landmark size={20} /><div><strong>{currentSite.name}</strong><p>{currentSite.region} · {c[currentSite.period as keyof typeof c]}</p><small>{currentSite.events[0].detail}</small></div>
                </div>
                <p className="athara-feature-note">{c.mapNote}</p>
              </div>
            )}

            {active === "compare" && (
              <div className="athara-feature-content">
                <p className="athara-feature-note">{c.compareHint}</p>
                <div className="athara-compare-selects">
                  <label className="athara-field-label">{c.firstArtifact}<select value={firstArtifact} onChange={(event) => setFirstArtifact(event.target.value)}>{artifacts.map((item) => <option key={item.id} value={item.id}>{optionNames?.artifacts[item.id as keyof typeof researcherOptionNames.fr.artifacts] ?? item.name}</option>)}</select></label>
                  <label className="athara-field-label">{c.secondArtifact}<select value={secondArtifact} onChange={(event) => setSecondArtifact(event.target.value)}>{artifacts.map((item) => <option key={item.id} value={item.id}>{optionNames?.artifacts[item.id as keyof typeof researcherOptionNames.fr.artifacts] ?? item.name}</option>)}</select></label>
                </div>
                <div className="athara-compare-grid">
                  {[first, second].map((item, index) => (
                    <article key={index}><span className="athara-compare-mark">{index === 0 ? "𓏞" : "𓊹"}</span><h3>{optionNames?.artifacts[item.id as keyof typeof researcherOptionNames.fr.artifacts] ?? item.name}</h3><dl>
                      <dt>{c.period}</dt><dd>{localizedArtifactDetails[lang as keyof typeof localizedArtifactDetails]?.[item.id as keyof typeof localizedArtifactDetails.en]?.[0] ?? item.period}</dd><dt>{c.function}</dt><dd>{localizedArtifactDetails[lang as keyof typeof localizedArtifactDetails]?.[item.id as keyof typeof localizedArtifactDetails.en]?.[1] ?? item.function}</dd><dt>{c.material}</dt><dd>{localizedArtifactDetails[lang as keyof typeof localizedArtifactDetails]?.[item.id as keyof typeof localizedArtifactDetails.en]?.[2] ?? item.material}</dd><dt>{c.significance}</dt><dd>{localizedArtifactDetails[lang as keyof typeof localizedArtifactDetails]?.[item.id as keyof typeof localizedArtifactDetails.en]?.[3] ?? item.significance}</dd>
                    </dl></article>
                  ))}
                </div>
              </div>
            )}

            {active === "notebook" && (
              <div className="athara-feature-content">
                <form className="athara-notebook-form" onSubmit={(event) => { event.preventDefault(); if (!noteTitle.trim() || !noteBody.trim()) return; saveNotes([{ id: Date.now(), title: noteTitle.trim(), body: noteBody.trim() }, ...notes]); setNoteTitle(""); setNoteBody(""); }}>
                  <label className="athara-field-label">{c.noteTitle}<input value={noteTitle} onChange={(event) => setNoteTitle(event.target.value)} maxLength={100} required /></label>
                  <label className="athara-field-label">{c.notePlaceholder}<textarea value={noteBody} onChange={(event) => setNoteBody(event.target.value)} rows={4} maxLength={3000} required /></label>
                  <button className="athara-feature-primary" type="submit"><ScrollText size={17} />{c.saveNote}</button>
                </form>
                <div className="athara-notes-heading"><h3>{c.savedNotes}</h3><small>{c.localStorageNote}</small></div>
                {notes.length === 0 ? <p className="athara-feature-note">{c.noNotes}</p> : <div className="athara-notes-list">{notes.map((note) => <article key={note.id}><div><strong>{note.title}</strong><p>{note.body}</p></div><button type="button" onClick={() => saveNotes(notes.filter((item) => item.id !== note.id))} aria-label={c.deleteNote}><Trash2 size={17} /></button></article>)}</div>}
              </div>
            )}

            {active === "detective" && (
              <div className="athara-feature-content">
                {questionIndex < 0 ? <div className="athara-quiz-intro"><span>𓂀</span><h3>{c.detective}</h3><p>{c.detectiveDesc}</p><button className="athara-feature-primary" type="button" onClick={startQuiz}>{c.startQuiz}</button></div>
                : showScore ? <div className="athara-quiz-intro"><span>𓋹</span><h3>{c.score}: {answers.filter((answer, index) => answer === quiz[index].answer).length} / {quiz.length}</h3><button className="athara-feature-primary" type="button" onClick={startQuiz}>{c.restartQuiz}</button></div>
                : <div className="athara-quiz-question"><small>{c.question} {questionIndex + 1} {c.of} {quiz.length}</small><h3>{quiz[questionIndex].question}</h3><div className="athara-quiz-options">{quiz[questionIndex].options.map((option, index) => <button type="button" key={option} className={answers[questionIndex] === index ? "is-chosen" : ""} onClick={() => setAnswers((current) => { const next = [...current]; next[questionIndex] = index; return next; })}>{option}</button>)}</div>
                  {answers[questionIndex] !== undefined && <div className={`athara-quiz-feedback ${answers[questionIndex] === quiz[questionIndex].answer ? "is-correct" : ""}`}><strong>{answers[questionIndex] === quiz[questionIndex].answer ? c.correct : c.incorrect}</strong><p>{quiz[questionIndex].explanation}</p></div>}
                  <button className="athara-feature-primary" type="button" disabled={answers[questionIndex] === undefined} onClick={() => questionIndex === quiz.length - 1 ? setShowScore(true) : setQuestionIndex((current) => current + 1)}>{questionIndex === quiz.length - 1 ? c.showResult : c.nextQuestion}</button>
                </div>}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}