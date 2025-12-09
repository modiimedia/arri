use crate::errors::ArriError;

pub enum StreamEvent<T> {
    Data(T),
    Error(ArriError),
    Start,
    End,
    Cancel,
}
