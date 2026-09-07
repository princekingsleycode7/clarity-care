import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  FileText, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Mail, 
  ArrowLeft, 
  Printer, 
  ChevronRight,
  Server,
  UserCheck,
  ShieldAlert,
  Sliders,
  ExternalLink
} from 'lucide-react';

interface PrivacyPageProps {
  onNavigate?: (page: string) => void;
  onOpenCookies?: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate, onOpenCookies }) => {
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
      id: 'core-philosophy',
      number: '01',
      title: 'Our Guiding Philosophy: Privacy as the Bedrock of Therapy',
      tag: 'Sacred Trust',
      plainEnglish: 'Healing requires complete vulnerability, which is impossible without absolute privacy. We treat your personal disclosures with the highest clinical and digital sanctity.',
      content: (
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#2c3d2a]">
          <p>
            At Clover Heart Haven Inc. (&ldquo;Clover Heart Haven,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), we recognize that seeking emotional support, recovering from painful breakups, or working through trauma requires profound courage. Digital safety is not an afterthought for us—it is an indispensable clinical prerequisite.
          </p>
          <p>
            This Privacy Policy details how we collect, store, encrypt, and handle your personal information when you visit <code className="px-2 py-0.5 rounded bg-[#e8efe3] text-xs font-mono">cloverhearthaven.com</code>, download guides (such as <em>Why You Still Miss Them</em>), schedule discovery calls, or communicate with our clinical team.
          </p>
        </div>
      )
    },
    {
      id: 'information-collected',
      number: '02',
      title: 'Categories of Information We Collect',
      tag: 'Data Transparency',
      plainEnglish: 'We collect only what is strictly necessary: your contact details to reach you, your booking preferences to match you, and basic technical logs to keep our system secure.',
      content: (
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#2c3d2a]">
          <p>We collect information in three transparent ways:</p>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-white border border-[#2d4728]/15 shadow-xs">
              <strong className="block font-bold text-[#1c2c19] text-sm mb-1">
                1. Information You Voluntarily Provide:
              </strong>
              <ul className="text-xs sm:text-sm text-[#3b4f38] list-disc list-inside space-y-1">
                <li><strong>Contact Identification:</strong> Full name, email address, phone number, and residential state/timezone.</li>
                <li><strong>Consultation & Intake Data:</strong> Reasons for seeking support, relationship status notes, scheduling preferences, and goals for therapy.</li>
                <li><strong>Payment Information:</strong> Processed directly through PCI-compliant providers (Stripe). We never store raw debit/credit card numbers or CVVs on our servers.</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#2d4728]/15 shadow-xs">
              <strong className="block font-bold text-[#1c2c19] text-sm mb-1">
                2. Automated Technical & Usage Data:
              </strong>
              <p className="text-xs sm:text-sm text-[#3b4f38] leading-relaxed">
                When navigating our platform, our servers automatically log technical metadata including your IP address, browser type, device operating system, referring URL, pages visited, and interaction timestamps to ensure platform uptime and prevent brute-force attacks.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#2d4728]/15 shadow-xs">
              <strong className="block font-bold text-[#1c2c19] text-sm mb-1">
                3. Lead Magnet & Funnel Attribution:
              </strong>
              <p className="text-xs sm:text-sm text-[#3b4f38] leading-relaxed">
                If you request our free recovery guides, we record the acquisition source (e.g. UTM campaign tags or landing page variant) to ensure accurate delivery of the requested publication and relevant healing follow-ups.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'how-we-use-information',
      number: '03',
      title: 'How We Use Your Information (Lawful Bases)',
      tag: 'Purpose of Processing',
      plainEnglish: 'We use your details solely to send you your requested guides, manage your appointments, confirm payments, and deliver high-quality clinical care.',
      content: (
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#2c3d2a]">
          <p>We process your personal information exclusively for lawful, legitimate clinical and operational purposes:</p>
          <ul className="space-y-2 list-disc list-inside pl-2">
            <li><strong>Service Delivery:</strong> Instantly emailing you requested ebooks, worksheets, or audio guides.</li>
            <li><strong>Care Coordination:</strong> Scheduling discovery calls, sending calendar invites, and coordinating telehealth links.</li>
            <li><strong>Clinical Continuity:</strong> Enabling your therapist to review your initial background notes prior to consultation.</li>
            <li><strong>Transactional Notifications:</strong> Delivering automated appointment reminders, intake paperwork, and billing superbills.</li>
            <li><strong>Platform Security:</strong> Detecting, preventing, and investigating fraud, unauthorized access, or DDoS disruptions.</li>
            <li><strong>Legal Compliance:</strong> Satisfying professional healthcare licensing requirements and state recordkeeping standards.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'no-sale-of-data',
      number: '04',
      title: 'Zero Sale of Personal Data (CCPA / CPRA & GDPR Guarantee)',
      tag: 'Ironclad Guarantee',
      plainEnglish: 'We DO NOT sell, rent, or trade your personal or health data to advertisers, data brokers, or third parties. Ever.',
      content: (
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#2c3d2a]">
          <div className="p-4 sm:p-5 rounded-xl bg-[#eef4ec] border border-[#2d4728]/20 flex items-start gap-3">
            <EyeOff size={22} className="text-[#2d4728] shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-[#1c2c19] text-sm mb-1">
                Our Non-Negotiable Commitment:
              </strong>
              <p className="text-xs sm:text-sm text-[#2a3e28]">
                Clover Heart Haven has never sold, and will never sell, rent, license, or barter your personal, health, or contact data to data brokers, advertising networks, or third-party marketing firms. We do not participate in cross-context behavioral advertising using your private intake data.
              </p>
            </div>
          </div>
          <p>
            Under the California Consumer Privacy Act (CCPA), as amended by the California Privacy Rights Act (CPRA), and the European Union General Data Protection Regulation (GDPR), you have the unalienable right to know that your sensitive personal information is strictly protected from commercial exploitation.
          </p>
        </div>
      )
    },
    {
      id: 'confidentiality-exceptions',
      number: '05',
      title: 'Clinical Confidentiality & Statutory Mandated Reporting Exceptions',
      tag: 'Legal Mandates',
      plainEnglish: 'Everything you share in therapy is confidential by law, with three strict legal exceptions where therapists are required to act to save lives or prevent abuse.',
      content: (
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#2c3d2a]">
          <p>
            Communications between a client and a licensed psychotherapist are protected by legal privilege and professional ethics codes (including HIPAA standards where applicable). However, in accordance with state and federal laws, there are specific, legally mandated circumstances where confidentiality must be breached to ensure safety:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-2">
            <div className="p-4 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#991b1b]">
              <strong className="block font-bold text-xs uppercase tracking-wider mb-1">1. Abuse of Vulnerable Persons</strong>
              <p className="text-xs leading-relaxed text-[#7f1d1d]">
                Mandated reporting laws require disclosure if there is reasonable suspicion of child abuse, neglect, elder abuse, or dependent adult mistreatment.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#991b1b]">
              <strong className="block font-bold text-xs uppercase tracking-wider mb-1">2. Imminent Danger to Self or Others</strong>
              <p className="text-xs leading-relaxed text-[#7f1d1d]">
                Under Tarasoff / Duty to Protect laws, if a client communicates an active, explicit, and imminent plan to harm themselves or an identifiable victim.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#991b1b]">
              <strong className="block font-bold text-xs uppercase tracking-wider mb-1">3. Valid Court Subpoena</strong>
              <p className="text-xs leading-relaxed text-[#7f1d1d]">
                If records are legally subpoenaed by a presiding judge with appropriate legal jurisdiction where privilege has been formally waived.
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#465a43]">
            Outside of these strict, life-safety statutory requirements, no details of your consultations or medical records will ever be released without your explicit, written authorization.
          </p>
        </div>
      )
    },
    {
      id: 'data-security',
      number: '06',
      title: 'Data Security, Encryption & Technical Safeguards',
      tag: 'High Security',
      plainEnglish: 'We use bank-grade TLS 1.3 encryption in transit and AES-256 encryption at rest. Access to your intake records is locked down to authorized clinicians.',
      content: (
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#2c3d2a]">
          <p>
            We implement administrative, physical, and technical safeguards engineered to protect your personal data against unauthorized access, destruction, loss, or alteration:
          </p>
          <ul className="space-y-2 list-disc list-inside pl-2">
            <li><strong>Transport Layer Security (TLS 1.3):</strong> All communications between your browser and our servers are encrypted using modern TLS 1.3 cipher suites.</li>
            <li><strong>Encryption at Rest (AES-256):</strong> Database records, booking tables, and stored contact entries are encrypted on disk utilizing industry-standard AES-256 encryption.</li>
            <li><strong>Role-Based Access Controls (RBAC):</strong> Administrative access is strictly tiered. Only credentialed clinical staff have access to intake responses, protected by multi-factor authentication (MFA).</li>
            <li><strong>Continuous Vulnerability Auditing:</strong> Regular automated security scanning, dependency vulnerability patching, and secure container hosting.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'subprocessors-infrastructure',
      number: '07',
      title: 'Trusted Service Providers & Infrastructure Partners',
      tag: 'Vetted Infrastructure',
      plainEnglish: 'We only partner with industry-leading, enterprise-grade cloud providers bound by strict confidentiality and data processing agreements.',
      content: (
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#2c3d2a]">
          <p>
            To reliably operate our platform and deliver services, we engage reputable third-party infrastructure providers who are contractually bound to process data solely on our instructions:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
            <div className="p-3.5 rounded-xl bg-white border border-[#2d4728]/15">
              <strong className="block text-sm font-bold text-[#1c2c19]">Supabase Inc.</strong>
              <p className="text-xs text-[#4b6048] mt-0.5">Encrypted PostgreSQL database hosting with strict Row Level Security (RLS) policies.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#2d4728]/15">
              <strong className="block text-sm font-bold text-[#1c2c19]">Resend Inc.</strong>
              <p className="text-xs text-[#4b6048] mt-0.5">Transactional email delivery for guide fulfillment and appointment confirmations.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#2d4728]/15">
              <strong className="block text-sm font-bold text-[#1c2c19]">Cal.com Inc. / Google Calendar</strong>
              <p className="text-xs text-[#4b6048] mt-0.5">HIPAA-ready appointment scheduling infrastructure and time slot coordination.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#2d4728]/15">
              <strong className="block text-sm font-bold text-[#1c2c19]">Stripe Inc.</strong>
              <p className="text-xs text-[#4b6048] mt-0.5">PCI-DSS Level 1 payment gateway processing out-of-network session deposits securely.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'data-retention',
      number: '08',
      title: 'Data Retention & Secure Cryptographic Disposal',
      tag: 'Records Lifecycle',
      plainEnglish: 'We keep your clinical intake notes for the time required by state medical licensing laws (typically 7 years), after which they are permanently deleted.',
      content: (
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#2c3d2a]">
          <p>
            We retain personal information only for as long as necessary to fulfill the clinical and legal purposes outlined in this policy:
          </p>
          <ul className="space-y-2 list-disc list-inside pl-2">
            <li><strong>Clinical Health Records:</strong> Retained for a minimum of seven (7) years following the conclusion of therapy (or longer for minor clients until reaching age 25), in compliance with state medical board regulations.</li>
            <li><strong>Marketing & Lead Magnet Contact Records:</strong> Retained until you opt-out or request deletion, after which your email is placed on a suppression list to honor your preference.</li>
            <li><strong>Cryptographic Disposal:</strong> When retention periods expire, records are permanently shredded from our databases using secure cryptographic erasure protocols.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'user-rights',
      number: '09',
      title: 'Your Privacy Rights (Access, Deletion & Opt-Out)',
      tag: 'Individual Control',
      plainEnglish: 'You have full rights over your data. You can request a copy of your records, ask for corrections, or request deletion at any time.',
      content: (
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#2c3d2a]">
          <p>Regardless of your geographic location, we respect your rights regarding your personal information:</p>
          <ul className="space-y-2 list-disc list-inside pl-2">
            <li><strong>Right to Know & Access:</strong> You may request a readable copy of the personal information we hold about you.</li>
            <li><strong>Right to Rectification:</strong> You may request correction of inaccurate contact or biographical details.</li>
            <li><strong>Right to Deletion:</strong> You may request the deletion of your personal data, subject only to mandatory legal and clinical healthcare retention obligations.</li>
            <li><strong>Right to Opt-Out:</strong> You may unsubscribe from any automated educational follow-up sequence with a single click via the link in any email footer.</li>
          </ul>
          <p className="text-xs text-[#4b6048] mt-2">
            To exercise any of these rights, email our designated privacy team at <a href="mailto:privacy@cloverhearthaven.com" className="text-[#1c2c19] font-semibold underline">privacy@cloverhearthaven.com</a>. We respond to all verified requests within thirty (30) days without charge.
          </p>
        </div>
      )
    },
    {
      id: 'childrens-privacy',
      number: '10',
      title: 'Children’s Privacy Protection (COPPA Compliance)',
      tag: 'Child Protection',
      plainEnglish: 'Our website is not designed for children under 13. Minors may only receive clinical care with formal parental consent.',
      content: (
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#2c3d2a]">
          <p>
            Clover Heart Haven does not knowingly solicit or collect personal information from children under the age of thirteen (13) in compliance with the Children&rsquo;s Online Privacy Protection Act (COPPA). If we discover that personal information has been submitted by a child under 13 without verified parental consent, we will promptly delete that data. Adolescent therapy services require executed parental/guardian consent and in-person intake verification.
          </p>
        </div>
      )
    },
    {
      id: 'privacy-officer',
      number: '11',
      title: 'Contacting our Privacy & Compliance Officer',
      tag: 'Direct Assistance',
      plainEnglish: 'Have questions or concerns about your privacy? Reach out directly to our dedicated compliance team.',
      content: (
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#2c3d2a]">
          <p>
            For questions about this policy, data processing practices, or to exercise your privacy rights, please contact our Privacy Officer:
          </p>
          <div className="p-4 rounded-xl bg-white border border-[#2d4728]/15 space-y-2 text-xs sm:text-sm">
            <p><strong>Clover Heart Haven Inc.</strong></p>
            <p>Attn: Privacy & Clinical Compliance Officer</p>
            <p>Email: <a href="mailto:privacy@cloverhearthaven.com" className="text-[#1c2c19] underline font-semibold">privacy@cloverhearthaven.com</a></p>
            <p>Urgent Clinical Inquiries: <a href="mailto:care@cloverhearthaven.com" className="text-[#1c2c19] underline font-semibold">care@cloverhearthaven.com</a></p>
            <p>Operating Hours: Monday – Friday, 9:00 AM – 5:00 PM (Pacific Time)</p>
          </div>
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
              title="Print Privacy Policy"
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
            <ShieldCheck size={14} className="text-[#a4bc87]" />
            Confidentiality & Data Protection Standards
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1c2c19] font-['Plus_Jakarta_Sans']">
            Privacy Policy
          </h1>
          <p className="text-base sm:text-lg text-[#4a5f47] max-w-3xl leading-relaxed">
            How we protect, encrypt, and respect your personal disclosures, clinical intake records, and digital footprint.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#62775f] pt-2">
            <span><strong>Effective Date:</strong> January 1, 2026</span>
            <span>•</span>
            <span><strong>Last Revised:</strong> September 6, 2026</span>
            <span>•</span>
            <span><strong>Compliance:</strong> HIPAA-Aligned • CCPA/CPRA • GDPR Compliant</span>
          </div>
        </header>

        {/* Executive Guarantee Card */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[#eaf1e6] border border-[#2d4728]/20 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2e472a]">
            <Lock size={18} className="text-[#3b5936]" />
            The Clover Heart Haven Privacy Pledge
          </div>
          <p className="text-sm sm:text-base text-[#1c2c19] leading-relaxed">
            Your trust is sacred. We treat your personal stories with the same confidentiality we provide in private therapy rooms. We do not sell your personal data, we do not share your health disclosures with advertisers, and we safeguard your digital records with end-to-end encryption.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-semibold text-[#304d2c]">
            <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-600" /> Never Sold or Rented</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-600" /> Bank-Grade AES-256 Encryption</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-600" /> One-Click Marketing Opt-Out</span>
          </div>
        </div>

        {/* Quick Table of Contents Index */}
        <nav aria-label="Table of Contents" className="p-5 rounded-2xl bg-white border border-[#2d4728]/15 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#354f32] flex items-center gap-2">
              <FileText size={15} /> Privacy Index & Quick Jump
            </h2>
            <button
              onClick={() => onNavigate ? onNavigate('Cookies') : (onOpenCookies ? onOpenCookies() : null)}
              className="text-xs font-bold text-[#2d4728] hover:text-[#1c2c19] flex items-center gap-1 underline cursor-pointer"
            >
              <Sliders size={13} /> Manage Cookie Settings
            </button>
          </div>
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

        {/* Policy Sections */}
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

              {/* In Plain English Translation */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#f7faf5] border-l-3 border-[#6b8b64] text-xs sm:text-sm text-[#2a3e28]">
                <strong className="font-bold text-[#1c2c19] mr-1.5">In Plain English:</strong>
                {sec.plainEnglish}
              </div>

              {/* Legal Content */}
              <div className="pt-2">
                {sec.content}
              </div>
            </article>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#1c2c19] text-white space-y-4">
          <div className="flex items-center gap-3">
            <Lock size={20} className="text-[#a4bc87]" />
            <h3 className="text-lg font-bold font-['Plus_Jakarta_Sans']">Manage Your Privacy Preferences</h3>
          </div>
          <p className="text-xs sm:text-sm text-[#c8dac0] leading-relaxed max-w-2xl">
            You are always in control of your digital footprint. Adjust your cookie settings or request a formal review of your personal records at any time.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs sm:text-sm">
            <button
              onClick={() => onNavigate ? onNavigate('Cookies') : (onOpenCookies ? onOpenCookies() : null)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#d2dbc8] text-[#1c2c19] font-bold hover:bg-white transition-colors cursor-pointer"
            >
              <Sliders size={16} /> Open Cookie Preference Center
            </button>
            <a 
              href="mailto:privacy@cloverhearthaven.com" 
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#283d25] border border-[#3c5938] text-white font-bold hover:bg-[#344f30] transition-colors cursor-pointer"
            >
              <Mail size={16} /> Email Privacy Officer
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
