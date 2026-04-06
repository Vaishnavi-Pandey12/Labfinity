import {
  Atom,
  Bot,
  Calculator,
  Cpu,
  FlaskConical,
  Microscope,
  type LucideIcon,
} from "lucide-react";

export interface SubjectOption {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  description: string;
  experiments: number;
}

export const subjects: SubjectOption[] = [
  {
    id: "chemistry",
    name: "Chemistry",
    icon: FlaskConical,
    color: "from-blue-500 to-cyan-500",
    description: "Electrochemistry, Colorimetry, Spectroscopy",
    experiments: 25,
  },
  {
    id: "physics",
    name: "Physics",
    icon: Atom,
    color: "from-purple-500 to-pink-500",
    description: "Mechanics, Optics, Modern Physics",
    experiments: 30,
  },
  {
    id: "biology",
    name: "Biology",
    icon: Microscope,
    color: "from-green-500 to-emerald-500",
    description: "Microbiology, Genetics, Ecology",
    experiments: 20,
  },
  {
    id: "maths",
    name: "Mathematics",
    icon: Calculator,
    color: "from-orange-500 to-yellow-500",
    description: "Calculus, Statistics, Algebra",
    experiments: 15,
  },
  {
    id: "electronics",
    name: "Electronics",
    icon: Cpu,
    color: "from-red-500 to-orange-500",
    description: "Circuits, Digital Logic, Microcontrollers",
    experiments: 18,
  },
  {
    id: "robotics",
    name: "Robotics",
    color: "from-indigo-500 to-purple-500",
    icon: Bot,
    description: "Automation, Control Systems, AI",
    experiments: 12,
  },
];
