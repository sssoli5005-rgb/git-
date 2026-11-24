import { useMemo, useState } from "react";
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
    x: 70,
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
    y: 66,
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
    x: 38,
    y: 88,
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
    x: 76,
    y: 40,
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
    x: 63,
    y: 53,
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
    x: 79,
    y: 20,
    events: [
      { date: "العصر الانتقالي الثالث", title: "ازدهار تانيس", detail: "أصبحت تانيس مركزًا ملكيًا مهمًا في شمال شرق الدلتا خلال الأسرة الحادية والعشرين." },
      { date: "العصر المتأخر", title: "استمرار الأهمية", detail: "احتفظت المدينة بأهمية دينية وسياسية في فترات لاحقة من تاريخ مصر القديمة." },
      { date: "العصر الحديث", title: "اكتشاف المقابر الملكية", detail: "كشفت أعمال التنقيب عن مقابر ملكية ومقتنيات مهمة في جبانة تانيس." },
    ],
  },
];

const artifacts = [
  { id: "djoser", name: "هرم زوسر المدرج", period: "الدولة القديمة – الأسرة الثالثة", function: "مجمع جنائزي ملكي", material: "الحجر الجيري", significance: "مرحلة مبكرة بارزة في تطور بناء الأهرامات والعمارة الحجرية." },
  { id: "khufu", name: "هرم خوفو", period: "الدولة القديمة – الأسرة الرابعة", function: "هرم جنائزي ملكي", material: "الحجر الجيري والجرانيت", significance: "أكبر أهرامات الجيزة، ويعكس قدرات تنظيمية وهندسية كبيرة." },
  { id: "bent", name: "الهرم المنحني", period: "الدولة القديمة – الأسرة الرابعة", function: "هرم جنائزي ملكي", material: "الحجر الجيري", significance: "يوضح مرحلة تجريبية مهمة في تطوير شكل الهرم الكامل." },
  { id: "abu-simbel", name: "معبدا أبو سمبل", period: "الدولة الحديثة – الأسرة التاسعة عشرة", function: "معبدان منحوتان في الصخر", material: "الصخر الرملي", significance: "يرتبطان ببرنامج رمسيس الثاني الملكي والديني في النوبة." },
];

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
];

const features: {
  id: FeatureId;
  icon: typeof Clock3;
  symbol: string;
  titleKey: keyof typeof heritageExperienceCopy.ar;
  descKey: keyof typeof heritageExperienceCopy.ar;
  art: string;
}[] = [
  { id: "timeline", icon: Clock3, symbol: "𓆣", titleKey: "timeline", descKey: "timelineDesc", art: "timeline" },
  { id: "map", icon: MapPinned, symbol: "𓊹", titleKey: "map", descKey: "mapDesc", art: "map" },
  { id: "compare", icon: GitCompareArrows, symbol: "𓏞", titleKey: "compare", descKey: "compareDesc", art: "compare" },
  { id: "notebook", icon: NotebookPen, symbol: "𓏛", titleKey: "notebook", descKey: "notebookDesc", art: "notebook" },
  { id: "detective", icon: SearchCheck, symbol: "𓂀", titleKey: "detective", descKey: "detectiveDesc", art: "detective" },
];

export function HeritageExperiences() {
  const { lang } = useLanguage();
  const c = heritageExperienceCopy[lang === "ar" ? "ar" : "en"];
  const [active, setActive] = useState<FeatureId | null>(null);
  const [selectedSite, setSelectedSite] = useState(sites[0].id);
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
          {features.map(({ id, icon: Icon, symbol, titleKey, descKey, art }) => (
            <button key={id} type="button" className={`athara-experience-card athara-art-${art}`} onClick={() => setActive(id)}>
              <span className="athara-experience-symbol" aria-hidden="true">{symbol}</span>
              <span className="athara-experience-icon"><Icon size={20} /></span>
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
                    {sites.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}
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
                <div className="athara-schematic-map" role="img" aria-label={c.map}>
                  <div className="athara-map-nile" />
                  <span className="athara-map-compass">𓇳 N</span>
                  {visibleSites.map((site) => (
                    <button key={site.id} type="button" className={`athara-map-pin ${selectedSite === site.id ? "is-selected" : ""}`} style={{ left: `${site.x}%`, top: `${site.y}%` }} onClick={() => setSelectedSite(site.id)} title={site.name}>
                      <span>𓊹</span><small>{site.name}</small>
                    </button>
                  ))}
                  <span className="athara-map-label">وادي النيل</span>
                </div>
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
                  <label className="athara-field-label">{c.firstArtifact}<select value={firstArtifact} onChange={(event) => setFirstArtifact(event.target.value)}>{artifacts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                  <label className="athara-field-label">{c.secondArtifact}<select value={secondArtifact} onChange={(event) => setSecondArtifact(event.target.value)}>{artifacts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                </div>
                <div className="athara-compare-grid">
                  {[first, second].map((item, index) => (
                    <article key={index}><span className="athara-compare-mark">{index === 0 ? "𓏞" : "𓊹"}</span><h3>{item.name}</h3><dl>
                      <dt>{c.period}</dt><dd>{item.period}</dd><dt>{c.function}</dt><dd>{item.function}</dd><dt>{c.material}</dt><dd>{item.material}</dd><dt>{c.significance}</dt><dd>{item.significance}</dd>
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
