export const NAME_MIN = 4;
export const NAME_MAX = 32;

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

export const PASSWORD_RULES = [
  {
    id: "minLength",
    label: `At least ${8} characters`,
    test: (v) => v.length >= 8,
  },
  {
    id: "uppercase",
    label: "At least one uppercase letter (A-Z)",
    test: (v) => /[A-Z]/.test(v),
  },
  {
    id: "lowercase",
    label: "At least one lowercase letter (a-z)",
    test: (v) => /[a-z]/.test(v),
  },
  {
    id: "digit",
    label: "At least one number (0-9)",
    test: (v) => /\d/.test(v),
  },
  {
    id: "special",
    label: "At least one special character (!@#$%…)",
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
];

export const TERMS_SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using Threadline you agree to be bound by these Terms and Conditions. " +
      "If you do not agree with any part of these terms, you must not use the platform.",
  },
  {
    title: "2. User Accounts",
    content:
      "You must register for an account to create communities, publish posts, comment, and vote. " +
      "You are responsible for maintaining the confidentiality of your credentials and for all activity that occurs under your account. " +
      "Threadline reserves the right to suspend or terminate accounts that violate these terms.",
  },
  {
    title: "3. User Content",
    content:
      "You retain ownership of any content you post on Threadline. By submitting content you grant Threadline " +
      "a non-exclusive, royalty-free licence to display and distribute that content within the platform. " +
      "You agree not to post content that is unlawful, defamatory, hateful, or infringes on the rights of others.",
  },
  {
    title: "4. Community Guidelines",
    content:
      "Community creators are responsible for moderating their communities. " +
      "Threadline administrators may remove content or communities that violate these terms or that are reported for abuse. " +
      "Repeated violations may result in a permanent account block.",
  },
  {
    title: "5. Limitation of Liability",
    content:
      "Threadline is provided on an \"as is\" and \"as available\" basis. We do not guarantee uninterrupted or error-free " +
      "operation of the platform. To the fullest extent permitted by law, Threadline shall not be liable for any indirect, " +
      "incidental, or consequential damages arising from your use of the service.",
  },
  {
    title: "6. Changes to Terms",
    content:
      "We may update these Terms and Conditions from time to time. Continued use of the platform after changes " +
      "are published constitutes acceptance of the revised terms. We encourage you to review this page periodically.",
  },
];

export const PRIVACY_SECTIONS = [
  {
    title: "1. Information We Collect",
    content:
      "When you register we collect your email address, username, and optional profile details such as " +
      "your first name, last name, phone number, and avatar image. We also collect content you create " +
      "(posts, comments, votes) and basic usage data needed to operate the platform.",
  },
  {
    title: "2. How We Use Your Information",
    content:
      "Your information is used to provide and improve the Threadline service: authenticating your account, " +
      "displaying your profile and content to other users, calculating reputation scores, and sending " +
      "service-related notifications. We do not sell your personal data to third parties.",
  },
  {
    title: "3. Data Storage & Security",
    content:
      "Your data is stored securely via Supabase infrastructure with row-level security policies. " +
      "Passwords are hashed and never stored in plain text. While we take reasonable measures to protect " +
      "your information, no method of electronic transmission or storage is 100% secure.",
  },
  {
    title: "4. Cookies & Local Storage",
    content:
      "Threadline uses session tokens stored in your browser to keep you logged in. " +
      "We do not use third-party tracking cookies or analytics services that profile your behaviour across other websites.",
  },
  {
    title: "5. Your Rights",
    content:
      "You may view, edit, or delete your profile information at any time from the Your Profile page. " +
      "You may also permanently delete your account, which will remove your profile data. " +
      "To request a full data export or erasure, contact us at the email below.",
  },
  {
    title: "6. Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. Any changes will be reflected on this page " +
      "with an updated revision date. Continued use of Threadline after changes are posted constitutes acceptance of the revised policy.",
  },
];