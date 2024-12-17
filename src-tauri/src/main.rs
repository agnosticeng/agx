#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod chdb;
mod clickhouse;
mod commands;
mod db;

use std::borrow::Cow;

use chdb::{
    arg::Arg,
    format,
    session::{Session, SessionBuilder},
};
use std::sync::Mutex;
use tauri::Manager;

struct AppState {
    session: Session,
}

fn main() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(db::DB_PATH, db::get_migrations())
                .build(),
        )
        .plugin(tauri_plugin_context_menu::init())
        .setup(|app| {
            let working_dir = app.path_resolver().app_local_data_dir().unwrap();
            let clickhouse_dir = working_dir.join("ch");
            let config_path = clickhouse_dir.join("config.xml".to_string());

            clickhouse::setup_clickhouse(&clickhouse_dir);

            let session = SessionBuilder::new()
                // .with_arg(Arg::LogLevel(chdb::log_level::LogLevel::Debug))
                .with_arg(Arg::OutputFormat(format::OutputFormat::JSON))
                .with_arg(Arg::ConfigFilePath(Cow::Borrowed(
                    config_path.to_str().unwrap(),
                )))
                .with_data_path(clickhouse_dir)
                .build()
                .unwrap();

            app.manage(Mutex::new(AppState { session }));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![commands::query])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
