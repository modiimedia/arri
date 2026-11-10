use std::borrow::Cow;

use crate::{
    ArriSchema, Decode, DecodeError, Decoder, Encode, EncodeError, Encoder, SchemaContext, TypeDef,
};

/// A value that must be present but may be `null`.
///
/// This is distinct from `Option<T>` which is used for fields that may be omitted entirely.
///
/// | Rust type               | Accepts                              |
/// | ----------------------- | ------------------------------------ |
/// | `T`                     | `T`                                  |
/// | `Nullable<T>`           | `T` or `null`                        |
/// | `Option<T>`             | `T` or an omitted field              |
/// | `Option<Nullable<T>>`   | `T`, `null`, or an omitted field     |
///
/// `Null` is ordered before `Present` (matching `Option`).
///
/// The variants are exported from the crate root so they can be used without the `Nullable::`
/// prefix, the same way `Some` and `None` are used with `Option`:
///
/// ```
/// use arri::{Null, Nullable, Present};
///
/// let name: Nullable<&str> = Present("John");
/// let nickname: Nullable<&str> = Null;
///
/// match name {
///     Present(name) => assert_eq!(name, "John"),
///     Null => unreachable!(),
/// }
/// assert!(nickname.is_null());
/// // values can also be converted with `into()`
/// let age: Nullable<u8> = 30.into();
/// assert_eq!(age, Present(30));
/// ```
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Default)]
pub enum Nullable<T> {
    #[default]
    Null,
    Present(T),
}

impl<T> Nullable<T> {
    #[inline]
    pub const fn is_present(&self) -> bool {
        matches!(self, Nullable::Present(_))
    }

    #[inline]
    pub const fn is_null(&self) -> bool {
        matches!(self, Nullable::Null)
    }

    #[inline]
    pub fn is_present_and(&self, f: impl FnOnce(&T) -> bool) -> bool {
        match self {
            Nullable::Present(value) => f(value),
            Nullable::Null => false,
        }
    }

    #[inline]
    pub const fn as_ref(&self) -> Nullable<&T> {
        match self {
            Nullable::Present(value) => Nullable::Present(value),
            Nullable::Null => Nullable::Null,
        }
    }

    #[inline]
    pub fn as_mut(&mut self) -> Nullable<&mut T> {
        match self {
            Nullable::Present(value) => Nullable::Present(value),
            Nullable::Null => Nullable::Null,
        }
    }

    #[inline]
    #[track_caller]
    pub fn expect(self, message: &str) -> T {
        match self {
            Nullable::Present(value) => value,
            Nullable::Null => panic!("{message}"),
        }
    }

    #[inline]
    #[track_caller]
    pub fn unwrap(self) -> T {
        match self {
            Nullable::Present(value) => value,
            Nullable::Null => panic!("called `Nullable::unwrap()` on a `Null` value"),
        }
    }

    #[inline]
    pub fn unwrap_or(self, default: T) -> T {
        match self {
            Nullable::Present(value) => value,
            Nullable::Null => default,
        }
    }

    #[inline]
    pub fn unwrap_or_else(self, f: impl FnOnce() -> T) -> T {
        match self {
            Nullable::Present(value) => value,
            Nullable::Null => f(),
        }
    }

    #[inline]
    pub fn unwrap_or_default(self) -> T
    where
        T: Default,
    {
        match self {
            Nullable::Present(value) => value,
            Nullable::Null => T::default(),
        }
    }

    #[inline]
    pub fn map<U>(self, f: impl FnOnce(T) -> U) -> Nullable<U> {
        match self {
            Nullable::Present(value) => Nullable::Present(f(value)),
            Nullable::Null => Nullable::Null,
        }
    }

    #[inline]
    pub fn map_or<U>(self, default: U, f: impl FnOnce(T) -> U) -> U {
        match self {
            Nullable::Present(value) => f(value),
            Nullable::Null => default,
        }
    }

    #[inline]
    pub fn ok_or<E>(self, err: E) -> Result<T, E> {
        match self {
            Nullable::Present(value) => Ok(value),
            Nullable::Null => Err(err),
        }
    }

    #[inline]
    pub fn take(&mut self) -> Nullable<T> {
        std::mem::take(self)
    }

    /// Convert into an `Option<T>` where `Null` becomes `None`
    #[inline]
    pub fn into_option(self) -> Option<T> {
        self.into()
    }
}

impl<T> From<T> for Nullable<T> {
    #[inline]
    fn from(value: T) -> Self {
        Nullable::Present(value)
    }
}

impl<T> From<Option<T>> for Nullable<T> {
    #[inline]
    fn from(value: Option<T>) -> Self {
        match value {
            Some(value) => Nullable::Present(value),
            None => Nullable::Null,
        }
    }
}

impl<T> From<Nullable<T>> for Option<T> {
    #[inline]
    fn from(value: Nullable<T>) -> Self {
        match value {
            Nullable::Present(value) => Some(value),
            Nullable::Null => None,
        }
    }
}

/// `Nullable<T>` has the same schema as `T` (including `metadata.id`) with `isNullable` set to `true`.
///
/// Its generic name has a `Nullable` suffix so that generic types instantiated with `T` and
/// `Nullable<T>` (which have different schemas) get different ids. (`Page<User>` is `UserPage`
/// while `Page<Nullable<User>>` is `UserNullablePage`.)
impl<T: ArriSchema> ArriSchema for Nullable<T> {
    fn generic_name() -> Cow<'static, str> {
        Cow::Owned(format!("{}Nullable", T::generic_name()))
    }

    fn type_def(ctx: &mut SchemaContext) -> TypeDef {
        T::type_def(ctx).nullable()
    }
}

impl<T: Encode> Encode for Nullable<T> {
    #[inline]
    fn encode<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError> {
        match self {
            Nullable::Present(value) => value.encode(e),
            Nullable::Null => e.encode_null(),
        }
    }
}

impl<T: Decode> Decode for Nullable<T> {
    #[inline]
    fn decode<D: Decoder + ?Sized>(d: &mut D) -> Result<Self, DecodeError> {
        if d.decode_null()? {
            return Ok(Nullable::Null);
        }
        T::decode(d).map(Nullable::Present)
    }
}
