import React from 'react';
import { ConsultationOnboardingModal } from './ConsultationOnboardingModal';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

export const ContactModal: React.FC<ContactModalProps> = (props) => {
  return <ConsultationOnboardingModal {...props} />;
};
