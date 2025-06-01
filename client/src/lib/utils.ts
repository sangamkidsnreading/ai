import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateMockBadges() {
  return [
    { id: 1, name: "첫 걸음", icon: "🎯", earned: true, description: "첫 번째 단어 학습" },
    { id: 2, name: "연속 학습자", icon: "🔥", earned: true, description: "3일 연속 학습" },
    { id: 3, name: "단어 마스터", icon: "📚", earned: true, description: "100개 단어 학습" },
    { id: 4, name: "문장 전문가", icon: "💬", earned: false, description: "50개 문장 학습" },
    { id: 5, name: "코인 수집가", icon: "💰", earned: false, description: "500코인 획득" },
  ];
}
