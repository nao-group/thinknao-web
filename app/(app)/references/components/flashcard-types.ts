import type { Subject } from "../types";

export interface FlashcardItem {
  id: string;
  subject: Subject;
  front: string;
  back: string;
  hanzi?: string;
  pinyin?: string;
  detail?: string;
  extra?: string[];
}
