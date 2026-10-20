import fs from "fs/promises";
import path from "path";
import { CurriculumViewer, DocFile } from "@/components/CurriculumViewer";

const DOC_FILES = [
  { filename: "00-curriculum-overview.md", title: "00. Getting Started & Rules" },
  { filename: "01-html-and-semantics.md", title: "01. HTML & Web Semantics" },
  { filename: "02-css-layout-and-styling.md", title: "02. CSS, Flexbox & Grid" },
  { filename: "03-modern-javascript.md", title: "03. Modern JavaScript (ES6+)" },
  { filename: "04-strict-typescript.md", title: "04. Strict TypeScript" },
  { filename: "05-frontend-react-and-ecosystem.md", title: "05. React & Next.js Ecosystem" },
  { filename: "06-backend-nodejs.md", title: "06. Backend Architecture (Node.js)" },
  { filename: "07-databases-and-sql.md", title: "07. Databases & Relational SQL" },
  { filename: "08-git-devops-deployment.md", title: "08. Git, Docker & DevOps" },
  { filename: "09-testing-and-quality.md", title: "09. Testing, TDD & E2E" },
  { filename: "10-cs-fundamentals-and-system-design.md", title: "10. CS Fundamentals & System Design" },
  { filename: "11-security-and-performance.md", title: "11. Web Security & Performance" },
  { filename: "12-roadmap-capstone-and-resources.md", title: "12. Capstone Project & Roadmap" },
];

const LEGACY_FILE_ALIASES: Record<string, string> = {
  "00-README.md": "00-curriculum-overview.md",
  "01-html.md": "01-html-and-semantics.md",
  "02-css.md": "02-css-layout-and-styling.md",
  "03-javascript.md": "03-modern-javascript.md",
  "04-typescript.md": "04-strict-typescript.md",
  "07-databases.md": "07-databases-and-sql.md",
};

export default async function CurriculumPage({
  searchParams,
}: {
  searchParams?: Promise<{ file?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const rawFile = params?.file;
  const initialFile = rawFile ? LEGACY_FILE_ALIASES[rawFile] || rawFile : undefined;
  const docs: DocFile[] = [];

  for (const doc of DOC_FILES) {
    try {
      const filePath = path.join(process.cwd(), doc.filename);
      const content = await fs.readFile(filePath, "utf-8");
      docs.push({
        filename: doc.filename,
        title: doc.title,
        content,
      });
    } catch {
      docs.push({
        filename: doc.filename,
        title: doc.title,
        content: `# ${doc.title}\n\nContent could not be loaded.`,
      });
    }
  }

  return <CurriculumViewer docs={docs} initialFile={initialFile} />;
}
