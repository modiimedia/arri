# arri_derive

The `#[derive(ArriModel)]` macro for the [`arri`](https://crates.io/crates/arri) crate.

Don't depend on this crate directly. Use `arri`, which re-exports the macro (through its default
`derive` feature):

```toml
[dependencies]
arri = "0.85"
```

```rust,ignore
use arri::ArriModel;

#[derive(ArriModel)]
struct User {
    id: String,
    name: String,
}
```

See the [`ArriModel` documentation](https://docs.rs/arri/latest/arri/derive.ArriModel.html) for
every attribute.

## License

MIT
