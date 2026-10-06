import Image from "next/image";
import { CalendarBlank } from "@phosphor-icons/react/ssr";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { RevealText } from "@/components/ui/RevealText";
import { faqs } from "@/data/faqs";
import { site } from "@/data/site";

/** FAQ accordion next to the red "discovery call" card. */
export function Faq() {
  return (
    <section id="faq" className="section-x border-t border-line py-20 md:py-[120px]">
      <Container className="flex flex-col gap-12 lg:flex-row">
        <div className="flex flex-1 flex-col gap-9">
          <RevealText className="text-h2 text-text" segments={[{ text: "FAQs" }]} />
          <Accordion items={faqs} defaultOpen={0} />
        </div>

        <FadeIn offsetY={40} className="flex-1 self-start lg:sticky lg:top-[110px]">
          <aside
            className="flex flex-col gap-[22px] rounded-[28px] border border-white/[0.18] p-7 shadow-[0_30px_80px_rgba(234,0,68,0.25)] md:p-9"
            style={{ background: "linear-gradient(160deg, #D60045 0%, #9A0033 100%)" }}
          >
            <Image
              src="/images/avatar.jpg"
              alt={site.name}
              width={68}
              height={68}
              className="size-[68px] rounded-full border-2 border-white/35 object-cover"
            />
            <h3 className="text-h3 text-white">
              Still not sure?
              <br />
              Book a free discovery call.
            </h3>
            <p className="text-body-lg text-white/[0.88]">
              Your brand should feel clear, strong and easy to trust. If that’s what you’re aiming
              for, we should talk.
            </p>
            <div className="flex flex-wrap items-center gap-[22px] pt-2">
              <Button href={site.bookingUrl} variant="dark">
                <CalendarBlank size={18} weight="bold" aria-hidden />
                Schedule now
              </Button>
              <span className="font-display text-[15px] font-bold leading-none text-white/80">
                via Cal.com
              </span>
            </div>
          </aside>
        </FadeIn>
      </Container>
    </section>
  );
}
