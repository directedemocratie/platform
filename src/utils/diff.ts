export interface DiffToken {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
}

/**
 * Compare deux chaînes de caractères mot par mot et renvoie une liste de jetons (tokens)
 * indiquant ce qui a été ajouté, supprimé ou conservé. Preserves spaces.
 */
export function computeDiff(oldText: string, newText: string): DiffToken[] {
  // On découpe en incluant les espaces pour pouvoir reconstruire fidèlement le texte
  const oldWords = oldText ? oldText.split(/(\s+)/) : [];
  const newWords = newText ? newText.split(/(\s+)/) : [];

  // Table de programmation dynamique pour le plus long sous-enchaînement commun (LCS)
  const dp: number[][] = Array(oldWords.length + 1)
    .fill(0)
    .map(() => Array(newWords.length + 1).fill(0));

  for (let i = 1; i <= oldWords.length; i++) {
    for (let j = 1; j <= newWords.length; j++) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const diff: DiffToken[] = [];
  let i = oldWords.length;
  let j = newWords.length;

  // Remonter le chemin optimal
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      diff.unshift({ type: 'unchanged', value: oldWords[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({ type: 'added', value: newWords[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      diff.unshift({ type: 'removed', value: oldWords[i - 1] });
      i--;
    }
  }

  return diff;
}
