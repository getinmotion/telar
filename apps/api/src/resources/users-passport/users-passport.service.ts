import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { UsersPassport } from './entities/users-passport.entity';
import { CreateUsersPassportDto } from './dto/create-users-passport.dto';
import { UpdateUsersPassportDto } from './dto/update-users-passport.dto';
import { MailService } from '../mail/mail.service';
import * as QRCode from 'qrcode';
import axios from 'axios';
import sharp from 'sharp';
import { ImageUrlBuilder } from '../../common/utils/image-url-builder.util';
import { buildPassportPdf, PassportPdfInput } from './pdf/passport-pdf.builder';

// Etiquetas del wizard de productos (artisans-web), replicadas para el PDF
const PURPOSE_LABELS: Record<string, string> = {
  funcional: 'Funcional',
  decorativa: 'Decorativa',
  ritual: 'Ritual',
  coleccionable: 'Coleccionable',
};

const STYLE_LABELS: Record<string, string> = {
  tradicional: 'Tradicional',
  contemporaneo: 'Contemporáneo',
  fusion: 'Fusión',
};

const AVAILABILITY_LABELS: Record<string, string> = {
  en_stock: 'Disponible ahora',
  bajo_pedido: 'Bajo pedido',
  edicion_limitada: 'Edición limitada',
  pieza_unica: 'Pieza única',
};

@Injectable()
export class UsersPassportService {
  constructor(
    @Inject('USERS_PASSPORT_REPOSITORY')
    private readonly usersPassportRepository: Repository<UsersPassport>,
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
  ) {}

  /**
   * Crear un nuevo usuario comprador
   */
  async create(createDto: CreateUsersPassportDto): Promise<UsersPassport> {
    const newUser = this.usersPassportRepository.create(createDto);
    return await this.usersPassportRepository.save(newUser);
  }

  /**
   * Obtener todos los usuarios compradores
   */
  async getAll(): Promise<UsersPassport[]> {
    return await this.usersPassportRepository.find({
      relations: ['passportUsers'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener un usuario comprador por ID
   */
  async getById(id: string): Promise<UsersPassport> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const user = await this.usersPassportRepository.findOne({
      where: { id },
      relations: ['passportUsers', 'passportUsers.productIdentity'],
    });

    if (!user) {
      throw new NotFoundException(
        `Usuario comprador con ID ${id} no encontrado`,
      );
    }

    return user;
  }

  /**
   * Obtener un usuario comprador por número de identificación
   */
  async getByNumIdentificacion(
    numIdentificacion: string,
  ): Promise<UsersPassport[]> {
    if (!numIdentificacion) {
      throw new BadRequestException(
        'El número de identificación es requerido',
      );
    }

    return await this.usersPassportRepository.find({
      where: { numIdentificacion },
      relations: ['passportUsers', 'passportUsers.productIdentity'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener un usuario comprador por email
   */
  async getByEmail(email: string): Promise<UsersPassport[]> {
    if (!email) {
      throw new BadRequestException('El email es requerido');
    }

    return await this.usersPassportRepository.find({
      where: { email },
      relations: ['passportUsers', 'passportUsers.productIdentity'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar un usuario comprador
   */
  async update(
    id: string,
    updateDto: UpdateUsersPassportDto,
  ): Promise<UsersPassport> {
    // Verificar que existe
    await this.getById(id);

    // Actualizar
    await this.usersPassportRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.getById(id);
  }

  /**
   * Eliminar un usuario comprador (soft delete)
   */
  async delete(id: string): Promise<{ message: string }> {
    // Verificar que existe
    await this.getById(id);

    // Soft delete
    await this.usersPassportRepository.softDelete(id);

    return {
      message: `Usuario comprador con ID ${id} eliminado exitosamente`,
    };
  }

  /**
   * Registrar usuario comprador con identityKey
   * Busca la identidad del producto, crea el usuario y la relación en passport_user
   * Genera el QR, arma el PDF del pasaporte digital y lo envía por email
   */
  async registerWithIdentityKey(data: {
    identityKey: string;
    numIdentificacion: string;
    nombreCompleto: string;
    email: string;
    telefono: string;
  }): Promise<{
    message: string;
    userPassport: UsersPassport;
    productIdentity: any;
  }> {
    // 1. Buscar el product_identity por identityKey
    const productIdentityQuery = await this.dataSource.query(
      `
      SELECT id, identity_key, product_id, store_id, artisan_id, is_active
      FROM digital_identity.product_identity
      WHERE identity_key = $1 AND is_active = true
      `,
      [data.identityKey],
    );

    if (!productIdentityQuery || productIdentityQuery.length === 0) {
      throw new NotFoundException(
        `No se encontró un certificado activo con la clave: ${data.identityKey}`,
      );
    }

    const productIdentity = productIdentityQuery[0];

    // 2. Crear el usuario comprador
    const newUserPassport = this.usersPassportRepository.create({
      numIdentificacion: data.numIdentificacion,
      nombreCompleto: data.nombreCompleto,
      email: data.email,
      telefono: data.telefono,
    });

    const savedUserPassport =
      await this.usersPassportRepository.save(newUserPassport);

    // 3. Crear la relación en passport_user (tabla pivot)
    const passportUserResult = await this.dataSource.query(
      `
      INSERT INTO digital_identity.passport_user 
        (passport_identity_id, user_passport_id, is_active, created_at, updated_at)
      VALUES 
        ($1, $2, true, NOW(), NOW())
      RETURNING id
      `,
      [productIdentity.id, savedUserPassport.id],
    );

    const passportUserId = passportUserResult[0].id;

    // 4. Generar QR code con la información del certificado
    const qrData = JSON.stringify({
      certificateId: passportUserId,
      identityKey: data.identityKey,
      productId: productIdentity.product_id,
      owner: data.nombreCompleto,
      registeredAt: new Date().toISOString(),
    });

    const qrCodeBuffer = await QRCode.toBuffer(qrData, {
      width: 600,
      margin: 1,
      color: {
        dark: '#151b2d',
        light: '#FFFFFF',
      },
    });

    // 5. Armar y generar el PDF del pasaporte digital
    const pdfInput = await this.buildPassportPdfInput({
      productId: productIdentity.product_id,
      artisanId: productIdentity.artisan_id,
      identityKey: data.identityKey,
      qrCodeBuffer,
      owner: {
        name: data.nombreCompleto,
        idNumber: data.numIdentificacion,
        email: data.email,
        phone: data.telefono,
      },
    });

    const pdfBuffer = await buildPassportPdf(pdfInput);

    // 6. Enviar email con el PDF del pasaporte
    try {
      await this.mailService.sendCertificateCompleted(
        data.email,
        data.nombreCompleto,
        pdfInput.piece.name,
        data.identityKey,
        pdfBuffer,
      );
    } catch (error) {
      console.error('Error al enviar email con certificado:', error);
      // No fallar el registro si el email falla
    }

    return {
      message:
        'Registro completado exitosamente. Certificado asociado a tu cuenta y enviado por email.',
      userPassport: savedUserPassport,
      productIdentity: {
        id: productIdentity.id,
        identityKey: productIdentity.identity_key,
        productId: productIdentity.product_id,
        storeId: productIdentity.store_id,
        artisanId: productIdentity.artisan_id,
      },
    };
  }

  /**
   * Reúne todos los datos que el pasaporte digital imprime: los mismos campos
   * que el artesano ve en el paso 5 del wizard de productos, más el titular del
   * certificado y el QR de verificación.
   */
  private async buildPassportPdfInput(params: {
    productId: string;
    artisanId: string;
    identityKey: string;
    qrCodeBuffer: Buffer;
    owner: {
      name: string;
      idNumber: string;
      email: string;
      phone: string;
    };
  }): Promise<PassportPdfInput> {
    const [rows, materialRows, mediaRows, variantRows] = await Promise.all([
      this.dataSource.query(
        `
        SELECT
          pc.name                        AS product_name,
          pc.short_description           AS short_description,
          pc.history                     AS history,
          pc.care_notes                  AS care_notes,
          pc.usage_suggestions           AS usage_suggestions,
          cat.name                       AS category_name,
          sub.name                       AS subcategory_name,
          ai.piece_type                  AS piece_type,
          ai.style                       AS style,
          ai.styles                      AS styles,
          ai.is_collaboration            AS is_collaboration,
          ai.collaboration_name          AS collaboration_name,
          ai.estimated_elaboration_time  AS elaboration_time,
          cr.name                        AS craft_name,
          t1.name                        AS primary_technique_name,
          t2.name                        AS secondary_technique_name,
          ps.height_cm                   AS height_cm,
          ps.width_cm                    AS width_cm,
          ps.length_or_diameter_cm       AS length_cm,
          ps.real_weight_kg              AS weight_kg,
          pp.availability_type           AS availability_type,
          pp.monthly_capacity            AS monthly_capacity,
          pp.process_description         AS process_description,
          pp.tools                       AS tools,
          pp.process_evidence_urls       AS process_evidence_urls,
          s.name                         AS store_name,
          ash.shop_name                  AS shop_name,
          ash.municipality               AS municipality,
          ash.department                 AS department,
          ap.full_name                   AS artisan_name
        FROM shop.products_core pc
        LEFT JOIN taxonomy.categories cat ON cat.id = pc.category_id
        LEFT JOIN taxonomy.categories sub ON sub.id = pc.subcategory_id
        LEFT JOIN shop.product_artisanal_identity ai
          ON ai.product_id = pc.id AND ai.deleted_at IS NULL
        LEFT JOIN taxonomy.crafts cr ON cr.id = ai.primary_craft_id
        LEFT JOIN taxonomy.techniques t1 ON t1.id = ai.primary_technique_id
        LEFT JOIN taxonomy.techniques t2 ON t2.id = ai.secondary_technique_id
        LEFT JOIN shop.product_physical_specs ps
          ON ps.product_id = pc.id AND ps.deleted_at IS NULL
        LEFT JOIN shop.product_production pp
          ON pp.product_id = pc.id AND pp.deleted_at IS NULL
        LEFT JOIN store.stores s ON s.id = pc.store_id
        LEFT JOIN shop.artisan_shops ash ON ash.id = COALESCE(s.legacy_id, pc.store_id)
        LEFT JOIN artesanos.artisan_profile ap ON ap.id = $2
        WHERE pc.id = $1
        LIMIT 1
        `,
        [params.productId, params.artisanId],
      ),
      this.dataSource.query(
        `
        SELECT m.name
        FROM shop.product_materials_link pml
        INNER JOIN taxonomy.materials m ON m.id = pml.material_id
        WHERE pml.product_id = $1 AND pml.deleted_at IS NULL
        `,
        [params.productId],
      ),
      this.dataSource.query(
        `
        SELECT media_url
        FROM shop.product_media
        WHERE product_id = $1
          AND deleted_at IS NULL
          AND (media_type = 'image' OR media_type IS NULL)
        ORDER BY is_primary DESC, display_order ASC
        LIMIT 6
        `,
        [params.productId],
      ),
      this.dataSource.query(
        `
        SELECT sku
        FROM shop.product_variants
        WHERE product_id = $1 AND deleted_at IS NULL AND sku IS NOT NULL
        ORDER BY created_at ASC
        LIMIT 1
        `,
        [params.productId],
      ),
    ]);

    const row = rows?.[0] ?? {};

    const dimensions = [row.height_cm, row.width_cm, row.length_cm]
      .map((value: unknown) => Number(value))
      .filter((value: number) => Number.isFinite(value) && value > 0);

    const weight = Number(row.weight_kg);

    const styles: string[] = Array.isArray(row.styles)
      ? row.styles
      : row.style
        ? [row.style]
        : [];

    const evidenceUrls: string[] = Array.isArray(row.process_evidence_urls)
      ? row.process_evidence_urls.slice(0, 4)
      : [];

    const annexUrls: string[] = (mediaRows ?? [])
      .map((media: { media_url: string }) => media.media_url)
      .filter(Boolean);

    // Las imágenes son opcionales: si alguna falla, el pasaporte se emite igual
    const [photo, annexes, evidence] = await Promise.all([
      annexUrls.length > 0 ? this.fetchImage(annexUrls[0], 720) : null,
      this.fetchImages(annexUrls),
      this.fetchImages(evidenceUrls),
    ]);

    return {
      passportNo: params.identityKey,
      issueDate: new Date(),
      piece: {
        name: row.product_name || 'Pieza artesanal',
        shortDescription: row.short_description,
        sku: variantRows?.[0]?.sku ?? null,
        workshopName: row.store_name || row.shop_name || null,
        origin:
          [row.municipality, row.department, 'Colombia']
            .filter(Boolean)
            .join(', ') || 'Colombia',
        department: row.department ?? null,
        collaboration: row.is_collaboration ? row.collaboration_name : null,
        categoryText: row.subcategory_name
          ? `${row.category_name ?? '—'} · ${row.subcategory_name}`
          : row.category_name ?? '—',
        purposeLabel: row.piece_type
          ? PURPOSE_LABELS[row.piece_type] ?? row.piece_type
          : null,
        styleLabels: styles.map((style) => STYLE_LABELS[style] ?? style),
        craftName: row.craft_name ?? null,
        primaryTechniqueName: row.primary_technique_name ?? null,
        secondaryTechniqueName: row.secondary_technique_name ?? null,
        materialNames: (materialRows ?? []).map((m: { name: string }) => m.name),
        elaborationTime: row.elaboration_time ?? null,
        availabilityLabel: row.availability_type
          ? AVAILABILITY_LABELS[row.availability_type] ?? row.availability_type
          : null,
        dimensionsText:
          dimensions.length > 0 ? `${dimensions.join(' × ')} cm` : '—',
        weightText: Number.isFinite(weight) && weight > 0 ? `${weight} kg` : '—',
        artisanName: row.artisan_name ?? null,
        history: row.history ?? null,
        processDescription: row.process_description ?? null,
        tools: Array.isArray(row.tools) ? row.tools : [],
        monthlyCapacity:
          row.monthly_capacity != null ? Number(row.monthly_capacity) : null,
        careNotes: row.care_notes ?? null,
        usageSuggestions: row.usage_suggestions ?? null,
      },
      owner: { ...params.owner },
      photo,
      annexes,
      evidence,
      qr: params.qrCodeBuffer,
    };
  }

  private async fetchImages(urls: string[]): Promise<Buffer[]> {
    const images = await Promise.all(
      urls.map((url) => this.fetchImage(url, 320)),
    );
    return images.filter((image): image is Buffer => image !== null);
  }

  /**
   * Descarga una imagen del CDN y la normaliza a JPEG (PDFKit sólo embebe
   * JPEG/PNG). Devuelve null ante cualquier fallo para no bloquear la emisión.
   */
  private async fetchImage(
    url: string | null,
    width: number,
  ): Promise<Buffer | null> {
    const fullUrl = ImageUrlBuilder.buildUrl(url);
    if (!fullUrl) return null;

    try {
      const response = await axios.get<ArrayBuffer>(fullUrl, {
        responseType: 'arraybuffer',
        timeout: 6000,
        maxContentLength: 15 * 1024 * 1024,
      });

      return await sharp(Buffer.from(response.data))
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .jpeg({ quality: 78 })
        .toBuffer();
    } catch (error) {
      console.error(
        `No se pudo procesar la imagen del pasaporte: ${fullUrl}`,
        error,
      );
      return null;
    }
  }
}
