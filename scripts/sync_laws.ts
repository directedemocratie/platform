import { PrismaClient } from '../src/generated/prisma/index.js';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

interface CodeConfig {
  id: string; // Identifiant LEGITEXT utilisé dans le dépôt GitHub
  slug: string;
  name: string;
  description: string;
  icon: string;
}

const CODES_TO_SYNC: CodeConfig[] = [
  {
    id: 'LEGITEXT000006071194',
    slug: 'constitution',
    name: 'Constitution',
    description: 'Texte fondamental de la Ve République, base de toutes les lois françaises.',
    icon: '📜'
  },
  {
    id: 'LEGITEXT000006070721',
    slug: 'code-civil',
    name: 'Code Civil',
    description: 'Le code civil français régit le droit privé français.',
    icon: '⚖️'
  },
  {
    id: 'LEGITEXT000006070719',
    slug: 'code-penal',
    name: 'Code Pénal',
    description: 'Le code pénal français définit les infractions et les peines applicables.',
    icon: '🔒'
  },
  {
    id: 'LEGITEXT000006072050',
    slug: 'code-travail',
    name: 'Code du travail',
    description: 'Le Code du travail régit les relations de travail en France.',
    icon: '💼'
  }
];

function inferSectionType(name: string): string {
  const nameUpper = name.toUpperCase().trim();
  if (nameUpper.startsWith('LIVRE')) return 'LIVRE';
  if (nameUpper.startsWith('TITRE')) return 'TITRE';
  if (nameUpper.startsWith('CHAPITRE')) return 'CHAPITRE';
  if (nameUpper.startsWith('SECTION')) return 'SECTION';
  if (nameUpper.startsWith('SOUS-SECTION')) return 'SOUS-SECTION';
  if (nameUpper.startsWith('PARAGRAPHE')) return 'PARAGRAPHE';
  return 'SECTION';
}

interface SectionStackElement {
  id: string;
  level: number;
}

async function getOrCreateSection(
  codeId: string,
  name: string,
  type: string,
  parentId: string | null
): Promise<string> {
  const existing = await prisma.section.findFirst({
    where: {
      codeId,
      name,
      type,
      parentId
    }
  });

  if (existing) {
    return existing.id;
  }

  const created = await prisma.section.create({
    data: {
      codeId,
      name,
      type,
      parentId
    }
  });

  return created.id;
}

async function syncCode(config: CodeConfig) {
  console.log(`\n=== Début de la synchronisation : ${config.name} (${config.id}) ===`);
  
  // 1. Créer ou mettre à jour le Code dans la base de données
  const code = await prisma.code.upsert({
    where: { slug: config.slug },
    update: {
      name: config.name,
      description: config.description,
      icon: config.icon
    },
    create: {
      slug: config.slug,
      name: config.name,
      description: config.description,
      icon: config.icon
    }
  });

  // 2. Télécharger le fichier de loi depuis GitHub
  const url = `https://raw.githubusercontent.com/legalize-dev/legalize-fr/main/fr/${config.id}.md`;
  console.log(`Téléchargement de ${url}...`);
  
  let content: string;
  try {
    const response = await axios.get(url, { responseType: 'text' });
    content = response.data;
  } catch (error: any) {
    console.error(`Erreur lors du téléchargement de ${config.name} :`, error.message);
    return;
  }

  // 3. Extraire le corps (retirer le frontmatter YAML si présent)
  let body = content;
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (frontmatterMatch) {
    body = content.substring(frontmatterMatch[0].length);
  }

  // 4. Parser ligne par ligne
  const lines = body.split('\n');
  const sectionStack: SectionStackElement[] = [];
  
  let currentArticle: {
    number: string;
    lines: string[];
  } | null = null;
  
  let articleCount = 0;
  let sectionCount = 0;

  // Regex pour détecter les sections et articles
  // ## H2 Section, ### H3 Section, #### H4 Section
  const sectionRegex = /^(#{2,4})\s+(.*)$/;
  // ##### Article [numero]
  const articleRegex = /^#####\s+Article\s+(.*)$/;

  // Fonction interne pour enregistrer l'article en cours
  async function flushArticle() {
    if (!currentArticle) return;

    const number = currentArticle.number.trim();
    const contentText = currentArticle.lines.join('\n').trim();
    
    // Déterminer la section parente active (le haut de la pile)
    const activeSectionId = sectionStack.length > 0 ? sectionStack[sectionStack.length - 1].id : null;

    try {
      await prisma.article.upsert({
        where: {
          codeId_number: {
            codeId: code.id,
            number
          }
        },
        update: {
          title: number,
          content: contentText,
          sectionId: activeSectionId,
          order: articleCount
        },
        create: {
          number,
          title: number,
          content: contentText,
          codeId: code.id,
          sectionId: activeSectionId,
          order: articleCount
        }
      });
      articleCount++;
      if (articleCount % 100 === 0) {
        console.log(`-> ${articleCount} articles importés...`);
      }
    } catch (e: any) {
      console.error(`Erreur lors de l'intégration de l'article ${number} :`, e.message);
    }

    currentArticle = null;
  }

  for (let line of lines) {
    const trimmedLine = line.trim();
    
    // Ignorer les lignes vides si on n'est pas dans un article
    if (trimmedLine === '' && !currentArticle) {
      continue;
    }

    // Détection d'un nouvel article
    const articleMatch = line.match(articleRegex);
    if (articleMatch) {
      // Enregistrer l'article précédent d'abord
      await flushArticle();

      currentArticle = {
        number: `Article ${articleMatch[1].trim()}`,
        lines: []
      };
      continue;
    }

    // Détection d'une nouvelle section
    const sectionMatch = line.match(sectionRegex);
    if (sectionMatch) {
      // Enregistrer l'article précédent d'abord
      await flushArticle();

      const hashes = sectionMatch[1];
      const name = sectionMatch[2].trim();
      const level = hashes.length; // 2 pour ##, 3 pour ###, etc.
      const type = inferSectionType(name);

      // Gérer la hiérarchie de la pile
      while (sectionStack.length > 0 && sectionStack[sectionStack.length - 1].level >= level) {
        sectionStack.pop();
      }

      const parentId = sectionStack.length > 0 ? sectionStack[sectionStack.length - 1].id : null;

      try {
        const sectionId = await getOrCreateSection(code.id, name, type, parentId);
        sectionStack.push({ id: sectionId, level });
        sectionCount++;
      } catch (e: any) {
        console.error(`Erreur lors de la création de la section "${name}" :`, e.message);
      }
      
      continue;
    }

    // Si on est dans un article, on accumule le texte
    if (currentArticle) {
      currentArticle.lines.push(line);
    }
  }

  // Enregistrer le tout dernier article
  await flushArticle();

  console.log(`Statistiques pour ${config.name} :`);
  console.log(`- Sections synchronisées : ${sectionCount}`);
  console.log(`- Articles synchronisés : ${articleCount}`);
  console.log(`=== Fin de la synchronisation : ${config.name} ===`);
}

async function main() {
  const args = process.argv.slice(2);
  const onlyArgIndex = args.indexOf('--only');
  const onlySlug = onlyArgIndex !== -1 ? args[onlyArgIndex + 1] : null;

  let codesToSync = CODES_TO_SYNC;
  if (onlySlug) {
    codesToSync = CODES_TO_SYNC.filter(c => c.slug === onlySlug);
    if (codesToSync.length === 0) {
      console.error(`Erreur : Le code avec le slug "${onlySlug}" n'est pas configuré.`);
      process.exit(1);
    }
  }

  console.log('Lancement de la mise à jour de la législation...');
  
  for (const config of codesToSync) {
    try {
      await syncCode(config);
    } catch (e: any) {
      console.error(`Erreur critique lors de la synchronisation de ${config.name} :`, e);
    }
  }

  console.log('\nTous les codes ciblés ont été traités.');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
