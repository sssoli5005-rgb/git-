import { useEffect, useRef, useState } from "react";
import {
  Camera,
  BookOpen,
  Landmark,
  Sparkles,
  Image as ImageIcon,
  X,
  Menu,
  MessageCircle,
  ChevronLeft,
  ShieldCheck,
  ScanLine,
} from "lucide-react";
import { useLanguage } from "@/i18n/language";
import {
  scannerCopy,
  scannerResultCopy,
  scannerWikipediaCopy,
  tourismCopy,
} from "@/i18n/translations";
import {
  createDocumentImageVariant,
  enhanceImageContrast,
  isLikelyMonochrome,
} from "@/lib/image-enhancement";

type ScanConfidence = Record<string, "high" | "medium" | "low" | "unavailable">;
type ScanDiagnostics = {
  provider?: string;
  usedFallback?: boolean;
};
type ScanVisualDescription = {
  object_type?: string;
  material?: string;
  symbols?: string[];
  style?: string;
  possible_location?: string;
};
type ScanArtifactCandidate = {
  name?: string;
  museum?: string;
  objectNumber?: string;
  location?: string;
  currentLocation?: string;
  findSpot?: string;
  period?: string;
  material?: string;
  provenance?: string;
  objectType?: string;
  description?: string;
  source?: string;
  url?: string;
  similarity?: number;
};

export function TouristHome({ onStartChat }: { onStartChat: () => void }) {
  const { lang } = useLanguage();
  const c = tourismCopy[lang as keyof typeof tourismCopy] ?? tourismCopy.en;
  const scanCopy = scannerCopy[lang];
  const resultCopy = scannerResultCopy[lang];
  const wikipediaUnavailableCopy = scannerWikipediaCopy[lang];
  const cameraAction =
    (
      {
        ar: "استخدم الكاميرا",
        en: "Use the camera",
        fr: "Utiliser la caméra",
        es: "Usar la cámara",
        it: "Usa la fotocamera",
        de: "Kamera verwenden",
        ru: "Использовать камеру",
        ja: "カメラを使う",
        zh: "使用相机",
      } as const
    )[lang] ?? "Use the camera";
  const [scannerOpen, setScannerOpen] = useState(false);
  const [artifactChoiceOpen, setArtifactChoiceOpen] = useState(false);
  const [scanMode, setScanMode] = useState<"objects" | "hieroglyphs">("objects");
  const [cameraError, setCameraError] = useState(true);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [captured, setCaptured] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanConfidence, setScanConfidence] = useState<ScanConfidence | null>(null);
  const [scanSources, setScanSources] = useState<
    Array<{ title: string; url: string; snippet?: string; source: string; trusted?: boolean }>
  >([]);
  const [scanWikipediaAvailable, setScanWikipediaAvailable] = useState<boolean | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [visionConsentRequired, setVisionConsentRequired] = useState(false);
  const [visionConsentChecked, setVisionConsentChecked] = useState(false);
  const [visionConsentSubmitting, setVisionConsentSubmitting] = useState(false);
  const [visionConsentError, setVisionConsentError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanAttempt, setScanAttempt] = useState(0);
  const [openInfo, setOpenInfo] = useState<"about" | "how" | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setCameraStarting(true);
    setScanError(null);
    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "المتصفح الحالي مش بيسمح بفتح الكاميرا. افتحي الموقع في Safari مباشرة أو استخدمي رفع الصورة.",
        );
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
      } catch (firstError) {
        // بعض إصدارات iOS لا تقبل قيود الكاميرا الخلفية؛ جرّبي طلبًا أبسط.
        stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
      }
      streamRef.current = stream;
      setCameraError(false);
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      const message =
        name === "NotAllowedError" || name === "SecurityError"
          ? "إذن الكاميرا مرفوض. افتحي إعدادات Safari للموقع واسمحي باستخدام الكاميرا، أو ارفعي صورة من الجهاز."
          : name === "NotFoundError" || name === "DevicesNotFoundError"
            ? "مش لاقيين كاميرا متاحة على الجهاز. تقدري ترفعي صورة محفوظة."
            : name === "NotReadableError" || name === "TrackStartError"
              ? "الكاميرا مستخدمة في تطبيق تاني. اقفلي التطبيق التاني وجربي تاني."
              : error instanceof Error
                ? error.message
                : "مش قادرين نشغّل الكاميرا دلوقتي. ارفعي صورة أو حاولي تاني.";
      setCameraError(true);
      setScanError(message);
    } finally {
      setCameraStarting(false);
    }
  };

  useEffect(() => {
    if (scannerOpen && !cameraError && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play().catch(() => {
        setCameraError(true);
        setScanError(
          "الكاميرا اتفتحت لكن المتصفح منع تشغيل الفيديو. اضغطي تشغيل الكاميرا مرة تانية.",
        );
      });
    }
    if (!scannerOpen) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, [scannerOpen, cameraError]);

  useEffect(() => {
    // لو الكاميرا غير متاحة، ما نبدأش تحليل فيديو فاضي، ونوقف مؤشر الانتظار.
    if (!scannerOpen || !captured) {
      setIsAnalyzing(false);
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    let timedOut = false;
    const requestTimeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 300000);
    setScanResult(null);
    setScanConfidence(null);
    setScanSources([]);
    setScanWikipediaAvailable(null);
    setScanError(null);
    setIsAnalyzing(true);
    const timer = window.setTimeout(
      async () => {
        try {
          let source: HTMLImageElement | HTMLVideoElement;
          if (captured) {
            const img = new Image();
            img.src = captured;
            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = () => reject(new Error("تعذر فتح الصورة."));
            });
            source = img;
          } else {
            const video = videoRef.current;
            if (!video) throw new Error("الكاميرا مش جاهزة. اقفل الماسح وافتحه تاني.");
            // استنى لحد ما المتصفح يستقبل أول إطار فعلي من الكاميرا بدل محاولة التحليل بعد وقت ثابت.
            if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth) {
              await new Promise<void>((resolve, reject) => {
                const timeout = window.setTimeout(() => {
                  cleanup();
                  reject(
                    new Error(
                      "الكاميرا اتفتحت لكن الصورة لسه موصلتش. اتأكد من إذن الكاميرا وجرّب تاني.",
                    ),
                  );
                }, 12000);
                const ready = () => {
                  if (video.videoWidth > 0 && video.videoHeight > 0) {
                    cleanup();
                    resolve();
                  }
                };
                const cleanup = () => {
                  window.clearTimeout(timeout);
                  video.removeEventListener("loadeddata", ready);
                  video.removeEventListener("playing", ready);
                  video.removeEventListener("resize", ready);
                };
                video.addEventListener("loadeddata", ready);
                video.addEventListener("playing", ready);
                video.addEventListener("resize", ready);
                ready();
              });
            }
            if (!video.videoWidth || !video.videoHeight)
              throw new Error("مش قادرين نقرأ إطار الكاميرا. جرّب تقفل الماسح وتفتحه تاني.");
            source = video;
          }
          const sourceWidth =
            source instanceof HTMLVideoElement ? source.videoWidth : source.naturalWidth;
          const sourceHeight =
            source instanceof HTMLVideoElement ? source.videoHeight : source.naturalHeight;
          if (!sourceWidth || !sourceHeight) throw new Error("تعذر قراءة أبعاد الصورة.");
          const scale = Math.min(1, 1800 / Math.max(sourceWidth, sourceHeight));
          const width = Math.round(sourceWidth * scale);
          const height = Math.round(sourceHeight * scale);
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext("2d");
          if (!context) throw new Error("تعذر تجهيز الصورة للتحليل.");
          context.drawImage(source, 0, 0, width, height);
          const image = canvas.toDataURL("image/jpeg", 0.9);
          const enhancedCanvas = document.createElement("canvas");
          enhancedCanvas.width = width;
          enhancedCanvas.height = height;
          const enhancedContext = enhancedCanvas.getContext("2d");
          if (!enhancedContext) throw new Error("تعذر تحسين تباين الصورة للتحليل.");
          const imageData = context.getImageData(0, 0, width, height);
          const documentImage =
            scanMode === "hieroglyphs" && isLikelyMonochrome(imageData.data)
              ? (() => {
                  const documentCanvas = document.createElement("canvas");
                  documentCanvas.width = width;
                  documentCanvas.height = height;
                  const documentContext = documentCanvas.getContext("2d");
                  if (!documentContext) throw new Error("تعذر تجهيز نسخة قراءة النقش للتحليل.");
                  const documentData = new ImageData(
                    createDocumentImageVariant(imageData.data, width, height),
                    width,
                    height,
                  );
                  documentContext.putImageData(documentData, 0, 0);
                  return documentCanvas.toDataURL("image/png");
                })()
              : undefined;
          imageData.data.set(enhanceImageContrast(imageData.data));
          enhancedContext.putImageData(imageData, 0, 0);
          const enhancedImage = enhancedCanvas.toDataURL("image/jpeg", 0.88);
          const searchCanvas = document.createElement("canvas");
          let searchScale = Math.min(1, 1200 / Math.max(sourceWidth, sourceHeight));
          let searchImage: string | undefined;
          for (let attempt = 0; attempt < 6; attempt++) {
            searchCanvas.width = Math.max(1, Math.round(sourceWidth * searchScale));
            searchCanvas.height = Math.max(1, Math.round(sourceHeight * searchScale));
            const searchContext = searchCanvas.getContext("2d");
            if (!searchContext) break;
            searchContext.drawImage(source, 0, 0, searchCanvas.width, searchCanvas.height);
            searchImage = searchCanvas.toDataURL("image/jpeg", 0.65);
            if (searchImage.length <= 640_000) break;
            searchScale *= 0.75;
          }
          if (searchImage && searchImage.length > 640_000) searchImage = undefined;
          const response = await fetch("/api/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image,
              ...(searchImage ? { searchImage } : {}),
              enhancedImage,
              ...(documentImage ? { documentImage } : {}),
              language: lang,
              mode: scanMode,
            }),
            signal: controller.signal,
          });
          const data = (await response.json()) as {
            ok?: boolean;
            analysis?: string;
            error?: string;
            detail?: string;
            sources?: Array<{
              title: string;
              url: string;
              snippet?: string;
              source: string;
              trusted?: boolean;
            }>;
            confidenceByField?: ScanConfidence;
            wikipediaAvailable?: boolean;
            licenseAgreementRequired?: boolean;
            visionDiagnostics?: ScanDiagnostics;
            reverseImageSearchStatus?: "unavailable" | "no_match" | "failed" | "match";
            visualDescription?: ScanVisualDescription;
            matchedArtifact?: ScanArtifactCandidate | null;
            candidates?: ScanArtifactCandidate[];
            identificationStatus?: "confirmed" | "probable" | "unverified";
            sourceStory?: string;
            researchCandidate?: {
              name?: string;
              museum?: string;
              location?: string;
              period?: string;
              description?: string;
              source?: string;
              url?: string;
              visuallyMatched?: boolean;
              status?: string;
            } | null;
          };
          const sourceAnalysis = data.analysis || "";
          let analysis = sourceAnalysis;
          if (data.visualDescription) {
            const visual = data.visualDescription;
            const details = [
              `${scanCopy.visualObjectType}: ${visual.object_type || scanCopy.visualUnknown}`,
              `${scanCopy.visualMaterial}: ${visual.material || scanCopy.visualUnknown}`,
              `${scanCopy.visualSymbols}: ${visual.symbols?.join(", ") || scanCopy.visualUnknown}`,
              `${scanCopy.visualStyle}: ${visual.style || scanCopy.visualUnknown}`,
              `${scanCopy.visualPossibleLocation}: ${visual.possible_location || scanCopy.visualUnknown}`,
            ];
            if (data.matchedArtifact) {
              const match = data.matchedArtifact;
              details.push(
                `${scanCopy.visualMatch}: ${match.name || scanCopy.visualUnknown}`,
                `${scanCopy.visualMuseum}: ${match.museum || scanCopy.visualUnknown}`,
                `${scanCopy.visualObjectNumber}: ${match.objectNumber || scanCopy.visualUnknown}`,
              );
              if (typeof match.similarity === "number") {
                details.push(`${scanCopy.visualSimilarity}: ${match.similarity.toFixed(3)}`);
              }
              const sourceText = data.sources?.[0]?.snippet?.trim();
              if (sourceText) details.push(sourceText);
            } else {
              details.push(scanCopy.visualUnconfirmed);
              const candidates = Array.isArray(data.candidates) ? data.candidates : [];
              if (candidates.length > 0) {
                details.push(
                  scanCopy.visualCandidates,
                  ...candidates.map(
                    (candidate, index) =>
                      `${index + 1}. ${candidate.name || scanCopy.visualUnknown} — ${
                        typeof candidate.similarity === "number"
                          ? candidate.similarity.toFixed(3)
                          : scanCopy.visualUnknown
                      }`,
                  ),
                );
              }
            }
            analysis = details.join("\n");
          }
          if (scanMode === "objects") {
            const candidates = Array.isArray(data.candidates) ? data.candidates : [];
            const bestVisualCandidate = candidates
              .filter((candidate) =>
                Boolean(candidate.name) &&
                typeof candidate.similarity === "number" &&
                Number.isFinite(candidate.similarity),
              )
              .sort((left, right) => (right.similarity ?? -1) - (left.similarity ?? -1))[0];
            // Use the structured artifact record first. A ranked visual candidate is
            // shown only when the scanner itself marked the identification as probable.
            const artifact = data.matchedArtifact ||
              (data.identificationStatus === "probable" ? bestVisualCandidate : null);
            const isIdentified = data.identificationStatus === "confirmed" ||
              data.identificationStatus === "probable";
            const identificationLabel = data.identificationStatus === "confirmed"
              ? resultCopy.confirmedStatus
              : data.identificationStatus === "probable"
                ? resultCopy.probableStatus
                : resultCopy.unverifiedStatus;

            if (isIdentified && artifact?.name) {
              // A museum or publisher is not automatically the archaeological site's location.
              const displayLocation =
                artifact.currentLocation || artifact.location || artifact.museum || "";
              const story = (data.sourceStory || artifact.description ||
                data.sources?.find((source) => source.trusted)?.snippet || "")
                .replace(/https?:\/\/\S+/g, "")
                .replace(/^(?:قصتها|القصة|من وصف المصدر|Story|Description|From the source description)\s*[:：-]\s*/i, "")
                .replace(/\n{3,}/g, "\n\n")
                .trim()
                .slice(0, 1800);
              const details = story || (artifact.period
                ? `${resultCopy.periodLabel}: ${artifact.period}`
                : "");
              analysis = [
                identificationLabel,
                `${resultCopy.nameLabel}: ${artifact.name}`,
                displayLocation ? `${resultCopy.locationLabel}: ${displayLocation}` : "",
                details ? `${resultCopy.storyLabel}: ${details}` : "",
              ].filter(Boolean).join("\n\n");
            } else if (data.researchCandidate?.name) {
              // Show the best trusted catalogue lead as a research candidate, not
              // as a visually confirmed identification.
              const lead = data.researchCandidate;
              const leadStory = (lead.description || data.sourceStory || "")
                .replace(/https?:\/\/\S+/g, "")
                .replace(/\n{3,}/g, "\n\n")
                .trim()
                .slice(0, 1200);
              const leadDetails = [
                leadStory,
                lead.period ? `${resultCopy.periodLabel}: ${lead.period}` : "",
                lang === "ar"
                  ? "الاسم والمعلومات من سجل مرتبط بنتائج البحث، وليست تأكيدًا أن الصورة للقطعة نفسها."
                  : "This related catalogue record does not confirm that the image shows this exact object.",
              ].filter(Boolean).join(" ");
              analysis = [
                resultCopy.unverifiedStatus,
                `اسم مرشح يحتاج مطابقة: ${lead.name}`,
                lead.location || lead.museum
                  ? `المكان المذكور في المصدر: ${lead.location || lead.museum}`
                  : "",
                leadDetails ? `${resultCopy.storyLabel}: ${leadDetails}` : "",
              ].filter(Boolean).join("\n\n");
            } else {
              // Keep the model's actual first-pass identification visible.
              // A missing catalog/image match changes the confidence label; it must
              // not erase a useful visual hypothesis returned in data.analysis.
              const cleanText = (value: unknown) => String(value || "")
                .replace(/https?:\/\/\S+/g, "")
                .replace(/\n{3,}/g, "\n\n")
                .trim();
              const analysisSections = sourceAnalysis.split(/\n(?=\d+\.\s)/);
              const sectionText = (number: number) => {
                const block = analysisSections.find((part) =>
                  new RegExp("^" + number + "\\.\\s").test(part.trim()),
                );
                return block ? cleanText(block.trim().replace(/^\d+\.\s*[^\n]*\n?/, "")) : "";
              };
              const initialIdentification = sectionText(1);
              const initialLocation = sectionText(2);
              const initialStory = sectionText(3);
              // Some older worker responses put an uncertainty sentence before
              // a useful candidate name in the same paragraph. Extract that name
              // explicitly instead of treating the whole paragraph as a failure.
              const embeddedCandidateName = sourceAnalysis.match(
                /(?:اسم\\s+(?:محتمل|مرشح)(?:\\s+غير\\s+مؤكد)?|(?:possible|candidate)\\s+name)\\s*[:：-]\\s*([^\\n]+)/i,
              )?.[1]?.trim() || "";
              const lead = data.researchCandidate ||
                candidates.find((candidate) => Boolean(candidate.name && candidate.url)) ||
                (embeddedCandidateName ? { name: embeddedCandidateName } : null);
              const trustedSource = data.sources?.find((source) => source.trusted);
              const story = cleanText(
                lead?.description || data.sourceStory || trustedSource?.snippet || initialStory,
              );
              const reliableLocation = cleanText(lead?.location || lead?.museum ||
                (data.confidenceByField?.place === "high" || data.confidenceByField?.place === "medium"
                  ? initialLocation
                  : ""));
              const initialTextIsOnlyFailure =
                !initialIdentification ||
                /^(?:لم يتم التأكد|لم أستطع تحديد|لا أستطيع تحديد|غير مؤكد|unknown|not identified|not confirmed)/i
                  .test(initialIdentification);
              const nameOrVisualLead = lead?.name
                ? `اسم مرشح يحتاج تأكيدًا: ${lead.name}`
                : !initialTextIsOnlyFailure
                  ? `التعرّف المبدئي من الصورة: ${initialIdentification}`
                  : "";
              const fallbackNarrative = !nameOrVisualLead && !story
                ? cleanText(sourceAnalysis)
                    .replace(/^(?:لم يتم تأكيد هوية القطعة|لم أستطع تحديد القطعة من الصورة)[^\\n]*\\n?/i, "")
                    .slice(0, 1100)
                : "";
              const uncertaintyNote = nameOrVisualLead || story || fallbackNarrative
                ? (lang === "ar"
                  ? "المعلومات المبدئية لا تعني أن المطابقة البصرية مع سجل المتحف قد تأكدت."
                  : "These preliminary details do not mean that a visual match to the museum record has been confirmed.")
                : (lang === "ar"
                  ? "لم يظهر اسم مفيد للقطعة في هذه المحاولة. جرّبي صورة أوضح أو زاوية أمامية."
                  : resultCopy.notIdentified);
              const fallbackDetails = [
                story || fallbackNarrative,
                lead?.period ? `${resultCopy.periodLabel}: ${lead.period}` : "",
                uncertaintyNote,
              ].filter(Boolean).join(" ");
              analysis = [
                resultCopy.unverifiedStatus,
                nameOrVisualLead,
                reliableLocation ? `المكان الوارد في المصدر: ${reliableLocation}` : "",
                fallbackDetails ? `${resultCopy.storyLabel}: ${fallbackDetails}` : "",
              ].filter(Boolean).join("\n\n");
            }
          }

          if (!cancelled) {
            setScanResult(analysis);
            setScanSources(Array.isArray(data.sources) ? data.sources : []);
            setScanConfidence(data.confidenceByField ?? null);
            setScanWikipediaAvailable(data.wikipediaAvailable ?? null);
            setVisionConsentRequired(data.licenseAgreementRequired === true);
            setVisionConsentChecked(false);
            setVisionConsentError("");
          }
        } catch (error) {
          if (!cancelled) {
            if (timedOut) {
              setScanError(scanCopy.analysisTimeout);
            } else if (!(error instanceof DOMException && error.name === "AbortError")) {
              setScanError(
                error instanceof Error ? error.message : "حصلت مشكلة أثناء تحليل الصورة.",
              );
            }
          }
        } finally {
          window.clearTimeout(requestTimeout);
          if (!cancelled) setIsAnalyzing(false);
        }
      },
      captured ? 250 : 300,
    );
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.clearTimeout(requestTimeout);
      controller.abort();
    };
  }, [scannerOpen, captured, cameraError, scanMode, lang, scanAttempt, resultCopy, scanCopy]);

  const acceptVisionLicense = async () => {
    if (!visionConsentChecked || visionConsentSubmitting) {
      setVisionConsentError(scanCopy.licenseConfirmationRequired);
      return;
    }

    setVisionConsentSubmitting(true);
    setVisionConsentError("");
    try {
      const response = await fetch("/api/vision-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ confirmed: true }),
      });
      const result = await response.json().catch(() => null) as { accepted?: boolean } | null;
      if (!response.ok || result?.accepted !== true) {
        throw new Error("Vision model consent request failed.");
      }

      setVisionConsentRequired(false);
      setScanResult(null);
      setScanSources([]);
      setScanError(null);
      setScanAttempt((current) => current + 1);
    } catch {
      setVisionConsentError(scanCopy.licenseAcceptError);
    } finally {
      setVisionConsentSubmitting(false);
    }
  };

  const categories = [
    { id: "artifacts", icon: Landmark, title: c.artifacts, desc: c.artifactsDesc, symbol: "𓂀" },
    {
      id: "hieroglyphs",
      icon: ScanLine,
      title: c.hieroglyphs,
      desc: c.hieroglyphsDesc,
      symbol: "𓋹",
    },
    { id: "stories", icon: BookOpen, title: c.stories, desc: c.storiesDesc, symbol: "𓏏" },
    { id: "heritage", icon: Sparkles, title: c.heritage, desc: c.heritageDesc, symbol: "𓆣" },
  ];
  return (
    <div className="egypt-app min-h-screen" dir={lang === "ar" ? "rtl" : "ltr"}>
      <header className="egypt-header">
        <a href="/" className="egypt-brand" aria-label={c.home}>
          <span className="egypt-brand-mark">𓂀</span>
          <span>
            <strong>{lang === "ar" ? "أثَرة" : "ATHARA"}</strong>
            <small>{c.brandSub}</small>
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-7">
          <a className="egypt-nav-chat" href="#discover">
            {lang === "ar" ? "ابدأ الاستكشاف" : "Explore"}
          </a>
        </nav>
        <div className="egypt-header-actions">
          <button className="md:hidden egypt-menu" aria-label={c.menu}>
            <Menu />
          </button>
        </div>
      </header>

      <main>
        <section
          className={`egypt-quick-start${openInfo ? " has-open-info" : ""}`}
          aria-label={lang === "ar" ? "ابدأ من هنا" : "Start here"}
        >
          <button
            type="button"
            className={`egypt-quick-card egypt-quick-about ${openInfo === "about" ? "is-active" : ""}`}
            aria-expanded={openInfo === "about"}
            aria-controls="about"
            onClick={() => {
              setOpenInfo(openInfo === "about" ? null : "about");
            }}
          >
            <span className="egypt-quick-symbol">𓂀</span>
            <span className="egypt-quick-copy">
              <strong>{lang === "ar" ? "معلومات عن الموقع" : "About the website"}</strong>
              <small>
                {lang === "ar" ? "اضغط لعرض نبذة عن أثَرة" : "Tap to learn about ATHARA"}
              </small>
            </span>
            <span className="egypt-quick-arrow">{openInfo === "about" ? "−" : "+"}</span>
          </button>
          <button
            type="button"
            className={`egypt-quick-card egypt-quick-how ${openInfo === "how" ? "is-active" : ""}`}
            aria-expanded={openInfo === "how"}
            aria-controls="how"
            onClick={() => {
              setOpenInfo(openInfo === "how" ? null : "how");
            }}
          >
            <span className="egypt-quick-symbol">𓏏</span>
            <span className="egypt-quick-copy">
              <strong>{lang === "ar" ? "كيفية الاستخدام" : "How to use"}</strong>
              <small>
                {lang === "ar"
                  ? "اضغط لعرض خطوات استخدام الشات والماسح"
                  : "Tap to see how to use chat and scanner"}
              </small>
            </span>
            <span className="egypt-quick-arrow">{openInfo === "how" ? "−" : "+"}</span>
          </button>
        </section>
        {openInfo === "how" && (
          <section id="how" className="egypt-how">
            <div>
              <span>{c.howLabel}</span>
              <h2>{c.howTitle}</h2>
            </div>
            <div className="egypt-how-steps">
              <article>
                <b>01</b>
                <strong>{c.stepOne}</strong>
                <p>{c.stepOneText}</p>
              </article>
              <article>
                <b>02</b>
                <strong>{c.stepTwo}</strong>
                <p>{c.stepTwoText}</p>
              </article>
              <article>
                <b>03</b>
                <strong>{c.stepThree}</strong>
                <p>{c.stepThreeText}</p>
              </article>
            </div>
          </section>
        )}
        {openInfo === "about" && (
          <section id="about" className="egypt-about-section">
            <span className="egypt-eyebrow">
              {lang === "ar" ? "مرحبًا بيك في أثَرة" : "WELCOME TO ATHARA"}
            </span>
            <h1>
              {lang === "ar" ? "اكتشف حكاية كل أثر" : "Discover the story behind every artifact"}
            </h1>
            <p>
              {lang === "ar"
                ? "أثَرة دليل سياحي رقمي بيساعدك تتعرف على الآثار المصرية والكتابة الهيروغليفية والأماكن التاريخية والحكايات المرتبطة بيها. اسأل المرشد أو استخدم الماسح لتحليل صورة، مع توضيح الفرق بين المعلومات الموثقة والروايات والأساطير."
                : "ATHARA is a digital heritage guide to Egyptian artifacts, hieroglyphs, historic places and their stories. Ask the guide or scan an image, with a clear distinction between documented facts, interpretations and legends."}
            </p>
          </section>
        )}

        <section id="discover" className="egypt-section">
          <div className="egypt-section-heading">
            <span className="egypt-discover-label">{c.discoverLabel}</span>
            <h2>{c.discoverTitle}</h2>
            <p>{c.discoverText}</p>
          </div>
          <div className="egypt-category-grid">
            {categories.map(({ id, icon: Icon, title, desc, symbol }) => (
              <button
                className={`egypt-category-card egypt-category-${id}`}
                key={title}
                onClick={() => {
                  if (id === "artifacts" || id === "hieroglyphs") {
                    setScanMode(id === "hieroglyphs" ? "hieroglyphs" : "objects");
                    setArtifactChoiceOpen(true);
                  } else onStartChat();
                }}
              >
                <span className="egypt-card-symbol">{symbol}</span>
                <span className="egypt-card-icon">
                  <Icon size={19} />
                </span>
                <strong>{title}</strong>
                <small>{desc}</small>
                <span className="egypt-card-arrow">←</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer className="egypt-footer">
        <span>𓂀</span>
        <strong>{lang === "ar" ? "أثَرة" : "ATHARA"}</strong>
        <p>{c.footerText}</p>
        <button onClick={onStartChat}>
          <MessageCircle size={16} />
          {lang === "ar" ? "اسأل المرشد" : "Ask the guide"}
        </button>
      </footer>

      {artifactChoiceOpen && (
        <div
          className="egypt-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={lang === "ar" ? "اختار طريقة الاستكشاف" : "Choose how to explore"}
        >
          <div className="egypt-scanner-modal">
            <div className="egypt-modal-head">
              <div>
                <span>{lang === "ar" ? "ابدأ من هنا" : "START HERE"}</span>
                <h2>
                  {lang === "ar"
                    ? scanMode === "hieroglyphs"
                      ? "تحب تعمل إيه في الكتابة الهيروغليفية؟"
                      : "تحب تعمل إيه في الآثار؟"
                    : scanMode === "hieroglyphs"
                      ? "How would you like to explore hieroglyphs?"
                      : "How would you like to explore artifacts?"}
                </h2>
              </div>
              <button onClick={() => setArtifactChoiceOpen(false)} aria-label={c.close}>
                <X />
              </button>
            </div>
            <div className="egypt-category-grid">
              <button
                className="egypt-category-card"
                onClick={() => {
                  setArtifactChoiceOpen(false);
                  onStartChat();
                }}
              >
                <span className="egypt-card-symbol">𓋹</span>
                <span className="egypt-card-icon">
                  <MessageCircle size={19} />
                </span>
                <strong>{lang === "ar" ? "الشات" : "Chat"}</strong>
                <small>
                  {lang === "ar"
                    ? scanMode === "hieroglyphs"
                      ? "اسأل المرشد عن العلامات ومعاني الكتابة القديمة"
                      : "اسأل المرشد عن أي أثر أو معلومة تاريخية"
                    : scanMode === "hieroglyphs"
                      ? "Ask about ancient signs and writing"
                      : "Ask the guide about artifacts and history"}
                </small>
                <span className="egypt-card-arrow">←</span>
              </button>
              <button
                className="egypt-category-card"
                onClick={() => {
                  setArtifactChoiceOpen(false);
                  setCaptured(null);
                  setScanResult(null);
                  setScanSources([]);
                  setScanError(null);
                  setScannerOpen(true);
                }}
              >
                <span className="egypt-card-symbol">{scanMode === "hieroglyphs" ? "𓋹" : "𓁟"}</span>
                <span className="egypt-card-icon">
                  <ScanLine size={19} />
                </span>
                <strong>{lang === "ar" ? "الماسح الضوئي" : "Scanner"}</strong>
                <small>
                  {lang === "ar"
                    ? scanMode === "hieroglyphs"
                      ? "صوّر النقش عشان أثَرة يحلل العلامات الظاهرة"
                      : "صوّر القطعة الأثرية عشان أثَرة يحللها"
                    : scanMode === "hieroglyphs"
                      ? "Photograph an inscription for ATHARA to analyze"
                      : "Photograph an artifact for ATHARA to analyze"}
                </small>
                <span className="egypt-card-arrow">←</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {scannerOpen && (
        <div
          className="egypt-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={c.cameraTitle}
        >
          <div className="egypt-scanner-modal">
            <div className="egypt-modal-head">
              <div>
                <span>{c.scannerEyebrow}</span>
                <h2>
                  {scanMode === "objects"
                    ? lang === "ar"
                      ? "ماسح الآثار"
                      : "Artifact scanner"
                    : lang === "ar"
                      ? "ماسح الكتابة الهيروغليفية"
                      : "Hieroglyphic scanner"}
                </h2>
              </div>
              <button onClick={() => setScannerOpen(false)} aria-label={c.close}>
                <X />
              </button>
            </div>
            <div className="egypt-camera-view">
              {captured ? (
                <img src={captured} alt={c.capturedImage} />
              ) : cameraError ? (
                <div className="egypt-camera-fallback">
                  <Camera size={38} />
                  <b>{lang === "ar" ? "شغّلي الكاميرا من هنا" : "Start the camera here"}</b>
                  <p>
                    {lang === "ar"
                      ? "اضغطي للسماح للمتصفح بفتح الكاميرا، أو ارفعي صورة محفوظة."
                      : "Tap to allow the browser to open the camera, or upload a saved image."}
                  </p>
                  <button
                    type="button"
                    className="egypt-gold-button"
                    disabled={cameraStarting}
                    onClick={() => void startCamera()}
                  >
                    {cameraStarting
                      ? lang === "ar"
                        ? "جاري تشغيل الكاميرا..."
                        : "Starting camera..."
                      : lang === "ar"
                        ? "تشغيل الكاميرا"
                        : "Start camera"}
                  </button>
                </div>
              ) : (
                <video ref={videoRef} autoPlay playsInline muted />
              )}
              {!captured && !cameraError && (
                <div className="egypt-camera-frame">
                  <i />
                  <i />
                  <i />
                  <i />
                  <span>𓂀</span>
                </div>
              )}
            </div>
            {!captured && (
              <p className="egypt-camera-tip">
                {scanMode === "objects"
                  ? lang === "ar"
                    ? "ينفع تصوّر القطعة بالكاميرا أو ترفع صورة محفوظة، حتى لو صورة أبيض وأسود من كتاب. أثَرة هتحللها بنفس الطريقة."
                    : "Capture the object or upload a saved image, including a black-and-white book photo. ATHARA analyzes them the same way."
                  : lang === "ar"
                    ? "ينفع تصوّر النقش أو ترفع صورة محفوظة ليه، حتى لو من كتاب أو أبيض وأسود."
                    : "Capture the inscription or upload a saved image, including a black-and-white book photo."}
              </p>
            )}
            {isAnalyzing && (
              <div className="egypt-scan-notice">
                <Sparkles size={18} />
                <p>
                  {lang === "ar"
                    ? "جاري تحليل الصورة تلقائيًا..."
                    : "Analyzing the image automatically..."}
                </p>
              </div>
            )}
            {scanError && (
              <div className="egypt-scan-notice">
                <ShieldCheck size={18} />
                <p>{scanError}</p>
                <button
                  className="egypt-outline-button"
                  onClick={() => {
                    setScanError(null);
                    setScanAttempt((value) => value + 1);
                  }}
                >
                  {" "}
                  {lang === "ar" ? "حاول تاني" : "Try again"}
                </button>
              </div>
            )}
            {scanResult && (
              <div className="egypt-scan-notice egypt-scan-result">
                <ShieldCheck size={18} />
                <div>
                  <strong>{resultCopy.title}</strong>
                  <div className="mt-3 space-y-3 text-sm leading-7">
                    {scanResult.split(/\n{2,}/).map((paragraph, index) => {
                      const separator = paragraph.indexOf(": ");
                      return (
                        <p key={index}>
                          {separator > 0 ? (
                            <>
                              <strong>{paragraph.slice(0, separator + 1)}</strong>
                              {paragraph.slice(separator + 1)}
                            </>
                          ) : paragraph}
                        </p>
                      );
                    })}
                  </div>
                  {visionConsentRequired && (
                    <div className="mt-4 space-y-3 border-t border-current/20 pt-4">
                      <h3 className="font-bold">{scanCopy.licenseTitle}</h3>
                      <p className="text-sm">{scanCopy.licenseDescription}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <a
                          href="https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE"
                          target="_blank"
                          rel="noreferrer"
                          className="underline font-medium"
                        >
                          {scanCopy.licenseLink}
                        </a>
                        <a
                          href="https://www.llama.com/llama3_2/use-policy/"
                          target="_blank"
                          rel="noreferrer"
                          className="underline font-medium"
                        >
                          {scanCopy.acceptableUseLink}
                        </a>
                      </div>
                      <label className="flex items-start gap-3 text-sm leading-6">
                        <input
                          type="checkbox"
                          checked={visionConsentChecked}
                          onChange={(event) => {
                            setVisionConsentChecked(event.target.checked);
                            setVisionConsentError("");
                          }}
                          className="mt-1 h-5 w-5 shrink-0 accent-primary"
                        />
                        <span>{scanCopy.licenseConfirmation}</span>
                      </label>
                      {visionConsentError && (
                        <p role="alert" className="text-sm text-destructive">
                          {visionConsentError}
                        </p>
                      )}
                      <button
                        type="button"
                        className="egypt-gold-button"
                        disabled={!visionConsentChecked || visionConsentSubmitting}
                        onClick={() => void acceptVisionLicense()}
                      >
                        {visionConsentSubmitting
                          ? scanCopy.licenseAccepting
                          : scanCopy.licenseAcceptButton}
                      </button>
                    </div>
                  )}
                  <details className="mt-4 border-t border-current/15 pt-3">
                    <summary className="cursor-pointer font-semibold">
                      {resultCopy.showReferences}
                    </summary>
                    <div className="mt-2">
                      <p className="text-xs opacity-75">{scanCopy.referenceDisclaimer}</p>
                      {scanSources.length > 0 ? (
                        <ul className="mt-2 space-y-1">
                          {[...scanSources]
                            .sort((a, b) => Number(Boolean(b.trusted)) - Number(Boolean(a.trusted)))
                            .slice(0, 2)
                            .map((source, index) => {
                              const label = (source.source || source.title || "").trim();
                              const shortLabel = label.length > 34 ? label.slice(0, 31) + "…" : label;
                              return (
                                <li key={source.url + index}>
                                  <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    title={source.title}
                                    className="inline-block max-w-full truncate text-xs underline font-medium"
                                  >
                                    {shortLabel || (lang === "ar" ? "فتح المصدر" : "Open source")}
                                  </a>
                                </li>
                              );
                            })}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm">{scanCopy.noSources}</p>
                      )}
                    </div>
                  </details>
                </div>
              </div>
            )}
            <div className="egypt-modal-actions">
              {!captured && !cameraError && (
                <button
                  className="egypt-gold-button"
                  type="button"
                  onClick={() => {
                    const video = videoRef.current;
                    if (!video || !video.videoWidth || !video.videoHeight) {
                      setScanError(
                        lang === "ar"
                          ? "الكاميرا لسه بتجهز. استني لحظة وجربي تاني."
                          : "The camera is still starting. Wait a moment and try again.",
                      );
                      return;
                    }
                    const scale = Math.min(1, 1800 / Math.max(video.videoWidth, video.videoHeight));
                    const canvas = document.createElement("canvas");
                    canvas.width = Math.round(video.videoWidth * scale);
                    canvas.height = Math.round(video.videoHeight * scale);
                    const context = canvas.getContext("2d");
                    if (!context) {
                      setScanError(
                        lang === "ar"
                          ? "مش قادرين نجهز الصورة للتحليل."
                          : "Could not prepare the image for analysis.",
                      );
                      return;
                    }
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    setScanError(null);
                    setScanResult(null);
                    setCaptured(canvas.toDataURL("image/jpeg", 0.9));
                  }}
                >
                  <Camera size={17} />
                  {lang === "ar" ? "التقط صورة وحللها" : "Capture and analyze"}
                </button>
              )}
              <label className="egypt-outline-button" htmlFor="athara-gallery-upload">
                <ImageIcon size={17} />
                {lang === "ar"
                  ? "ارفع صورة من الموبايل أو كتاب أو صورة فوتوغرافية"
                  : "Upload a phone, book, or photograph image"}
              </label>
              <input
                id="athara-gallery-upload"
                className="sr-only"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const input = event.currentTarget;
                  const selectedFile = input.files?.[0];
                  input.value = "";
                  if (!selectedFile) return;
                  if (!selectedFile.type.startsWith("image/")) {
                    setScanError(
                      lang === "ar"
                        ? "الملف ده مش صورة. اختاري صورة من ألبوم الصور أو الملفات."
                        : "This file is not an image. Choose a photo.",
                    );
                    return;
                  }
                  if (selectedFile.size > 20 * 1024 * 1024) {
                    setScanError(
                      lang === "ar"
                        ? "حجم الصورة أكبر من 20 ميجابايت. اختاري صورة أصغر."
                        : "The image is larger than 20 MB. Choose a smaller photo.",
                    );
                    return;
                  }
                  setCaptured(null);
                  setScanResult(null);
                  setScanSources([]);
                  setScanError(null);
                  setIsAnalyzing(false);
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (typeof reader.result !== "string") {
                      setScanError(
                        lang === "ar"
                          ? "مش قادرين نقرأ الصورة. جرّبي صورة تانية."
                          : "Could not read this image. Try another one.",
                      );
                      return;
                    }
                    const image = new Image();
                    image.onload = () => {
                      if (!image.naturalWidth || !image.naturalHeight) {
                        setScanError(
                          lang === "ar"
                            ? "الصورة مش واضحة أو الملف تالف. اختاري صورة تانية."
                            : "The image is invalid or damaged. Choose another photo.",
                        );
                        return;
                      }
                      setCaptured(reader.result as string);
                    };
                    image.onerror = () =>
                      setScanError(
                        lang === "ar"
                          ? "الصورة دي مش مدعومة على المتصفح. جرّبي حفظها بصيغة JPG أو PNG."
                          : "This image format is not supported by the browser. Try JPG or PNG.",
                      );
                    image.src = reader.result;
                  };
                  reader.onerror = () =>
                    setScanError(
                      lang === "ar"
                        ? "حصلت مشكلة أثناء قراءة الصورة من الجهاز."
                        : "There was a problem reading the image from your device.",
                    );
                  reader.readAsDataURL(selectedFile);
                }}
              />
              {captured && (
                <button
                  className="egypt-outline-button"
                  onClick={() => {
                    setCaptured(null);
                    setScanResult(null);
                    setScanError(null);
                  }}
                >
                  <Camera size={17} />
                  {lang === "ar" ? "افتح الكاميرا تاني" : "Use camera again"}
                </button>
              )}
              <button className="egypt-outline-button" onClick={() => setScannerOpen(false)}>
                {c.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
