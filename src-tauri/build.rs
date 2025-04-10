use std::path::PathBuf;

fn main() {
    let target_triple = std::env::consts::ARCH.to_string() + "-apple-" + "darwin";

    let current_dir = std::env::current_dir().expect("Failed to get current directory");
    let new_name = format!("libchdb.so-{}", target_triple);
    let source = current_dir.join("libchdb.so");
    let dest = current_dir.join(&new_name);

    if source.exists() && !dest.exists() {
        std::fs::rename(source, dest).expect("Failed to rename library file");
    }

    tauri_build::build();

    // // Tell cargo to look for shared libraries in the specified directory
    println!("cargo:rustc-link-search=./");

    // // Tell cargo to tell rustc to link the system chdb library.
    println!("cargo:rustc-link-lib=chdb");

    // Tell cargo to invalidate the built crate whenever the wrapper changes.
    println!("cargo:rerun-if-changed=chdb.h");

    // The bindgen::Builder is the main entry point
    // to bindgen, and lets you build up options for
    // the resulting bindings.
    let bindings = bindgen::Builder::default()
        // The input header we would like to generate
        // bindings for.
        .header("chdb.h") // Tell cargo to invalidate the built crate whenever any of the
        // included header files changed.
        .parse_callbacks(Box::new(bindgen::CargoCallbacks::new()))
        // Finish the builder and generate the bindings.
        .generate()
        // Unwrap the Result and panic on failure.
        .expect("Unable to generate bindings");

    // Write the bindings to the $OUT_DIR/bindings.rs file.
    let out_path = PathBuf::from("./src/chdb/");
    bindings
        .write_to_file(out_path.join("bindings.rs"))
        .expect("Couldn't write bindings!");
}
