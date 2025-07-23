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

bool listsAreEqual(List? list1, List? list2, {bool log = false}) {
  if (list1 == null || list2 == null) {
    return list1 == null && list2 == null;
  }
  final length = list1.length;
  if (list2.length != length) return false;
  for (var i = 0; i < length; i++) {
    final item1 = list1[i];
    final item2 = list2[i];
    if (log) {
      print("1 $item1");
      print("2 $item2");
    }
    if (item1 is Map) {
      if (!mapsAreEqual(item1, item2, log: log)) {
        if (log) print("$item1 != $item2");
        return false;
      }
    } else if (item1 is List) {
      if (!listsAreEqual(item1, item2, log: log)) return false;
    } else if (item1.runtimeType != item2.runtimeType) {
      if (log) print("$item1 != $item2");
      return false;
    } else if (item1 is DateTime) {
      if (!item1.isAtSameMomentAs(item2)) {
        if (log) print("$item1 != $item2");
        return false;
      }
    } else if (item1 != item2) {
      if (log) print("$item1 != $item2");
      return false;
    }
  }
  return true;
}

bool mapsAreEqual(Map? map1, Map? map2, {bool log = false}) {
  if (map1 == null || map2 == null) {
    return map1 == null && map2 == null;
  }
  final length = map1.length;
  if (map2.length != length) return false;
  for (final entry in map1.entries) {
    if (!map2.containsKey(entry.key)) return false;
    final value1 = entry.value;
    final value2 = map2[entry.key];

    if (value1 is Map) {
      if (!mapsAreEqual(value1, value2, log: log)) return false;
    } else if (value1 is List) {
      if (!listsAreEqual(value1, value2, log: log)) return false;
    } else if (value1.runtimeType != value2.runtimeType) {
      if (log) print("$value1 != $value2");
      return false;
    } else if (value1 is DateTime) {
      if (!value1.isAtSameMomentAs(value2)) {
        if (log) print("$value1 != $value2");
        return false;
      }
    } else if (value1 != value2) {
      if (log) print("$value1 != $value2");
      return false;
    }
  }
  return true;
}

int listToHashCode(List items) {
  int result = 0;
  for (final item in items) {
    if (item is List) {
      result += listToHashCode(item);
    } else if (item is Map) {
      result += mapToHashCode(item);
    } else {
      result += item.hashCode;
    }
  }
  return result;
}

int mapToHashCode(Map input) {
  int result = 0;
  for (final entry in input.entries) {
    result += entry.key.hashCode;
    final value = entry.value;
    if (value is List) {
      result += listToHashCode(value);
    } else if (value is Map) {
      result += mapToHashCode(value);
    } else {
      result += value.hashCode;
    }
  }
  return result;
}
