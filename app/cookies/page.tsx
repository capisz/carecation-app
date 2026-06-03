import { LegalPage } from "@/components/legal-page";

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      intro="Carecation uses cookies for secure sessions and consent. Optional cookies are limited to analytics and affiliate attribution when enabled."
      sections={[
        {
          title: "Required cookies",
          body: "Required cookies keep users signed in, maintain secure sessions, remember cookie consent, and support saved plan functionality.",
        },
        {
          title: "Optional cookies",
          body: "Optional cookies may help understand app usage and affiliate booking handoffs. These should only run after a user accepts optional cookies.",
        },
        {
          title: "Managing cookies",
          body: "Users can change cookie choices by clearing the Carecation cookie consent cookie in their browser and revisiting the site.",
        },
      ]}
    />
  );
}
