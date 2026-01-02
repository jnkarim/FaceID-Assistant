"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type StepId = 0 | 1 | 2;

const steps: { id: StepId; title: string; body: string }[] = [
  {
    id: 0,
    title: "Welcome to FaceID Assistant",
    body:
      "This app uses your camera to detect and recognize registered faces in real time. It stores facial data in a database for instant identification.",
  },
  {
    id: 1,
    title: "Register people",
    body:
      "Go to the Add Person page, enter a name and description, upload a clear frontal photo, and save to store them in the database.",
  },
  {
    id: 2,
    title: "Run recognition",
    body:
      "On the Home page, allow camera access. The system will automatically detect faces and show recognition results directly on the video feed.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<StepId>(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentStep = steps[step];
  const isLast = step === steps.length - 1;
  const isFirst = step === 0;

  const handleNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
      if (isLast) {
        router.push("/");
        return;
      }
      setStep((prev) => (prev + 1) as StepId);
      setIsAnimating(false);
    }, 300);
  };

  const handleBack = () => {
    if (isFirst) return;
    setIsAnimating(true);
    setTimeout(() => {
      setStep((prev) => (prev - 1) as StepId);
      setIsAnimating(false);
    }, 300);
  };

  const handleSkip = () => {
    router.push("/");
  };

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-slideIn {
          opacity: 0;
          animation: slideIn 0.5s ease-out forwards;
        }
      `}</style>
      <main className="min-h-screen bg-neutral-950 text-neutral-50 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-2xl">
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            {steps.map((s, index) => (
              <span
                key={s.id}
                className={[
                  "h-1.5 sm:h-2 rounded-full transition-all",
                  index === step ? "w-6 sm:w-8 bg-lime-400" : "w-2 sm:w-2.5 bg-neutral-700",
                ].join(" ")}
              />
            ))}
          </div>

          {/* Card */}
          <div 
            className={`rounded-2xl sm:rounded-3xl border border-neutral-700 bg-neutral-900 p-6 sm:p-8 md:p-10 shadow-2xl transition-all duration-300 ${
              isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            }`}
          >
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-lime-400 mb-2 sm:mb-3 font-semibold">
              Step {step + 1} of {steps.length}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-white">{currentStep.title}</h1>
            <p className="text-sm sm:text-base text-neutral-100 mb-6 sm:mb-8 leading-relaxed">{currentStep.body}</p>

            {/* Extra bullets for some steps */}
            {step === 1 && (
              <ul className="mb-6 sm:mb-8 space-y-2 sm:space-y-3 text-xs sm:text-sm text-neutral-100 animate-fadeIn">
                <li className="flex items-start gap-2 sm:gap-3 animate-slideIn" style={{ animationDelay: "0.1s" }}>
                  <span className="text-lime-400 mt-0.5 flex-shrink-0 font-bold">→</span>
                  <span>Navigate to {"Add Person"}.</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 animate-slideIn" style={{ animationDelay: "0.2s" }}>
                  <span className="text-lime-400 mt-0.5 flex-shrink-0 font-bold">→</span>
                  <span>Enter name and description.</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 animate-slideIn" style={{ animationDelay: "0.3s" }}>
                  <span className="text-lime-400 mt-0.5 flex-shrink-0 font-bold">→</span>
                  <span>Upload a clear face image.</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 animate-slideIn" style={{ animationDelay: "0.4s" }}>
                  <span className="text-lime-400 mt-0.5 flex-shrink-0 font-bold">→</span>
                  <span>Click save to store in database.</span>
                </li>
              </ul>
            )}

            {step === 2 && (
              <ul className="mb-6 sm:mb-8 space-y-2 sm:space-y-3 text-xs sm:text-sm text-neutral-100 animate-fadeIn">
                <li className="flex items-start gap-2 sm:gap-3 animate-slideIn" style={{ animationDelay: "0.1s" }}>
                  <span className="text-lime-400 mt-0.5 flex-shrink-0 font-bold">→</span>
                  <span>Open the Home page.</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 animate-slideIn" style={{ animationDelay: "0.2s" }}>
                  <span className="text-lime-400 mt-0.5 flex-shrink-0 font-bold">→</span>
                  <span>Allow camera access in the browser prompt.</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 animate-slideIn" style={{ animationDelay: "0.3s" }}>
                  <span className="text-lime-400 mt-0.5 flex-shrink-0 font-bold">→</span>
                  <span>Wait a moment for detection and recognition.</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 animate-slideIn" style={{ animationDelay: "0.4s" }}>
                  <span className="text-lime-400 mt-0.5 flex-shrink-0 font-bold">→</span>
                  <span>Recognized names appear on top of the video feed.</span>
                </li>
              </ul>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-between gap-3 sm:gap-4 pt-2 sm:pt-4">
              <button
                type="button"
                onClick={handleBack}
                disabled={isFirst}
                className="text-xs sm:text-sm rounded-full border-2 border-neutral-600 px-4 sm:px-6 py-2 sm:py-2.5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-neutral-400 hover:bg-neutral-800 transition-all active:scale-95"
              >
                Back
              </button>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-xs sm:text-sm text-neutral-300 hover:text-white transition-colors px-2 sm:px-3 active:scale-95 font-medium"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-full bg-lime-400 px-5 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-black hover:bg-lime-300 transition-colors shadow-lg shadow-lime-400/20 active:scale-95"
                >
                  {isLast ? "Finish" : "Next"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}