import 'dart:async';

sealed class Result<T, E> {
  T? unwrap();
  T unwrapOr(T fallback);
  E? unwrapErr();
}

class Ok<T, E> implements Result<T, E> {
  final T value;
  const Ok(this.value);

  T unwrap() => value;
  T unwrapOr(T _) => value;
  E? unwrapErr() => null;
}

class Err<T, E> implements Result<T, E> {
  final E error;
  final StackTrace? stackTrace;
  const Err(this.error, {this.stackTrace});

  T? unwrap() => null;
  T unwrapOr(T fallback) => fallback;
  E? unwrapErr() => error;
}

extension SafeFuture<T> on Future<T> {
  Future<Result<T, Object>> tryCatch() async {
    try {
      return Ok(await this);
    } catch (err, stackTrace) {
      return Err(err, stackTrace: stackTrace);
    }
  }
}
