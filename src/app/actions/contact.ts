"use server";

interface ContactFormState {
  success: boolean;
  error: string | null;
}

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = formData.get("name");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const subject = formData.get("subject");
  const message = formData.get("message");
  const gdpr = formData.get("gdpr");

  if (!name || !email || !subject || !message) {
    return { success: false, error: "Vyplňte prosím všechna povinná pole." };
  }

  if (!gdpr) {
    return { success: false, error: "Musíte souhlasit se zpracováním osobních údajů." };
  }

  const emailStr = String(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
    return { success: false, error: "Zadejte platnou e-mailovou adresu." };
  }

  try {
    // Log the contact form submission
    // In production, replace with email sending service (e.g. Resend, Nodemailer)
    console.log("Contact form submission:", {
      name: String(name),
      email: emailStr,
      phone: phone ? String(phone) : "",
      subject: String(subject),
      message: String(message),
      timestamp: new Date().toISOString(),
    });

    return { success: true, error: null };
  } catch {
    return { success: false, error: "Odeslání se nezdařilo. Zkuste to prosím znovu." };
  }
}
