import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  CmsSeedSkipDocument,
  CmsSeedSkipDoc,
} from './schemas/cms-seed-skip.schema';

/**
 * CmsSeedSkipsService — gestiona la lista de docs que el curador borró
 * y que el seed runner debe respetar (no re-crear).
 */
@Injectable()
export class CmsSeedSkipsService {
  constructor(
    @Inject('CMS_SEED_SKIP_MODEL')
    private readonly model: Model<CmsSeedSkipDocument>,
  ) {}

  /** Marca un slug como "skip" para futuras seeds. Idempotente (upsert). */
  async record(
    kind: CmsSeedSkipDoc['kind'],
    key: string,
    reason = 'deleted from admin',
  ): Promise<void> {
    await this.model
      .updateOne(
        { kind, key },
        { $set: { kind, key, reason } },
        { upsert: true },
      )
      .exec();
  }

  /** Devuelve `true` si el seed debe saltarse este key. */
  async isSkipped(
    kind: CmsSeedSkipDoc['kind'],
    key: string,
  ): Promise<boolean> {
    const found = await this.model.exists({ kind, key });
    return !!found;
  }

  /** Cargar todos los skips de un tipo, pre-seed (perf). */
  async listKeys(kind: CmsSeedSkipDoc['kind']): Promise<Set<string>> {
    const docs = await this.model.find({ kind }, { key: 1 }).lean().exec();
    return new Set(docs.map((d) => d.key));
  }

  /** Quita un skip — útil si el curador quiere "resucitar" del seed. */
  async unrecord(kind: CmsSeedSkipDoc['kind'], key: string): Promise<void> {
    await this.model.deleteOne({ kind, key }).exec();
  }

  /** Lista todos los skips (para admin UI futuro). */
  async listAll(): Promise<CmsSeedSkipDoc[]> {
    return this.model.find().sort({ createdAt: -1 }).lean().exec();
  }
}
