import React from 'react';

interface OnboardingWelcomeProps {
  onComplete: () => void;
}

export const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({ onComplete }) => {
  return (
    <div className="relative h-screen w-screen bg-gray-900 font-sans">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556911220-e15b29be8c9f?q=80&w=2070&auto=format&fit=crop')" }}
      ></div>
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white p-4">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Finally, Food Cost Control That's Actually Easy
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-200">
            AI handles the busywork. You focus on cooking great food.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-y-6">
            <button
              onClick={onComplete}
              className="rounded-md bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transform transition-transform duration-200 hover:scale-105"
            >
              Get Started - It's Free
            </button>
            <p className="text-sm">
              Already have an account?{' '}
              <a href="#" className="font-semibold text-blue-400 hover:text-blue-300">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};