export const projects = [
  { title: "Byt Biskoupová", location: "Praha", type: "Rekonstrukce bytu" },
  { title: "Byt Kladno", location: "Kladno", type: "Rekonstrukce bytu" },
  { title: "Byt Běchovice", location: "Praha-východ", type: "Rekonstrukce bytu" },
  { title: "Byt Služská", location: "Praha", type: "Rekonstrukce bytu" },
  { title: "Byt Tobrucká", location: "Praha", type: "Rekonstrukce bytu" },
  { title: "Byt Sulická", location: "Praha", type: "Rekonstrukce bytu" },
  { title: "Vila Šestajovice", location: "Praha-východ", type: "Development" },
  { title: "Vila Uhříněves", location: "Praha", type: "Development" },
] as const;

export const featuredDevelopmentProjects = [
  {
    title: "Vila Šestajovice",
    location: "Praha-východ",
    type: "Development",
    status: "Dokončeno" as const,
    description: "Luxusní rodinná vila s 5 pokoji a zahradou.",
    units: "5 pokojů",
  },
  {
    title: "Vila Uhříněves",
    location: "Praha",
    type: "Development",
    status: "V prodeji" as const,
    description: "Moderní vila v klidné rezidenční čtvrti.",
    units: "4 pokoje",
  },
  {
    title: "Bytový dům Vinohrady",
    location: "Praha 2",
    type: "Development",
    status: "V přípravě" as const,
    description: "Rezidenční projekt v srdci Vinohrad.",
    units: "12 bytů",
  },
] as const;
