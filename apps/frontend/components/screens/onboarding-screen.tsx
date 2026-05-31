'use client';

import { useRef, useState } from 'react';
import type { ComponentType, ReactNode, TouchEvent } from 'react';
import {
  Baby,
  Bean,
  Bed,
  Check,
  ChevronLeft,
  CircleOff,
  Egg,
  GraduationCap,
  Heart,
  HeartPulse,
  Milk,
  Nut,
  Shell,
  Smile,
  UserCheck,
  UserRound,
  Wheat,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const lifeStageRules = [
  { label: '영유아', range: '만 0~2세', icon: Baby },
  { label: '어린이', range: '만 3~12세', icon: Smile },
  { label: '청소년', range: '만 13~18세', icon: GraduationCap },
  { label: '성인', range: '만 19~64세', icon: UserCheck },
  { label: '고령자', range: '만 65세 이상', icon: Heart },
];

const statusOptions = [
  { id: 'pregnant', label: '임신 중입니다', icon: Baby },
  { id: 'breastfeeding', label: '수유 중입니다', icon: Milk },
  { id: 'none', label: '해당 없음', icon: CircleOff },
];

const caffeineOptions = [
  { id: 'sleep', label: '잠이 잘 오지 않음', icon: Bed },
  { id: 'heart', label: '심장이 두근거림', icon: HeartPulse },
  { id: 'anxiety', label: '불안감 또는 손 떨림', icon: UserRound },
  { id: 'none', label: '해당 없음', icon: CircleOff },
];

const allergyOptions = [
  { label: '유제품', icon: Milk },
  { label: '대두', icon: Bean },
  { label: '견과류', icon: Nut },
  { label: '글루텐', icon: Wheat },
  { label: '갑각류', icon: Shell },
  { label: '계란', icon: Egg },
];

const onboardingSteps = [
  {
    title: '연령대를 알려주세요',
    description: '연령 기준에 맞춰 성분 경고와 복용 주의를 조정합니다.',
    panelTitle: '연령 기준',
  },
  {
    title: '현재 상태를 알려주세요',
    description: '임신·수유 여부에 따라 주의 성분 안내가 달라집니다.',
    panelTitle: '현재 상태',
  },
  {
    title: '카페인 반응을 확인해요',
    description: '민감 증상이 있으면 고카페인 제품을 별도로 표시합니다.',
    panelTitle: '자주 있는 증상',
  },
  {
    title: '피하고 싶은 성분이 있나요?',
    description: '알레르기와 주의 성분을 저장해 상품 확인에 반영합니다.',
    panelTitle: '주의 성분',
  },
];

function toggleExclusiveOption(currentValues: string[], optionId: string) {
  if (optionId === 'none') {
    return currentValues.includes('none') ? [] : ['none'];
  }

  const withoutNone = currentValues.filter((value) => value !== 'none');

  return withoutNone.includes(optionId)
    ? withoutNone.filter((value) => value !== optionId)
    : [...withoutNone, optionId];
}

function OptionCard({
  id,
  label,
  supportingText,
  icon: Icon,
  checked,
  onToggle,
}: {
  id: string;
  label: string;
  supportingText?: string;
  icon?: ComponentType<{ className?: string }>;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Label
      htmlFor={id}
      className={cn(
        'flex min-h-[3.95rem] cursor-pointer items-center justify-between gap-3 border-b border-[#dde3eb] px-3.5 py-3 text-base font-medium transition-colors',
        checked
          ? 'rounded-lg border-primary bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(10,37,64,0.15)]'
          : 'text-primary hover:bg-[#f8fbff]'
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onToggle}
        className="sr-only"
      />
      <span className="flex min-w-0 flex-1 items-center gap-3">
        {Icon && (
          <span
            className={cn(
              'flex h-8 w-8 flex-shrink-0 items-center justify-center',
              checked ? 'text-primary-foreground' : 'text-primary'
            )}
          >
            <Icon className="h-[1.35rem] w-[1.35rem] stroke-[1.75]" />
          </span>
        )}
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-base font-medium">{label}</span>
          {supportingText && (
            <span
              className={cn(
                'mt-1 text-xs font-medium',
                checked ? 'text-primary-foreground/68' : 'text-muted-foreground'
              )}
            >
              {supportingText}
            </span>
          )}
        </span>
      </span>
      {checked && (
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center text-primary-foreground">
          <Check className="h-5 w-5 stroke-[2.15]" />
        </span>
      )}
    </Label>
  );
}

function SlideCard({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <section className="mx-auto w-[92%] rounded-[1.35rem] bg-white p-5 shadow-[0_14px_34px_rgba(10,37,64,0.09)] ring-1 ring-primary/[0.04]">
      {children}
    </section>
  );
}

export function OnboardingScreen() {
  const router = useRouter();
  const touchStartX = useRef<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLifeStage, setSelectedLifeStage] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCaffeineSymptoms, setSelectedCaffeineSymptoms] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [customIngredient, setCustomIngredient] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasCaffeineSensitivity =
    selectedCaffeineSymptoms.length > 0 && !selectedCaffeineSymptoms.includes('none');
  const canSubmit = Boolean(selectedLifeStage);
  const isLastStep = currentStep === 3;
  const canGoNext = currentStep === 0 ? canSubmit : true;
  const currentStepMeta = onboardingSteps[currentStep];

  const setStep = (step: number) => {
    setCurrentStep(step);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0 });
    });
  };

  const goToStep = (step: number) => {
    if (step === 0 || canSubmit) {
      setStep(step);
    }
  };

  const goToPreviousStep = () => {
    setStep(Math.max(currentStep - 1, 0));
  };

  const goToNextStep = () => {
    if (canGoNext) {
      setStep(Math.min(currentStep + 1, 3));
    }
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) {
      return;
    }

    const touchEndX = event.changedTouches[0]?.clientX;
    if (touchEndX === undefined) {
      touchStartX.current = null;
      return;
    }

    const deltaX = touchEndX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(deltaX) < 48) {
      return;
    }

    if (deltaX < 0) {
      goToNextStep();
    } else {
      goToPreviousStep();
    }
  };

  const handleStatusToggle = (optionId: string) => {
    setSelectedStatuses((currentValues) => toggleExclusiveOption(currentValues, optionId));
  };

  const handleCaffeineToggle = (optionId: string) => {
    setSelectedCaffeineSymptoms((currentValues) =>
      toggleExclusiveOption(currentValues, optionId)
    );
  };

  const handleAllergyToggle = (ingredient: string) => {
    setSelectedAllergies((currentValues) =>
      currentValues.includes(ingredient)
        ? currentValues.filter((value) => value !== ingredient)
        : [...currentValues, ingredient]
    );
  };

  const handlePrimaryAction = async () => {
    if (!isLastStep) {
      goToNextStep();
      return;
    }

    if (!canSubmit) {
      setStep(0);
      return;
    }

    setIsSubmitting(true);
    window.localStorage.setItem(
      'jikgubom:onboarding',
      JSON.stringify({
        lifeStage: selectedLifeStage,
        statuses: selectedStatuses,
        caffeineSymptoms: selectedCaffeineSymptoms,
        caffeineSensitive: hasCaffeineSensitivity,
        allergies: selectedAllergies,
        customIngredient: customIngredient.trim(),
      })
    );
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white px-4 pb-32 pt-7">
      <header className="mb-7">
        <div className="flex items-center justify-between">
          <Button
            asChild
            variant="ghost"
            className="h-8 rounded-md px-0 text-sm font-medium text-primary hover:bg-transparent"
          >
            <Link href="/login" aria-label="로그인으로 돌아가기">
              <span className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                이전
              </span>
            </Link>
          </Button>
          <span className="text-sm font-medium text-primary/48">
            {currentStep + 1}
            <span className="text-primary/25"> / 4</span>
          </span>
        </div>
        <div className="mt-5 flex items-center gap-1.5">
          {[0, 1, 2, 3].map((step) => (
            <button
              key={step}
              type="button"
              aria-label={`${step + 1}번째 카드로 이동`}
              onClick={() => goToStep(step)}
              className={cn(
                'h-0.5 flex-1 rounded-full transition-colors',
                step <= currentStep ? 'bg-primary' : 'bg-primary/12'
              )}
            />
          ))}
        </div>
        <div className="mt-8">
          <h1 className="text-[1.86rem] font-bold leading-tight text-primary">
            {currentStepMeta.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {currentStepMeta.description}
          </p>
        </div>
      </header>

      <div
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translate3d(-${currentStep * 100}%, 0, 0)` }}
        >
          <div className="min-w-0 flex-[0_0_100%]">
            <SlideCard>
              <div className="[&>button:last-child]:border-b-0">
                {lifeStageRules.map((rule) => {
                  const Icon = rule.icon;
                  const isActive = selectedLifeStage === rule.label;

                  return (
                    <button
                      key={rule.label}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setSelectedLifeStage(rule.label)}
                      className={cn(
                        'flex min-h-[3.95rem] w-full items-center justify-between gap-3 border-b border-[#dde3eb] px-3.5 py-3 text-left text-base font-medium transition-colors',
                        isActive
                          ? 'rounded-lg border-primary bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(10,37,64,0.15)]'
                          : 'text-primary hover:bg-[#f8fbff]'
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={cn(
                            'flex h-8 w-8 flex-shrink-0 items-center justify-center',
                            isActive ? 'text-primary-foreground' : 'text-primary'
                          )}
                        >
                          <Icon className="h-[1.35rem] w-[1.35rem] stroke-[1.75]" />
                        </span>
                        <span className="min-w-0 flex-1 truncate">
                          {rule.label} ({rule.range})
                        </span>
                      </span>
                      {isActive && (
                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center text-primary-foreground">
                          <Check className="h-5 w-5 stroke-[2.15]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </SlideCard>
          </div>

          <div className="min-w-0 flex-[0_0_100%]">
            <SlideCard>
              <div className="[&>label:last-child]:border-b-0">
                {statusOptions.map((option) => (
                  <OptionCard
                    key={option.id}
                    id={`status-${option.id}`}
                    label={option.label}
                    icon={option.icon}
                    checked={selectedStatuses.includes(option.id)}
                    onToggle={() => handleStatusToggle(option.id)}
                  />
                ))}
              </div>
            </SlideCard>
          </div>

          <div className="min-w-0 flex-[0_0_100%]">
            <SlideCard>
              <div className="[&>label:last-child]:border-b-0">
                {caffeineOptions.map((option) => (
                  <OptionCard
                    key={option.id}
                    id={`caffeine-${option.id}`}
                    label={option.label}
                    icon={option.icon}
                    checked={selectedCaffeineSymptoms.includes(option.id)}
                    onToggle={() => handleCaffeineToggle(option.id)}
                  />
                ))}
              </div>
              {hasCaffeineSensitivity && (
                <p className="mt-4 px-3 text-xs font-medium leading-5 text-muted-foreground">
                  고카페인 제품은 상품 확인 시 별도로 표시돼요.
                </p>
              )}
            </SlideCard>
          </div>

          <div className="min-w-0 flex-[0_0_100%]">
            <SlideCard>
              <div className="[&>label:last-child]:border-b-0">
                {allergyOptions.map((ingredient) => (
                  <OptionCard
                    key={ingredient.label}
                    id={`allergy-${ingredient.label}`}
                    label={ingredient.label}
                    icon={ingredient.icon}
                    checked={selectedAllergies.includes(ingredient.label)}
                    onToggle={() => handleAllergyToggle(ingredient.label)}
                  />
                ))}
              </div>
              <div className="mt-3 space-y-2">
                <Label htmlFor="customIngredient" className="text-sm font-medium text-foreground">
                  특정 성분명 직접 입력
                </Label>
                <Input
                  id="customIngredient"
                  value={customIngredient}
                  onChange={(event) => setCustomIngredient(event.target.value)}
                  placeholder="예) 멜라토닌, 요힘빈, DMAA"
                />
              </div>
            </SlideCard>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/92 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <div className="mx-auto grid max-w-[411px] grid-cols-[0.34fr_1fr] gap-4">
          <Button
            type="button"
            variant="ghost"
            className="h-14 text-lg font-medium text-primary"
            disabled={currentStep === 0}
            onClick={goToPreviousStep}
          >
            이전
          </Button>
          <Button
            onClick={handlePrimaryAction}
            disabled={!canGoNext || isSubmitting}
            className="h-14 rounded-lg text-lg font-medium"
            size="lg"
          >
            {isSubmitting
              ? '저장 중...'
              : isLastStep
                ? '시작하기'
                : '다음'}
          </Button>
        </div>
      </div>
    </div>
  );
}
