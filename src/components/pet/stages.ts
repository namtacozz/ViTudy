import { getAssetPath } from '@/lib/assets';

export interface PetStageConfig {
  stage: number;
  name: string;
  minStreak: number;
  maxStreak: number | null;
  awakeSrc: string;
  sleepSrc: string;
  description: string;
}

export const PET_STAGES: PetStageConfig[] = [
  {
    stage: 1,
    name: 'Trứng',
    minStreak: 0,
    maxStreak: 3,
    awakeSrc: getAssetPath('/brand/pet/stage1.png'),
    sleepSrc: getAssetPath('/brand/pet/sleep-stage1.png'),
    description: 'Quả trứng tri thức đang ấp ủ, sẵn sàng khởi đầu chuỗi học tập.',
  },
  {
    stage: 2,
    name: 'Nứt vỏ',
    minStreak: 4,
    maxStreak: 10,
    awakeSrc: getAssetPath('/brand/pet/stage2.png'),
    sleepSrc: getAssetPath('/brand/pet/sleep-stage2.png'),
    description: 'Vỏ trứng bắt đầu nứt ra khi duy trì chuỗi học 4 ngày liên tiếp.',
  },
  {
    stage: 3,
    name: 'Vịt con',
    minStreak: 11,
    maxStreak: 100,
    awakeSrc: getAssetPath('/brand/pet/stage3.png'),
    sleepSrc: getAssetPath('/brand/pet/sleep-stage3.png'),
    description: 'Chú vịt vàng thông minh, bạn đồng hành kiên trì cùng Sếp.',
  },
  {
    stage: 4,
    name: 'Trưởng thành',
    minStreak: 101,
    maxStreak: null,
    awakeSrc: getAssetPath('/brand/pet/stage4.png'),
    sleepSrc: getAssetPath('/brand/pet/sleep-stage4.png'),
    description: 'Vịt tri thức đỉnh cao, biểu tượng của ý chí thép hơn 100 ngày.',
  },
];

export function getStageConfig(stageNumber: number): PetStageConfig {
  return PET_STAGES.find((s) => s.stage === stageNumber) || PET_STAGES[0];
}

export function calculateStage(streak: number): number {
  for (const s of PET_STAGES) {
    if (s.maxStreak === null) {
      if (streak >= s.minStreak) return s.stage;
    } else if (streak >= s.minStreak && streak <= s.maxStreak) {
      return s.stage;
    }
  }
  return 1;
}

export function calculateDaysToNextStage(streak: number): number | null {
  const currentStage = calculateStage(streak);
  if (currentStage >= PET_STAGES.length) return null;
  const nextConfig = PET_STAGES[currentStage];
  return Math.max(0, nextConfig.minStreak - streak);
}
