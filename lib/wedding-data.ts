export const wedding = {
  couple: {
    bride: "Raveena",
    groom: "Roshana",
    display: "Raveena & Roshana",
    monogram: "R & R",
  },
  event: {
    dateLabel: "21st October 2026",
    dateISO: "2026-10-21",
    venue: "Courtyard by Marriott Colombo",
    room: "Grand Sapphire Ballroom",
    dressCode: "Dress To Impress",
    rsvpDeadline: "1st October 2026",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Courtyard+by+Marriott+Colombo",
  },
  programme: [
    { time: "6:45 PM", title: "Welcome & Ceremony Start" },
    { time: "7:02 PM", title: "Poruwa Nakatha" },
    { time: "7:30 PM", title: "Reception & Partying" },
  ],
  story: [
    "Some love stories begin with a perfect plan. Ours began simply—with two people who met, became friends, and slowly discovered something more beautiful than either of us had expected.",
    "Along the way, life brought us laughter, beautiful memories, and challenges that made our bond stronger. Through every chapter, we continued to find our way back to each other and discovered that the best part of life is having someone with whom to share it. What started as a simple beginning has now brought us to this beautiful moment—a promise, a new beginning, and a lifetime together.",
    "And so, we celebrate not only the love that brought us together, but every moment that shaped our journey and led us to where we are today.",
  ],
  storyClosing: "Two hearts. One journey. One forever.",
  closing: "We are waiting to celebrate with you",
  contacts: [
    { name: "Roshana", display: "071-8935991", href: "tel:+94718935991" },
    { name: "Raveena", display: "070-1739272", href: "tel:+94701739272" },
  ],
  music: {
    src: "/music/datha-dara-instrumental.mp3",
    title: "Dátha Dara — Instrumental",
  },
  photos: [
    "/images/couple/couple-01.jpg",
    "/images/couple/couple-02.jpg",
    "/images/couple/couple-03.jpg",
    "/images/couple/couple-04.jpg",
    "/images/couple/couple-05.jpg",
  ],
} as const;
