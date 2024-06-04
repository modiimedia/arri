library;

export "errors.dart";
export 'parsing.dart';
export 'request.dart';
export 'sse.dart';
export 'utils.dart';
export 'ws.dart';

abstract class ArriModel {
  Map<String, dynamic> toJson();
  String toJsonString();
  String toUrlQueryParams();
  ArriModel copyWith();
}
