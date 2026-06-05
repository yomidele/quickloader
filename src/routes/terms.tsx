import { createFileRoute } from "@tanstack/react-router";
import { SubPage } from "@/components/SubPage";

export const Route = createFileRoute("/terms")({ component: Terms });

function Terms() {
  return (
    <SubPage title="Terms of Service" description="Last updated June 2026">
      <article className="bg-background p-5 rounded-2xl shadow-card text-sm leading-relaxed space-y-4 text-foreground/90">
        <p>By creating an Al-Malami account you agree to these terms.</p>
        <Section title="1. Eligibility">
          You must be at least 18 years old and able to enter into a binding contract under Nigerian law.
        </Section>
        <Section title="2. Account">
          You are responsible for safeguarding your password, PIN and biometric access. Notify us immediately of any
          unauthorized use.
        </Section>
        <Section title="3. Transactions">
          All purchases are final once successfully delivered. Failed purchases are refunded to your wallet
          automatically; please allow up to 24 hours for resolution.
        </Section>
        <Section title="4. Fees">
          Service fees, if any, are shown clearly before you confirm a transaction.
        </Section>
        <Section title="5. Prohibited use">
          You may not use Al-Malami for fraud, money laundering, or any unlawful purpose. We may suspend accounts
          we reasonably believe to be in violation.
        </Section>
        <Section title="6. Liability">
          We provide the service "as is". To the maximum extent permitted by law our liability is limited to amounts
          actually held in your wallet.
        </Section>
        <Section title="7. Changes">
          We may update these terms; continued use of the app after notification constitutes acceptance.
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
