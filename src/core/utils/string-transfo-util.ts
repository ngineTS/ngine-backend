  export function stringToLowerCaseWithUnderscore(text: string): string {
    return text
      .split(" ")
      .map(word => word.toLowerCase())
      .join("_");
  }