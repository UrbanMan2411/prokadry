import fs from 'fs';
import path from 'path';
import { bulkImport } from '../lib/parsers/db-importer';
import type { ParsedResumeForDB } from '../lib/parsers/hh';

type RawResumeRecord = Omit<ParsedResumeForDB, 'birthDate'> & {
  birthDate: string;
};

function getArg(name: string, fallback?: string): string {
  const prefix = `--${name}=`;
  const inline = process.argv.find(arg => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);

  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];

  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required argument --${name}`);
}

function readRecords(filePath: string): RawResumeRecord[] {
  const abs = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(abs)) throw new Error(`Input file not found: ${abs}`);

  const raw = fs.readFileSync(abs, 'utf8').trim();
  if (!raw) return [];

  if (raw.startsWith('[')) return JSON.parse(raw) as RawResumeRecord[];

  return raw
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => JSON.parse(line) as RawResumeRecord);
}

function normalize(record: RawResumeRecord): ParsedResumeForDB {
  if (record.source !== 'hh' && record.source !== 'avito') {
    throw new Error(`Unsupported source: ${record.source}`);
  }
  if (!record.sourceId || !record.position) {
    throw new Error(`Invalid resume record: sourceId and position are required`);
  }

  return {
    ...record,
    patronymic: record.patronymic ?? null,
    salaryFrom: record.salaryFrom ?? null,
    birthDate: new Date(record.birthDate),
    workExperiences: record.workExperiences ?? [],
  };
}

async function main() {
  const input = getArg('input', 'data/imports/resumes.jsonl');
  const records = readRecords(input).map(normalize);

  if (records.length === 0) {
    console.log(JSON.stringify({ input, imported: 0, created: 0, skipped: 0, errors: 0 }, null, 2));
    return;
  }

  const summary = await bulkImport(records, (done, total) => {
    if (done === total || done % 10 === 0) {
      console.error(`[import] ${done}/${total}`);
    }
  });

  console.log(JSON.stringify({ input, imported: records.length, ...summary }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
