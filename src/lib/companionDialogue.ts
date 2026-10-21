export interface CompanionDialogueContext {
  justLeveledUp?: boolean;
  hasError?: boolean;
  realmId?: string;
}

export function getCompanionDialogue(context: CompanionDialogueContext): string {
  if (context.justLeveledUp) {
    return "Congratulations on leveling up! Your power grows!";
  }

  if (context.hasError) {
    return "Don't give up! Every error is a learning opportunity. You can do this!";
  }

  if (context.realmId) {
    switch (context.realmId) {
      case "html":
        return "A11y Wisdom: Using semantic HTML tags like <nav> and <main> lets screen-reader users navigate by landmarks.";
      case "css":
        return "Tip: In the CSS realm, switch to the Concept Visualizer tab to play with live flex-direction and justify-content!";
      case "javascript":
        return "Did you know? JavaScript Promises drain on the Microtask Queue before setTimeout(0) macrotasks fire!";
      case "typescript":
        return "Tactical Intel: The Any-Demon boss in Realm 04 is weak to Discriminated Unions and unknown type narrowing.";
      case "react":
        return "React Hint: Keep an eye on your dependency arrays in useEffect to prevent infinite render loops!";
      case "backend":
        return "Backend Tip: Always handle your promise rejections to prevent silent server crashes.";
      case "databases":
        return "Database Defense: Never concatenate user strings into raw SQL! Parameterized queries ($1, $2) neutralize injection.";
      case "devops":
        return "Docker Magic: Multi-stage builds compile artifacts in a build container, leaving the production image ultralight.";
      case "testing":
        return "Testing Fact: Flaky tests are often caused by race conditions or shared state between tests.";
      case "cs":
        return "CS Wisdom: Hash maps provide O(1) average time complexity for lookups, making them incredibly fast.";
      case "security":
        return "Security First: Always sanitize user input to prevent XSS attacks before rendering it in the DOM.";
      case "capstone":
        return "Capstone Insight: A robust architecture balances scalability, maintainability, and performance.";
      default:
        return "Stay alert! The matrix is ever-changing.";
    }
  }

  return "I'm Byte, your cyber-companion! Let's conquer the matrix together.";
}
