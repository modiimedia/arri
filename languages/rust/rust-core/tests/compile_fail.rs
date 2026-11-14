//! Make sure that invalid usages of `#[derive(Arri)]` produce helpful compile errors.
//!
//! Run with `TRYBUILD=overwrite cargo test --test compile_fail` to regenerate the expected output.

#[test]
fn compile_fail() {
    let t = trybuild::TestCases::new();
    t.compile_fail("tests/ui/*.rs");
}
