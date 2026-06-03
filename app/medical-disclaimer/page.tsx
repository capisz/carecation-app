import { LegalPage } from "@/components/legal-page";

export default function MedicalDisclaimerPage() {
  return (
    <LegalPage
      title="Medical Disclaimer"
      intro="Carecation is not a healthcare provider and does not provide medical advice."
      sections={[
        {
          title: "No medical advice",
          body: "Carecation content, estimates, itineraries, and provider listings are for research and planning only. They are not diagnosis, treatment advice, or a substitute for consultation with licensed healthcare professionals.",
        },
        {
          title: "Independent verification",
          body: "Users should independently verify provider credentials, accreditation, procedure suitability, travel risks, recovery needs, and follow-up care before making decisions.",
        },
        {
          title: "Emergency care",
          body: "Carecation is not for emergencies. If you may be experiencing a medical emergency, contact local emergency services immediately.",
        },
      ]}
    />
  );
}
