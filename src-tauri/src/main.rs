mod clickhouse;
mod commands;
mod menu;

use std::sync::Mutex;
use tauri::{Emitter, Manager};

struct AppState {
    path: String,
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let working_dir = app.path().app_local_data_dir().unwrap();
            let clickhouse_dir = working_dir.join("ch");

            clickhouse::setup_clickhouse(&clickhouse_dir);

            app.manage(Mutex::new(AppState {
                path: clickhouse_dir.to_string_lossy().to_string(),
            }));

            let menu = menu::new_menu(app.app_handle())?;
            app.set_menu(menu)?;

            app.on_menu_event(move |app_handle: &tauri::AppHandle, event| {
                match event.id().0.as_str() {
                    "settings" => {
                        app_handle.emit("open_settings", ()).unwrap();
                    }
                    _ => {}
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![commands::query])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
