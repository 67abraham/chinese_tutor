import { type Flashcard, type TracingCharacter, type QuizQuestion } from './types';

export const hskFlashcards: Flashcard[] = [
  {
    character: '你好',
    pinyin: 'nǐ hǎo',
    translationEn: 'Hello',
    translationFr: 'Bonjour',
    exampleZh: '你好！很高兴认识你。',
    exampleEn: 'Hello! Nice to meet you.'
  },
  {
    character: '谢谢',
    pinyin: 'xièxie',
    translationEn: 'Thank you',
    translationFr: 'Merci',
    exampleZh: '谢谢你的帮助。',
    exampleEn: 'Thank you for your help.'
  },
  {
    character: '再见',
    pinyin: 'zài jiàn',
    translationEn: 'Goodbye',
    translationFr: 'Au revoir',
    exampleZh: '老师，再见！',
    exampleEn: 'Goodbye, teacher!'
  },
  {
    character: '一',
    pinyin: 'yī',
    translationEn: 'One',
    translationFr: 'Un',
    exampleZh: '我有一本书。',
    exampleEn: 'I have one book.'
  },
  {
    character: '人',
    pinyin: 'rén',
    translationEn: 'Person / People',
    translationFr: 'Personne / Gens',
    exampleZh: '他是中国人。',
    exampleEn: 'He is Chinese (literally: Chinese person).'
  },
  {
    character: '水',
    pinyin: 'shuǐ',
    translationEn: 'Water',
    translationFr: 'Eau',
    exampleZh: '我想喝水。',
    exampleEn: 'I want to drink water.'
  }
];

export const tracingCharacters: TracingCharacter[] = [
  {
    character: '人',
    pinyin: 'rén',
    meaning: 'Person / Human (Un/e personne)',
    strokes: 2,
    strokeOrderInstruction: [
      '1. 撇 (piě): Draw a curved downward stroke from top to bottom-left.',
      '2. 捺 (nà): Draw a straight downward stroke from the middle to bottom-right.'
    ],
    gridStyle: 'rice'
  },
  {
    character: '中',
    pinyin: 'zhōng',
    meaning: 'Middle / Center (Milieu / Centre)',
    strokes: 4,
    strokeOrderInstruction: [
      '1. 竖 (shù): Draw the left vertical line.',
      '2. 横折 (héng zhé): Draw the top horizontal, turning downwards on the right.',
      '3. 横 (héng): Close the middle box with a horizontal line in the center.',
      '4. 竖 (shù): Draw a long vertical stroke down through the middle.'
    ],
    gridStyle: 'field'
  },
  {
    character: '水',
    pinyin: 'shuǐ',
    meaning: 'Water (L\'eau)',
    strokes: 4,
    strokeOrderInstruction: [
      '1. 竖钩 (shù gōu): Draw the center vertical line with a hook at the bottom.',
      '2. 横撇 (héng piě): Draw the left horizontal-to-diagonal stroke.',
      '3. 撇 (piě): Draw the top-right diagonal sweeping leftwards.',
      '4. 捺 (nà): Draw the bottom-right diagonal sweeping rightwards.'
    ],
    gridStyle: 'rice'
  },
  {
    character: '山',
    pinyin: 'shān',
    meaning: 'Mountain (La montagne)',
    strokes: 3,
    strokeOrderInstruction: [
      '1. 竖 (shù): Draw the center vertical line.',
      '2. 竖折 (shù zhé): Draw the left vertical line and turn horizontally across the bottom.',
      '3. 竖 (shù): Draw the outer right vertical line downward to block.'
    ],
    gridStyle: 'rice'
  }
];

export const HskQuizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: 'Translate the word "谢谢" (xièxie) to English/French:',
    options: ['Hello (Bonjour)', 'Water (Eau)', 'Thank you (Merci)', 'Goodbye (Au revoir)'],
    correctAnswer: 'Thank you (Merci)',
    explanation: '谢谢 (xièxie) means "Thank you" in Chinese, expressing gratitude.'
  },
  {
    id: 2,
    question: 'Which of the following Chinese characters means "Water" (shuǐ)?',
    options: ['人', '一', '再见', '水'],
    correctAnswer: '水',
    explanation: '水 (shuǐ) is the Chinese character representing water. It is drawn with four strokes.'
  },
  {
    id: 3,
    question: 'How do you say "Goodbye" in Chinese?',
    options: ['再见 (zài jiàn)', '你好 (nǐ hǎo)', '谢谢 (xiè xie)', '人 (rén)'],
    correctAnswer: '再见 (zài jiàn)',
    explanation: '再见 (zài jiàn) translates literally to "See you again" and is the standard way to say "Goodbye" in Mandarin.'
  }
];
