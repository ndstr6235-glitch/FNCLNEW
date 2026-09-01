export const siteConfig = {
  name: "Puskin and Partners",
  company: {
    legalName: "Alexandr Puškin, s.r.o.",
    ico: "26740788",
    dic: "CZ26740788",
    founded: "2002-12-09",
    buildingSince: 2004,
    investmentSince: 2023,
    address: {
      street: "Rybná 716/24",
      city: "Praha 1",
      zip: "110 00",
      country: "Česká republika",
    },
  },
  contact: {
    email: "info@apartmentspushkin.com",
    phone: "+420 222 244 889",
    hours: "Po–Pá 09:00–18:00",
  },
  owner: "Miroslav Fencl",
  navigation: {
    main: [
      { label: "O nás", href: "/o-nas" },
      {
        label: "Služby",
        href: "#",
        children: [
          { label: "Development", href: "/sluzby/development" },
          { label: "Rekonstrukce", href: "/sluzby/rekonstrukce" },
          { label: "Nemovitosti", href: "/sluzby/nemovitosti" },
          { label: "Investice", href: "/sluzby/investice" },
        ],
      },
      { label: "Reference", href: "/reference" },
      { label: "Kariéra", href: "/kariera" },
      { label: "Blog", href: "/blog" },
      { label: "Kontakt", href: "/kontakt" },
    ],
  },
} as const;
