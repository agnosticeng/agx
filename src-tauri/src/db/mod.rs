use std::fs;
use std::path::Path;
use tauri_plugin_sql::{Migration, MigrationKind};

pub const DB_PATH: &str = "sqlite:database.db";
const MIGRATION_DIR: &str = "src/db/migrations";

pub fn get_migrations() -> Vec<Migration> {
    let migration_dir = Path::new(MIGRATION_DIR);
    let mut migrations = vec![];

    if let Ok(entries) = fs::read_dir(migration_dir) {
        let mut files: Vec<_> = entries
            .filter_map(|entry| entry.ok())
            .filter(|entry| entry.path().extension().map_or(false, |ext| ext == "sql"))
            .collect();

        files.sort_by_key(|entry| entry.path());

        for (i, file) in files.iter().enumerate() {
            if let Ok(content) = fs::read_to_string(file.path()) {
                let description = Box::leak(
                    file.path()
                        .file_name()
                        .unwrap()
                        .to_string_lossy()
                        .to_string()
                        .into_boxed_str(),
                );
                let sql = Box::leak(content.into_boxed_str());

                migrations.push(Migration {
                    version: i as i64 + 1,
                    description,
                    sql,
                    kind: MigrationKind::Up,
                });
            }
        }
    }

    migrations
}
