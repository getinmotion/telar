import { MigrationInterface, QueryRunner } from "typeorm";
import axios from 'axios';
import * as crypto from 'crypto';

export class UpdateIdTypeAndNumberFromCobre1776831150090 implements MigrationInterface {
    private readonly cobreBaseUrl = 'https://api.cobre.co';
    private readonly algorithm = 'aes-256-cbc';

    private encrypt(text: string): string {
        const encryptionKey = process.env.ENCRYPTION_KEY;

        if (!encryptionKey) {
            throw new Error('❌ ENCRYPTION_KEY debe estar configurada en las variables de entorno');
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

    private async authenticate(): Promise<string> {
        const clientId = process.env.COBRE_API_KEY;
        const secretKey = process.env.COBRE_API_SECRET;

        if (!clientId || !secretKey) {
            throw new Error('❌ COBRE_API_KEY y COBRE_API_SECRET deben estar configuradas en las variables de entorno');
        }

        console.log('🔐 Autenticando con Cobre API...');

        const response = await axios.post(
            `${this.cobreBaseUrl}/v1/auth`,
            {
                user_id: clientId,
                secret: secretKey,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );

        return response.data.access_token;
    }

    private async getCounterparty(
        counterpartyId: string,
        accessToken: string,
    ): Promise<any> {
        const response = await axios.get(
            `${this.cobreBaseUrl}/v1/counterparties/${counterpartyId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        );

        return response.data;
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Iniciando actualización de id_type y id_number desde Cobre API...\n');

        try {
            // PASO 1: Autenticar con Cobre
            const accessToken = await this.authenticate();
            console.log('✅ Autenticación exitosa\n');

            // PASO 2: Obtener todos los user_id de artisan_profile
            console.log('📝 Obteniendo registros de artisan_profile...');
            const artisanProfiles = await queryRunner.query(`
                SELECT user_id
                FROM artesanos.artisan_profile
                WHERE user_id IS NOT NULL
                ORDER BY user_id
            `);
            console.log(`✅ ${artisanProfiles.length} registros encontrados\n`);

            if (artisanProfiles.length === 0) {
                console.log('⚠️  No hay registros para procesar');
                return;
            }

            let successCount = 0;
            let errorCount = 0;
            let skippedCount = 0;

            // PASO 3: Iterar sobre cada artisan_profile
            for (let i = 0; i < artisanProfiles.length; i++) {
                const profile = artisanProfiles[i];
                const userId = profile.user_id;

                console.log(`\n[${i + 1}/${artisanProfiles.length}] 📝 Procesando user_id: ${userId}`);

                try {
                    // PASO 4: Buscar id_contraparty en artisan_shops
                    const shops = await queryRunner.query(`
                        SELECT id_contraparty
                        FROM shop.artisan_shops
                        WHERE user_id = $1
                        LIMIT 1
                    `, [userId]);

                    if (!shops || shops.length === 0) {
                        console.log(`   ⚠️  No se encontró artisan_shop para user_id: ${userId}`);
                        skippedCount++;
                        continue;
                    }

                    const idContraparty = shops[0].id_contraparty;

                    if (!idContraparty) {
                        console.log(`   ⚠️  id_contraparty es NULL para user_id: ${userId}`);
                        skippedCount++;
                        continue;
                    }

                    console.log(`   📞 Consultando Cobre API para contraparty: ${idContraparty}`);

                    // PASO 5: Llamar a getCounterparty de Cobre
                    const counterpartyData = await this.getCounterparty(idContraparty, accessToken);

                    // PASO 6: Extraer datos del metadata
                    const metadata = counterpartyData.metadata;
                    const idType = metadata?.counterparty_id_type;
                    const idNumber = metadata?.counterparty_id_number;

                    if (!idType || !idNumber) {
                        console.log(`   ⚠️  Metadata incompleto para contraparty: ${idContraparty}`);
                        console.log(`   Metadata recibido:`, metadata);
                        errorCount++;
                        continue;
                    }

                    console.log(`   ✅ Datos obtenidos: id_type=${idType}, id_number=${idNumber}`);

                    // PASO 7: Encriptar id_number
                    console.log(`   🔐 Encriptando id_number...`);
                    const encryptedIdNumber = this.encrypt(idNumber);
                    console.log(`   ✅ id_number encriptado`);

                    // PASO 8: Actualizar artisan_profile
                    await queryRunner.query(`
                        UPDATE artesanos.artisan_profile
                        SET id_type = $1, id_number = $2
                        WHERE user_id = $3
                    `, [idType, encryptedIdNumber, userId]);

                    console.log(`   ✅ Registro actualizado exitosamente`);
                    successCount++;

                    // Pequeño delay para no saturar la API (200ms)
                    await new Promise(resolve => setTimeout(resolve, 200));

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    console.error(`   ❌ Error procesando user_id ${userId}:`, errorMessage);

                    // Si es error de autenticación (401), intentar reautenticar
                    if (axios.isAxiosError(error) && error.response?.status === 401) {
                        console.log('   🔄 Token expirado, reautenticando...');
                        try {
                            const newToken = await this.authenticate();
                            console.log('   ✅ Reautenticación exitosa, continuando...');
                            // El próximo registro usará el nuevo token
                        } catch (authError) {
                            console.error('   ❌ Error en reautenticación:', authError);
                            throw authError;
                        }
                    }

                    errorCount++;
                }
            }

            console.log('\n🎉 Migración completada:');
            console.log(`   ✅ Registros actualizados exitosamente: ${successCount}`);
            console.log(`   ⚠️  Registros saltados (sin shop o sin contraparty): ${skippedCount}`);
            console.log(`   ❌ Registros con errores: ${errorCount}`);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('\n❌ Error crítico en la migración:', errorMessage);
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Revirtiendo actualización de id_type y id_number...\n');

        // Esta migración no tiene un rollback seguro porque actualizó datos
        // basados en una API externa. No podemos saber cuáles eran los valores anteriores.
        console.log('⚠️  Esta migración NO tiene rollback automático.');
        console.log('   Los datos fueron obtenidos de Cobre API y no hay forma de revertir');
        console.log('   sin un backup previo de la base de datos.');
        console.log('   Si necesitas revertir, deberás restaurar desde un backup.\n');

        // Opcionalmente, podrías setear a NULL los valores, pero esto podría no ser deseado:
        await queryRunner.query(`
            UPDATE artesanos.artisan_profile
            SET id_type = NULL, id_number = NULL
            WHERE id_type IS NOT NULL OR id_number IS NOT NULL
        `);
    }
}
