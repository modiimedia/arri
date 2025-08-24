import 'dart:typed_data';

import 'package:arri_core/helpers.dart';
import 'package:arri_core/message.dart';

abstract class ArriModel {
  Map<String, dynamic> toMap();
  String toJsonString();
  String toUrlQueryParams();
  List<Object?> get props;
}

class ArriModelValidator<T> {
  final T Function() empty;
  final Result<T, Object> Function(Uint8List input, {ContentType? contentType})
      decode;
  final Result<T, Object> Function(String input) decodeString;
  const ArriModelValidator({
    required this.empty,
    required this.decode,
    required this.decodeString,
  });
}
