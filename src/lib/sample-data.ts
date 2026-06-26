import type { IELTSPracticeTest } from "@/types/ielts";

export const sampleTests: IELTSPracticeTest[] = [
  {
    id: "reading-tea-gap-fill",
    title: "Reading Practice: The History of Tea",
    skill: "reading",
    testType: "academic",
    level: "band_5_6",
    durationMinutes: 20,
    status: "published",
    tags: ["gap-fill", "history", "academic"],
    sections: [
      {
        id: "section-reading-1",
        title: "Passage 1",
        passage:
          "Tea has been part of daily life in many cultures for centuries. According to one popular story, tea was discovered in ancient China when leaves from a nearby tree fell into boiling water. The drink became valued not only for its taste but also for its role in social rituals. Traders later carried tea across Asia and Europe, where it became a symbol of hospitality and refinement.",
        questionGroups: [
          {
            id: "group-reading-1",
            type: "gap_fill",
            title: "Summary Completion",
            instruction: "NO MORE THAN TWO WORDS",
            body:
              "Tea was first discovered when leaves fell into boiling {{blank_1}}. Over time, it became connected with social {{blank_2}} and was later spread by {{blank_3}}.",
            questions: [
              {
                id: "q1",
                number: 1,
                blankId: "blank_1",
                answers: ["water"],
                maxWords: 1,
                explanation:
                  "The passage says leaves from a nearby tree fell into boiling water.",
                evidence: {
                  passageIndex: 0,
                  text: "leaves from a nearby tree fell into boiling water"
                }
              },
              {
                id: "q2",
                number: 2,
                blankId: "blank_2",
                answers: ["rituals"],
                maxWords: 1,
                explanation:
                  "The answer comes from the sentence mentioning the role of tea in social rituals.",
                evidence: {
                  passageIndex: 0,
                  text: "its role in social rituals"
                }
              },
              {
                id: "q3",
                number: 3,
                blankId: "blank_3",
                answers: ["traders"],
                maxWords: 1,
                explanation:
                  "The passage states that traders later carried tea across Asia and Europe.",
                evidence: {
                  passageIndex: 0,
                  text: "Traders later carried tea across Asia and Europe"
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "listening-campus-tour",
    title: "Listening Practice: Campus Tour",
    skill: "listening",
    testType: "practice",
    level: "band_5_6",
    durationMinutes: 12,
    status: "published",
    tags: ["listening", "campus", "note-completion"],
    sections: [
      {
        id: "section-listening-1",
        title: "Part 1",
        transcript:
          "Welcome to the campus tour. The library is open until nine o'clock on weekdays. Students can collect their ID cards from the main office after registration.",
        audio: {
          id: "audio-campus-tour",
          fileName: "campus-tour-sample.mp3",
          bucket: "ielts-audio",
          objectKey: "tests/listening-campus-tour/part-1.mp3",
          mimeType: "audio/mpeg",
          size: 0,
          durationSeconds: 58,
          storageProvider: "minio",
          publicUrl: ""
        },
        questionGroups: [
          {
            id: "group-listening-1",
            type: "note_completion",
            title: "Notes",
            instruction: "Write ONE WORD AND/OR A NUMBER for each answer.",
            body:
              "The library closes at {{blank_4}} on weekdays. ID cards can be collected from the main {{blank_5}}.",
            questions: [
              {
                id: "q4",
                number: 1,
                blankId: "blank_4",
                answers: ["9", "nine", "nine o'clock"],
                maxWords: 2,
                explanation:
                  "The speaker says the library is open until nine o'clock on weekdays.",
                evidence: {
                  text: "The library is open until nine o'clock on weekdays.",
                  timestampStart: 8,
                  timestampEnd: 14
                }
              },
              {
                id: "q5",
                number: 2,
                blankId: "blank_5",
                answers: ["office"],
                maxWords: 1,
                explanation:
                  "The speaker says students can collect ID cards from the main office.",
                evidence: {
                  text: "Students can collect their ID cards from the main office.",
                  timestampStart: 15,
                  timestampEnd: 23
                }
              }
            ]
          }
        ]
      }
    ]
  }
];

export function getTestById(testId: string) {
  return sampleTests.find((test) => test.id === testId);
}
