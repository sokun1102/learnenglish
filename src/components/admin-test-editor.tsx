"use client";

import { useMemo, useState } from "react";
import { Eye, FileAudio, Plus, Save, Scissors, UploadCloud, GraduationCap, CheckSquare } from "lucide-react";
import { createOrUpdateTest } from "@/lib/actions/test-actions";

type DraftBlank = {
  id: string;
  answer: string;
  maxWords: number;
  explanation: string;
};

import type { IELTSPracticeTest } from "@/types/ielts";

export function AdminTestEditor({ initialTest }: { initialTest?: IELTSPracticeTest | null }) {
  const [skill, setSkill] = useState<"reading" | "listening">(
    initialTest ? initialTest.skill : "reading"
  );
  const [title, setTitle] = useState(
    initialTest ? initialTest.title : "New IELTS Practice Mock"
  );
  const [difficulty, setDifficulty] = useState(
    initialTest ? initialTest.level : "band_5_6"
  );
  const [duration, setDuration] = useState(
    initialTest ? initialTest.durationMinutes : 60
  );
  const [coverImage, setCoverImage] = useState(
    initialTest ? initialTest.coverImage || "" : ""
  );
  const [description, setDescription] = useState(
    initialTest ? initialTest.description || "" : ""
  );
  const [sourceText, setSourceText] = useState(
    initialTest
      ? (initialTest.skill === "reading"
          ? initialTest.sections[0]?.passage || ""
          : initialTest.sections[0]?.transcript || "")
      : "Tea was first discovered when leaves fell into boiling water. The drink later became connected with social rituals."
  );
  const [body, setBody] = useState(
    initialTest ? initialTest.sections[0]?.questionGroups[0]?.body || "" : "Tea was first discovered when leaves fell into boiling water. The drink later became connected with social rituals."
  );
  const [selectedText, setSelectedText] = useState("");
  const [blanks, setBlanks] = useState<DraftBlank[]>(
    initialTest
      ? (initialTest.sections[0]?.questionGroups[0]?.questions.map((q) => ({
          id: q.id,
          answer: q.answers[0] || "",
          maxWords: q.maxWords || 1,
          explanation: q.explanation || ""
        })) || [])
      : []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [audioAsset, setAudioAsset] = useState<{
    mediaAssetId: string;
    objectKey: string;
    bucket: string;
    publicUrl: string;
  } | null>(
    initialTest?.sections[0]?.audio
      ? {
          mediaAssetId: typeof initialTest.sections[0].audio.id === "string" ? initialTest.sections[0].audio.id : (initialTest.sections[0].audio as any)._id?.toString() || "",
          objectKey: initialTest.sections[0].audio.objectKey,
          bucket: initialTest.sections[0].audio.bucket,
          publicUrl: initialTest.sections[0].audio.publicUrl || ""
        }
      : null
  );

  // Audio upload handler
  async function handleAudioChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          size: file.size
        })
      });

      if (!res.ok) {
        throw new Error("Không thể lấy phiên upload từ máy chủ.");
      }

      const { uploadUrl, objectKey, mediaAssetId, publicUrl } = await res.json();

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type
        },
        body: file
      });

      if (!uploadRes.ok) {
        throw new Error("Không thể gửi tệp tin lên kho lưu trữ MinIO/S3.");
      }

      setAudioAsset({
        mediaAssetId,
        objectKey,
        bucket: "ielts-audio",
        publicUrl
      });
      alert("Tải lên file nghe thành công!");
    } catch (err: any) {
      console.error(err);
      alert("Lỗi khi tải lên file: " + err.message);
    } finally {
      setIsUploading(false);
    }
  }

  // Save Mock Test
  async function handleSaveDraft() {
    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề bài thi.");
      return;
    }
    setIsSaving(true);
    try {
      const slugId = initialTest
        ? initialTest.id
        : (title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") || `test_${Date.now()}`);

      const questions = blanks.map((blank, index) => ({
        id: blank.id,
        number: index + 1,
        blankId: blank.id,
        answers: [blank.answer],
        maxWords: blank.maxWords,
        explanation: blank.explanation
      }));

      const questionGroups = [
        {
          id: "group-1",
          type: skill === "reading" ? ("gap_fill" as const) : ("note_completion" as const),
          title: skill === "reading" ? "Summary Completion" : "Note Completion",
          instruction: "Write ONE WORD ONLY for each answer.",
          body: body,
          questions
        }
      ];

      const sections = [
        {
          id: "section-1",
          title: skill === "reading" ? "Passage 1" : "Part 1",
          passage: skill === "reading" ? sourceText : undefined,
          transcript: skill === "listening" ? sourceText : undefined,
          audio: skill === "listening" && audioAsset ? {
            id: audioAsset.mediaAssetId,
            fileName: audioAsset.objectKey.split("/").pop() || "audio.mp3",
            bucket: audioAsset.bucket,
            objectKey: audioAsset.objectKey,
            mimeType: "audio/mpeg",
            size: 0,
            storageProvider: "minio" as const,
            publicUrl: audioAsset.publicUrl
          } : undefined,
          questionGroups
        }
      ];

      await createOrUpdateTest({
        id: slugId,
        title,
        description,
        coverImage,
        skill,
        testType: "practice",
        level: difficulty as any,
        durationMinutes: duration,
        status: "draft",
        tags: [skill, "draft"],
        sections
      });

      alert("Lưu nháp đề thi thành công!");
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Đã xảy ra lỗi khi lưu nháp đề thi.");
    } finally {
      setIsSaving(false);
    }
  }

  const previewQuestions = useMemo(
    () =>
      blanks.map((blank, index) => ({
        ...blank,
        number: index + 1,
        token: `{{${blank.id}}}`
      })),
    [blanks]
  );

  function captureSelection() {
    const selection = window.getSelection()?.toString().trim() ?? "";
    setSelectedText(selection);
  }

  function createBlankFromSelection() {
    const answer = selectedText.trim();
    if (!answer || !body.includes(answer)) {
      return;
    }

    const nextId = `blank_${blanks.length + 1}`;
    setBody((current) => current.replace(answer, `{{${nextId}}}`));
    setBlanks((current) => [
      ...current,
      {
        id: nextId,
        answer,
        maxWords: Math.max(1, answer.split(/\s+/).length),
        explanation: "Admin sẽ thêm giải thích cho câu này."
      }
    ]);
    setSelectedText("");
  }

  function resetBodyFromSource() {
    setBody(sourceText);
    setBlanks([]);
    setSelectedText("");
  }

  // Count words and paragraphs in the passage
  const wordCount = sourceText.trim() === "" ? 0 : sourceText.trim().split(/\s+/).length;
  const paragraphCount = sourceText.trim() === "" ? 0 : sourceText.split(/\n\n+/).length;

  return (
    <div className="space-y-6">
      {/* 1. Header with Configuration Titles */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Create New Test</span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">Test Configuration</h1>
          <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
            Configure reading passages, listening audio, and associated questions.
          </p>
        </div>

        {/* Header Tabs */}
        <div className="flex bg-slate-100 rounded-lg p-0.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setSkill("reading")}
            className={`px-3.5 py-1.5 rounded-md transition ${
              skill === "reading" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Reading Test
          </button>
          <button
            type="button"
            onClick={() => setSkill("listening")}
            className={`px-3.5 py-1.5 rounded-md transition ${
              skill === "listening" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Listening Test
          </button>
        </div>
      </div>

      {/* 2. Global Test Settings Panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
          Global Test Settings
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="grid gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Test Title</span>
            <input
              type="text"
              placeholder="e.g., Academic Reading Practice 1"
              className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Difficulty Level</span>
            <select
              className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
            >
              <option value="band_4_5">Academic - Band 4.5</option>
              <option value="band_5_6">Academic - Standard (Band 5.5)</option>
              <option value="band_6_7">Academic - Advanced (Band 6.5)</option>
              <option value="band_7_8">Academic - Expert (Band 7.5)</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Time Limit (Minutes)</span>
            <input
              type="number"
              min={1}
              className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Cover Image URL</span>
            <input
              type="text"
              placeholder="e.g., https://example.com/cover.jpg"
              className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Description</span>
            <textarea
              placeholder="Brief summary or description of the test..."
              rows={2}
              className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
        </div>
      </div>

      {/* 3. Main Split Editor Area */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Side: Passage / Script Editor */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Eye size={14} className="text-blue-600" />
              Reading Passage Editor
            </h3>
            {/* Formatting toolbars */}
            <div className="flex gap-1.5 text-[9px] font-bold bg-slate-50 border border-slate-200 rounded p-1 select-none">
              <span className="cursor-pointer hover:text-blue-600 px-1 font-black">B</span>
              <span className="cursor-pointer hover:text-blue-600 px-1 italic">I</span>
              <span className="cursor-pointer hover:text-blue-600 px-1 underline font-black">U</span>
            </div>
          </div>

          <textarea
            className="focus-ring flex-1 min-h-[300px] rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-800"
            placeholder="Type or paste the passage text here..."
            value={sourceText}
            onChange={(e) => {
              setSourceText(e.target.value);
              setBody(e.target.value);
              setBlanks([]);
            }}
          />

          <div className="flex justify-between text-[10px] font-bold text-slate-400 border-t border-slate-100 pt-3">
            <span>Word count: {wordCount} / 800</span>
            <span>Paragraphs: {paragraphCount}</span>
          </div>
        </div>

        {/* Right Side: Questions / Answer Key Generator */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare size={14} className="text-green-600" />
              Question Blocks
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={captureSelection}
                className="focus-ring rounded bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Lấy Selection
              </button>
              <button
                type="button"
                onClick={createBlankFromSelection}
                disabled={!selectedText}
                className="focus-ring rounded bg-blue-600 px-2.5 py-1 text-[10px] font-extrabold text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 disabled:opacity-50 cursor-pointer"
              >
                Create blank
              </button>
            </div>
          </div>

          {/* Interactive preview box */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 text-xs leading-relaxed text-slate-700 max-h-48 overflow-y-auto custom-scrollbar">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 select-none">Passage Preview (Blank markers)</p>
            <div onMouseUp={captureSelection} className="cursor-text bg-white p-2.5 border border-slate-100 rounded-md">
              {body}
            </div>
          </div>

          {/* Answer details list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar max-h-60 space-y-3 pr-0.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 border-b border-slate-100 pb-1.5">
              <span>ANSWER KEY BINDINGS</span>
              <button
                type="button"
                onClick={resetBodyFromSource}
                className="text-red-500 hover:underline hover:text-red-600 cursor-pointer"
              >
                Reset Blanks
              </button>
            </div>

            {previewQuestions.length > 0 ? (
              previewQuestions.map((blank) => (
                <div key={blank.id} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Question {blank.number}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 font-mono select-all">
                      {blank.token}
                    </span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="grid gap-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Correct Answer</span>
                      <input
                        type="text"
                        className="focus-ring rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800"
                        value={blank.answer}
                        onChange={(e) =>
                          setBlanks((current) =>
                            current.map((item) =>
                              item.id === blank.id
                                ? { ...item, answer: e.target.value }
                                : item
                            )
                          )
                        }
                      />
                    </label>
                    <label className="grid gap-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Explanation Text</span>
                      <input
                        type="text"
                        className="focus-ring rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800"
                        value={blank.explanation}
                        onChange={(e) =>
                          setBlanks((current) =>
                            current.map((item) =>
                              item.id === blank.id
                                ? { ...item, explanation: e.target.value }
                                : item
                            )
                          )
                        }
                      />
                    </label>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-xs text-slate-400 font-medium">
                Chưa có câu hỏi đục lỗ nào được khởi tạo. Hãy bôi đen văn bản trong ô Preview và nhấn &quot;Create blank&quot;.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Audio Configuration upload row */}
      {skill === "listening" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
            <FileAudio size={15} className="text-blue-600" />
            Audio Configuration
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl font-medium">
            Chọn tệp tin âm thanh bài nói để đính kèm. File được lưu trữ bảo mật trong bucket MinIO/S3 của hệ thống.
          </p>

          <div className="flex flex-wrap gap-4 pt-1.5">
            <label className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-700 cursor-pointer hover:border-blue-600 hover:text-blue-600 transition shadow-sm">
              <UploadCloud size={15} />
              {isUploading ? "Uploading..." : "Select File"}
              <input
                type="file"
                accept="audio/*"
                disabled={isUploading}
                className="hidden"
                onChange={handleAudioChange}
              />
            </label>

            {audioAsset && (
              <div className="flex-1 min-w-[280px] rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs flex flex-col space-y-2">
                <div className="flex justify-between gap-2">
                  <span className="font-bold text-slate-700">Audio uploaded:</span>
                  <span className="text-[10px] text-slate-400 truncate max-w-xs">{audioAsset.objectKey}</span>
                </div>
                <audio src={audioAsset.publicUrl} controls className="w-full h-8" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Footer action triggers */}
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={isSaving}
          className="focus-ring rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm disabled:opacity-50"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={isSaving}
          className="focus-ring rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-extrabold cursor-pointer shadow-md shadow-blue-500/10 disabled:opacity-50"
        >
          Publish Test
        </button>
      </div>
    </div>
  );
}
