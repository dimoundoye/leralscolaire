const db = require('./db');
async function checkSchema() {
  try {
    const tables = ['users', 'etablissements', 'eleves', 'classes', 'notes', 'matieres', 'inscription_classes'];
    for (const table of tables) {
      const res = await db.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [table]);
      console.log(`--- Table: ${table} ---`);
      console.table(res.rows);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
checkSchema();
