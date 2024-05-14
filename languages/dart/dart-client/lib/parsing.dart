T typeFromDynamic<T>(dynamic input, T fallback) {
  if (input is T) {
    return input;
  }
  return fallback;
}

T? nullableTypeFromDynamic<T>(dynamic input) {
  if (input is T) {
    return input;
  }
  return null;
}

List<T> typeListFromDynamic<T>(dynamic input, T fallback) {
  return input is List
      ? input.map((item) => typeFromDynamic<T>(input, fallback)).toList()
      : [];
}

List<T?> nullableTypeListFromDynamic<T>(dynamic input) {
  return input is List
      ? input.map((item) => nullableTypeFromDynamic<T>(item)).toList()
      : [];
}

double doubleFromDynamic(dynamic input, double fallback) {
  if (input is double) {
    return input;
  }
  if (input is int) {
    return input.toDouble();
  }
  return fallback;
}

double? nullableDoubleFromDynamic(dynamic input) {
  if (input is double) {
    return input;
  }
  if (input is int) {
    return input.toDouble();
  }
  return null;
}

List<double> doubleListFromDynamic(dynamic input) {
  return input is List
      ? input.map((e) => doubleFromDynamic(input, 0)).toList()
      : [];
}

List<double?> nullableDoubleListFromDynamic(dynamic input) {
  return input is List
      ? input.map((e) => nullableDoubleFromDynamic(e)).toList()
      : [];
}

BigInt bigIntFromDynamic(dynamic input, BigInt fallback) {
  if (input is BigInt) {
    return input;
  }
  if (input is String) {
    return BigInt.parse(input);
  }
  if (input is double) {
    return BigInt.from(input);
  }
  if (input is int) {
    return BigInt.from(input);
  }
  return fallback;
}

BigInt? nullableBigIntFromDynamic(dynamic input) {
  if (input is BigInt) {
    return input;
  }
  if (input is String) {
    return BigInt.parse(input);
  }
  if (input is double) {
    return BigInt.from(input);
  }
  if (input is int) {
    return BigInt.from(input);
  }
  return null;
}

int intFromDynamic(dynamic input, int fallback) {
  if (input is int) {
    return input;
  }
  if (input is double) {
    return input.toInt();
  }
  return fallback;
}

int? nullableIntFromDynamic(dynamic input) {
  if (input is int) {
    return input;
  }
  if (input is double) {
    return input.toInt();
  }
  return null;
}

List<int> intListFromDynamic(dynamic input) {
  return input is List
      ? input.map((e) => intFromDynamic(input, 0)).toList()
      : [];
}

List<int?> nullableIntListFromDynamic(dynamic input) {
  return input is List
      ? input.map((e) => nullableIntFromDynamic(e)).toList()
      : [];
}

DateTime dateTimeFromDynamic(dynamic input, DateTime fallback) {
  if (input is DateTime) {
    return input;
  }
  DateTime.fromMillisecondsSinceEpoch(0);
  DateTime.now().toUtc().toIso8601String();
  if (input is String) {
    return DateTime.parse(input);
  }
  if (input is int) {
    return DateTime.fromMillisecondsSinceEpoch(input);
  }
  return fallback;
}

DateTime? nullableDateTimeFromDynamic(dynamic input) {
  if (input is DateTime) {
    return input;
  }
  if (input is String) {
    return DateTime.parse(input);
  }
  if (input is int) {
    return DateTime.fromMillisecondsSinceEpoch(input);
  }
  return null;
}

List<DateTime> dateTimeListFromDynamic(dynamic input) {
  return input is List
      ? input
          .map((e) =>
              dateTimeFromDynamic(e, DateTime.fromMillisecondsSinceEpoch(0)))
          .toList()
      : [];
}

List<DateTime?> nullableDateTimeListFromDynamic(dynamic input) {
  return input is List
      ? input.map((e) => nullableDateTimeFromDynamic(e)).toList()
      : [];
}
