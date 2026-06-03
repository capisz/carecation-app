import { LegalPage } from "@/components/legal-page";

export default function SupportPage() {
  return (
    <LegalPage
      title="Customer Support"
      intro="Carecation support can help with account access, saved plans, provider applications, and general planning questions."
      sections={[
        {
          title: "Account and plans",
          body: "For login, saved plan, or deletion/export requests, contact support with the email address connected to your Carecation account.",
        },
        {
          title: "Travel bookings",
          body: "Flights and hotels are completed through third-party booking partners. Booking changes, cancellations, refunds, or payment questions should be handled through the partner that processed the booking.",
        },
        {
          title: "Provider quotes",
          body: "Clinic and hospital costs are paid directly to the provider. Carecation can help organize quote request details but does not collect treatment payments.",
        },
      ]}
    />
  );
}
