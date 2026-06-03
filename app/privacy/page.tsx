import { LegalPage } from "@/components/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="Carecation stores the minimum information needed to help users plan medical travel and revisit saved itineraries."
      sections={[
        {
          title: "Information we collect",
          body: "We may collect account details, saved plan selections, destination preferences, clinic quote estimates, provider application details, testimonials, support messages, and affiliate click metadata. We do not support medical record uploads in this version.",
        },
        {
          title: "How we use information",
          body: "We use information to authenticate users, save plans, support travel and provider research, record affiliate handoffs, respond to support requests, and improve reliability and safety.",
        },
        {
          title: "Medical privacy",
          body: "Carecation is a planning tool and does not provide medical advice. Users should avoid entering protected medical records or sensitive health documents. Any future expansion into medical records requires additional legal, privacy, and security review.",
        },
        {
          title: "Your choices",
          body: "Users can request deletion or export of saved account data by contacting support. Optional cookies and analytics should only be used after consent.",
        },
      ]}
    />
  );
}
