export interface Flashcard {
  character: string;
  pinyin: string;
  translationEn: string;
  translationFr: string;
  exampleZh: string;
  exampleEn: string;
}

export interface TracingCharacter {
  character: string;
  pinyin: string;
  meaning: string;
  strokes: number;
  strokeOrderInstruction: string[];
  gridStyle: 'rice' | 'field';
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}
