import { LegalPage } from "@/components/legal-page";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      intro="These terms describe Carecation as a planning and research service for international healthcare travel."
      sections={[
        {
          title: "Planning service",
          body: "Carecation helps users compare travel options, clinics, estimates, and itinerary details. It does not guarantee availability, final prices, clinical outcomes, travel eligibility, or provider acceptance.",
        },
        {
          title: "Affiliate booking handoff",
          body: "Flights and hotels are booked through third-party travel partners. Carecation may receive affiliate compensation when users click partner links. The partner site is responsible for booking terms, payment, refunds, cancellations, and customer service.",
        },
        {
          title: "Healthcare providers",
          body: "Clinic and provider information should be independently verified by users. Provider estimates are informational and are not a medical recommendation, diagnosis, or treatment plan.",
        },
        {
          title: "User responsibilities",
          body: "Users are responsible for confirming travel documents, visa requirements, provider credentials, medical suitability, insurance coverage, and local health or travel advisories before booking.",
        },
      ]}
    />
  );
}
