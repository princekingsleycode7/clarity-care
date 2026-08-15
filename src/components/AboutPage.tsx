import React, { useState } from 'react';
import { 
  Award, 
  GraduationCap, 
  Heart, 
  Sparkles, 
  Brain, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Calendar,
  Compass,
  Smile,
  Activity
} from 'lucide-react';
import doctorPortrait from '../assets/images/licensed_therapist_session_1786464568739.jpg';
import practiceImg from '../assets/images/therapy_support_woman_1786464396553.jpg';

interface AboutPageProps {
  onBookConsultation: () => void;
  onNavigate: (page: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBookConsultation, onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeTechniqueTab, setActiveTechniqueTab] = useState<string>('cbt');

  const faqs = [
    {
      q: 'What are Dr. Elena Vance\'s clinical credentials and background?',
      a: 'Dr. Elena Vance holds a Doctorate in Clinical Psychology (PsyD) from Columbia University and completed specialized postdoctoral fellowship training in Mindfulness-Based Cognitive Therapy at Harvard Medical School. She is a Licensed Marriage and Family Therapist (LMFT #84920) and Certified EMDR Practitioner with over 14 years of clinical experience guiding individuals and couples through anxiety, trauma, and life transitions.'
    },
    {
      q: 'What should I expect during our first 50-minute consultation?',
      a: 'Our initial intake session is a safe, unhurried space focused entirely on understanding your story. We will explore what brings you to therapy, your current challenges, personal history, and what meaningful healing looks like for you. You\'ll never be pressured to share more than you feel ready for. By the end of the session, we will outline a personalized treatment roadmap tailored to your pace.'
    },
    {
      q: 'Which clinical techniques and modalities does Dr. Vance practice?',
      a: 'Dr. Vance utilizes an integrative, evidence-based approach combining Cognitive Behavioral Therapy (CBT), Acceptance and Commitment Therapy (ACT), Eye Movement Desensitization and Reprocessing (EMDR), Somatic Experiencing, and Mindfulness-Based Stress Reduction. Every plan is dynamically customized to match your individual nervous system and psychological needs.'
    },
    {
      q: 'Is online / telehealth therapy as effective as in-person sessions?',
      a: 'Yes. Extensive clinical research and our own patient outcomes confirm that secure, HIPAA-compliant telehealth provides equal efficacy to in-person sessions for anxiety, depression, burnout, and couples counseling. Telehealth offers the comfort of your own home, eliminates commute stress, and allows flexible scheduling across multiple time zones.'
    },
    {
      q: 'Do you accept insurance or provide superbills for reimbursement?',
      a: 'We are an out-of-network provider to guarantee the highest standard of confidential, unrestricted care without insurance companies dictating session limits. We provide comprehensive monthly Superbills (itemized medical receipts) with all necessary diagnostic codes for direct reimbursement from your PPO or FSA/HSA accounts, typically covering 60%–80% of costs.'
    },
    {
      q: 'How long does therapy typically take to see tangible relief?',
      a: 'While every journey is unique, most clients report noticeable symptom reduction, improved emotional regulation, and clearer perspective within 4 to 8 weekly sessions. Long-term transformative shifts in relationship patterns and trauma processing often unfold across 3 to 6 months of steady collaboration.'
    }
  ];

  const techniques = [
    {
      id: 'cbt',
      name: 'Cognitive Behavioral Therapy (CBT)',
      tagline: 'Reframing negative thought loops into constructive clarity',
      desc: 'CBT uncovers the unconscious cognitive distortions that fuel anxiety, self-doubt, and depressive spirals. Through practical exercises, you learn to identify trigger thoughts, evaluate objective evidence, and construct balanced neural pathways that support daily resilience.',
      benefits: ['Rapid symptom alleviation for acute anxiety', 'Identification of automatic negative thoughts', 'Actionable behavioral experiments between sessions']
    },
    {
      id: 'act',
      name: 'Acceptance & Commitment Therapy (ACT)',
      tagline: 'Making peace with difficult emotions while living your core values',
      desc: 'Instead of exhausting yourself fighting painful thoughts and feelings, ACT teaches psychological flexibility. You learn to accept inner experiences without letting them dictate your behavior, channeling your energy toward actions that align with what matters most to you.',
      benefits: ['Enhanced psychological flexibility', 'Diffusion from harsh self-judgment', 'Clarification of deeply held personal values']
    },
    {
      id: 'emdr',
      name: 'EMDR & Trauma Processing',
      tagline: 'Unlocking and desensitizing stored traumatic memories',
      desc: 'Eye Movement Desensitization and Reprocessing uses bilateral stimulation to assist the brain in reprocessing distressing memories stored in the nervous system. EMDR allows past pain to be integrated peacefully without triggering intense emotional arousal.',
      benefits: ['Effective PTSD and acute stress resolution', 'Reduction in physical panic reactions', 'Permanent desensitization of lingering traumatic triggers']
    },
    {
      id: 'somatic',
      name: 'Somatic & Nervous System Regulation',
      tagline: 'Healing emotional distress through the wisdom of the body',
      desc: 'Trauma and chronic stress reside physically in the nervous system. Somatic experiencing utilizes gentle breathwork, progressive neuromuscular release, and vagus nerve toning to restore your body to a calm, grounded baseline of safety.',
      benefits: ['Release of chronic bodily tension and tightness', 'Vagus nerve stimulation for sustained calm', 'Restoration of natural sleep and heart rhythm balance']
    }
  ];

  return (
    <div className="w-full bg-[#f6f9f3] text-[#1c2c19] pt-24 pb-20 px-4 sm:px-6 md:px-12 lg:px-20 transition-all duration-300">
      <div className="max-w-7xl mx-auto space-y-16 sm:space-y-24">
        
        {/* Header Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1c2c19]/5 border border-[#1c2c19]/10 text-xs font-semibold text-[#2d4728] uppercase tracking-wider">
            <Heart size={14} className="text-[#a4bc87]" /> About Clover Heart Haven & Dr. Elena Vance
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1c2c19] font-['Plus_Jakarta_Sans']">
            Compassionate Care Grounded in Neuroscience & Warmth
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-light">
            We believe that mental wellness is not merely the absence of distress, but the presence of deep self-compassion, resilience, and meaningful connection.
          </p>
        </section>

        {/* Doctor Bio & Practice Story */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center bg-white rounded-3xl p-6 sm:p-10 md:p-14 shadow-sm border border-[#e2ebd9]">
          {/* Doctor Portrait */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] shadow-lg border border-[#d2dbc8]">
              <img 
                src={doctorPortrait} 
                alt="Dr. Elena Vance" 
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c2c19]/70 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="font-bold text-xl font-['Plus_Jakarta_Sans']">Dr. Elena Vance, PsyD, LMFT</p>
                <p className="text-xs text-[#d2dbc8] font-medium">Founder & Clinical Director • 14+ Yrs Experience</p>
              </div>
            </div>
            
            {/* Accreditations Badge */}
            <div className="absolute -bottom-4 -right-2 sm:-right-4 bg-[#1c2c19] text-white p-3 sm:p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-white/20">
              <div className="w-10 h-10 rounded-full bg-[#a4bc87]/20 flex items-center justify-center text-[#a4bc87]">
                <Award size={22} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold leading-tight">Harvard & Columbia</p>
                <p className="text-[10px] text-gray-300">Trained Specialist</p>
              </div>
            </div>
          </div>

          {/* Doctor Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#5c7a52]">Meet Your Lead Therapist</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#1c2c19] font-['Plus_Jakarta_Sans']">
                "Healing happens when you are truly seen, heard, and met with unconditional respect."
              </h2>
            </div>
            
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Dr. Elena Vance founded <strong>Clover Heart Haven</strong> with a singular mission: to provide an antidote to clinical, sterile therapy environments. Combining advanced cognitive psychology with somatic nervous system regulation, Dr. Vance creates a warm, empowering sanctuary where clients unburden their deepest anxieties and reclaim vibrant mental clarity.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#f6f9f3] border border-[#d2dbc8]/60 flex items-start gap-3">
                <GraduationCap className="text-[#3c5d35] mt-1 shrink-0" size={20} />
                <div>
                  <p className="text-xs font-bold text-[#1c2c19]">Doctorate in Clinical Psychology</p>
                  <p className="text-[11px] text-slate-500">Columbia University, NYC</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#f6f9f3] border border-[#d2dbc8]/60 flex items-start gap-3">
                <Brain className="text-[#3c5d35] mt-1 shrink-0" size={20} />
                <div>
                  <p className="text-xs font-bold text-[#1c2c19]">Fellow in Mindfulness CBT</p>
                  <p className="text-[11px] text-slate-500">Harvard Medical School</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#f6f9f3] border border-[#d2dbc8]/60 flex items-start gap-3">
                <ShieldCheck className="text-[#3c5d35] mt-1 shrink-0" size={20} />
                <div>
                  <p className="text-xs font-bold text-[#1c2c19]">Licensed LMFT #84920</p>
                  <p className="text-[11px] text-slate-500">Board Certified & Supervised</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#f6f9f3] border border-[#d2dbc8]/60 flex items-start gap-3">
                <Sparkles className="text-[#3c5d35] mt-1 shrink-0" size={20} />
                <div>
                  <p className="text-xs font-bold text-[#1c2c19]">EMDR Institute Certified</p>
                  <p className="text-[11px] text-slate-500">Advanced Trauma Integration</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onBookConsultation}
                className="bg-[#1c2c19] text-white hover:bg-[#2b4427] px-6 py-3.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide flex items-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <span>Schedule Free 15-Min Consultation</span>
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => onNavigate('Service')}
                className="bg-[#f0f4ec] text-[#1c2c19] hover:bg-[#e2ebd9] px-5 py-3.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer"
              >
                Explore Services & Techniques
              </button>
            </div>
          </div>
        </section>

        {/* Therapeutic Techniques Deep Dive */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#5c7a52]">Our Clinical Modalities</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1c2c19] font-['Plus_Jakarta_Sans']">
              Evidence-Based Techniques Tailored to You
            </h2>
            <p className="text-sm text-slate-600">
              We never enforce a one-size-fits-all formula. Select a modality below to discover how it directly supports healing:
            </p>
          </div>

          {/* Technique Tabs */}
          <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-white rounded-2xl max-w-3xl mx-auto border border-[#e2ebd9] shadow-sm">
            {techniques.map((tech) => (
              <button
                key={tech.id}
                onClick={() => setActiveTechniqueTab(tech.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTechniqueTab === tech.id
                    ? 'bg-[#1c2c19] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#1c2c19] hover:bg-slate-50'
                }`}
              >
                {tech.name.split('(')[0].trim()}
              </button>
            ))}
          </div>

          {/* Active Technique Display Card */}
          {techniques.map((tech) => {
            if (tech.id !== activeTechniqueTab) return null;
            return (
              <div 
                key={tech.id}
                className="bg-white rounded-3xl p-6 sm:p-10 border border-[#d2dbc8] shadow-sm max-w-4xl mx-auto animate-fade-in space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans']">
                      {tech.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4a6b3f] font-medium mt-1">
                      {tech.tagline}
                    </p>
                  </div>
                  <span className="self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-[#f4f8f1] text-[#2c4724] text-xs font-bold border border-[#d2dbc8]">
                    Clinical Gold Standard
                  </span>
                </div>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  {tech.desc}
                </p>

                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Clinical Benefits</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {tech.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#f9fbf7] border border-[#e2ebd9]">
                        <CheckCircle2 size={16} className="text-[#5c7a52] shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700 font-medium leading-tight">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Doctor & Process FAQ Accordion */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 md:p-14 border border-[#e2ebd9] shadow-sm max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f4ec] text-xs font-semibold text-[#3c5d35]">
              <HelpCircle size={14} /> Clear Answers & Transparency
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans']">
              Frequently Asked Questions About Therapy & Dr. Vance
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Everything you need to know prior to beginning your therapeutic journey.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  className="rounded-2xl border border-slate-200 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full text-left p-5 sm:p-6 bg-white hover:bg-[#fafcf9] flex items-center justify-between gap-4 transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-sm sm:text-base text-[#1c2c19] font-['Plus_Jakarta_Sans']">
                      {faq.q}
                    </span>
                    <ChevronDown 
                      size={20} 
                      className={`text-[#4a6b3f] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-6 pt-1 sm:px-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-[#fafcf8] animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom Call to Action Banner */}
        <section className="bg-[#1c2c19] text-white rounded-3xl p-8 sm:p-12 md:p-16 text-center relative overflow-hidden shadow-xl border border-white/10">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-['Plus_Jakarta_Sans']">
              Ready to take the first step toward lasting peace of mind?
            </h2>
            <p className="text-sm sm:text-base text-[#d2dbc8] font-light leading-relaxed">
              Book a complimentary 15-minute consultation with Dr. Elena Vance to discuss your goals and find the exact path for your wellness.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <button
                onClick={onBookConsultation}
                className="bg-white text-[#1c2c19] hover:bg-[#f0f4ec] px-8 py-4 rounded-full text-sm font-bold transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
              >
                Schedule Free Consultation
              </button>
              <button
                onClick={() => onNavigate('Contact')}
                className="bg-transparent border border-white/30 text-white hover:bg-white/10 px-7 py-4 rounded-full text-sm font-semibold transition-all cursor-pointer"
              >
                View Contact & Office Location
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
