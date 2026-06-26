"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  FileText,
  Headphones,
  RotateCcw,
  Send,
  Play,
  Pause,
  Volume2,
  AlertCircle,
  Flag,
  Eye,
  EyeOff,
  Search,
  Info,
  Menu,
  HelpCircle,
  GraduationCap
} from "lucide-react";
import { renderPlaceholderBody } from "@/lib/render-placeholders";
import { submitAttempt } from "@/lib/actions/attempt-actions";
import type { AttemptResult, IELTSPracticeTest, StudentAnswers } from "@/types/ielts";

export function PracticeWorkspace({ test }: { test: IELTSPracticeTest }) {
  const [answers, setAnswers] = useState<StudentAnswers>({});
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedQuestionId, setFocusedQuestionId] = useState<string | null>(null);

  // Split-pane layout drag control
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState(55); // initial width of left pane in percentage
  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"passage" | "questions">("questions");
  const [userHighlights, setUserHighlights] = useState<Record<string, { start: number; end: number }[]>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Countdown timer controls
  const [timeLeft, setTimeLeft] = useState(test.durationMinutes * 60);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isTimerVisible, setIsTimerVisible] = useState(true);

  // Flags for review
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});

  // Audio Playback Speed control & ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [speed, setSpeed] = useState(1.0);

  // Evidence highlighting state (review mode)
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);

  // Check mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle Drag Resizer
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !workspaceRef.current) return;
      const containerRect = workspaceRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      // Allow resizing between 25% and 75% width
      if (newLeftWidth > 25 && newLeftWidth < 75) {
        setLeftWidth(newLeftWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // Audio playback rate syncer
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  // Load saved state from localStorage on mount
  useEffect(() => {
    // Load answers
    const savedAnswersStr = localStorage.getItem(`test_answers_${test.id}`);
    if (savedAnswersStr) {
      try {
        setAnswers(JSON.parse(savedAnswersStr));
      } catch (e) {
        console.error("Error parsing stored answers:", e);
      }
    }

    // Check if test was paused
    const savedPausedTime = localStorage.getItem(`test_paused_time_left_${test.id}`);
    if (savedPausedTime) {
      const remainingSec = parseInt(savedPausedTime, 10);
      setTimeLeft(remainingSec);
      setIsTimerPaused(true);
    } else {
      // Load or set running end time
      const savedEndTime = localStorage.getItem(`test_end_time_${test.id}`);
      let targetEndTime = 0;

      if (savedEndTime) {
        targetEndTime = parseInt(savedEndTime, 10);
      } else {
        // Calculate and save new end time
        targetEndTime = Date.now() + test.durationMinutes * 60 * 1000;
        localStorage.setItem(`test_end_time_${test.id}`, targetEndTime.toString());
      }

      // Calculate initial time left
      const remainingSeconds = Math.max(0, Math.floor((targetEndTime - Date.now()) / 1000));
      setTimeLeft(remainingSeconds);
    }
    
    setIsLoaded(true);
  }, [test.id, test.durationMinutes]);

  // Handle play/pause persistence in localStorage
  useEffect(() => {
    if (!isLoaded || result) return;

    if (isTimerPaused) {
      localStorage.setItem(`test_paused_time_left_${test.id}`, timeLeft.toString());
      localStorage.removeItem(`test_end_time_${test.id}`);
    } else {
      // If we were paused and are resuming, recalculate the target end time
      const savedPausedTime = localStorage.getItem(`test_paused_time_left_${test.id}`);
      if (savedPausedTime) {
        const remainingSec = parseInt(savedPausedTime, 10);
        const targetEndTime = Date.now() + remainingSec * 1000;
        localStorage.setItem(`test_end_time_${test.id}`, targetEndTime.toString());
        localStorage.removeItem(`test_paused_time_left_${test.id}`);
      }
    }
  }, [isTimerPaused, isLoaded, result, test.id, timeLeft]);

  // Countdown timer logic
  useEffect(() => {
    if (!isLoaded || result) return; // Stop counting if not loaded or already submitted
    if (isTimerPaused) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit(); // Auto-submit when time is up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoaded, isTimerPaused, result]);

  // Scroll to highlighted evidence in left panel
  useEffect(() => {
    if (selectedEvidence) {
      setTimeout(() => {
        const element = document.getElementById("active-evidence");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  }, [selectedEvidence]);

  // Extract flat list of all questions in this test
  const allQuestions = useMemo(() => {
    return test.sections.flatMap((section) =>
      section.questionGroups.flatMap((group) => group.questions)
    );
  }, [test]);

  const questionCount = allQuestions.length;

  function handleAnswerChange(questionId: string, value: string) {
    setAnswers((current) => {
      const updated = { ...current, [questionId]: value };
      localStorage.setItem(`test_answers_${test.id}`, JSON.stringify(updated));
      return updated;
    });
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const res = await submitAttempt(test.id, answers);
      setResult(res);

      // Clear localStorage persistence for this test
      localStorage.removeItem(`test_answers_${test.id}`);
      localStorage.removeItem(`test_end_time_${test.id}`);
      localStorage.removeItem(`test_paused_time_left_${test.id}`);

      // Auto-select first question's evidence if available to help review
      const firstEv = res.results.find((q) => q.evidence?.text)?.evidence?.text;
      if (firstEv) {
        setSelectedEvidence(firstEv);
      }
    } catch (error) {
      console.error("Error submitting attempt:", error);
      alert("Đã xảy ra lỗi khi nộp bài. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setAnswers({});
    setResult(null);
    setFocusedQuestionId(null);
    setFlaggedQuestions({});
    setSelectedEvidence(null);
    setTimeLeft(test.durationMinutes * 60);
    setIsTimerPaused(false);

    // Clear localStorage persistence for this test
    localStorage.removeItem(`test_answers_${test.id}`);
    localStorage.removeItem(`test_end_time_${test.id}`);
    localStorage.removeItem(`test_paused_time_left_${test.id}`);
  }

  // Scroll to and focus a question input field
  function handleNavigateToQuestion(questionId: string) {
    const question = allQuestions.find((q) => q.id === questionId);
    if (result && question?.evidence) {
      setSelectedEvidence(question.evidence.text);
    }

    // Try to find the blank input inside the body first
    const input = document.getElementById(`input-q-${questionId}`) as HTMLInputElement | null;
    if (input) {
      input.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => input.focus(), 100);
      return;
    }

    // Otherwise, scroll to the normal question card
    const card = document.getElementById(`card-q-${questionId}`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function toggleFlag(questionId: string) {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  }

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Convert raw score to estimated IELTS Band
  function getEstimatedBandScore(correct: number, total: number): string {
    if (total === 0) return "0.0";
    const pct = (correct / total) * 100;
    if (pct >= 90) return "9.0";
    if (pct >= 85) return "8.5";
    if (pct >= 78) return "8.0";
    if (pct >= 70) return "7.5";
    if (pct >= 62) return "7.0";
    if (pct >= 53) return "6.5";
    if (pct >= 45) return "6.0";
    if (pct >= 35) return "5.5";
    if (pct >= 25) return "5.0";
    if (pct >= 15) return "4.5";
    if (pct >= 5) return "4.0";
    return "3.0";
  }

  // Feedback messaging matching band scores
  function getBandScoreFeedback(correct: number, total: number): string {
    if (total === 0) return "";
    const pct = (correct / total) * 100;
    if (pct >= 90) return "Xuất sắc! Khả năng ngôn ngữ của bạn cực kỳ vững vàng và nhạy bén.";
    if (pct >= 75) return "Rất tốt! Bạn làm chủ được các câu hỏi và bẫy trong đề IELTS.";
    if (pct >= 60) return "Tốt! Kỹ năng đọc/nghe khá tốt, hãy cải thiện vốn từ nâng cao để nâng band.";
    if (pct >= 45) return "Khá! Bạn đã hiểu cấu trúc bài thi, cần luyện phản xạ nhanh hơn.";
    if (pct >= 25) return "Trung bình! Hãy chú ý phân tích kỹ các lỗi sai và bám sát từ khóa.";
    return "Cần cố gắng nhiều! Hãy bắt đầu luyện từ vựng cơ bản và làm quen kỹ năng làm đề.";
  }

  // Helper to find the character offset of a node inside a paragraph element
  const getParagraphOffset = (pElement: HTMLElement, container: Node, offset: number) => {
    let currentOffset = 0;
    let targetNode = container;
    if (container.nodeType === Node.ELEMENT_NODE) {
      if (container.childNodes.length > 0 && offset < container.childNodes.length) {
        targetNode = container.childNodes[offset];
      }
    }
    const walker = document.createTreeWalker(pElement, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const textNode = walker.currentNode;
      if (textNode === targetNode || targetNode.contains(textNode)) {
        return currentOffset + (targetNode === textNode ? offset : 0);
      }
      currentOffset += textNode.textContent?.length || 0;
    }
    return -1;
  };

  // Text selection highlight trigger
  const highlightSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const passageContainer = document.getElementById("passage-container");
    if (!passageContainer) return;

    try {
      const range = selection.getRangeAt(0);
      let startNode = range.startContainer;
      let endNode = range.endContainer;

      // Find the containing <p> element for start and end
      let startP: HTMLElement | null = null;
      let currNode: Node | null = startNode;
      while (currNode && currNode !== passageContainer) {
        if (currNode.nodeType === Node.ELEMENT_NODE && (currNode as Element).tagName === "P") {
          startP = currNode as HTMLElement;
          break;
        }
        currNode = currNode.parentNode;
      }

      let endP: HTMLElement | null = null;
      currNode = endNode;
      while (currNode && currNode !== passageContainer) {
        if (currNode.nodeType === Node.ELEMENT_NODE && (currNode as Element).tagName === "P") {
          endP = currNode as HTMLElement;
          break;
        }
        currNode = currNode.parentNode;
      }

      // If selection is within the same paragraph, calculate offsets
      if (startP && endP && startP === endP) {
        const paraKey = startP.id;
        if (!paraKey) return;

        const startOffset = getParagraphOffset(startP, startNode, range.startOffset);
        const endOffset = getParagraphOffset(startP, endNode, range.endOffset);

        if (startOffset !== -1 && endOffset !== -1 && startOffset !== endOffset) {
          const start = Math.min(startOffset, endOffset);
          const end = Math.max(startOffset, endOffset);

          setUserHighlights(prev => {
            const currentList = prev[paraKey] || [];
            return {
              ...prev,
              [paraKey]: [...currentList, { start, end }]
            };
          });
        }
      }

      selection.removeAllRanges();
    } catch (e) {
      console.error("Error highlighting selection:", e);
    }
  };

  const clearAllHighlights = () => {
    setUserHighlights({});
  };

  const mergeHighlights = (ranges: { start: number; end: number; isEvidence?: boolean }[]) => {
    if (ranges.length === 0) return [];
    const sorted = [...ranges].sort((a, b) => a.start - b.start);
    const merged = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
      const last = merged[merged.length - 1];
      const curr = sorted[i];
      if (curr.start <= last.end) {
        last.end = Math.max(last.end, curr.end);
        if (curr.isEvidence) last.isEvidence = true;
      } else {
        merged.push(curr);
      }
    }
    return merged;
  };

  // Highlight paragraph matches
  function renderParagraphWithHighlight(para: string, key: string) {
    const paraHighlights = userHighlights[key] || [];
    let merged = mergeHighlights(paraHighlights);

    // If review mode evidence is active and matches, add it as a highlight
    if (selectedEvidence && para.includes(selectedEvidence)) {
      let startIdx = para.indexOf(selectedEvidence);
      const evidenceRanges = [];
      while (startIdx !== -1) {
        evidenceRanges.push({
          start: startIdx,
          end: startIdx + selectedEvidence.length,
          isEvidence: true
        });
        startIdx = para.indexOf(selectedEvidence, startIdx + 1);
      }
      merged = mergeHighlights([...merged, ...evidenceRanges]);
    }

    if (merged.length === 0) {
      return (
        <p id={key} key={key} className="indent-4 text-justify">
          {para}
        </p>
      );
    }

    const elements: React.ReactNode[] = [];
    let lastIdx = 0;

    merged.forEach((range, idx) => {
      if (range.start > lastIdx) {
        elements.push(para.substring(lastIdx, range.start));
      }

      const highlightText = para.substring(range.start, range.end);
      if (range.isEvidence) {
        elements.push(
          <mark key={`ev-${idx}`} id="active-evidence" className="evidence-highlight">
            {highlightText}
          </mark>
        );
      } else {
        elements.push(
          <mark key={`hl-${idx}`} className="bg-yellow-200 text-slate-900 px-0.5 rounded">
            {highlightText}
          </mark>
        );
      }

      lastIdx = range.end;
    });

    if (lastIdx < para.length) {
      elements.push(para.substring(lastIdx));
    }

    return (
      <p id={key} key={key} className="indent-4 text-justify">
        {elements}
      </p>
    );
  }

  // Highlight transcript matches
  function renderTranscriptWithHighlight(transcript: string) {
    if (selectedEvidence && transcript.includes(selectedEvidence)) {
      const parts = transcript.split(selectedEvidence);
      return (
        <span className="whitespace-pre-wrap">
          {parts[0]}
          <mark id="active-evidence" className="evidence-highlight">
            {selectedEvidence}
          </mark>
          {parts.slice(1).join(selectedEvidence)}
        </span>
      );
    }
    return <span className="whitespace-pre-wrap">{transcript}</span>;
  }

  const answeredCount = Object.keys(answers).filter((k) => answers[k]?.trim()).length;
  const progressPercent = questionCount > 0 ? (answeredCount / questionCount) * 100 : 0;

  const isListening = test.skill === "listening";
  const SkillIcon = isListening ? Headphones : FileText;

  // Split-pane layout dynamic styling
  const gridStyle = isMobile
    ? { gridTemplateColumns: "100%" }
    : { gridTemplateColumns: `calc(${leftWidth}% - 4px) 8px calc(${100 - leftWidth}% - 4px)` };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-50 relative">
      {/* 1. IELTS Prep Master Header */}
      <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button className="p-1 rounded-md text-slate-500 hover:bg-slate-100 cursor-pointer">
            <Menu size={18} />
          </button>
          <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition cursor-pointer select-none">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <GraduationCap size={15} />
            </div>
            <span className="text-xs font-black tracking-tight text-slate-900 uppercase hidden sm:block">IELTS Prep Master</span>
          </Link>
        </div>

        {/* Center Progress Meter */}
        <div className="hidden md:flex items-center gap-3 w-64">
          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
            {answeredCount} of {questionCount} answered
          </span>
        </div>

        {/* Right Action Widgets */}
        <div className="flex items-center gap-3.5">
          {/* Timer Display */}
          <div
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold border transition ${
              result
                ? "bg-slate-50 border-line text-slate-500"
                : timeLeft < 120
                ? "bg-red-50 border-red-200 text-red-600 animate-pulse"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <Clock3 size={14} />
            <span className={isTimerVisible ? "" : "blur-sm select-none"}>
              {result ? "Đã nộp bài" : formatTime(timeLeft)}
            </span>
          </div>

          {!result && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsTimerVisible(!isTimerVisible)}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 cursor-pointer"
                title={isTimerVisible ? "Ẩn đồng hồ" : "Hiện đồng hồ"}
              >
                {isTimerVisible ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>

              <button
                type="button"
                onClick={() => setIsTimerPaused(!isTimerPaused)}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 cursor-pointer"
                title={isTimerPaused ? "Tiếp tục" : "Tạm dừng"}
              >
                {isTimerPaused ? <Play size={15} /> : <Pause size={15} />}
              </button>
            </div>
          )}

          <HelpCircle size={18} className="text-slate-400 hover:text-slate-600 cursor-pointer hidden sm:block" />

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || Boolean(result)}
            className="focus-ring rounded-lg bg-[#10b981] hover:bg-[#059669] text-white px-5 py-2 font-bold text-xs cursor-pointer shadow-md shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Đang nộp..." : "Nộp bài"}
          </button>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      {isMobile && (
        <div className="flex bg-slate-100 p-1.5 border-b border-slate-200 shrink-0 select-none">
          <button
            type="button"
            onClick={() => setActiveMobileTab("passage")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition text-center cursor-pointer ${
              activeMobileTab === "passage" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
            }`}
          >
            {test.skill === "listening" ? "Transcript / Audio" : "Đọc đoạn văn"}
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab("questions")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition text-center cursor-pointer ${
              activeMobileTab === "questions" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
            }`}
          >
            Bảng câu hỏi ({answeredCount}/{questionCount})
          </button>
        </div>
      )}

      {/* 2. Main workspace grid splits */}
      <div
        ref={workspaceRef}
        className="flex-1 grid grid-cols-1 lg:grid-flow-col gap-0 overflow-hidden relative animate-fade-in"
        style={gridStyle}
      >
        {/* LEFT COLUMN: Passage, Audio, Transcript */}
        <section className={`bg-white overflow-y-auto custom-scrollbar h-full flex flex-col border-r border-slate-200 p-5 ${
          isMobile && activeMobileTab !== "passage" ? "hidden" : "flex"
        }`}>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1.5 space-y-6">
            {test.sections.map((section) => (
              <article key={section.id} className="space-y-4">
                {/* Passage Title & Formatting toolbar */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-lg font-black text-slate-800 border-l-4 border-blue-600 pl-3">
                    {section.title}
                  </h2>

                  {/* Formatting Highlight toolbar */}
                  {test.skill === "reading" && (
                    <div className="flex items-center gap-2 border border-slate-200 bg-slate-50 rounded-lg px-2.5 py-1 text-xs">
                      <span className="text-[9px] font-bold text-slate-400 uppercase mr-1 select-none">Format</span>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={highlightSelection}
                        className="p-1 rounded bg-yellow-200 hover:bg-yellow-300 text-slate-800 transition font-bold text-[10px] px-2 flex items-center gap-1 border border-yellow-300 cursor-pointer"
                        title="Tô màu vàng đánh dấu"
                      >
                        <span className="underline decoration-yellow-600 decoration-2 font-black">A</span>
                      </button>
                      <span className="text-slate-200 select-none">|</span>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={clearAllHighlights}
                        className="text-[10px] text-slate-500 hover:text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        Clear highlights
                      </button>
                    </div>
                  )}
                </div>

                {/* Listening Audio Component */}
                {section.audio ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
                        <Volume2 size={16} />
                        <span>Trình phát nghe thử Audio</span>
                      </div>
                      {/* Playback speed controller */}
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] font-bold">
                        <span className="text-slate-500 mr-1.5">Tốc độ:</span>
                        {[1.0, 1.25, 1.5, 1.75].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => setSpeed(rate)}
                            className={`px-1.5 py-0.5 rounded transition ${
                              speed === rate
                                ? "bg-blue-600 text-white"
                                : "text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    </div>

                    {section.audio.publicUrl ? (
                      <audio
                        ref={audioRef}
                        className="w-full"
                        controls
                        src={section.audio.publicUrl}
                      />
                    ) : (
                      <div className="rounded-md border border-dashed border-slate-200 bg-white px-3 py-3 text-[11px] text-slate-500">
                        Audio metadata: {section.audio.objectKey}
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Reading Passage Paragraphs */}
                {section.passage ? (
                  <div
                    id="passage-container"
                    className="rounded-xl border border-slate-100 bg-white p-5 leading-8 text-slate-700 text-[14.5px] space-y-4 text-justify"
                  >
                    {section.passage.split("\n\n").map((para, pIdx) =>
                      renderParagraphWithHighlight(para, `p-${section.id}-${pIdx}`)
                    )}
                  </div>
                ) : null}

                {/* Listening/Reading Transcript */}
                {result && section.transcript ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                    <h3 className="font-bold text-xs text-slate-900 border-b border-slate-200 pb-1">
                      Transcript & Giải thích
                    </h3>
                    <p className="text-[13px] leading-6 text-slate-600 italic">
                      {renderTranscriptWithHighlight(section.transcript)}
                    </p>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        {/* DRAG HANDLER */}
        {!isMobile && (
          <div
            onMouseDown={startResizing}
            className="resizer-handle"
          />
        )}

        {/* RIGHT COLUMN: Questions list, navigator & submitting */}
        <aside className={`grid grid-rows-[minmax(0,1fr)_auto] gap-0 h-full overflow-hidden bg-slate-50 ${
          isMobile && activeMobileTab !== "questions" ? "hidden" : "grid"
        }`}>
          {/* Question fields list */}
          <div className="overflow-y-auto custom-scrollbar h-full flex flex-col p-5 space-y-4">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
              Bảng câu hỏi
            </h2>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1.5 space-y-4">
              {test.sections.map((section) =>
                section.questionGroups.map((group) => (
                  <div key={group.id} className="space-y-3.5">
                    <div className="bg-slate-100 rounded-lg p-3.5 border border-slate-200">
                      <h3 className="text-xs font-black text-slate-800">{group.title}</h3>
                      <p className="mt-0.5 text-[11px] font-semibold text-red-500 leading-4">
                        Yêu cầu: {group.instruction}
                      </p>
                    </div>

                    {group.body ? (
                      <div className="rounded-lg bg-slate-100/50 p-4 border border-slate-200 leading-7.5 text-slate-800 text-[13.5px]">
                        {renderPlaceholderBody({
                          body: group.body,
                          questions: group.questions,
                          answers,
                          onAnswerChange: handleAnswerChange,
                          disabled: Boolean(result),
                          focusedQuestionId,
                          onFocusQuestion: setFocusedQuestionId
                        })}
                      </div>
                    ) : null}

                    <div className="space-y-3">
                      {group.questions.map((question) => {
                        const questionResult = result?.results.find(
                          (item) => item.questionId === question.id
                        );
                        const isFocused = focusedQuestionId === question.id;
                        const isFlagged = flaggedQuestions[question.id];

                        return (
                          <div
                            id={`card-q-${question.id}`}
                            key={question.id}
                            className={`rounded-lg border p-4 transition-all duration-200 ${
                              isFocused
                                ? "border-blue-500 bg-blue-50/10 ring-2 ring-blue-500/5"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 border-b border-slate-50 pb-2 mb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                  Câu {question.number}
                                </span>
                                {isFlagged && (
                                  <Flag size={11} className="text-yellow-500 fill-yellow-500 flagged-badge" />
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                {!result && (
                                  <button
                                    type="button"
                                    onClick={() => toggleFlag(question.id)}
                                    className={`p-1 rounded transition ${
                                      isFlagged
                                        ? "text-yellow-500 hover:text-yellow-600"
                                        : "text-slate-300 hover:text-slate-500 hover:bg-slate-50"
                                    }`}
                                    title="Đánh dấu xem lại"
                                  >
                                    <Flag size={12} className={isFlagged ? "fill-yellow-500" : ""} />
                                  </button>
                                )}

                                {questionResult && (
                                  <span
                                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                      questionResult.isCorrect
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-red-50 text-red-600"
                                    }`}
                                  >
                                    {questionResult.isCorrect ? "Đúng" : "Sai"}
                                  </span>
                                )}
                              </div>
                            </div>

                            {question.prompt && (
                              <p className="text-[13px] text-slate-700 leading-relaxed mb-2.5">
                                {question.prompt}
                              </p>
                            )}

                            {/* Normal text-box if input isn't inline */}
                            {!group.body && (
                              <input
                                type="text"
                                id={`input-q-${question.id}`}
                                disabled={Boolean(result)}
                                value={answers[question.id] ?? ""}
                                onFocus={() => setFocusedQuestionId(question.id)}
                                onBlur={() => setFocusedQuestionId(null)}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                placeholder="Nhập câu trả lời..."
                                className="focus-ring w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
                              />
                            )}

                            {questionResult && (
                              <div className="mt-3.5 space-y-2.5 border-t border-dashed border-slate-200 pt-3 text-[11px] leading-relaxed text-slate-600">
                                <p>
                                  Đáp án đúng:{" "}
                                  <span className="font-bold text-slate-900">
                                    {questionResult.correctAnswers.join(" / ")}
                                  </span>
                                </p>
                                {question.evidence && (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedEvidence(question.evidence!.text)}
                                    className="flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                                  >
                                    <Search size={11} />
                                    Xem bằng chứng trong bài
                                  </button>
                                )}
                                <p className="italic">{question.explanation}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action grid (submit and navigator) */}
          <div className="paper-panel border-t border-slate-200 bg-white p-4 space-y-3.5 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800">Bảng làm bài</span>
              <span className="text-[11px] font-semibold text-slate-500">
                Đã làm {answeredCount}/{questionCount} câu
              </span>
            </div>

            {/* Score estimate feedback block */}
            {result && (
              <div className="rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/10 border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kết quả</p>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">
                      {result.correct} <span className="text-xs text-slate-400 font-normal">/ {result.total} câu</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IELTS Band</p>
                    <span className="inline-block rounded bg-blue-600 px-2.5 py-0.5 text-sm font-black text-white mt-1 shadow-md shadow-blue-500/10">
                      {getEstimatedBandScore(result.correct, result.total)}
                    </span>
                  </div>
                </div>

                {/* Progress bar accuracy */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-500">Độ chính xác</span>
                    <span className="text-blue-600">{result.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${result.percentage}%` }}
                    />
                  </div>
                </div>

                <div className="rounded bg-slate-50 border border-slate-100 p-2.5 text-[11px] text-slate-600 italic">
                  {getBandScoreFeedback(result.correct, result.total)}
                </div>
              </div>
            )}

            {/* Navigator Question Numbers grid */}
            <div className="grid grid-cols-6 gap-2 max-h-24 overflow-y-auto custom-scrollbar pr-0.5">
              {allQuestions.map((question) => {
                const questionResult = result?.results.find(
                  (item) => item.questionId === question.id
                );
                const hasAnswered = answers[question.id]?.trim();
                const isFocused = focusedQuestionId === question.id;
                const isFlagged = flaggedQuestions[question.id];

                let btnBgClass = "bg-white border-slate-200 text-slate-700 hover:border-slate-400";

                if (result && questionResult) {
                  btnBgClass = questionResult.isCorrect
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/10"
                    : "bg-red-500 text-white border-red-500 shadow-md shadow-red-500/10";
                } else if (isFlagged) {
                  btnBgClass = "bg-yellow-50 border-yellow-400 text-yellow-800 font-bold";
                } else if (hasAnswered) {
                  btnBgClass = "bg-blue-50 border-blue-500 text-blue-700 font-bold";
                }

                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => handleNavigateToQuestion(question.id)}
                    className={`relative flex aspect-square items-center justify-center rounded-lg border text-[11px] font-bold transition-all focus:outline-none ${btnBgClass} ${
                      isFocused ? "ring-2 ring-offset-1 ring-blue-500 scale-[1.05]" : ""
                    }`}
                  >
                    {question.number}
                    {isFlagged && !result && (
                      <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Reset Controls */}
            {result && (
              <button
                onClick={handleReset}
                className="focus-ring flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                type="button"
              >
                <RotateCcw size={13} />
                Làm lại đề thi
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* 3. Anti-Cheat Pause overlay */}
      {isTimerPaused && !result && (
        <div className="pause-overlay">
          <div className="text-center p-8 paper-panel rounded-2xl max-w-sm shadow-xl border border-slate-200 mx-4 bg-white">
            <div className="bg-blue-50 text-blue-600 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play size={22} className="ml-1 fill-blue-100" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1.5">Bài thi đang tạm dừng</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Thời gian đã dừng lại. Đề thi và các ô câu trả lời tạm ẩn đi để bảo vệ độ trung thực của bài kiểm tra.
            </p>
            <button
              type="button"
              onClick={() => setIsTimerPaused(false)}
              className="focus-ring inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 cursor-pointer"
            >
              Tiếp tục làm bài
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
