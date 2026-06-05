import { createFileRoute } from "@tanstack/react-router";
import { SubPage } from "@/components/SubPage";

export const Route = createFileRoute("/privacy")({ component: Privacy });

function Privacy() {
  return (
    <SubPage title="Privacy Policy" description="Last updated June 2026">
      <article className="bg-background p-5 rounded-2xl shadow-card text-sm leading-relaxed space-y-4 text-foreground/90">
        <p>
          Al-Malami ("we", "our") respects your privacy. This policy explains what data we collect, how we use it,
          and the choices you have.
        </p>
        <Section title="Information we collect">
          We collect the information you provide when signing up (name, email, phone), transaction history,
          and device information needed to deliver and secure the service.
        </Section>
        <Section title="How we use your data">
          To operate your wallet and process airtime, data, TV and electricity purchases; to prevent fraud;
          to comply with legal obligations; and to improve the product.
        </Section>
        <Section title="Sharing">
          We share data only with the payment processors and service providers required to fulfil your transactions,
          and with regulators when legally required. We never sell your data.
        </Section>
        <Section title="Security">
          Data is encrypted in transit and at rest. Passwords are hashed; PINs and biometric credentials never leave
          your device unencrypted.
        </Section>
        <Section title="Your rights">
          You can update or delete your account at any time from the Profile screen, or by contacting
          support@al-malami.app.
        </Section>
      </article>
    </SubPage>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-bold mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{children}</p>
    </div>
  );
}
