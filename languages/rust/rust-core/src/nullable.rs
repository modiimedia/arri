use std::{cmp, hint, pin::Pin};

#[derive(Copy, Debug, Hash)]
pub enum Nullable<T> {
    Present(T),
    Null,
}

impl<T> Nullable<T> {
    #[inline]
    #[must_use = "if you intend to assert that this has a value, consider `.unwrap()` instead"]
    pub fn is_present(&self) -> bool {
        matches!(*self, Nullable::Present(_))
    }

    #[inline]
    #[must_use]
    pub fn is_present_and(&self, f: impl FnOnce(&T) -> bool) -> bool {
        match self {
            Nullable::Null => false,
            Nullable::Present(x) => f(x),
        }
    }

    #[inline]
    #[must_use = "if you intended to assert that this doesn't have a value, consider \
                  wrapping this in an `assert!()` instead"]
    pub fn is_null(&self) -> bool {
        !self.is_present()
    }

    #[inline]
    #[must_use]
    pub fn is_null_or(self, f: impl FnOnce(T) -> bool) -> bool {
        match self {
            Nullable::Present(x) => f(x),
            Nullable::Null => true,
        }
    }

    #[inline]
    pub fn as_mut(&mut self) -> Nullable<&mut T> {
        match *self {
            Nullable::Present(ref mut v) => Nullable::Present(v),
            Nullable::Null => Nullable::Null,
        }
    }

    #[inline]
    pub fn as_ref(&self) -> Nullable<&T> {
        match *self {
            Nullable::Present(ref x) => Nullable::Present(x),
            Nullable::Null => Nullable::Null,
        }
    }

    #[inline]
    #[must_use]
    pub fn as_pin_ref(self: Pin<&Self>) -> Nullable<Pin<&T>> {
        match Pin::get_ref(self).as_ref() {
            Nullable::Present(x) => unsafe { Nullable::Present(Pin::new_unchecked(x)) },
            Nullable::Null => Nullable::Null,
        }
    }

    #[inline]
    #[must_use]
    pub fn as_pin_mut(self: Pin<&mut Self>) -> Nullable<Pin<&mut T>> {
        unsafe {
            match Pin::get_unchecked_mut(self).as_mut() {
                Nullable::Present(x) => Nullable::Present(Pin::new_unchecked(x)),
                Nullable::Null => Nullable::Null,
            }
        }
    }

    #[inline]
    #[track_caller]
    pub fn expect(self, msg: &str) -> T {
        match self {
            Nullable::Present(val) => val,
            Nullable::Null => panic!("{}", msg),
        }
    }

    #[inline(always)]
    #[track_caller]
    pub fn unwrap(self) -> T {
        match self {
            Nullable::Null => panic!("tried to unwrap Nullable::Null"),
            Nullable::Present(val) => val,
        }
    }

    #[inline]
    pub fn unwrap_or(self, default: T) -> T {
        match self {
            Nullable::Present(x) => x,
            Nullable::Null => default,
        }
    }

    #[inline]
    #[track_caller]
    pub fn unwrap_or_else<F>(self, f: F) -> T
    where
        F: FnOnce() -> T,
    {
        match self {
            Nullable::Present(x) => x,
            Nullable::Null => f(),
        }
    }

    #[inline]
    pub fn unwrap_or_default(self) -> T
    where
        T: Default,
    {
        match self {
            Nullable::Present(x) => x,
            Nullable::Null => T::default(),
        }
    }

    #[inline]
    #[track_caller]
    pub unsafe fn unwrap_unchecked(self) -> T {
        match self {
            Nullable::Present(x) => x,
            Nullable::Null => unsafe { hint::unreachable_unchecked() },
        }
    }

    #[inline]
    #[must_use = "if you don't need the returned value, use `if let` instead"]
    pub fn map_or<U, F>(self, default: U, f: F) -> U
    where
        F: FnOnce(T) -> U,
    {
        match self {
            Nullable::Present(t) => f(t),
            Nullable::Null => default,
        }
    }

    pub fn map<U, F>(self, f: F) -> Nullable<U>
    where
        F: FnOnce(T) -> U,
    {
        match self {
            Nullable::Present(x) => Nullable::Present(f(x)),
            Nullable::Null => Nullable::Null,
        }
    }

    pub fn map_or_else<U, D, F>(self, default: D, f: F) -> U
    where
        D: FnOnce() -> U,
        F: FnOnce(T) -> U,
    {
        match self {
            Nullable::Present(t) => f(t),
            Nullable::Null => default(),
        }
    }

    pub fn ok_or<E>(self, err: E) -> Result<T, E> {
        match self {
            Nullable::Present(v) => Ok(v),
            Nullable::Null => Err(err),
        }
    }

    pub fn ok_or_else<F, E>(self, err: F) -> Result<T, E>
    where
        F: FnOnce() -> E,
    {
        match self {
            Nullable::Present(v) => Ok(v),
            Nullable::Null => Err(err()),
        }
    }

    pub fn or(self, nullableb: Nullable<T>) -> Nullable<T> {
        match self {
            x @ Nullable::Present(_) => x,
            Nullable::Null => nullableb,
        }
    }

    pub fn or_else<F>(self, f: F) -> Nullable<T>
    where
        F: (FnOnce() -> Nullable<T>),
    {
        match self {
            x @ Nullable::Present(_) => x,
            Nullable::Null => f(),
        }
    }
}

impl<T> Default for Nullable<T> {
    fn default() -> Self {
        Self::Null
    }
}

impl<T: Clone> Clone for Nullable<T> {
    fn clone(&self) -> Self {
        match self {
            Self::Present(val) => Self::Present(val.clone()),
            Self::Null => Self::Null,
        }
    }
}

impl<T> From<T> for Nullable<T> {
    fn from(value: T) -> Self {
        Self::Present(value)
    }
}

impl<T: PartialEq> PartialEq for Nullable<T> {
    fn eq(&self, other: &Self) -> bool {
        match (self, other) {
            (Nullable::Present(l), Nullable::Present(r)) => *l == *r,
            (Nullable::Present(_), Nullable::Null) => false,
            (Nullable::Null, Nullable::Present(_)) => false,
            (Nullable::Null, Nullable::Null) => true,
        }
    }
}

impl<T: PartialOrd> PartialOrd for Nullable<T> {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        match (self, other) {
            (Nullable::Present(l), Nullable::Present(r)) => l.partial_cmp(r),
            (Nullable::Present(_), Nullable::Null) => Some(cmp::Ordering::Greater),
            (Nullable::Null, Nullable::Present(_)) => Some(cmp::Ordering::Less),
            (Nullable::Null, Nullable::Null) => Some(cmp::Ordering::Equal),
        }
    }
}

impl<T: Eq> Eq for Nullable<T> {}

impl<T: Ord> Ord for Nullable<T> {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        match (self, other) {
            (Nullable::Present(l), Nullable::Present(r)) => l.cmp(r),
            (Nullable::Present(_), Nullable::Null) => cmp::Ordering::Greater,
            (Nullable::Null, Nullable::Present(_)) => cmp::Ordering::Less,
            (Nullable::Null, Nullable::Null) => cmp::Ordering::Equal,
        }
    }
}
