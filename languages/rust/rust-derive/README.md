# arri_derive

The `#[derive(Arri)]` macro for the [`arri`](https://crates.io/crates/arri) crate.

Don't depend on this crate directly. Use `arri`, which re-exports the macro (through its default
`derive` feature):

```toml
[dependencies]
arri = "0.85"
```

```rust,ignore
use arri::Arri;

#[derive(Arri)]
struct User {
    id: String,
    name: String,
}
```

See the [`Arri` documentation](https://docs.rs/arri/latest/arri/derive.Arri.html) for
every attribute.

## License

MIT
