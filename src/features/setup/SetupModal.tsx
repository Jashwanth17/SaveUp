import React from 'react';
import { OnboardingView } from '../onboarding/OnboardingView';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in flex items-center justify-center p-3 sm:p-6 select-none">
      <div className="w-full max-w-5xl relative">
        <OnboardingView
          onComplete={onClose}
          onClose={onClose}
          isEditing={true}
        />
      </div>
    </div>
  );
};
