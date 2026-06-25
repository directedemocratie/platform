import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Création des codes
  const codeCivil = await prisma.code.upsert({
    where: { slug: 'code-civil' },
    update: {},
    create: {
      name: 'Code Civil',
      slug: 'code-civil',
      description: 'Le code civil français régit le droit privé français.',
      icon: '⚖️',
    },
  });

  const codePenal = await prisma.code.upsert({
    where: { slug: 'code-penal' },
    update: {},
    create: {
      name: 'Code Pénal',
      slug: 'code-penal',
      description: 'Le code pénal français définit les infractions et les peines applicables.',
      icon: '🔒',
    },
  });

  // Création des articles pour le Code Civil
  await prisma.article.upsert({
    where: { codeId_number: { codeId: codeCivil.id, number: 'Article 1' } },
    update: {},
    create: {
      number: 'Article 1',
      title: "Entrée en vigueur des lois",
      content: "Les lois et, lorsqu'ils sont publiés au Journal officiel de la République française, les actes administratifs entrent en vigueur à la date qu'ils fixent ou, à défaut, le lendemain de leur publication.",
      codeId: codeCivil.id,
    },
  });

  await prisma.article.upsert({
    where: { codeId_number: { codeId: codeCivil.id, number: 'Article 2' } },
    update: {},
    create: {
      number: 'Article 2',
      title: "Application des lois dans le temps",
      content: "La loi ne dispose que pour l'avenir ; elle n'a point d'effet rétroactif.",
      codeId: codeCivil.id,
    },
  });

  // Création d'un article pour le Code Pénal
  await prisma.article.upsert({
    where: { codeId_number: { codeId: codePenal.id, number: 'Article 111-1' } },
    update: {},
    create: {
      number: 'Article 111-1',
      title: "Principe de légalité des délits et des peines",
      content: "Les infractions sont classées, suivant leur gravité, en crimes, délits et contraventions.",
      codeId: codePenal.id,
    },
  });
}

main()
  .then(() => {
    console.log('Seed terminé !');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });