import React, { useState } from 'react';
import { 
  Sparkles, 
  Brain, 
  Heart, 
  Users, 
  ShieldCheck, 
  Compass, 
  Zap, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ArrowRight,
  Smile,
  Activity,
  Layers,
  FileCheck,
  CreditCard
} from 'lucide-react';

interface ServicesPageProps {
  onBookConsultation: () => void;
  onNavigate: (page: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onBookConsultation, onNavigate }) => {
  const [selectedGoal, setSelectedGoal] = useState<string>('anxiety');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const servicesList = [
    {
      id: 'individual',
      title: 'Individual Psychotherapy',
      duration: '50 Minutes',
      focus: 'Personal Clarity, Healing & Emotional Resilience',
      desc: 'One-on-one sessions addressing the root causes of persistent stress, low mood, grief, and life transitions. We co-create a safe container to unravel deep-seated patterns and build sustainable inner strength.',
      includes: ['Weekly dedicated 50-min session', 'Personalized nervous system toolkit', 'Direct email support between sessions', 'Quarterly progress reflections']
    },
    {
      id: 'couples',
      title: 'Couples & Marital Counseling',
      duration: '75 Minutes',
      focus: 'Communication, Trust Repair & Intimacy',
      desc: 'Groundbreaking Emotionally Focused Therapy (EFT) designed to de-escalate circular arguments, heal past betrayals, and re-establish profound emotional safety between partners.',
      includes: ['Interactive dual-partner assessments', 'De-escalation communication protocols', 'Conflict resolution blueprints', 'Attachment style integration']
    },
    {
      id: 'anxiety-panic',
      title: 'Anxiety, Panic & OCD Specialization',
      duration: '50 Minutes',
      focus: 'Nervous System Reset & Cognitive Restructuring',
      desc: 'Targeted interventions utilizing Exposure and Response Prevention (ERP) and somatic bio-calming to dismantle chronic worry, panic attacks, and intrusive thought spirals.',
      includes: ['Real-time panic interception exercises', 'Cognitive distortion re-mapping', 'Heart-rate variability calming techniques', 'Relapse prevention strategy']
    },
    {
      id: 'trauma-emdr',
      title: 'Trauma & PTSD Recovery (EMDR)',
      duration: '60–90 Minutes',
      focus: 'Gentle Memory Reprocessing & Bodily Integration',
      desc: 'Safe, bilateral EMDR stimulation to process unresolved childhood adverse experiences, single-incident trauma, or complex PTSD without requiring you to repeatedly re-tell painful details.',
      includes: ['Phase-based EMDR protocols', 'Somatic grounding stabilization', 'Resource installation & safe-place anchoring', 'Long-term trauma neutralization']
    },
    {
      id: 'burnout-executive',
      title: 'Executive Burnout & Performance Care',
      duration: '50 Minutes',
      focus: 'Boundary Mastery, Energy & Sustainable Drive',
      desc: 'Customized psychological support for high-achievers, healthcare professionals, founders, and leaders struggling with perfectionism, imposter syndrome, and chronic work fatigue.',
      includes: ['Workplace boundary audit', 'Cognitive overload mitigation', 'Sleep architecture optimization', 'Values-aligned career reorientation']
    },
    {
      id: 'mindfulness-somatic',
      title: 'Mindfulness & Somatic Body-Mind Care',
      duration: '50 Minutes',
      focus: 'Vagus Nerve Regulation & Embodied Peace',
      desc: 'Holistic mind-body sessions integrating polyvagal theory, somatic mindfulness, and breathwork to release tension stored deep in physical muscle memory.',
      includes: ['Vagus nerve stimulation techniques', 'Progressive neuromuscular decompression', 'Daily diaphragmatic breathing scripts', 'Mindful self-compassion practices']
    }
  ];

  const techniqueExplorer = {
    anxiety: {
      technique: 'CBT + Somatic Breathwork',
      why: 'Rapidly calms racing thoughts while reducing physical heart palpitations and muscular tightness.',
      outcome: '94% of clients report reduced panic frequency within 6 weeks.'
    },
    trauma: {
      technique: 'EMDR + Safe-Place Resource Anchoring',
      why: 'Directly reprocesses trauma in the limbic system without emotional overwhelm.',
      outcome: 'Permanent reduction in traumatic trigger sensitivity and intrusive memories.'
    },
    couples: {
      technique: 'Emotionally Focused Therapy (EFT)',
      why: 'Shifts blame patterns into deep vulnerability and mutual empathy.',
      outcome: 'Restores intimacy, respectful dialogue, and long-term marital security.'
    },
    burnout: {
      technique: 'ACT (Acceptance & Commitment) + Polyvagal Pacing',
      why: 'Replaces toxic productivity guilt with firm boundaries and aligned living.',
      outcome: 'Restored vitality, sound sleep, and sustainable career joy.'
    }
  };

  const serviceFaqs = [
    {
      q: 'How do I know which therapy service is right for me?',
      a: 'During our complimentary 15-minute introductory call, Dr. Elena Vance will listen to your symptoms, history, and primary goals to recommend the exact service modality (Individual, Couples, EMDR, or Somatic) best suited for your journey.'
    },
    {
      q: 'What is the investment per session?',
      a: 'Individual 50-minute sessions are $220. Couples 75-minute sessions are $290. Intensive 90-minute EMDR trauma sessions are $320. We offer a limited number of sliding-scale slots based on financial necessity.'
    },
    {
      q: 'How does the Superbill insurance reimbursement work?',
      a: 'At the end of each month, we provide you with an itemized Superbill with all required procedure (CPT) and diagnostic codes. You simply submit this receipt to your insurance provider (via their app or portal) for direct out-of-network reimbursement (typically covering 60%–80%).'
    },
    {
      q: 'Can sessions be held virtually via Telehealth?',
      a: 'Yes, all of our services are fully available through our secure, encrypted HIPAA-compliant telehealth portal, allowing you to participate comfortably from anywhere in the state.'
    }
  ];

  return (
    <div className="w-full bg-[#f6f9f3] text-[#1c2c19] pt-24 pb-20 px-4 sm:px-6 md:px-12 lg:px-20 transition-all duration-300">
      <div className="max-w-7xl mx-auto space-y-16 sm:space-y-24">

        {/* Page Header */}
        <section className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1c2c19]/5 border border-[#1c2c19]/10 text-xs font-semibold text-[#2d4728] uppercase tracking-wider">
            <Layers size={14} className="text-[#a4bc87]" /> Clinical Services & Specialized Care
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1c2c19] font-['Plus_Jakarta_Sans']">
            Tailored Psychological Services for Lasting Transformation
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-light">
            Explore our comprehensive suite of evidence-based individual therapy, couples counseling, trauma recovery, and somatic nervous system care.
          </p>
        </section>

        {/* Interactive Technique Matcher Tool */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 border border-[#d2dbc8] shadow-sm max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f4ec] text-xs font-semibold text-[#3c5d35]">
              <Sparkles size={14} /> Interactive Modality Matcher
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans']">
              What is your primary wellness goal today?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Select an area of focus to view our recommended clinical approach and expected outcome:
            </p>
          </div>

          {/* Goal Selector Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              { id: 'anxiety', label: 'Overcoming Anxiety & Panic' },
              { id: 'trauma', label: 'Healing Past Trauma' },
              { id: 'couples', label: 'Strengthening Relationship' },
              { id: 'burnout', label: 'Recovering from Burnout' },
            ].map((goal) => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                className={`p-3.5 rounded-2xl text-xs font-bold transition-all text-center cursor-pointer border ${
                  selectedGoal === goal.id
                    ? 'bg-[#1c2c19] text-white border-[#1c2c19] shadow-md scale-102'
                    : 'bg-[#fafcf8] text-slate-700 border-[#e2ebd9] hover:bg-[#f0f4ec]'
                }`}
              >
                {goal.label}
              </button>
            ))}
          </div>

          {/* Result Card */}
          {techniqueExplorer[selectedGoal as keyof typeof techniqueExplorer] && (
            <div className="bg-[#f7faf4] rounded-2xl p-6 sm:p-8 border border-[#d2dbc8] max-w-3xl mx-auto animate-fade-in space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2ebd9] pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#5c7a52]">Recommended Technique</span>
                  <h3 className="text-xl font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans']">
                    {techniqueExplorer[selectedGoal as keyof typeof techniqueExplorer].technique}
                  </h3>
                </div>
                <button
                  onClick={onBookConsultation}
                  className="self-start sm:self-auto bg-[#1c2c19] text-white hover:bg-[#2b4427] px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Book This Focus</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700">
                <div className="p-3.5 bg-white rounded-xl border border-[#e2ebd9]">
                  <p className="font-bold text-[#1c2c19] mb-1">Why this approach works:</p>
                  <p className="text-slate-600 leading-relaxed">
                    {techniqueExplorer[selectedGoal as keyof typeof techniqueExplorer].why}
                  </p>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-[#e2ebd9]">
                  <p className="font-bold text-[#1c2c19] mb-1">Clinical Outcome:</p>
                  <p className="text-slate-600 leading-relaxed">
                    {techniqueExplorer[selectedGoal as keyof typeof techniqueExplorer].outcome}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Services Directory Grid */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#5c7a52]">Core Practice Offerings</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1c2c19] font-['Plus_Jakarta_Sans']">
              Complete Therapeutic Services
            </h2>
            <p className="text-sm text-slate-600">
              Each session is conducted in a secure, confidential environment with bespoke clinical attention.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {servicesList.map((srv) => (
              <div 
                key={srv.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2ebd9] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#f0f4ec] text-[#2d4728] border border-[#d2dbc8]">
                      {srv.duration}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">In-Person & Telehealth</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans'] group-hover:text-[#3c5d35] transition-colors">
                      {srv.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#5c7a52] mt-1">
                      {srv.focus}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {srv.desc}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Included in Care:</p>
                    <ul className="space-y-1.5">
                      {srv.includes.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 size={14} className="text-[#5c7a52] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={onBookConsultation}
                  className="w-full bg-[#f6f9f3] text-[#1c2c19] hover:bg-[#1c2c19] hover:text-white py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#d2dbc8]"
                >
                  <span>Request Consultation</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Investment, Insurance & Superbill Transparency */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 border border-[#e2ebd9] shadow-sm max-w-5xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#5c7a52]">Financial Clarity</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans']">
              Transparent Fees & Insurance Reimbursement
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              No hidden fees, no surprise medical bills. We guide you through straightforward out-of-network benefits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#fafcf8] border border-[#e2ebd9] space-y-3">
              <CreditCard className="text-[#3c5d35]" size={24} />
              <h3 className="font-bold text-base text-[#1c2c19]">Session Pricing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                • 50-Min Individual: <strong>$220</strong><br/>
                • 75-Min Couples: <strong>$290</strong><br/>
                • 90-Min EMDR Trauma: <strong>$320</strong>
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#fafcf8] border border-[#e2ebd9] space-y-3">
              <FileCheck className="text-[#3c5d35]" size={24} />
              <h3 className="font-bold text-base text-[#1c2c19]">Superbill Receipts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We generate itemized monthly medical statements for PPO plans that typically reimburse 60%–80% of out-of-network therapy costs.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#fafcf8] border border-[#e2ebd9] space-y-3">
              <ShieldCheck className="text-[#3c5d35]" size={24} />
              <h3 className="font-bold text-base text-[#1c2c19]">HSA & FSA Eligible</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Health Savings Accounts (HSA) and Flexible Spending Accounts (FSA) debit cards are accepted directly for all therapy services.
              </p>
            </div>
          </div>
        </section>

        {/* Services FAQ Accordion */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#e2ebd9] shadow-sm max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans']">
              Services & Booking FAQ
            </h2>
          </div>

          <div className="space-y-3">
            {serviceFaqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  className="rounded-2xl border border-slate-200 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full text-left p-4 sm:p-5 bg-white hover:bg-[#fafcf9] flex items-center justify-between gap-4 transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-xs sm:text-sm text-[#1c2c19]">
                      {faq.q}
                    </span>
                    <ChevronDown 
                      size={18} 
                      className={`text-[#4a6b3f] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-[#fafcf8] animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-[#1c2c19] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl border border-white/10 max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold font-['Plus_Jakarta_Sans']">
            Begin Your Customized Therapy Plan
          </h2>
          <p className="text-xs sm:text-sm text-[#d2dbc8] max-w-xl mx-auto font-light">
            Take 2 minutes to book your free 15-minute consultation. We look forward to supporting your healing.
          </p>
          <button
            onClick={onBookConsultation}
            className="bg-white text-[#1c2c19] hover:bg-[#f0f4ec] px-8 py-4 rounded-full text-sm font-bold transition-all shadow-md hover:scale-105 cursor-pointer"
          >
            Schedule Free Consultation
          </button>
        </section>

      </div>
    </div>
  );
};
