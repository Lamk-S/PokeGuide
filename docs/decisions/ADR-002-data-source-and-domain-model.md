# ADR 002: Fuente de Datos y Modelo de Dominio

## Estado
Aceptado

## Contexto
PokeGuide requiere un acceso rápido, determinista y estructurado a una gran cantidad de datos sobre Pokémon (estadísticas base, tipos, movimientos, naturalezas). La API pública `PokeAPI` contiene toda esta información, pero presenta varios desafíos arquitectónicos si se consume directamente en tiempo de ejecución (runtime):
1. **Estructura acoplada:** Las respuestas de PokeAPI contienen una gran cantidad de datos anidados e innecesarios para nuestro dominio competitivo.
2. **Latencia y Rate Limits:** Funcionalidades futuras como el *Build Optimizer* requerirán iterar y calcular miles de combinaciones. Hacer esto mediante peticiones HTTP asíncronas haría la herramienta inusable.
3. **Estabilidad:** Depender de una API externa de terceros como fuente de verdad en tiempo real introduce un punto de fallo crítico.

## Decisión
Se ha decidido implementar un **Pipeline de Ingestión de Datos (Local-First)** y aislar completamente nuestro Modelo de Dominio de la fuente externa. 

La arquitectura se compone de:
1. **PokeAPI como fuente externa:** Solo se interactúa con ella mediante scripts fuera del runtime de la aplicación.
2. **DTOs y Validación de Fronteras:** Se utiliza `Zod` para validar la respuesta cruda (DTO) de la API. No se confía a ciegas en la estructura externa.
3. **Mappers:** Transforman los DTOs validados en nuestras entidades de **Dominio** estrictas.
4. **Dataset Local Versionado:** Las entidades de dominio se serializan en archivos JSON dentro de la carpeta `data/`. Estos archivos se versionan en Git.
5. **Repositorios Locales:** La capa de aplicación interactúa con interfaces de repositorios (ej. `PokemonRepository`), cuyas implementaciones leen el dataset estático local.

## Consecuencias

### Positivas
* **Performance extrema (Latencia 0):** Los algoritmos de optimización matemática podrán ejecutarse en memoria de forma síncrona sin bloqueos I/O de red.
* **Aislamiento del Dominio (Clean Architecture):** Si mañana PokeAPI cambia su estructura o desaparece, solo debemos actualizar el script de ingestión y el Mapper. Ni el Modelo de Dominio ni los componentes de React se verán afectados.
* **Determinismo en Tests:** Las pruebas unitarias de los motores de cálculo usarán datos reales del dataset local sin necesidad de *mockear* peticiones HTTP.
* **Offline-friendly:** Prepara el terreno para que la aplicación pueda funcionar como una PWA (Progressive Web App) en el futuro.

### Negativas
* **Mantenimiento del Pipeline:** Requiere mantener y ejecutar scripts (`scripts/fetch-pokeapi.ts`) para mantener los datos actualizados cuando haya nuevas generaciones.
* **Tamaño del repositorio:** Almacenar JSONs locales incrementará el tamaño del repositorio. Deberemos aplicar estrategias de lazy loading en el cliente para no enviar todo el JSON masivo al navegador en la carga inicial.

## Alternativas Consideradas
* **Consumo directo de PokeAPI en componentes React:** Descartado. Viola la separación de responsabilidades, acopla la UI a contratos de terceros y destruye el performance necesario para las simulaciones.
* **Base de datos completa (Supabase / Postgres) en el MVP:** Descartado prematuramente. Añade complejidad de infraestructura innecesaria para datos que son de solo lectura y universales. Se reserva Supabase para datos transaccionales futuros (equipos guardados de usuarios).
* **Escribir el dataset manualmente:** Descartado. Inviable a largo plazo (1000+ Pokémon, cientos de movimientos y habilidades).