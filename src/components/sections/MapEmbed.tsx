import { Section, Container } from "@/components/ui";

export default function MapEmbed() {
  return (
    <Section>
      <Container>
        <div className="rounded-xl overflow-hidden shadow-card">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2559.8!2d14.4271!3d50.0886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470b94eadbce2c75%3A0x0!2sRybn%C3%A1%20716%2F24%2C%20110%2000%20Praha%201!5e0!3m2!1scs!2scz!4v1"
            width="100%"
            height="450"
            style={{ border: 0, filter: "grayscale(30%)" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Puskin and Partners — mapa"
          />
        </div>
      </Container>
    </Section>
  );
}
