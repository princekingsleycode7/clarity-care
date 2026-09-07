import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  FileText, 
  Scale, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  Mail, 
  ArrowLeft, 
  Printer, 
  ChevronRight,
  HelpCircle,
  Lock,
  HeartHandshake,
  Calendar,
  DollarSign,
  Award
} from 'lucide-react';

interface TermsPageProps {
  onNavigate?: (page: string) => void;
  onBookConsultation?: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate, onBookConsultation }) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const sections = [
    {
      id: 'emergency-disclaimer',
      number: '01',
      title: 'Emergency & Crisis Disclaimer (Non-Emergency Notice)',
      tag: 'Critical Safety Notice',
      plainEnglish: 'Clover Heart Haven is NOT an emergency or crisis service. If you are in physical danger, feeling suicidal, or facing severe psychiatric distress, please call emergency services immediately.',
      content: (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] flex items-start gap-3.5">
            <ShieldAlert size={24} className="shrink-0 mt-0.5 text-[#dc2626]" />
            <div className="text-sm leading-relaxed">
              <strong className="block font-bold text-base text-[#7f1d1d] mb-1">
                Immediate Crisis Resources:
              </strong>
              If you are experiencing suicidal ideation, urges to harm yourself or others, or an acute medical or psychiatric emergency, do not wait for an email response or appointment. Immediately contact:
              <ul className="mt-2 space-y-1 list-disc list-inside font-semibold">
                <li>National Suicide & Crisis Lifeline: Call or Text <span className="underline">988</span> (Available 24/7/365, Free & Confidential)</li>
                <li>The Crisis Text Line: Text <span className="underline">HOME to 741741</span></li>
                <li>Emergency Services: Call <span className="underline">911</span> or proceed to the nearest hospital emergency room</li>
              </ul>
            </div>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-[#2c3d2a]">
            Clover Heart Haven Inc. (&ldquo;Clover Heart Haven,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) provides planned, non-acute psychotherapeutic consultations, educational ebooks, self-reflection guides, and scheduled mental wellness sessions. Our communication channels (including online intake forms, web chat, automated follow-up sequences, and email addresses) are monitored only during regular business hours and are <strong>strictly incapable of handling acute emergencies</strong>.
          </p>
        </div>
      )
    },
    {
      id: 'acceptance-eligibility',
      number: '02',
      title: 'Acceptance of Terms & Eligibility Requirements',
      tag: 'Legal Contract',
      plainEnglish: 'By using this site, downloading our guides, or booking a call, you confirm you are at least 18 years old and agree to follow these rules.',
      content: (
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#2c3d2a]">
          <p>
            By accessing or browsing <code className="px-2 py-0.5 rounded bg-[#e8efe3] text-xs font-mono">cloverhearthaven.com</code>, purchasing digital materials, submitting contact information for guides (such as <em>Why You Still Miss Them</em>), or scheduling appointments, you acknowledge that you have read, understood, and agreed to be legally bound by these Terms of Service and our Privacy Policy.
          </p>
          <p>
            <strong>Age Requirement:</strong> You represent and warrant that you are at least eighteen (18) years of age and possess the legal capacity to enter into a binding agreement. Minors under the age of 18 may only receive clinical care with the verified written consent of a custodial parent or legal guardian in compliance with applicable state licensure laws.
          </p>
        </div>
      )
    },
    {
      id: 'scope-and-nature',
      number: '03',
      title: 'Nature of Services: Educational vs. Clinical Relationship',
      tag: 'Clinical Boundaries',
      plainEnglish: 'Downloading a free ebook or booking an exploratory clarity call does NOT automatically establish a doctor-patient relationship. Formal therapy begins only after mutual intake agreements are signed.',
      content: (
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#2c3d2a]">
          <p>
            To avoid misunderstandings and protect all parties, we maintain a clear distinction between educational materials and clinical therapy:
          </p>
          <ul className="space-y-2.5 list-disc list-inside pl-2">
            <li>
              <strong>Educational Content & Lead Magnets:</strong> Articles, newsletters, downloadable PDF guides, audio clips, and self-assessment tools are intended purely for psychoeducational and self-development purposes. They do not constitute personalized medical advice, formal psychiatric evaluation, or clinical diagnosis.
            </li>
            <li>
              <strong>Preliminary Clarity Consultations:</strong> Initial 15-to-30-minute discovery calls or telephone intakes serve as mutual exploratory evaluations to determine therapeutic fit. A formal, confidential clinician-patient relationship is created <em>only</em> after both parties execute our formal Clinical Consent Agreement, complete mandatory medical intake disclosures, and commence clinical care.
            </li>
            <li>
              <strong>Jurisdictional Licensing:</strong> Clinical psychotherapy is provided exclusively in jurisdictions where our practitioners hold active, valid professional licenses (such as LMFT, PsyD, LCSW, or LPC) in compliance with state telehealth statutes.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'bookings-cancellations',
      number: '04',
      title: 'Appointments, 24-Hour Cancellation Policy & Punctuality',
      tag: 'Scheduling & Fees',
      plainEnglish: 'We dedicate full clinical hours exclusively to you. If you need to cancel or reschedule, give us at least 24 hours notice so another person in need can use that time.',
      content: (
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#2c3d2a]">
          <p>
            When you schedule an appointment, that time is reserved exclusively for you and is unavailable to other clients. We require strict adherence to our scheduling policy:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
            <div className="p-4 rounded-xl bg-white border border-[#2d4728]/15 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-[#1c2c19] mb-1">
                <Clock size={18} className="text-[#a4bc87]" />
                24-Hour Notice Window
              </div>
              <p className="text-xs sm:text-sm text-[#465a43]">
                Cancellations or rescheduling requests submitted at least 24 hours prior to the scheduled start time incur zero penalty and may be rescheduled freely.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#dc2626]/20 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-[#991b1b] mb-1">
                <AlertTriangle size={18} className="text-[#dc2626]" />
                Late Cancellations & No-Shows
              </div>
              <p className="text-xs sm:text-sm text-[#465a43]">
                Appointments cancelled with less than 24 hours notice, or where a client fails to attend within 15 minutes of the start time, will be billed at the full session rate.
              </p>
            </div>
          </div>
          <p>
            <strong>Genuine Emergencies:</strong> We are human and understand that unforeseen medical emergencies, acute illnesses, or severe bereavement occur. Discretionary waivers may be granted on a case-by-case basis by notifying our office promptly.
          </p>
        </div>
      )
    },
    {
      id: 'payments-superbills',
      number: '05',
      title: 'Fees, Payment Processing & Out-of-Network Superbills',
      tag: 'Financial Terms',
      plainEnglish: 'We are an out-of-network practice to protect your privacy. Payment is processed securely through PCI-compliant gateways. We provide monthly superbills for insurance reimbursement.',
      content: (
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#2c3d2a]">
          <p>
            All fees for private sessions, workshops, and specialized programs are transparently stated before booking. Clients agree to maintain a valid, authorized credit card, debit card, or HSA/FSA card on file.
          </p>
          <ul className="space-y-2 list-disc list-inside pl-2">
            <li>
              <strong>PCI-DSS Compliance:</strong> Payment credentials are encrypted and handled directly by PCI-Level-1 compliant payment processors (e.g., Stripe). Clover Heart Haven never stores raw card numbers on its servers.
            </li>
            <li>
              <strong>Insurance & Superbills:</strong> Clover Heart Haven operates as an out-of-network provider. We do not accept direct insurance assignment or bill third-party insurers. Upon request, we provide detailed monthly itemized receipts (&ldquo;Superbills&rdquo;) containing standard diagnostic and procedural codes (CPT codes) for clients to submit to their private PPO or HSA/FSA plans for potential reimbursement.
            </li>
            <li>
              <strong>Chargebacks:</strong> By booking a service, you agree not to initiate fraudulent chargebacks or payment disputes for completed sessions. Legitimate billing inquiries should be directed to our support team for prompt review.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'intellectual-property',
      number: '06',
      title: 'Intellectual Property, Copyright & Limited Personal License',
      tag: 'Ownership Rights',
      plainEnglish: 'All guides, articles, videos, and The Clover Method™ materials are copyrighted. You may download them for your own personal healing, but you cannot resell or redistribute them.',
      content: (
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#2c3d2a]">
          <p>
            All original content published on our website—including but not limited to the title and contents of <em>Why You Still Miss Them</em>, therapeutic frameworks, The Clover Method™, text, graphics, logos, videos, audio exercises, and software code—is the exclusive intellectual property of Clover Heart Haven Inc. and protected by United States and international copyright, trademark, and unfair competition laws.
          </p>
          <p>
            <strong>Grant of Limited License:</strong> We grant you a personal, non-exclusive, non-transferable, revocable license to download and view one copy of educational resources solely for your private, non-commercial, personal healing use. You may not modify, reproduce, republish, broadcast, sell, or create derivative works from our materials without explicit prior written authorization.
          </p>
        </div>
      )
    },
    {
      id: 'client-conduct',
      number: '07',
      title: 'Client Conduct, Session Recording & Mutual Safety',
      tag: 'Behavior & Respect',
      plainEnglish: 'Therapy requires mutual safety. Recording sessions without written consent is strictly prohibited. Harassment or abusive behavior toward staff will result in immediate termination.',
      content: (
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#2c3d2a]">
          <p>
            To preserve clinical safety and confidentiality:
          </p>
          <ul className="space-y-2 list-disc list-inside pl-2">
            <li>
              <strong>No Unauthorized Recordings:</strong> Audio recording, video recording, taking screenshots, or broadcasting of telehealth sessions without the express, prior written agreement of the clinician is strictly illegal and constitutes grounds for immediate discharge and legal recourse.
            </li>
            <li>
              <strong>Respectful Communication:</strong> Our clinicians and administrative staff are dedicated to empathetic care. Verbal abuse, threats, harassment, discrimination, or invasive behavior toward any staff member will result in the immediate cancellation of services and termination of the relationship.
            </li>
            <li>
              <strong>Sobriety in Sessions:</strong> Clients must not be under the influence of non-prescribed intoxicating substances, alcohol, or illicit drugs during clinical sessions. If a clinician assesses that a client is impaired, the session will be paused immediately and billed in full.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'disclaimer-warranties',
      number: '08',
      title: 'Disclaimer of Warranties & Psychological Outcomes',
      tag: 'Legal Protection',
      plainEnglish: 'Healing is a personal journey. We provide evidence-based, compassionate clinical care, but cannot legally guarantee specific emotional or relationship results.',
      content: (
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#2c3d2a]">
          <p className="uppercase text-xs tracking-wider text-[#587352] font-bold">
            Notice Regarding Psychological Growth & Outcome Disclaimers
          </p>
          <p>
            Clover Heart Haven utilizes rigorous, evidence-based psychotherapeutic modalities (including CBT, ACT, EMDR, and Somatic Experiencing). However, psychological progress, personal transformation, grief resolution, and relationship outcomes depend on a complex array of personal, environmental, and interpersonal factors unique to each individual.
          </p>
          <p>
            EXCEPT WHERE PROHIBITED BY LAW, OUR PLATFORM AND SERVICES ARE PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS. CLOVER HEART HAVEN EXPRESSLY DISCLAIMS ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT GUARANTEE THAT THERAPY OR EDUCATIONAL MATERIALS WILL PRODUCE ANY SPECIFIC PSYCHOLOGICAL, EMOTIONAL, MARITAL, OR MEDICAL RESULT.
          </p>
        </div>
      )
    },
    {
      id: 'limitation-liability',
      number: '09',
      title: 'Limitation of Liability & Indemnification',
      tag: 'Airtight Legal Defense',
      plainEnglish: 'Our liability is strictly limited to the amount you paid us for services in the preceding three months. You agree to protect us from third-party claims arising from unauthorized use.',
      content: (
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#2c3d2a]">
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE JURISDICTIONAL LAW, IN NO EVENT SHALL CLOVER HEART HAVEN INC., ITS FOUNDERS, CLINICIANS, EMPLOYEES, CONTRACTORS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR EMOTIONAL DISTRESS ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE SITE, DIGITAL MATERIALS, OR CONSULTATIVE SERVICES.
          </p>
          <p>
            IN NO EVENT SHALL OUR TOTAL AGGREGATE LIABILITY ARISING FROM OR RELATING TO THESE TERMS OR OUR SERVICES EXCEED THE GREATER OF: (A) THE TOTAL AMOUNT ACTUALLY PAID BY YOU TO CLOVER HEART HAVEN DURING THE THREE (3) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO LIABILITY, OR (B) ONE HUNDRED UNITED STATES DOLLARS ($100.00 USD).
          </p>
          <p>
            <strong>Indemnification:</strong> You agree to defend, indemnify, and hold harmless Clover Heart Haven, its officers, clinicians, and agents against any third-party claims, liabilities, damages, losses, or expenses (including reasonable attorney fees) arising from your violation of these Terms, infringement of third-party rights, or unlawful conduct.
          </p>
        </div>
      )
    },
    {
      id: 'dispute-resolution',
      number: '10',
      title: 'Mandatory Informal Resolution, Binding Arbitration & Class Action Waiver',
      tag: 'Dispute Settlement',
      plainEnglish: 'If an issue arises, we first talk it out informally for 30 days. If unresolved, disputes are settled through private individual arbitration rather than public lawsuits or class actions.',
      content: (
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#2c3d2a]">
          <p>
            We believe in honest, open dialogue. If you ever feel dissatisfied with our services or materials, you agree to first contact our clinical administration at <a href="mailto:care@cloverhearthaven.com" className="text-[#1c2c19] font-semibold underline">care@cloverhearthaven.com</a> and participate in a good-faith thirty (30) day informal resolution dialogue before filing any legal claim.
          </p>
          <p>
            <strong>Binding Individual Arbitration:</strong> If the informal process does not resolve the matter, all claims, disputes, or controversies arising out of or relating to these Terms or our services shall be settled by binding individual arbitration administered by the American Arbitration Association (AAA) or JAMS in accordance with its Consumer Arbitration Rules. The arbitration shall be conducted before a single neutral arbitrator.
          </p>
          <p className="p-4 rounded-xl bg-[#e8efe3] border border-[#2d4728]/15 font-semibold text-xs sm:text-sm text-[#1c2c19]">
            CLASS ACTION WAIVER: YOU AND CLOVER HEART HAVEN AGREE THAT EACH PARTY MAY BRING CLAIMS AGAINST THE OTHER ONLY IN AN INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, CONSOLIDATED, OR REPRESENTATIVE PROCEEDING. YOU EXPRESSLY WAIVE ANY RIGHT TO A TRIAL BY JURY.
          </p>
        </div>
      )
    },
    {
      id: 'communications-tcpa',
      number: '11',
      title: 'Communications Consent, CAN-SPAM & TCPA Compliance',
      tag: 'Email & SMS Notifications',
      plainEnglish: 'We send appointment reminders, guides, and occasional healing newsletters. You can unsubscribe from marketing emails with one click at any time.',
      content: (
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#2c3d2a]">
          <p>
            When you enter your email address to download a resource or book a consultation, you consent to receive transactional notifications (such as calendar invitations, intake forms, and billing receipts) as well as periodic wellness insights and automated follow-up sequences.
          </p>
          <p>
            All marketing and educational email communications strictly comply with the federal CAN-SPAM Act and contain an immediate, functional &ldquo;Unsubscribe&rdquo; link. Operational emails directly concerning an upcoming clinical appointment or safety matter are exempt from marketing opt-outs.
          </p>
        </div>
      )
    },
    {
      id: 'governing-law',
      number: '12',
      title: 'Governing Law, Severability & Amendments to Terms',
      tag: 'Legal Framework',
      plainEnglish: 'These terms follow the laws of our primary practice jurisdiction. If any part is deemed invalid, the rest remains fully active and enforceable.',
      content: (
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#2c3d2a]">
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the State of California, without giving effect to its conflict of law principles.
          </p>
          <p>
            <strong>Severability:</strong> If any provision of these Terms is found to be unlawful, void, or for any reason unenforceable, that specific provision shall be deemed severable and shall not affect the validity and enforceability of any remaining provisions.
          </p>
          <p>
            <strong>Modifications:</strong> We reserve the right to modify these Terms periodically to reflect changes in regulatory standards or clinical practices. Updated terms will be posted with an updated &ldquo;Last Modified&rdquo; date. Continued use of our site or services after updates constitutes your affirmative acceptance.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="w-full bg-[#f6f9f3] text-[#1c2c19] pt-24 pb-20 px-4 sm:px-6 md:px-12 lg:px-20 transition-all duration-300">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Navigation Breadcrumb / Back button */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => onNavigate ? onNavigate('Home') : window.history.back()}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#3e5939] hover:text-[#1c2c19] transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back to Sanctuary
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#2d4728]/15 text-xs font-semibold text-[#1c2c19] hover:bg-[#eaf1e6] transition-all cursor-pointer shadow-xs"
              title="Print Terms of Service"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Print Document</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#2d4728]/15 text-xs font-semibold text-[#1c2c19] hover:bg-[#eaf1e6] transition-all cursor-pointer shadow-xs"
              title="Copy link to clipboard"
            >
              {copiedLink ? <CheckCircle2 size={14} className="text-emerald-600" /> : <FileText size={14} />}
              <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Hero Header */}
        <header className="space-y-4 pb-6 border-b border-[#2d4728]/15">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1c2c19]/5 border border-[#1c2c19]/10 text-xs font-semibold text-[#2d4728]">
            <Scale size={14} className="text-[#a4bc87]" />
            Legal & Clinical Service Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1c2c19] font-['Plus_Jakarta_Sans']">
            Terms of Service
          </h1>
          <p className="text-base sm:text-lg text-[#4a5f47] max-w-3xl leading-relaxed">
            Straightforward rules built to protect your personal healing journey, ensure clinical boundaries, and secure our therapeutic practice.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#62775f] pt-2">
            <span><strong>Effective Date:</strong> January 1, 2026</span>
            <span>•</span>
            <span><strong>Last Revised:</strong> September 6, 2026</span>
            <span>•</span>
            <span><strong>Version:</strong> 2.4 (Active)</span>
          </div>
        </header>

        {/* Human-First Mission Pledge Callout */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[#eaf1e6] border border-[#2d4728]/20 shadow-xs relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2e472a]">
              <HeartHandshake size={18} className="text-[#3b5936]" />
              Our Commitment: Protecting People & Healing Spaces
            </div>
            <p className="text-sm sm:text-base text-[#1c2c19] leading-relaxed">
              We are in the business of helping people heal, recover from heartbreak, and reclaim emotional resilience. To ensure our sanctuary remains safe, ethical, and legally protected, these Terms outline the rules of mutual respect, scheduling commitments, and crisis boundaries.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-[#304d2c]">
              <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-600" /> Transparent Out-of-Network Pricing</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-600" /> Complete Confidentiality Protocols</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-600" /> Clear 24-Hr Rescheduling Rules</span>
            </div>
          </div>
        </div>

        {/* Quick Table of Contents Jump Grid */}
        <nav aria-label="Table of Contents" className="p-5 rounded-2xl bg-white border border-[#2d4728]/15 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#354f32] mb-3 flex items-center gap-2">
            <FileText size={15} /> Quick Navigation Index
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-xs p-2 rounded-lg text-[#2f462c] hover:bg-[#eef4ec] hover:text-[#1c2c19] transition-colors flex items-center justify-between group"
              >
                <span className="truncate pr-1">
                  <span className="font-mono text-[#788f74] mr-1.5">{s.number}.</span>
                  {s.title.split('(')[0]}
                </span>
                <ChevronRight size={12} className="text-[#788f74] group-hover:translate-x-0.5 transition-transform shrink-0" />
              </a>
            ))}
          </div>
        </nav>

        {/* Main Content Sections */}
        <div className="space-y-12">
          {sections.map((sec) => (
            <article 
              key={sec.id} 
              id={sec.id} 
              className="scroll-mt-28 p-6 sm:p-8 rounded-2xl bg-white border border-[#2d4728]/15 shadow-xs space-y-5 transition-all hover:border-[#2d4728]/30"
            >
              {/* Header with Tag & Number */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2d4728]/10 pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#1c2c19] text-[#d2dbc8] font-mono text-xs font-bold flex items-center justify-center">
                    {sec.number}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans']">
                    {sec.title}
                  </h2>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#eef4ec] text-[#2c4728] border border-[#2c4728]/15">
                  {sec.tag}
                </span>
              </div>

              {/* In Plain English Translation Box */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#f7faf5] border-l-3 border-[#6b8b64] text-xs sm:text-sm text-[#2a3e28]">
                <strong className="font-bold text-[#1c2c19] mr-1.5">In Plain English:</strong>
                {sec.plainEnglish}
              </div>

              {/* Deep Legally Armed Provisions */}
              <div className="pt-2">
                {sec.content}
              </div>
            </article>
          ))}
        </div>

        {/* Contact & Legal Counsel Footnote */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#1c2c19] text-white space-y-4">
          <div className="flex items-center gap-3">
            <Lock size={20} className="text-[#a4bc87]" />
            <h3 className="text-lg font-bold font-['Plus_Jakarta_Sans']">Questions About Our Terms?</h3>
          </div>
          <p className="text-xs sm:text-sm text-[#c8dac0] leading-relaxed max-w-2xl">
            If you have questions regarding our clinical agreements, fee schedules, or compliance protocols, our administrative team is available to assist you.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs sm:text-sm">
            <a 
              href="mailto:care@cloverhearthaven.com" 
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#d2dbc8] text-[#1c2c19] font-bold hover:bg-white transition-colors cursor-pointer"
            >
              <Mail size={16} /> Contact Legal & Compliance
            </a>
            {onBookConsultation && (
              <button
                onClick={onBookConsultation}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#283d25] border border-[#3c5938] text-white font-bold hover:bg-[#344f30] transition-colors cursor-pointer"
              >
                <Calendar size={16} /> Schedule Consultation
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
