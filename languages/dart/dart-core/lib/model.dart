import 'dart:typed_data';

import 'package:arri_core/helpers.dart';
import 'package:arri_core/message.dart';

abstract class ArriModel {
  Map<String, dynamic> toJson();
  String toJsonString();
  String toUrlQueryParams();
  List<Object?> get props;
}

class ArriModelClientValidator<T> {
  final T Function() empty;
  final T Function(Uint8List input, {ContentType? contentType}) decode;
  final T Function(String input) decodeJson;
  const ArriModelClientValidator({
    required this.empty,
    required this.decode,
    required this.decodeJson,
  });
}

class ArriModelValidator<T> {
  final T Function() empty;
  final Result<T, Object> Function(
    Uint8List input, {
    ContentType? contentType,
  }) decode;
  final Result<T, Object> Function(String input) decodeString;
  const ArriModelValidator({
    required this.empty,
    required this.decode,
    required this.decodeString,
  });
}
