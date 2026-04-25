export interface FitScoreClasses {
  label: string;
  text: string;
  dot: string;
  badge: string;
  pillTint: string;
  border: string;
}

export function fitScoreClasses(score: number): FitScoreClasses {
  if (score < 50) {
    return {
      label: "Not a fit",
      text: "text-red-500",
      dot: "bg-red-500",
      badge: "bg-red-500/15 text-red-500",
      pillTint: "bg-red-500/8 border-red-500/15 text-red-500",
      border: "border-l-2 border-red-500",
    };
  }
  if (score < 60) {
    return {
      label: "Borderline",
      text: "text-orange-400",
      dot: "bg-orange-400",
      badge: "bg-orange-400/15 text-orange-400",
      pillTint: "bg-orange-400/8 border-orange-400/15 text-orange-400",
      border: "border-l-2 border-yellow-400",
    };
  }
  if (score < 70) {
    return {
      label: "Partial fit",
      text: "text-yellow-400",
      dot: "bg-yellow-400",
      badge: "bg-yellow-400/15 text-yellow-400",
      pillTint: "bg-yellow-400/8 border-yellow-400/15 text-yellow-400",
      border: "border-l-2 border-teal",
    };
  }
  if (score < 80) {
    return {
      label: "Good fit",
      text: "text-teal",
      dot: "bg-teal",
      badge: "bg-teal/15 text-teal",
      pillTint: "bg-teal/8 border-teal/15 text-teal",
      border: "border-l-2 border-teal",
    };
  }
  return {
    label: "Excellent fit",
    text: "text-green-400",
    dot: "bg-green-400",
    badge: "bg-green-400/15 text-green-400",
    pillTint: "bg-green-400/8 border-green-400/15 text-green-400",
    border: "border-l-2 border-teal",
  };
}
