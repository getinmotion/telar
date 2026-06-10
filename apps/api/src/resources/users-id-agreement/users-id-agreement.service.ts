import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { UsersIdAgreement } from './entities/users-id-agreement.entity';
import { CreateUsersIdAgreementDto } from './dto/create-users-id-agreement.dto';
import { BulkCreateUsersIdAgreementDto } from './dto/bulk-create-users-id-agreement.dto';
import { IdTypeUserService } from '../id-type-user/id-type-user.service';
import { AgreementsService } from '../agreements/agreements.service';

@Injectable()
export class UsersIdAgreementService {
  private readonly algorithm = 'aes-256-cbc';

  constructor(
    @Inject('USERS_ID_AGREEMENT_REPOSITORY')
    private readonly usersIdAgreementRepository: Repository<UsersIdAgreement>,
    private readonly configService: ConfigService,
    private readonly idTypeUserService: IdTypeUserService,
    private readonly agreementsService: AgreementsService,
  ) {}

  /**
   * Encripta un texto usando AES-256-CBC (igual que user-profiles)
   */
  private encrypt(text: string): string {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');

    if (!encryptionKey) {
      throw new Error(
        'ENCRYPTION_KEY no está configurada en las variables de entorno',
      );
    }

    // La key debe ser de 32 bytes para AES-256
    const key = crypto.scryptSync(encryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Retornar IV + encrypted data (separados por :)
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Desencripta un texto encriptado con AES-256-CBC
   */
  private decrypt(encryptedText: string): string {
    if (!encryptedText) {
      return encryptedText;
    }

    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');

    if (!encryptionKey) {
      throw new Error(
        'ENCRYPTION_KEY no está configurada en las variables de entorno',
      );
    }

    try {
      // Separar IV y datos encriptados
      const parts = encryptedText.split(':');
      if (parts.length !== 2) {
        return encryptedText;
      }

      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];

      // La key debe ser de 32 bytes para AES-256
      const key = crypto.scryptSync(encryptionKey, 'salt', 32);

      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Error desencriptando num_id:', error);
      return encryptedText;
    }
  }

  /**
   * Desencripta el numId de un registro
   */
  private decryptRecord(record: UsersIdAgreement): UsersIdAgreement {
    if (record && record.numId) {
      record.numId = this.decrypt(record.numId);
    }
    return record;
  }

  /**
   * Desencripta el numId de múltiples registros
   */
  private decryptRecords(records: UsersIdAgreement[]): UsersIdAgreement[] {
    return records.map((record) => this.decryptRecord(record));
  }

  /**
   * Crear un nuevo registro
   */
  async create(
    createDto: CreateUsersIdAgreementDto,
  ): Promise<UsersIdAgreement> {
    // 1. Validar que el id_type existe
    await this.idTypeUserService.findOne(createDto.idType);

    // 2. Validar que el agreement_id existe
    await this.agreementsService.findOne(createDto.agreementId);

    // 3. Encriptar numId
    const dataToSave = {
      ...createDto,
      numId: this.encrypt(createDto.numId),
    };

    // 4. Guardar
    const newRecord = this.usersIdAgreementRepository.create(dataToSave);
    const savedRecord = await this.usersIdAgreementRepository.save(newRecord);

    // 5. Desencriptar antes de retornar
    return this.decryptRecord(savedRecord);
  }

  /**
   * Crear múltiples registros desde CSV
   * El CSV debe contener: idTypeValue, numId, agreementId
   */
  async bulkCreate(
    records: BulkCreateUsersIdAgreementDto[],
  ): Promise<{
    success: number;
    failed: number;
    errors: Array<{ row: number; error: string; data: any }>;
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ row: number; error: string; data: any }>,
    };

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      try {
        // 1. Buscar el UUID del id_type por su valor (CC, NIT, etc.)
        const idTypeRecord = await this.idTypeUserService.findByValue(
          record.idTypeValue.toUpperCase(),
        );

        if (!idTypeRecord) {
          throw new Error(
            `Tipo de ID "${record.idTypeValue}" no encontrado`,
          );
        }

        // 2. Validar que el agreement existe
        await this.agreementsService.findOne(record.agreementId);

        // 3. Crear el registro
        await this.create({
          idType: idTypeRecord.id,
          numId: record.numId,
          agreementId: record.agreementId,
          createdBy: record.createdBy,
        });

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: error.message || 'Error desconocido',
          data: record,
        });
      }
    }

    return results;
  }

  /**
   * Crear múltiples registros desde contenido CSV
   */
  async bulkCreateFromCsv(csvContent: string): Promise<{
    success: number;
    failed: number;
    errors: Array<{ row: number; error: string; data: any }>;
  }> {
    // Parsear CSV manualmente (simple parser)
    const lines = csvContent.trim().split('\n');

    if (lines.length < 2) {
      throw new BadRequestException('El archivo CSV está vacío o no tiene datos');
    }

    // Detectar el delimitador (puede ser , o ;)
    const firstLine = lines[0];
    const delimiter = firstLine.includes(';') ? ';' : ',';

    // Obtener headers y validar
    const headers = firstLine.split(delimiter).map(h => h.trim());
    const expectedHeaders = ['idTypeValue', 'numId', 'agreementId'];

    const hasValidHeaders = expectedHeaders.every(h => headers.includes(h));
    if (!hasValidHeaders) {
      throw new BadRequestException(
        `El CSV debe tener los headers: ${expectedHeaders.join(', ')}. Encontrados: ${headers.join(', ')}`,
      );
    }

    // Parsear las filas de datos
    const records: BulkCreateUsersIdAgreementDto[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Saltar líneas vacías

      const values = line.split(delimiter).map(v => v.trim());

      // Mapear valores a objeto según el orden de los headers
      const record: any = {};
      headers.forEach((header, index) => {
        record[header] = values[index];
      });

      records.push({
        idTypeValue: record.idTypeValue,
        numId: record.numId,
        agreementId: record.agreementId,
      });
    }

    // Llamar al método bulkCreate existente
    return await this.bulkCreate(records);
  }

  /**
   * Validar si existe un registro con la combinación de idType, numId y agreementId
   * El numId se recibe sin encriptar y se busca encriptado
   */
  async validateNumId(
    idType: string,
    numId: string,
    agreementId: string,
  ): Promise<{
    exists: boolean;
    record?: UsersIdAgreement;
  }> {
    // Obtener registros filtrados por idType y agreementId
    const records = await this.usersIdAgreementRepository.find({
      where: {
        idType,
        agreementId,
      },
      relations: ['idTypeUser', 'agreement'],
    });

    // Si no hay registros con ese idType y agreementId, retornar false
    if (records.length === 0) {
      return { exists: false };
    }

    // Desencriptar y buscar coincidencia de numId
    for (const record of records) {
      const decryptedNumId = this.decrypt(record.numId);
      if (decryptedNumId === numId) {
        return {
          exists: true,
          record: this.decryptRecord(record),
        };
      }
    }

    return { exists: false };
  }

  /**
   * Obtener todos los registros
   */
  async findAll(): Promise<UsersIdAgreement[]> {
    const records = await this.usersIdAgreementRepository.find({
      relations: ['idTypeUser', 'agreement'],
      order: { createdAt: 'DESC' },
    });

    return this.decryptRecords(records);
  }

  /**
   * Obtener un registro por ID
   */
  async findOne(id: string): Promise<UsersIdAgreement> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const record = await this.usersIdAgreementRepository.findOne({
      where: { id },
      relations: ['idTypeUser', 'agreement'],
    });

    if (!record) {
      throw new NotFoundException(`Registro con ID ${id} no encontrado`);
    }

    return this.decryptRecord(record);
  }

  /**
   * Eliminar un registro
   */
  async delete(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.usersIdAgreementRepository.delete(id);

    return {
      message: `Registro con ID ${id} eliminado exitosamente`,
    };
  }

  /**
   * Generar plantilla CSV en blanco para bulk upload
   */
  generateCsvTemplate(): string {
    const headers = ['idTypeValue', 'numId', 'agreementId'];
    const exampleRow = ['CC', '1234567890', 'UUID-del-convenio'];

    // Retornar CSV con headers y una fila de ejemplo
    return `${headers.join(',')}\n${exampleRow.join(',')}`;
  }
}
