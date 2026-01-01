
import dotenv from 'dotenv';
import { performExegesis } from '../src/lib/studyService';

// Cargar variables de entorno
dotenv.config();

async function runTest() {
    console.log('🧪 Iniciando prueba de Exégesis (Versión Ligera)...\n');

    try {
        console.log('📖 Pasaje: Juan 3:16');
        const startTime = Date.now();

        // Llamada real al servicio
        const result = await performExegesis(
            "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
            "Juan",
            3,
            "Juan 3:16"
        );

        const duration = Date.now() - startTime;

        if (result.success) {
            console.log(`\n✅ ÉXITO en ${duration}ms`);
            console.log(`📡 Proveedor usado: ${result.provider}`);
            console.log('\n--- RESPUESTA GENERADA ---');
            console.log(result.content);
            console.log('--------------------------\n');

            // Verificaciones básicas de contenido
            if (result.content.includes("CONTEXTO") && result.content.includes("ORACIÓN")) {
                console.log("🌟 Estructura correcta detectada (Contexto, Significado, Aplicación, Oración).");
            } else {
                console.warn("⚠️ La estructura de la respuesta puede no ser la esperada.");
            }

        } else {
            console.error(`\n❌ FALLO en ${duration}ms`);
            console.error(`Error: ${result.content}`);
        }
    } catch (error) {
        console.error('\n❌ Error crítico en ejecución:', error);
    }
}

runTest();
