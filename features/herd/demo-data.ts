export type GoatStatus = "Breeding" | "Growing" | "Dry";

export type DemoGoat = {
  id: string;
  name: string;
  tag: string;
  sex: "Doe" | "Buck";
  breed: string;
  age: string;
  status: GoatStatus;
  weight: number;
  updated: string;
  color: string;
};

export const demoGoats: DemoGoat[] = [
  {
    id: "g-001",
    name: "Bella",
    tag: "KBS-024",
    sex: "Doe",
    breed: "Boer",
    age: "3y 2m",
    status: "Breeding",
    weight: 72.4,
    updated: "Today",
    color: "bg-amber-100 text-amber-800",
  },
  {
    id: "g-002",
    name: "Milo",
    tag: "KBS-018",
    sex: "Buck",
    breed: "Boer",
    age: "4y 1m",
    status: "Breeding",
    weight: 94.8,
    updated: "Yesterday",
    color: "bg-stone-200 text-stone-800",
  },
  {
    id: "g-003",
    name: "Nala",
    tag: "KBS-031",
    sex: "Doe",
    breed: "Savanna",
    age: "1y 8m",
    status: "Growing",
    weight: 48.6,
    updated: "12 Jul",
    color: "bg-orange-100 text-orange-800",
  },
  {
    id: "g-004",
    name: "Daisy",
    tag: "KBS-012",
    sex: "Doe",
    breed: "Boer",
    age: "5y 5m",
    status: "Dry",
    weight: 69.1,
    updated: "08 Jul",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    id: "g-005",
    name: "Storm",
    tag: "KBS-035",
    sex: "Buck",
    breed: "Kalahari Red",
    age: "11m",
    status: "Growing",
    weight: 52.3,
    updated: "04 Jul",
    color: "bg-rose-100 text-rose-800",
  },
];

export const demoWeighIns = [
  {
    id: "w-01",
    goat: "Bella",
    tag: "KBS-024",
    weight: 72.4,
    previous: 70.9,
    date: "30 Jul 2026",
    trend: "+1.5 kg",
  },
  {
    id: "w-02",
    goat: "Milo",
    tag: "KBS-018",
    weight: 94.8,
    previous: 93.1,
    date: "30 Jul 2026",
    trend: "+1.7 kg",
  },
  {
    id: "w-03",
    goat: "Nala",
    tag: "KBS-031",
    weight: 48.6,
    previous: 46.2,
    date: "25 Jul 2026",
    trend: "+2.4 kg",
  },
  {
    id: "w-04",
    goat: "Daisy",
    tag: "KBS-012",
    weight: 69.1,
    previous: 69.8,
    date: "21 Jul 2026",
    trend: "−0.7 kg",
  },
  {
    id: "w-05",
    goat: "Storm",
    tag: "KBS-035",
    weight: 52.3,
    previous: 49.7,
    date: "18 Jul 2026",
    trend: "+2.6 kg",
  },
];
