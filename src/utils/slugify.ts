export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function generateLawSlug(code: string, article: string): string {
  const codeSlug = slugify(code);
  const articleSlug = slugify(article);
  return `${codeSlug}/${articleSlug}`;
}

export function parseLawSlug(slug: string): { code: string; article: string } | null {
  const parts = slug.split('/');
  if (parts.length !== 2) {
    return null;
  }
  
  return {
    code: parts[0].replace(/-/g, ' '),
    article: parts[1].replace(/-/g, ' ')
  };
} 