#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::borrow::Cow;
use String;

use agx::{arg::Arg, format::OutputFormat};

use std::env;
mod conf;

#[tauri::command]
async fn query(query: String, udfs: String) -> String {
    let config_path = conf::gen_clickhouse_config(&udfs);

    let args = if !udfs.is_empty() {
        vec![
            // Arg::Custom("logger.level".into(), Some("debug".into())),
            Arg::OutputFormat(OutputFormat::JSON),
            Arg::Custom("path".into(), Some(udfs.into())),
            Arg::ConfigFilePath(Cow::Borrowed(&config_path)),
        ]
    } else {
        vec![Arg::OutputFormat(OutputFormat::JSON)]
    };

    let result = agx::execute(&query, Some(&args));
    match result {
        Ok(Some(query_result)) => query_result
            .data_utf8()
            .unwrap_or_else(|_| String::from("invalid utf8 char")),
        Ok(None) => String::from("No result"),
        Err(e) => format!("Error: {:?}", e),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![query])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
